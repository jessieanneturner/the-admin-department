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
  let session = 0;

  function requireUnlocked() {
    if (state !== "unlocked" || !key) throw new Error("Unlock the T.A.D. vault before accessing private records.");
    return { key, session };
  }
  function ensureSession(expected) {
    if (state !== "unlocked" || session !== expected) throw new Error("The T.A.D. vault was locked during this operation.");
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
        session += 1;
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
      session += 1;
      state = "unlocked";
      return true;
    },
    async unlockWithRecoveryKey(recoveryKey) {
      const descriptor = await descriptorOrThrow();
      const unlockedKey = await unlockVaultWithRecoveryKey(recoveryKey, descriptor);
      key = unlockedKey;
      session += 1;
      state = "unlocked";
      return true;
    },
    lock() {
      session += 1;
      key = null;
      state = "locked";
    },
    async save(id, value) {
      if (typeof id !== "string" || !id.trim()) throw new TypeError("A non-empty record ID is required.");
      const current = requireUnlocked();
      const encrypted = await encryptRecord(current.key, id, value);
      ensureSession(current.session);
      await storage.putRecord(encrypted);
      ensureSession(current.session);
      return id;
    },
    async get(id) {
      const current = requireUnlocked();
      const encrypted = await storage.getRecord(id);
      ensureSession(current.session);
      if (!encrypted) return null;
      const value = await decryptRecord(current.key, encrypted);
      ensureSession(current.session);
      return value;
    },
    async list() {
      const current = requireUnlocked();
      const encryptedRecords = await storage.listRecords();
      ensureSession(current.session);
      const values = [];
      for (const record of encryptedRecords) {
        const value = await decryptRecord(current.key, record);
        ensureSession(current.session);
        values.push({ id: record.id, value });
      }
      return values;
    },
    async remove(id) {
      const current = requireUnlocked();
      await storage.deleteRecord(id);
      ensureSession(current.session);
    }
  });
}
