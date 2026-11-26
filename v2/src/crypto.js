/**
 * T.A.D. V2 cryptographic foundation (proof of concept).
 *
 * Browser Web Crypto only. No secrets or plaintext are persisted by this module.
 * The four-digit app PIN must never be used as a passphrase or encryption key.
 */
const FORMAT_VERSION = 1;
const PBKDF2_ITERATIONS = 600_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function webCrypto() {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable. Use HTTPS or localhost.");
  return globalThis.crypto;
}
function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function fromBase64(value) {
  if (typeof value !== "string" || !value || value.length % 4 !== 0) throw new Error("Invalid encoded vault data.");
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}
function randomBytes(length) {
  return webCrypto().getRandomValues(new Uint8Array(length));
}
function validatePassphrase(passphrase) {
  if (typeof passphrase !== "string" || passphrase.length < 12) {
    throw new Error("Use a unique passphrase of at least 12 characters. A four-digit PIN is not suitable.");
  }
}
async function deriveWrappingKey(secret, salt) {
  const material = await webCrypto().subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return webCrypto().subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function wrapRawKey(rawKey, wrappingKey, purpose) {
  const iv = randomBytes(12);
  const additionalData = encoder.encode(`TAD|vault|v${FORMAT_VERSION}|${purpose}`);
  const ciphertext = await webCrypto().subtle.encrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    wrappingKey,
    rawKey
  );
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
}
async function unwrapRawKey(wrapped, wrappingKey, purpose) {
  const iv = fromBase64(wrapped.iv);
  const ciphertext = fromBase64(wrapped.ciphertext);
  if (iv.length !== 12 || ciphertext.length !== 48) throw new Error("Invalid wrapped vault key.");
  const additionalData = encoder.encode(`TAD|vault|v${FORMAT_VERSION}|${purpose}`);
  return new Uint8Array(await webCrypto().subtle.decrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    wrappingKey,
    ciphertext
  ));
}
async function importDataKey(rawKey) {
  return webCrypto().subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/**
 * Creates a random data-encryption key and two independent wraps:
 * one protected by a strong passphrase, one by a separately-held recovery key.
 * Display/store recoveryKey offline; do not upload it with backup packages.
 */
export async function createVault(passphrase) {
  validatePassphrase(passphrase);
  const rawDataKey = randomBytes(32);
  const passphraseSalt = randomBytes(16);
  const passphraseKey = await deriveWrappingKey(passphrase, passphraseSalt);
  const recoveryKey = toBase64(randomBytes(32));
  const recoveryWrappingKey = await webCrypto().subtle.importKey(
    "raw", fromBase64(recoveryKey), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
  );
  try {
    const descriptor = {
      format: "TAD-VAULT",
      version: FORMAT_VERSION,
      kdf: { name: "PBKDF2", hash: "SHA-256", iterations: PBKDF2_ITERATIONS, salt: toBase64(passphraseSalt) },
      passphraseWrap: await wrapRawKey(rawDataKey, passphraseKey, "passphrase"),
      recoveryWrap: await wrapRawKey(rawDataKey, recoveryWrappingKey, "recovery")
    };
    return { descriptor, recoveryKey, key: await importDataKey(rawDataKey) };
  } finally {
    rawDataKey.fill(0);
  }
}

export async function unlockVault(passphrase, descriptor) {
  validatePassphrase(passphrase);
  validateDescriptor(descriptor);
  const wrappingKey = await deriveWrappingKey(passphrase, fromBase64(descriptor.kdf.salt));
  const raw = await unwrapRawKey(descriptor.passphraseWrap, wrappingKey, "passphrase");
  try { return await importDataKey(raw); } finally { raw.fill(0); }
}

export async function unlockVaultWithRecoveryKey(recoveryKey, descriptor) {
  validateDescriptor(descriptor);
  if (typeof recoveryKey !== "string" || fromBase64(recoveryKey).length !== 32) throw new Error("Invalid recovery key.");
  const wrappingKey = await webCrypto().subtle.importKey(
    "raw", fromBase64(recoveryKey), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
  );
  const raw = await unwrapRawKey(descriptor.recoveryWrap, wrappingKey, "recovery");
  try { return await importDataKey(raw); } finally { raw.fill(0); }
}

function validateDescriptor(descriptor) {
  if (descriptor?.format !== "TAD-VAULT" || descriptor.version !== FORMAT_VERSION ||
      descriptor.kdf?.name !== "PBKDF2" || descriptor.kdf.hash !== "SHA-256" ||
      descriptor.kdf.iterations !== PBKDF2_ITERATIONS || !descriptor.passphraseWrap || !descriptor.recoveryWrap) {
    throw new Error("Unsupported or invalid T.A.D. vault descriptor.");
  }
  if (fromBase64(descriptor.kdf.salt).length !== 16) throw new Error("Invalid vault key-derivation salt.");
}

/** Encrypts one JSON record. recordId is authenticated as AES-GCM additional data. */
export async function encryptRecord(key, recordId, value) {
  if (!recordId || typeof recordId !== "string") throw new Error("A record ID is required.");
  const iv = randomBytes(12);
  const additionalData = encoder.encode(`TAD|record|v${FORMAT_VERSION}|${recordId}`);
  const plaintext = encoder.encode(JSON.stringify(value));
  try {
    const ciphertext = await webCrypto().subtle.encrypt(
      { name: "AES-GCM", iv, additionalData, tagLength: 128 }, key, plaintext
    );
    return { id: recordId, version: FORMAT_VERSION, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
  } finally {
    plaintext.fill(0);
  }
}

export async function decryptRecord(key, record) {
  if (record?.version !== FORMAT_VERSION || typeof record.id !== "string" || !record.id) {
    throw new Error("Unsupported or invalid encrypted record.");
  }
  const iv = fromBase64(record.iv);
  if (iv.length !== 12) throw new Error("Invalid encrypted record nonce.");
  const additionalData = encoder.encode(`TAD|record|v${FORMAT_VERSION}|${record.id}`);
  const plaintext = new Uint8Array(await webCrypto().subtle.decrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    key,
    fromBase64(record.ciphertext)
  ));
  try {
    return JSON.parse(decoder.decode(plaintext));
  } finally {
    plaintext.fill(0);
  }
}
