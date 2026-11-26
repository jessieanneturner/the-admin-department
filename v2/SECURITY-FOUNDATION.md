# V2 security foundation — proof of concept

This folder contains the first isolated security/data-layer engineering milestone for T.A.D. V2.

## What is implemented

- A random 256-bit data-encryption key.
- AES-256-GCM authenticated encryption for records, with each record ID authenticated as additional data.
- A passphrase-wrapped data key using PBKDF2-HMAC-SHA-256 (600,000 iterations) and a fresh 128-bit salt.
- A separately generated 256-bit recovery key that independently wraps the same data key.
- An IndexedDB adapter with separate vault metadata and encrypted-record stores. It stores encrypted record envelopes and a wrapped-key descriptor; it has no plaintext fallback or localStorage use.
- A vault manager that persists the descriptor, keeps the unlocked CryptoKey in memory, supports lock/unlock and recovery-key unlock, and provides encrypted record save/read/list/delete operations.
- Automated cryptographic and vault lifecycle tests.

## Important limits — not ready for personal data

This is a proof of concept, not a complete secure application or a security certification.

- It is not connected to the current V2 screen or any department yet.
- No account authentication, backend, multi-device sync, Google Drive backup, recovery workflow UI, biometric integration, PIN lock, key rotation or device revocation exists.
- Chromium browser integration tests now verify IndexedDB persistence, encrypted-at-rest record envelopes, locked-state access control, passphrase and recovery-key unlock, deletion, duplicate-vault protection, tamper rejection, concurrent writes, invalid structured-clone writes, retry after an open failure, blocked-schema recovery, and the absence of a plaintext storage fallback. These tests are automated in GitHub Actions; target Android-device testing remains outstanding.
- Automated Node.js and Chromium browser checks are running in GitHub Actions. Passing CI is a useful engineering gate, not a security certification.
- A browser profile compromise, malicious extension, XSS, compromised device or an unlocked session can expose data.
- Browser storage can be cleared by the user, browser or operating system. IndexedDB is not a backup.
- The recovery key must eventually be displayed safely, confirmed as recorded offline and never included in cloud backup packages.
- The app PIN must not be used as the encryption passphrase or recovery key.
- KDF parameters and mobile performance need device testing and independent security review before release.

## Local test

From this directory, with Node.js 20 or later:

```sh
npm test
```

The tests use Node's Web Crypto implementation. Production use must be served in a secure context (HTTPS or localhost) and tested in supported Android and Windows browsers.

## Next gates

1. Confirm CI for the new lifecycle tests and fix any failures.
2. Continue expanding browser-level IndexedDB tests for blocked connections, interrupted operations, quota exhaustion and transaction failure paths.
3. Design a safe first-run/unlock/recovery UI that never logs or persists plaintext secrets.
4. Review key lifecycle, passphrase change, recovery-key rotation and memory handling.
5. Design authenticated account/device management and end-to-end encrypted sync/backup.
6. Integrate native Android Keystore/biometric approval through Capacitor and validate Windows PWA/passkey support.
7. Complete threat modelling, independent review, restore tests and privacy testing before migration or release.
