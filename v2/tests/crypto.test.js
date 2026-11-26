import test from "node:test";
import assert from "node:assert/strict";
import { createVault, unlockVault, unlockVaultWithRecoveryKey, encryptRecord, decryptRecord } from "../crypto.js";

test("vault encrypts records and unlocks with passphrase and independent recovery key", async () => {
  const { descriptor, recoveryKey, key } = await createVault("A-long-unique-test-passphrase!");
  const original = { title: "Private test", body: "This must remain encrypted", tags: ["one", "two"] };
  const encrypted = await encryptRecord(key, "note-1", original);
  assert.equal(encrypted.id, "note-1");
  assert.equal(JSON.stringify(encrypted).includes("Private test"), false);
  assert.deepEqual(await decryptRecord(key, encrypted), original);
  const passphraseKey = await unlockVault("A-long-unique-test-passphrase!", descriptor);
  assert.deepEqual(await decryptRecord(passphraseKey, encrypted), original);
  const recoveryUnlockedKey = await unlockVaultWithRecoveryKey(recoveryKey, descriptor);
  assert.deepEqual(await decryptRecord(recoveryUnlockedKey, encrypted), original);
});

test("rejects short PIN-like passphrases", async () => {
  await assert.rejects(() => createVault("1234"), /at least 12 characters/);
});

test("authenticated encryption rejects tampering and record-ID substitution", async () => {
  const { key } = await createVault("Another-long-test-passphrase!");
  const encrypted = await encryptRecord(key, "note-a", { secret: "hello" });
  const altered = { ...encrypted, ciphertext: encrypted.ciphertext.slice(0, -4) + "AAAA" };
  await assert.rejects(() => decryptRecord(key, altered));
  await assert.rejects(() => decryptRecord(key, { ...encrypted, id: "note-b" }));
});
