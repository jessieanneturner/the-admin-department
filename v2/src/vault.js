/**
 * T.A.D. vault lifecycle and encrypted-record repository.
 * Keys exist only in this manager's memory while unlocked.
 * No biometric/PIN integration, account service, sync or backup is provided here.
 */
import { createVault, unlockVault, unlockVaultWithRecoveryKey, encryptRecord, decryptRecord } from "./crypto.js";

export function createVaultManager({ storage }) {
  if (!storage) throw new TypeError("A vault storage adapter is required.");
  let key = null;
  let state = "locked";

  function requireUnlocked() {
    if (state !== "unlocked" || !key) throw new Error("Unlock the T.A.D. vault before accessing private records.");
  }
  async function descriptorOrThrow() {
    const descriptor = await storage.readDescriptor();
    if (!descriptor) throw new Error("No T.A.D. vault has been created on this device.");
    return descriptor;
  }

  return Object.freeze({
    get state() { return state; },
    async initialise(passphrase) {
      if (await storage.readDescriptor()) throw new Error("A T.A.D. vault already exists on this device.");
      const created = await createVault(passphrase);
      try {
        await storage.writeDescriptor(created.descriptor);
        key = created.key;
        state = "unlocked";
        return { recoveryKey: created.recoveryKey };
      } catch (error) {
        key = null;
        state = "locked";
        throw error;
      }
    },
    async unlock(passphrase) {
      const descriptor = await descriptorOrThrow();
      const unlockedKey = await unlockVault(passphrase, descriptor);
      key = unlockedKey;
      state = "unlocked";
      return true;
    },
    async unlockWithRecoveryKey(recoveryKey) {
      const descriptor = await descriptorOrThrow();
      const unlockedKey = await unlockVaultWithRecoveryKey(recoveryKey, descriptor);
      key = unlockedKey;
      state = "unlocked";
      return true;
    },
    lock() {
      key = null;
      state = "locked";
    },
    async save(id, value) {
      requireUnlocked();
      if (typeof id !== "string" || !id.trim()) throw new TypeError("A non-empty record ID is required.");
      const encrypted = await encryptRecord(key, id, value);
      await storage.putRecord(encrypted);
      return id;
    },
    async get(id) {
      requireUnlocked();
      const encrypted = await storage.getRecord(id);
      return encrypted ? decryptRecord(key, encrypted) : null;
    },
    async list() {
      requireUnlocked();
      const encryptedRecords = await storage.listRecords();
      const values = [];
      for (const record of encryptedRecords) values.push({ id: record.id, value: await decryptRecord(key, record) });
      return values;
    },
    async remove(id) {
      requireUnlocked();
      await storage.deleteRecord(id);
    }
  });
}
