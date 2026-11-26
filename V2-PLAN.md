# T.A.D. 2.0 — Master Build Plan

## Purpose

Build a complete replacement for The Admin Department (T.A.D.) as a private, dependable personal organiser. The current live T.A.D. remains untouched and available while V2 is developed. The user will not be asked to move to or rely on V2 until the agreed features have been implemented, tested, and security-reviewed.

## Product principles

- Calm, elegant, understated visual design.
- Palette: forest green `#203B30`, secondary forest `#2E4B3D`, moss `#65745A`, warm cream `#E9E3D7`, paper `#F6F2E9`, chocolate brown `#49382D`, brown secondary `#735B48`.
- Dry, understated British humour; no childish styling or garish emoji.
- Android phone is the primary device; desktop/laptop use and reliable synchronisation are required.
- Simple navigation, compact typography, accessible controls.
- Privacy first. Private diary, notes and study reflections must never appear in general widgets or notifications.
- Local-first data handling, robust backup and restore, and transparent recovery.
- No production migration until the user approves the tested V2.

## Department structure

1. **Today** — today's appointments, due and overdue tasks, birthdays/occasions, reminders and concise task summary.
2. **Calendar** — appointments, birthdays, anniversaries, important dates and events.
3. **Tasks & Reminders** — one-off tasks, priorities, due dates, checklists and reminders.
4. **Routines** — independently recurring jobs (e.g. weekly, fortnightly, monthly); completing one schedules its next occurrence.
5. **Habits** — habit tracking and history.
6. **Notes & Diary** — general notes, private diary entries, archive/restore. Notes remain the capture/inbox space; no separate Brain Dump department.
7. **Reading Journal** — Bible reading, ministry reading and other study. Entries have a flexible title/passage, reading type, date, scripture/reference field, impressions/reflections and additional notes. Searchable history. No book ratings, authors, or book-progress tracker. Private by default.
8. **Travel** — trips, trip details, reusable packing templates, tickable packing lists, auto-filled essentials, outfit planning and saved outfit templates. Any calendar event can optionally have a checkbox to create a linked packing list; no special event type required. Dates stay linked. Editing an event must not create duplicate lists. Packing lists remain independently editable.
9. **Personal Life** — personal appointments, people, birthdays, gift ideas, bedroom organisation, personal care, projects, hobbies, memories and other flexible personal categories.
10. **Personal Shopping** — wishlist and purchased items, with category dropdown (clothes, shoes, makeup, skincare/beauty, toiletries, bedroom, accessories, gifts, other), price, link, notes, priority and purchased status.
11. **Savings** — one overall savings balance, manual deposits/withdrawals and transaction history; no goal pots or bank linking.
12. **Archive & Recycle Bin** — archived items and recoverable deleted items, with clear restore and permanent-delete controls.
13. **Settings** — security, backups, sync, notifications, data export/import, privacy and customisation.
14. **Pinboard** — a central inspiration space for saving photos, recipes, links and miscellaneous ideas. Start with one main board, with optional user-created boards/categories for organising items when wanted. Saved items can have a title, source link, caption/notes, tags and image where applicable. Items should be reusable in Notes/Moodboards without uploading the same image again. The board should automatically lay out saved content as a relaxed, attractive pinboard collage: uploaded photos become image pins at sensible sizes while preserving their aspect ratio; pasted links become simple, editable sticky-note cards showing a user-editable title, the web address and a small link indicator, with optional personal notes; do not show website screenshots, thumbnails or rich website previews. Recipes can be saved from links or images, using the same simple link-note treatment. Users should never need to manually resize or fit content to the board. Use a subtle tactile visual treatment—paper-like cards with understated pinned or taped corners/shadows—while keeping the overall interface clean, modern and easy to scan. Allow optional drag/rearrangement, but make automatic layout the default.

## Personal schedule and life context

The initial setup should support the user's current recurring week while keeping every commitment editable:

