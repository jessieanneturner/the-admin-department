# V2 security foundation — proof of concept

This folder contains the first isolated security/data-layer engineering milestone for T.A.D. V2.

## What is implemented

- A random 256-bit data-encryption key.
- AES-256-GCM authenticated encryption for records, with each record ID authenticated as additional data.
- A passphrase-wrapped data key using PBKDF2-HMAC-SHA-256 (600,000 iterations) and a fresh 128-bit salt.
- A separately generated 256-bit recovery key that independently wraps the same data key.
- A minimal IndexedDB adapter that accepts encrypted record envelopes only.
- Automated tests for round-trip encryption, passphrase unlock, recovery-key unlock, short-passphrase rejection, ciphertext tampering and record-ID substitution.

## Important limits — not ready for personal data

This is a proof of concept, not a complete secure application or a security certification.

- It is not connected to the current V2 screen or any department yet.
- No account authentication, backend, multi-device sync, Google Drive backup, recovery workflow UI, biometric integration, PIN lock, key rotation or device revocation exists.
- The IndexedDB adapter stores encrypted record envelopes, but this code does not yet persist the vault descriptor or manage the lifecycle of the unlocked key.
- A browser profile compromise, malicious extension, XSS, compromised device or an unlocked session can expose data.
- Browser storage can be cleared by the user, browser or operating system. IndexedDB is not a backup.
- The recovery key is returned once by `createVault`; a future UI must display it safely, require confirmation that it has been recorded offline, and never include it in cloud backup packages.
- The app PIN must not be used as the encryption passphrase or as the recovery key.
- The KDF parameters and mobile performance need device testing and independent security review before release.

## Local test

From this directory, with Node.js 20 or later:

```sh
npm test
```

The tests use Node's Web Crypto implementation. Production use must be served in a secure context (HTTPS or localhost) and tested in supported Android and Windows browsers.

## Next gates

1. Run automated tests in CI and on target devices.
2. Review key lifecycle, passphrase change, recovery-key rotation and memory handling.
3. Add an explicit vault setup/unlock/recovery experience without connecting it to personal data until reviewed.
4. Design authenticated account/device management and an end-to-end encrypted sync/backup protocol.
5. Integrate native Android Keystore/biometric approval through Capacitor and validate the Windows PWA/passkey path.
6. Complete threat modelling, independent review, restore tests and privacy testing before migration or release.
