import test from "node:test";
import assert from "node:assert/strict";
import { createVaultManager } from "../src/vault.js";

function memoryStorage() {
  let descriptor;
  const records = new Map();
  return {
    async readDescriptor() { return descriptor; },
    async writeDescriptor(value) {
      if (descriptor) throw new Error("A T.A.D. vault already exists on this device.");
      descriptor = structuredClone(value);
    },
    async putRecord(value) { records.set(value.id, structuredClone(value)); },
    async getRecord(id) { return records.has(id) ? structuredClone(records.get(id)) : undefined; },
    async deleteRecord(id) { records.delete(id); },
    async listRecords() { return [...records.values()].map(value => structuredClone(value)); }
  };
}

const passphrase = "A-long-unique-test-passphrase!";

test("vault manager starts locked and refuses private reads until unlocked", async () => {
  const manager = createVaultManager({ storage: memoryStorage() });
  assert.equal(manager.state, "locked");
  await assert.rejects(() => manager.list(), /Unlock the T.A.D. vault/);
  await assert.rejects(() => manager.get("note-1"), /Unlock the T.A.D. vault/);
});

test("initialise, save, lock, unlock and retrieve encrypted records", async () => {
  const storage = memoryStorage();
  const manager = createVaultManager({ storage });
  const { recoveryKey } = await manager.initialise(passphrase);
  assert.equal(manager.state, "unlocked");
  await manager.save("note-1", { department: "notes", title: "Private entry" });
  const stored = await storage.getRecord("note-1");
  assert.equal(JSON.stringify(stored).includes("Private entry"), false);
  manager.lock();
  assert.equal(manager.state, "locked");
  await assert.rejects(() => manager.get("note-1"), /Unlock the T.A.D. vault/);
  await manager.unlock(passphrase);
  assert.deepEqual(await manager.get("note-1"), { department: "notes", title: "Private entry" });
  manager.lock();
  await manager.unlockWithRecoveryKey(recoveryKey);
  assert.deepEqual(await manager.get("note-1"), { department: "notes", title: "Private entry" });
});

test("wrong passphrase does not unlock and duplicate initialisation is refused", async () => {
  const manager = createVaultManager({ storage: memoryStorage() });
  await manager.initialise(passphrase);
  manager.lock();
  await assert.rejects(() => manager.unlock("Wrong-passphrase-123"), /decrypt|operation|data/i);
  assert.equal(manager.state, "locked");
  await assert.rejects(() => manager.initialise(passphrase), /already exists/);
});

test("list and remove operate on decrypted values only while unlocked", async () => {
  const manager = createVaultManager({ storage: memoryStorage() });
  await manager.initialise(passphrase);
  await manager.save("a", { text: "one" });
  await manager.save("b", { text: "two" });
  assert.deepEqual((await manager.list()).map(item => item.id).sort(), ["a", "b"]);
  await manager.remove("a");
  assert.equal(await manager.get("a"), null);
});