- **Work:** Monday to Friday, 7:30am–5:00pm. Treat these as recurring calendar commitments and unavailable time when suggesting or planning tasks. Do not assume commute or preparation durations; let the user add those separately.
- **Church:** recurring commitments on Monday, Tuesday, Wednesday and Friday at 7:00pm, plus Saturday at 11:30am. Sunday has three regular commitments, but their times and durations must be entered by the user rather than guessed. Keep these as editable calendar events.
- **Church organisation:** prioritise the user's personal responsibilities, assignments, preparation, reminders, personal study and related notes. These should be easy to organise under a Church category or workspace without requiring a separate top-level department. Meeting attendance alone is not the whole requirement.
- **Charity volunteering (EA role):** workload is occasional and variable rather than a fixed weekly shift. Provide a lightweight, clearly separated Charity/Volunteering category or workspace for occasional tasks, meeting preparation, action points, follow-ups, deadlines and events. Allow items to surface in Today and the central calendar. Do not create a heavy project-management department unless the user later asks for it. Avoid storing confidential beneficiary or sensitive charity case information unless a separately reviewed secure workflow is explicitly designed.
- **Balanced free time:** planning should balance productivity, hobbies and rest. Help distinguish must-do tasks from optional tasks and deferrable items; show genuinely available time after recurring commitments; allow the user to protect free time and mark personal time as unavailable. Do not automatically fill every free slot or imply that every unbooked hour is available.
- **Energy-aware planning:** consider the user's full workday and evening commitments when presenting suggested task timing. Keep suggestions realistic and user-controlled; do not infer health or energy levels. Allow optional preparation/travel buffers and temporary schedule changes.

## Cross-app features



- **One connected calendar across T.A.D.** — the Calendar is the central date view for the whole app, not a separate place where users must re-enter dates. Date-bearing records created in other departments should appear automatically as linked calendar entries where appropriate:
  - Personal Life: birthdays and anniversaries (annual by default), personal appointments and important dates.
  - Tasks & Reminders: dated tasks, deadlines and reminders.
  - Routines: each scheduled occurrence, including weekly, fortnightly, monthly or other supported schedules.
  - Travel: trip start/end dates and relevant itinerary events.
  - Other departments: any record with a meaningful date can opt into the calendar where appropriate; private content must still respect privacy rules.
- Each calendar entry must retain a link to its source record and department. The calendar is a unified view of those records, not a second independent copy. Creating or editing a source record updates its calendar representation; it must not create duplicates.
- Recurrence options should include one-off, daily, weekly, fortnightly, monthly, yearly and a custom interval where practical. Birthday/anniversary records default to yearly recurrence. Users can edit a single occurrence or the whole series; skipped/changed occurrences should be represented as exceptions without corrupting the recurring series.
- Deleting or archiving a source record must update or remove its linked calendar entry consistently, with clear confirmation where deletion affects a series. Removing a calendar display entry must not unexpectedly delete the source record; offer the appropriate source action instead.
- Support all-day dates and timed events, clear start/end dates, and correct local-time handling across phone and desktop. Today, calendar views, reminders and weekly overviews must all use the same underlying date/time rules.
- Calendar filters may let users show or hide categories/departments, but hiding a category must never delete or alter its records.

- **Quick Add** from anywhere: task, appointment, reminder, note, diary entry, habit, birthday/important date, reading journal entry, shopping item, routine, trip or Pinboard item.
- **Note templates** — offer useful starting layouts when creating a Note, including a **Moodboard** template for collecting photos, recipes, links, colour/theme ideas and written thoughts. Moodboards can reuse items saved on the main Pinboard; they should also allow adding new material directly.
- **Send to Pinboard** — relevant departments should offer a simple action to save an item or inspiration to the Pinboard without re-entering it. Initial candidates: Personal Shopping (especially wishlist items, product links and photos), Travel (places, activities and trip inspiration), Personal Life (ideas and projects), and Notes. Where practical, save a linked reference to the original item rather than creating a disconnected duplicate; show where an item came from and keep edits/deletion behaviour clear. The user can choose an existing board (or the main board by default) and optionally add a short note. Do not add this action indiscriminately to every record type.
- **Global search** across all relevant departments, including Pinboard items, respecting privacy boundaries.
- **Weekly Overview** notification on Sunday evening. Review upcoming appointments, tasks, birthdays, routines, unfinished items and Notes. Notes are reviewed and can be converted into tasks, reminders or calendar events.
- **Monthly Reset** notification on the last day of each month. Review savings, habits/routines, reading journal, upcoming birthdays, unfinished tasks and next-month organisation.
- Notifications should contain only general information; never expose private diary, private notes or reading reflections.
- **Recurring reminders** for bills, renewals and other repeating responsibilities.
- **Reliable export** so the user can retrieve their data in a documented format, including Pinboard metadata and user-owned uploaded images where technically possible.
- **Phone/desktop sync** with conflict detection and safe resolution; never silently overwrite a newer edit.
- Widget may show appointments, reminders and task summaries only, with general information and no private content.
- Future ChatGPT connection may create items in T.A.D. only through an authenticated integration and explicit confirmation before any write.

