/**
 * Encrypted-record IndexedDB adapter.
 * Stores ciphertext envelopes only; callers must encrypt before put() and decrypt after get().
 * This is local device storage, not sync or backup.
 */
const DB_NAME = "tad-v2-encrypted";
const DB_VERSION = 1;
const STORE_NAME = "records";

function openDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(new Error("IndexedDB is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open encrypted storage."));
    request.onblocked = () => reject(new Error("Encrypted storage upgrade is blocked by another open tab."));
  });
}

async function withStore(mode, operation) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      let result;
      try { result = operation(store); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(result?.result);
      tx.onerror = () => reject(tx.error || new Error("Encrypted storage transaction failed."));
      tx.onabort = () => reject(tx.error || new Error("Encrypted storage transaction was aborted."));
    });
  } finally { db.close(); }
}

export function putEncryptedRecord(envelope) {
  if (!envelope?.id || !envelope?.ciphertext || !envelope?.iv || envelope.version !== 1) {
    throw new Error("Only a valid encrypted record envelope can be stored.");
  }
  return withStore("readwrite", store => store.put(envelope));
}
export function getEncryptedRecord(id) {
  return withStore("readonly", store => store.get(id));
}
export function listEncryptedRecords() {
  return withStore("readonly", store => store.getAll());
}
export function deleteEncryptedRecord(id) {
  return withStore("readwrite", store => store.delete(id));
}
export function clearEncryptedRecords() {
  return withStore("readwrite", store => store.clear());
}
