# Roadmap: Habit Tracker

## Milestones

- ✅ **v1.0 Habit Tracker MVP** — Phases 1–4 (shipped 2026-07-23) · Tag `v1.0.0` · [archive](./milestones/v1.0-MILESTONE.md)
- ✅ **v1.1 Motivation Polish & Flexibility** — Phases 5–8 (shipped 2026-07-25) · Tag `v1.1.0` · [roadmap](./milestones/v1.1-ROADMAP.md) · [requirements](./milestones/v1.1-REQUIREMENTS.md)
- 🚧 **v2.0 Reminders & PWA** — Phases 9–14 (in progress)

## Overview

v2.0 extends the shipped local-first habit loop with **installable PWA durability** (manifest, offline shell, storage persistence, user-controlled updates) and **schedule-aware reminders that fire when the app is closed** (per-habit reminder prefs, gesture-gated permission, Web Push + minimal relay). Phase numbering continues from v1.1 (ended at Phase 8). Critical path: PWA shell → reminder prefs → push client → relay delivery.

## Phases

<details>
<summary>✅ v1.0 Habit Tracker MVP (Phases 1–4) — SHIPPED 2026-07-23</summary>

- [x] Phase 1: Habit Management & Daily Logging — completed 2026-07-19
- [x] Phase 2: Streaks & Statistics — completed 2026-07-20
- [x] Phase 3: Dashboard & Progress Visualization — completed 2026-07-21
- [x] Phase 4: Data Backup & Restore — completed 2026-07-23

Phase dirs retained: `.planning/phases/01-*` … `04-*`

</details>

<details>
<summary>✅ v1.1 Motivation Polish & Flexibility (Phases 5–8) — SHIPPED 2026-07-25</summary>

- [x] Phase 5: Visual Identity & Check-in Delight (3/3 plans) — completed 2026-07-23
- [x] Phase 6: Dashboard Aggregate & UAT Residual (3/3 plans) — completed 2026-07-23
- [x] Phase 7: Flexible Weekly Frequency (3/3 plans) — completed 2026-07-24
- [x] Phase 8: Streak Freeze (3/3 plans) — completed 2026-07-25

Phase dirs archived: `.planning/milestones/v1.1-phases/`

</details>

### 🚧 v2.0 Reminders & PWA (In Progress)

**Milestone Goal:** Help users remember to check in when the app is closed, and make the app installable, offline-capable, and storage-durable — without accounts or cloud sync.

- [ ] **Phase 9: PWA Install & Manifest** - Installable app with icons, standalone display, and install prompt UX
- [ ] **Phase 10: Service Worker, Offline & Updates** - Offline app shell, full offline core loop, and user-controlled update prompt
- [ ] **Phase 11: Storage Durability** - Durable IndexedDB request with honest status messaging and export fallback
- [ ] **Phase 12: Reminder Preferences** - Per-habit reminder toggle/time, schedule-aware rules, gesture-gated permission
- [ ] **Phase 13: Web Push & Notification Handling** - Push subscription, completion/freeze suppression, notification deep links
- [ ] **Phase 14: Push Relay & Closed-App Delivery** - Minimal relay scheduler delivers reminders when the PWA is closed

## Phase Details

### Phase 9: PWA Install & Manifest

**Goal**: Users can install Habit Tracker to their home screen as a standalone app
**Depends on**: v1.1 (Phases 1–8 complete)
**Requirements**: PWA-01
**Success Criteria** (what must be TRUE):

  1. User can add the app to their home screen from a supported browser (manifest, 192/512 maskable icons, `display: standalone`)
  2. Installed app opens in standalone mode with dark theme colors matching the existing UI
  3. User sees a contextual install prompt that explains value (not a blocking first-visit modal)
  4. On iOS, user sees guidance that installing to the home screen is required before push reminders will work

**Plans**: 3 plans

Plans:
**Wave 1**

- [ ] 09-01-PLAN.md — Static manifest, flame icons, index.html meta, platform/install.ts + unit tests

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 09-02-PLAN.md — InstallBanner, IosInstallModal, MainLayout mount + component tests

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 09-03-PLAN.md — Settings install section, SettingsPage tests, phase scope fence

**UI hint**: yes

### Phase 10: Service Worker, Offline & Updates

**Goal**: Users can open and use the app without network after the first visit, and control when to reload for updates
**Depends on**: Phase 9
**Requirements**: PWA-02, PWA-03, PWA-05
**Success Criteria** (what must be TRUE):

  1. User can load the app shell offline after at least one prior online visit (service worker precache)
  2. User can check in, view streaks, and export/import JSON backup with no network connection
  3. User sees a prompt when a new app version is available and chooses when to reload (no mid-session auto-reload)
  4. Offline check-in and streak data persist across offline sessions via IndexedDB (unchanged from v1.1 behavior, now verified behind cached shell)

