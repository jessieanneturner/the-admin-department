import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const mime = {
  ".js": "text/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const requested = resolve(root, "." + pathname);
      if (requested !== root && !requested.startsWith(root + sep)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const filePath = pathname.endsWith("/") ? resolve(requested, "index.html") : requested;
      const body = await readFile(filePath);
      response.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream", "cache-control": "no-store" });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

test("real Chromium IndexedDB vault persistence, encryption and recovery", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const { createVaultManager } = await import("/v2/src/vault.js");
      const dbName = "tad-browser-test-" + crypto.randomUUID();
      const passphrase = "Browser-test-only-long-passphrase-2026!";
      const firstStorage = createIndexedDbStorage({ name: dbName });
      const manager = createVaultManager({ storage: firstStorage });
      const { recoveryKey } = await manager.initialise(passphrase);
      await manager.save("diary-entry-1", {
        department: "notes-diary",
        title: "Browser-only private test marker",
        body: "This must never appear in IndexedDB as plaintext."
      });
      const rawStored = await firstStorage.getRecord("diary-entry-1");
      const rawDescriptor = await firstStorage.readDescriptor();
      const rawText = JSON.stringify({ rawStored, rawDescriptor });
      const ciphertextHidesContent = !rawText.includes("Browser-only private test marker") &&
        !rawText.includes("This must never appear in IndexedDB as plaintext.");
      await firstStorage.close();

      const secondStorage = createIndexedDbStorage({ name: dbName });
      const reopened = createVaultManager({ storage: secondStorage });
      const startsLocked = reopened.state === "locked";
      let lockedReadRejected = false;
      try { await reopened.get("diary-entry-1"); } catch { lockedReadRejected = true; }
      await reopened.unlock(passphrase);
      const restored = await reopened.get("diary-entry-1");
      reopened.lock();
      await reopened.unlockWithRecoveryKey(recoveryKey);
      const recovered = await reopened.get("diary-entry-1");
      await reopened.remove("diary-entry-1");
      const deleted = await reopened.get("diary-entry-1") === null;
      await secondStorage.close();
      indexedDB.deleteDatabase(dbName);
      return {
        ciphertextHidesContent,
        startsLocked,
        lockedReadRejected,
        restored,
        recovered,
        deleted
      };
    });
    assert.equal(result.ciphertextHidesContent, true, "stored IndexedDB values must not contain record plaintext");
    assert.equal(result.startsLocked, true, "a newly opened manager must start locked");
    assert.equal(result.lockedReadRejected, true, "locked vault must reject reads");
    assert.deepEqual(result.restored, {
      department: "notes-diary",
      title: "Browser-only private test marker",
      body: "This must never appear in IndexedDB as plaintext."
    });
    assert.deepEqual(result.recovered, result.restored, "offline recovery key must reopen the same data key");
    assert.equal(result.deleted, true, "record deletion must persist");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});


test("real Chromium rejects duplicate vault creation, wrong keys and corrupted records", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const { createVaultManager } = await import("/v2/src/vault.js");
      const dbName = "tad-browser-negative-" + crypto.randomUUID();
      const passphrase = "Negative-test-long-passphrase-2026!";
      const storage = createIndexedDbStorage({ name: dbName });
      const manager = createVaultManager({ storage });
      const { recoveryKey } = await manager.initialise(passphrase);

      let duplicateInitialisationRejected = false;
      try { await manager.initialise(passphrase); } catch { duplicateInitialisationRejected = true; }
      manager.lock();

      let wrongPassphraseRejected = false;
      try { await manager.unlock("Not-the-right-passphrase-123!"); } catch { wrongPassphraseRejected = true; }
      const remainsLockedAfterWrongPassphrase = manager.state === "locked";

      await manager.unlockWithRecoveryKey(recoveryKey);
      await manager.save("tamper-check", { text: "integrity protected" });
      const envelope = await storage.getRecord("tamper-check");
      envelope.ciphertext = envelope.ciphertext.slice(0, -4) + "AAAA";
      await storage.putRecord(envelope);
      let tamperingRejected = false;
      try { await manager.get("tamper-check"); } catch { tamperingRejected = true; }

      await storage.close();
      indexedDB.deleteDatabase(dbName);
      return {
        duplicateInitialisationRejected,
        wrongPassphraseRejected,
        remainsLockedAfterWrongPassphrase,
        tamperingRejected
      };
    });
    assert.equal(result.duplicateInitialisationRejected, true, "an existing vault must never be overwritten");
    assert.equal(result.wrongPassphraseRejected, true, "a wrong passphrase must fail");
    assert.equal(result.remainsLockedAfterWrongPassphrase, true, "a failed unlock must leave the vault locked");
    assert.equal(result.tamperingRejected, true, "modified ciphertext must fail authenticated decryption");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});