## Security and reliability — release blockers

V2 is not ready for personal use until these are implemented and tested:

1. Authentication: fingerprint/biometric unlock where supported, with PIN fallback. Lock immediately when leaving the app. Do not treat a four-digit PIN alone as strong encryption.
2. Encryption: private data encrypted at rest; use modern platform/Web Crypto primitives and a sound key-management design. Do not invent cryptography or store encryption keys alongside plaintext data.
3. Recovery: a separate strong offline recovery key plus an additional email-assisted account-recovery route, clearly distinguished from the four-digit app PIN. Email recovery must not bypass encryption or independently decrypt user data. Explain the limits and test recovery scenarios; losing all trusted devices and the offline recovery key may make encrypted data unrecoverable.
4. Backups: encrypted manual and automatic backups to a visible Google Drive folder named **T.A.D. Backups**, retain the latest five, verify backup integrity, and test restore. Do not upload plaintext private data.
5. Sync: authenticated and encrypted transport, safe conflict handling, and clear sync status.
6. Data lifecycle: export, restore, recycle bin, and deletion behaviour tested.
7. Privacy review: widgets, notifications, logs, analytics and error messages must not leak private content.
8. Platform review: verify actual Android/browser support for biometrics, background notifications and scheduling. If reliable behaviour requires a native Android wrapper, implement and test that rather than claiming a PWA can do it.

## Privacy and backup design — decisions to validate before implementation

The following is the proposed design direction. It must be proven with working prototypes and reviewed before it is treated as secure or used for personal data.

