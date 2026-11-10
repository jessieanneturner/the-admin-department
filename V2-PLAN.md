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

## Cross-app features

- **Quick Add** from anywhere: task, appointment, reminder, note, diary entry, habit, birthday/important date, reading journal entry, shopping item, routine, trip.
- **Global search** across all relevant departments, respecting privacy boundaries.
- **Weekly Overview** notification on Sunday evening. Review upcoming appointments, tasks, birthdays, routines, unfinished items and Notes. Notes are reviewed and can be converted into tasks, reminders or calendar events.
- **Monthly Reset** notification on the last day of each month. Review savings, habits/routines, reading journal, upcoming birthdays, unfinished tasks and next-month organisation.
- Notifications should contain only general information; never expose private diary, private notes or reading reflections.
- **Recurring reminders** for bills, renewals and other repeating responsibilities.
- **Reliable export** so the user can retrieve their data in a documented format.
- **Phone/desktop sync** with conflict detection and safe resolution; never silently overwrite a newer edit.
- Widget may show appointments, reminders and task summaries only, with general information and no private content.
- Future ChatGPT connection may create items in T.A.D. only through an authenticated integration and explicit confirmation before any write.

## Security and reliability — release blockers

V2 is not ready for personal use until these are implemented and tested:

1. Authentication: fingerprint/biometric unlock where supported, with PIN fallback. Lock immediately when leaving the app. Do not treat a four-digit PIN alone as strong encryption.
2. Encryption: private data encrypted at rest; use modern platform/Web Crypto primitives and a sound key-management design. Do not invent cryptography or store encryption keys alongside plaintext data.
3. Recovery: a separate strong recovery key/passphrase, clearly distinguished from the four-digit app PIN. Explain that losing both the device credentials and recovery material may make encrypted data unrecoverable.
4. Backups: encrypted manual and automatic backups to a visible Google Drive folder named **T.A.D. Backups**, retain the latest five, verify backup integrity, and test restore. Do not upload plaintext private data.
5. Sync: authenticated and encrypted transport, safe conflict handling, and clear sync status.
6. Data lifecycle: export, restore, recycle bin, and deletion behaviour tested.
7. Privacy review: widgets, notifications, logs, analytics and error messages must not leak private content.
8. Platform review: verify actual Android/browser support for biometrics, background notifications and scheduling. If reliable behaviour requires a native Android wrapper, implement and test that rather than claiming a PWA can do it.

## Development sequence

### Phase 0 — protect and specify
- Keep the current production branch and deployment untouched.
- Develop only on the separate `v2-development` branch.
- Confirm the current app's existing features/data model before replacing anything.
- Use this document as the agreed scope and update it only when the user approves a change.

### Phase 1 — architecture and security foundation
- Choose the delivery architecture that can genuinely support Android biometrics, encrypted local data, Google Drive backups, reliable notifications and desktop access.
- Define data schema, encryption/key management, backup format, sync/conflict strategy and migration plan.
- Build security and recovery proof-of-concepts before entering personal data.

### Phase 2 — complete app shell and departments
- Build the full navigation, design system, responsive phone/desktop layout and all department views.
- Implement core data models and CRUD flows, archive/recycle bin, search, Quick Add and export.
- Add the Reading Journal, Personal Shopping improvements and Travel structure.

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
