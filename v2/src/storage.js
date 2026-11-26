/**
 * IndexedDB persistence for the encrypted T.A.D. vault.
 * The descriptor contains wrapped keys only; record payloads are ciphertext.
 * This module deliberately has no localStorage or plaintext fallback.
 */
const DB_VERSION = 1;
const META_STORE = "vault-meta";
const RECORD_STORE = "encrypted-records";

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
  });
}
function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
  });
}

export function createIndexedDbStorage({ name = "tad-v2-private-vault" } = {}) {
  let databasePromise;
  function open() {
    if (!globalThis.indexedDB) throw new Error("IndexedDB is unavailable in this browser.");
    if (!databasePromise) {
      databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(name, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
          if (!db.objectStoreNames.contains(RECORD_STORE)) db.createObjectStore(RECORD_STORE, { keyPath: "id" });
        };
        let settled = false;
        request.onsuccess = () => {
          const db = request.result;
          // An open request may succeed after its onblocked event rejected the
          // promise. Close that late connection rather than leaking it.
          if (settled) {
            db.close();
            return;
          }
          settled = true;
          db.onversionchange = () => { db.close(); databasePromise = undefined; };
          resolve(db);
        };
        request.onerror = () => {
          if (settled) return;
          settled = true;
          reject(request.error || new Error("Could not open the T.A.D. vault database."));
        };
        request.onblocked = () => {
          if (settled) return;
          settled = true;
          reject(new Error("The T.A.D. vault database is blocked by another open tab."));
        };
      });
      const pending = databasePromise;
      pending.catch(() => {
        // Do not cache a failed open forever: storage may become available later.
        if (databasePromise === pending) databasePromise = undefined;
      });
    }
    return databasePromise;
  }
  async function read(storeName, key) {
    const db = await open();
    const tx = db.transaction(storeName, "readonly");
    const result = await requestResult(tx.objectStore(storeName).get(key));
    await transactionDone(tx);
    return result;
  }
  async function write(storeName, value, key) {
    const db = await open();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (key === undefined) store.put(value); else store.put(value, key);
    await transactionDone(tx);
  }
  return Object.freeze({
    async readDescriptor() { return read(META_STORE, "descriptor"); },
    async writeDescriptor(descriptor) {
      const db = await open();
      const tx = db.transaction(META_STORE, "readwrite");
      const store = tx.objectStore(META_STORE);
      const existing = await requestResult(store.get("descriptor"));
      if (existing) { tx.abort(); throw new Error("A T.A.D. vault already exists on this device."); }
      store.put(descriptor, "descriptor");
      await transactionDone(tx);
    },
    async putRecord(record) { return write(RECORD_STORE, record); },
    async getRecord(id) { return read(RECORD_STORE, id); },
    async deleteRecord(id) {
      const db = await open();
      const tx = db.transaction(RECORD_STORE, "readwrite");
      tx.objectStore(RECORD_STORE).delete(id);
      await transactionDone(tx);
    },
    async listRecords() {
      const db = await open();
      const tx = db.transaction(RECORD_STORE, "readonly");
      const records = await requestResult(tx.objectStore(RECORD_STORE).getAll());
      await transactionDone(tx);
      return records;
    },
    async close() {
      if (databasePromise) {
        const db = await databasePromise;
        db.close();
        databasePromise = undefined;
      }
    }
  });
}