- **Separate the security jobs:** biometric authentication controls convenient access; the app PIN is a fallback access check; encryption protects stored data; recovery material restores access if a device is lost. None should be casually substituted for another.
- **Cross-device account access:** the same T.A.D. account must work on the user's Android phone and laptop, with secure sign-in on both and encrypted sync between them. Support standards-based passkeys where available, with each device registered independently.
- **Laptop sign-in (user has confirmed Windows):** target Windows Hello on the user's Windows laptop. Where supported, allow Windows Hello fingerprint, face recognition or the Windows Hello PIN to approve a passkey/sign-in locally. The Windows Hello PIN belongs to Windows and is not the T.A.D. four-digit app PIN. If Windows Hello/passkeys are unavailable, provide a secure account sign-in fallback and then T.A.D. app unlocking as appropriate.
- **Fallback access:** if the laptop does not support a suitable biometric/passkey experience, provide a secure account sign-in fallback and then the T.A.D. app PIN for local app unlocking where appropriate. Never rely on a four-digit PIN alone to authenticate a remote account or protect synced data.
- **Session and device controls:** allow the user to see registered devices/sessions, sign out a lost device, revoke its access and require re-authentication after a configurable idle period. Lock private app content when the app is backgrounded or the session expires.
- **Android access:** investigate a native Android container (for example, Capacitor) so the app can use Android's system biometric prompt and Android Keystore. The fingerprint itself is never stored by T.A.D.; the operating system confirms authentication.
- **Four-digit PIN:** retain as a user-friendly fallback only if it can be implemented with secure attempt limits, delay/lockout and safe verification. It must not be used directly as the data-encryption key or as the sole protection for a cloud backup.
- **Encryption and key handling:** encrypt sensitive records and attachments before they leave the device. Use established, authenticated encryption and a documented key hierarchy. Keep key material out of ordinary app storage and away from encrypted data. Review desktop/browser key storage separately from Android; do not assume browser storage has Android Keystore protections.
- **Recovery (user-approved preference):** provide both (a) a separate, high-entropy recovery key that the user stores safely offline, and (b) an additional email-assisted account-recovery route. The recovery key remains the independent way to regain access to encrypted data if all trusted devices are lost. Email recovery may verify account ownership, help restore account sign-in, and notify the user of recovery activity, but must not silently bypass end-to-end encryption or decrypt data on its own. If an email-based recovery design is proposed to restore encrypted data without the offline key, it must use a separately reviewed, cryptographically sound recovery mechanism with clear user consent and threat-model documentation; do not weaken encryption or make email inbox access alone sufficient to obtain the data-encryption key. The user will enter/verify their email address privately during setup; never ask them to send passwords or recovery secrets in chat. Explain that losing all trusted devices and the offline recovery key may make encrypted data unrecoverable. Never store or upload the recovery secret alongside the Google Drive backup.
- **Google Drive backups:** use the user's visible T.A.D. Backups folder, not the hidden Drive appDataFolder. Upload only encrypted backup packages. Request the minimum Drive permission needed to create and manage T.A.D.'s own backup files. Keep the latest five successful, integrity-checked backups; show date, size and status; verify before marking a backup complete; test restore from an actual downloaded backup.
- **Backup PIN clarification:** a four-digit PIN may be used to unlock the app, but it is not strong enough to protect an exported backup by itself. Backup encryption must use the recovery/key design above.
- **Sync is not backup:** phone/desktop synchronisation needs authenticated access, encrypted transport and conflict handling. A sync mistake must not silently erase the last good backup.
- **Privacy defaults:** diary entries, private notes and reading reflections stay private by default; exclude their contents from notifications, widgets, logs, diagnostics and analytics. Search results must respect the same access rules.
- **Automatic backup controls:** allow the user to enable/disable automatic backups, see the last successful backup, retry failures and run a manual backup/restore. Do not claim a backup exists until upload and integrity verification succeed.
- **Agreed delivery architecture (user approved 2026-11-26):** one shared application/codebase and account/data model, packaged for Android with **Capacitor** so Android can use native system biometrics and Android Keystore, and delivered on Windows as an installable **Progressive Web App (PWA)** through a supported browser. Both clients use the same authenticated, encrypted sync service and data model; they are not separate apps or separate datasets. Validate platform support with small security proof-of-concepts before relying on any API. Keep a future Windows desktop wrapper as an option only if PWA capabilities prove insufficient; do not introduce a second codebase.

## Build progress (2026-11-26)
- Agreed architecture recorded: shared application, Capacitor Android client, installable Windows PWA.
- Added the first PWA packaging foundations under `v2/`: web app manifest, T.A.D. SVG app icon, service worker and static app-shell caching registration.
- This is an installability/offline-shell foundation only. It does **not** yet provide secure personal-data storage, authentication, encryption, account recovery, backups, multi-device sync or a releasable private app. Do not enter personal data.
- Next engineering priority: security architecture proof-of-concepts and a real application data layer, followed by working department workflows. Keep production `main` untouched.

## Development sequence

### Phase 0 — protect and specify
- Keep the current production branch and deployment untouched.
- Develop only on the separate `v2-development` branch.
- Confirm the current app's existing features/data model before replacing anything.
- Use this document as the agreed scope and update it only when the user approves a change.

### Phase 1 — architecture and security foundation (start immediately)
- Implement the agreed shared-codebase architecture: Capacitor Android client and installable Windows PWA.
- Define and prove the account/authentication model, data schema, encryption/key hierarchy, secure local storage per platform, backup format, encrypted sync/conflict strategy and migration plan.
- Prove Android biometric-gated key access/Keystore, Windows browser/passkey capabilities, email-assisted account recovery that cannot decrypt data by itself, offline recovery-key flow, and encrypted Google Drive backup/restore.
- Keep all real personal data out until the security gates pass.

### Phase 2 — working application (build alongside the foundation where safe)
- Replace prototype-only interactions with real create, view, edit, complete, archive, restore and delete workflows.
- Implement the agreed departments and shared calendar, Quick Add, search, recurrence, Pinboard/Moodboard, travel packing, reading journal and savings features.
- Use a documented local data layer and test fixtures until the secure storage boundary is ready; never present prototype/demo storage as private or production-ready.
- Prioritise a usable core first: Today, Calendar, Tasks & Reminders, Notes & Diary, Personal Life, Pinboard and Settings; then complete the remaining agreed departments and workflows.