test("real Chromium persists concurrent record writes and rejects uncloneable values safely", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const { createVaultManager } = await import("/v2/src/vault.js");
      const dbName = "tad-browser-concurrency-" + crypto.randomUUID();
      const storage = createIndexedDbStorage({ name: dbName });
      const manager = createVaultManager({ storage });
      await manager.initialise("Concurrent-test-long-passphrase-2026!");
      await Promise.all(Array.from({ length: 12 }, (_, index) =>
        manager.save("record-" + index, { index, value: "parallel write" })
      ));
      const records = await manager.list();
      let uncloneableValueRejected = false;
      try { await storage.putRecord({ id: "invalid", value: () => "not cloneable" }); }
      catch { uncloneableValueRejected = true; }
      const savedCountAfterInvalidWrite = (await manager.list()).length;
      const reopenedStorage = createIndexedDbStorage({ name: dbName });
      const reopened = createVaultManager({ storage: reopenedStorage });
      await reopened.unlock("Concurrent-test-long-passphrase-2026!");
      const reopenedCount = (await reopened.list()).length;
      await storage.close();
      await reopenedStorage.close();
      indexedDB.deleteDatabase(dbName);
      return {
        ids: records.map(record => record.id).sort(),
        uncloneableValueRejected,
        savedCountAfterInvalidWrite,
        reopenedCount
      };
    });
    assert.deepEqual(result.ids, Array.from({ length: 12 }, (_, index) => "record-" + index).sort());
    assert.equal(result.uncloneableValueRejected, true, "IndexedDB must reject values it cannot safely clone");
    assert.equal(result.savedCountAfterInvalidWrite, 12, "a failed write must not corrupt existing records");
    assert.equal(result.reopenedCount, 12, "all concurrent successful writes must persist");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});


test("real Chromium retries IndexedDB after a failed open instead of caching the failure", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const dbName = "tad-browser-retry-" + crypto.randomUUID();
      const upgrade = indexedDB.open(dbName, 2);
      await new Promise((resolve, reject) => {
        upgrade.onupgradeneeded = () => upgrade.result.createObjectStore("future-store");
        upgrade.onsuccess = resolve;
        upgrade.onerror = () => reject(upgrade.error);
      });
      upgrade.result.close();

      const storage = createIndexedDbStorage({ name: dbName });
      let firstOpenRejected = false;
      try { await storage.readDescriptor(); } catch { firstOpenRejected = true; }

      const deletion = indexedDB.deleteDatabase(dbName);
      await new Promise((resolve, reject) => {
        deletion.onsuccess = resolve;
        deletion.onerror = () => reject(deletion.error);
        deletion.onblocked = () => reject(new Error("Database deletion unexpectedly blocked."));
      });
      const secondOpenResult = await storage.readDescriptor();
      await storage.close();
      indexedDB.deleteDatabase(dbName);
      return { firstOpenRejected, secondOpenResult: secondOpenResult ?? null };
    });
    assert.equal(result.firstOpenRejected, true, "a schema-version mismatch must reject the first open");
    assert.equal(result.secondOpenResult, null, "the same adapter must recover after the failed database is removed");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});