**Plans**: TBD
**UI hint**: yes

### Phase 11: Storage Durability

**Goal**: Users understand and can improve the durability of their local data against browser eviction
**Depends on**: Phase 9 (installed PWAs grant `persist()` more readily; can parallelize with Phase 10)
**Requirements**: PWA-04
**Success Criteria** (what must be TRUE):

  1. User can request durable storage from Settings and see whether persistence was granted or denied
  2. User sees plain-language status explaining what durable storage means for their habit data
  3. If persistence is denied, user sees an export CTA and guidance that export remains their backup safety net
  4. Persistence request is deferred until meaningful engagement (not on first visit)

**Plans**: TBD
**UI hint**: yes

### Phase 12: Reminder Preferences

**Goal**: Users can configure optional per-habit daily reminders with schedule-aware rules and intentional permission UX
**Depends on**: v1.1 schedule domain (Phases 7–8); can parallelize with Phases 9–11 once Dexie v3 schema is defined
**Requirements**: REM-01, REM-03, REM-04
**Success Criteria** (what must be TRUE):

  1. User can enable an optional daily reminder time per habit when creating or editing (off by default)
  2. User is asked for notification permission only after enabling a reminder and setting a time — never on first visit
  3. Reminder configuration respects each habit's schedule (no reminder configured for days the habit is not due)
  4. Reminder preferences persist across sessions and survive export/import backup round-trip

**Plans**: TBD
**UI hint**: yes

### Phase 13: Web Push & Notification Handling

**Goal**: Users receive correctly gated push notifications and can tap them to return to the relevant habit or today view
**Depends on**: Phase 10 (service worker registration), Phase 12 (reminder schedule shape)
**Requirements**: REM-05, REM-06
**Success Criteria** (what must be TRUE):

  1. User does not receive a reminder notification for a habit already completed today
  2. User does not receive a reminder notification for a habit frozen (skipped) today
  3. User can tap a notification to open the app to today's view or the relevant habit detail
  4. Push subscription is established via the registered service worker and recovers from `pushsubscriptionchange` events

**Plans**: TBD

### Phase 14: Push Relay & Closed-App Delivery

**Goal**: Users receive browser push notifications at their chosen reminder time even when the app is fully closed
**Depends on**: Phase 12 (schedule snapshots), Phase 13 (push subscription + SW handlers)
**Requirements**: REM-02
**Success Criteria** (what must be TRUE):

  1. User receives a browser push notification when a due habit's reminder time arrives while the app is closed
  2. Closed-app delivery works via Web Push through a minimal relay (no user accounts; anonymous device ID only)
  3. Relay fires only on days the habit is due per its schedule (daily, specific weekdays, or X×/week rules)
  4. Relay uses the user's local timezone for reminder matching (including DST transitions)
  5. Settings show diagnostic guidance when push delivery fails (permission denied, not installed on iOS, subscription expired)

**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Habit Management & Daily Logging | v1.0 | 5/5 | Complete | 2026-07-19 |
| 2. Streaks & Statistics | v1.0 | 4/4 | Complete | 2026-07-20 |
| 3. Dashboard & Progress Visualization | v1.0 | 4/4 | Complete | 2026-07-21 |
| 4. Data Backup & Restore | v1.0 | 3/3 | Complete | 2026-07-23 |
| 5. Visual Identity & Check-in Delight | v1.1 | 3/3 | Complete | 2026-07-23 |
| 6. Dashboard Aggregate & UAT Residual | v1.1 | 3/3 | Complete | 2026-07-23 |
| 7. Flexible Weekly Frequency | v1.1 | 3/3 | Complete | 2026-07-24 |
| 8. Streak Freeze | v1.1 | 3/3 | Complete | 2026-07-25 |
| 9. PWA Install & Manifest | v2.0 | 0/3 | Not started | - |
| 10. Service Worker, Offline & Updates | v2.0 | 0/TBD | Not started | - |
| 11. Storage Durability | v2.0 | 0/TBD | Not started | - |
| 12. Reminder Preferences | v2.0 | 0/TBD | Not started | - |
| 13. Web Push & Notification Handling | v2.0 | 0/TBD | Not started | - |
| 14. Push Relay & Closed-App Delivery | v2.0 | 0/TBD | Not started | - |

**Execution order:** 9 → 10 → 11 (11 may parallel 10) → 12 (may parallel 9–11) → 13 → 14