### Phase 3 — device clients, sync and release hardening
- Package and test the Android client; installable Windows PWA; verify sign-in, lock behaviour, offline use, notifications and device-specific security.
- Complete encrypted multi-device sync, conflict resolution, Google Drive backup/restore, device revocation and recovery.
- Run privacy, security, data-integrity and usability tests on the user's Samsung Android device and Windows laptop.

### Phase 4 — user acceptance and safe migration
- Demonstrate the working app and provide installation steps/builds.
- Test restore, lost-device recovery, offline operation, conflicts, recurring dates, notifications and privacy defaults.
- Rehearse V1 data import without changing V1; obtain explicit user approval before any migration or production release.

### Phase 5 — ongoing refinement
- Adjust departments, appearance and workflows from real use without compromising privacy or data integrity.
- Build the full navigation, design system, responsive phone/desktop layout and all department views.
- Implement core data models and CRUD flows, archive/recycle bin, search, Quick Add and export.
- Add the Reading Journal, Personal Shopping improvements, Travel structure and Pinboard.
- Add Note templates, including Moodboard, with reusable links to Pinboard items.

### Phase 3 — cross-department workflows
- Calendar checkbox creates a linked packing list.
- Trip templates and outfit-to-packing-list flow.
- Recurring routines and reminders.
- Sunday Weekly Overview and month-end Monthly Reset.
- Widget/privacy behaviour.

### Phase 4 — security, backup and sync
- Complete biometric/PIN access, encryption, recovery, Google Drive backup/restore, sync and conflict resolution.
- Verify notifications and background scheduling on the target Samsung Android device and desktop browser.

### Phase 5 — testing and release
- Test on desktop and Samsung Android.
- Test offline behaviour, refresh/reopen, data persistence, backup/restore, lost-device recovery, sync conflicts, recurring dates, notification permissions and privacy leakage.
- Run a migration rehearsal from V1 without touching the live data.
- User reviews and approves the final V2.
- Only then plan a careful migration and replacement of the installed app.

## Explicit non-goals for now

- No separate Important Documents department.
- No separate Brain Dump department.
- No standalone Wardrobe department for now; outfit planning stays inside Travel.
- No bank account connection.
- No requirement to use V2 before the security and release gates pass.

## Status

- V2 development branch created from `main`.
- This document records the agreed scope; it does not mean the features above are implemented.


### Engineering progress — 2026-11-26 (security foundation milestone 1)

Added an isolated proof-of-concept under `v2/src/`:
- `crypto.js`: Web Crypto AES-256-GCM record encryption; random 256-bit data key; PBKDF2-HMAC-SHA-256 passphrase wrapping (600,000 iterations); independent random 256-bit offline recovery-key wrapping; record IDs authenticated as additional data.
- `encrypted-store.js`: IndexedDB adapter that accepts encrypted record envelopes only. It does not accept plaintext records and is not a sync or backup service.
- `tests/crypto.test.js` and `package.json`: automated tests for encrypt/decrypt, both unlock paths, short passphrase rejection and tamper detection.
- `SECURITY-FOUNDATION.md`: implementation notes, limitations and next security gates.
- `.github/workflows/v2-security-tests.yml`: CI workflow definition for the tests.

This is a **proof of concept only**. It is not integrated into the V2 interface and is not ready for personal data. No login/account service, biometric/PIN integration, key lifecycle UI, sync, Google Drive backup, restore, or device revocation has been implemented. Automated test execution and target-device testing remain verification gates; no successful CI run is claimed yet. Production `main` and the live app remain untouched.


Verification update — 2026-11-26:
- Ran the three cryptographic module tests locally with Node.js 22.16.0 after correcting the test harness to use Node's built-in Web Crypto global: **3 passed, 0 failed**.
- The GitHub Actions workflow file is committed, but GitHub has not reported a workflow run yet; CI is therefore still unverified.

- CI follow-up: corrected the test import path after the first two workflow runs exposed harness issues. GitHub Actions run [45888108610](https://github.com/jessieanneturner/the-admin-department/actions/runs/45888108610) completed successfully on commit `d2a9c41a1adf067dfc5c0f9a299195e35d0cdfa8`; all three cryptographic tests passed.