test("real Chromium refuses to overwrite an existing vault descriptor", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const dbName = "tad-browser-descriptor-" + crypto.randomUUID();
      const storage = createIndexedDbStorage({ name: dbName });
      const original = { version: 1, wrappedKey: "original-descriptor" };
      await storage.writeDescriptor(original);
      let overwriteRejected = false;
      try { await storage.writeDescriptor({ version: 1, wrappedKey: "replacement-descriptor" }); }
      catch { overwriteRejected = true; }
      const retained = await storage.readDescriptor();
      await storage.close();
      indexedDB.deleteDatabase(dbName);
      return { overwriteRejected, retained };
    });
    assert.equal(result.overwriteRejected, true, "a second descriptor write must be refused");
    assert.deepEqual(result.retained, { version: 1, wrappedKey: "original-descriptor" });
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});

test("real Chromium reports unavailable IndexedDB without falling back to plaintext storage", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: undefined });
    });
    const page = await context.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const storage = createIndexedDbStorage({ name: "tad-browser-no-idb-" + crypto.randomUUID() });
      let rejected = false;
      let message = "";
      try { await storage.readDescriptor(); }
      catch (error) { rejected = true; message = error.message; }
      return {
        rejected,
        message,
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage)
      };
    });
    assert.equal(result.rejected, true, "storage operations must fail when IndexedDB is unavailable");
    assert.match(result.message, /IndexedDB is unavailable/);
    assert.deepEqual(result.localStorageKeys, [], "there must be no localStorage plaintext fallback");
    assert.deepEqual(result.sessionStorageKeys, [], "there must be no sessionStorage plaintext fallback");
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});


test("real Chromium recovers from a blocked IndexedDB upgrade without leaking the late connection", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/v2/");
    const result = await page.evaluate(async () => {
      const { createIndexedDbStorage } = await import("/v2/src/storage.js");
      const dbName = "tad-browser-blocked-" + crypto.randomUUID();
      const blockerRequest = indexedDB.open(dbName, 1);
      const blocker = await new Promise((resolve, reject) => {
        blockerRequest.onupgradeneeded = () => {
          blockerRequest.result.createObjectStore("held-open");
        };
        blockerRequest.onsuccess = () => resolve(blockerRequest.result);
        blockerRequest.onerror = () => reject(blockerRequest.error);
      });

      const storage = createIndexedDbStorage({ name: dbName, version: 2 });
      let blockedRejected = false;
      try { await storage.readDescriptor(); }
      catch (error) { blockedRejected = /blocked/i.test(error.message); }

      blocker.close();
      await new Promise(resolve => setTimeout(resolve, 50));
      const retryDescriptor = await storage.readDescriptor();
      await storage.close();

      let invalidVersionRejected = false;
      try { createIndexedDbStorage({ name: dbName, version: 0 }); }
      catch { invalidVersionRejected = true; }

      const deletion = indexedDB.deleteDatabase(dbName);
      const deleteCompleted = await new Promise(resolve => {
        deletion.onsuccess = () => resolve(true);
        deletion.onerror = () => resolve(false);
        deletion.onblocked = () => resolve(false);
      });
      return {
        blockedRejected,
        retryDescriptor: retryDescriptor ?? null,
        invalidVersionRejected,
        deleteCompleted
      };
    });
    assert.equal(result.blockedRejected, true, "an upgrade blocked by another tab must reject clearly");
    assert.equal(result.retryDescriptor, null, "the same adapter must recover once the blocking tab closes");
    assert.equal(result.invalidVersionRejected, true, "invalid schema versions must be rejected immediately");
    assert.equal(result.deleteCompleted, true, "late successful opens must not leave a database connection behind");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});
