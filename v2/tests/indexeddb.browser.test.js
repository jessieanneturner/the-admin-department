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
