# Project Research Summary

**Project:** Habit Tracker — v2.0 Reminders & PWA
**Domain:** Local-first habit tracker adding Web Push reminders, installable PWA, and offline durability to an existing Dexie/React SPA
**Researched:** 2026-07-25
**Confidence:** MEDIUM-HIGH

## Executive Summary

Habit Tracker v2.0 extends a shipped local-first SPA (v1.0–v1.1: habits, schedule-aware streaks, freeze, export/import) with **reminders that work when the app is closed** and **installable offline durability** — without accounts, cloud sync, or a full backend. Experts building comparable PWAs treat the service worker as a **delivery adapter** (precached shell + push display + deep links), keep IndexedDB as the single source of truth in the main thread, and add a **minimal push relay** because browsers cannot fire exact-time notifications when the PWA is killed. The v1.1 stack (Vite 8, React 19, Dexie 4, Tailwind 4, shadcn/ui) stays unchanged; v2.0 adds `vite-plugin-pwa` + Workbox 7 (`injectManifest` for custom `push` handlers), native Push/Notification APIs, and a separate `push-relay/` deployable (Cloudflare Worker + `@pushforge/builder` recommended).

The recommended approach is **bottom-up**: PWA manifest and service worker registration first (shared prerequisite for offline shell, update prompts, and push subscription), then storage persistence UX, then per-habit reminder preferences in Dexie, then Web Push client + relay scheduler. Reminder **configuration** lives in Dexie (`Habit.reminder?: { enabled, timeLocal }`); **delivery** is delegated to platform (Web Push + optional Notification Triggers) with schedule snapshots synced to the relay. Reuse v1.1 `schedule.ts` and `dates.ts` for frequency-aware eligibility — reminders must respect `specific_days`, `times_per_week`, freeze records, and same-day completions. Permission must be **gesture-gated after user enables a reminder**, never on cold visit.

Key risks are well-documented: client-side timers and Periodic Background Sync cannot replace server cron; UTC/DST mishandling will drift reminder times; iOS requires installed PWA before Web Push; relay cannot see Dexie completions without either SW-side due checks or a minimal due-bitmap sync. Mitigate with minute-resolution relay cron keyed by IANA timezone, contextual permission UX, iOS install-first guidance, `registerType: 'prompt'` for SW updates, and completion suppression evaluated at fire time (not at morning snapshot).

## Key Findings

### Recommended Stack

v2.0 adds PWA and push infrastructure on top of the existing v1.1 stack without new runtime deps in the main SPA bundle beyond `workbox-window` for SW registration. See [STACK.md](./STACK.md) for full rationale.

**Core v2.0 additions:**
- **vite-plugin-pwa 1.3.0** — manifest, precache, `virtual:pwa-register/react` for update prompts — peers Vite 8 and Workbox 7.4.1
- **Workbox 7.4.1** (`workbox-precaching`, `workbox-core`, `workbox-routing`) — precache app shell via `injectManifest` strategy (required for custom `push` / `notificationclick` handlers; `generateSW` is not viable for REM-02)
- **@pushforge/builder 2.0.5** — Web Push encryption + VAPID signing on Cloudflare Workers (replaces `web-push`, which fails on Workers runtime)
- **Cloudflare Workers + Cron Triggers** — minimal relay: store subscriptions + schedule snapshots, fire due reminders each minute
- **Native APIs** — `PushManager`, `Notification.permission`, `navigator.storage.persist()`, `navigator.serviceWorker.ready` — no client library needed for subscribe flow

**Critical version/integration notes:**
- Use `strategies: 'injectManifest'` with `src/sw/sw.ts` — not `generateSW`
- Use `registerType: 'prompt'` — not `autoUpdate` (mid-check-in reload risk)
- Dexie stays in main thread only; relay embeds habit name in push payload OR SW reads Dexie at `push` time for completion gate
- Relay is a separate `push-relay/` workspace — not bundled in the SPA

### Expected Features

See [FEATURES.md](./FEATURES.md) for competitor analysis and dependency graph.

**Must have (table stakes) — v2.0 launch:**
- **Per-habit optional reminder time (REM-01)** — off by default; toggle + time picker on habit edit; persisted in Dexie
- **Push when app closed (REM-02)** — Web Push + SW handler + minimal relay; client-only timers are insufficient
- **Permission on user intent** — pre-prompt → user enables reminder → gesture-gated `requestPermission()`
- **Schedule-aware reminders** — reuse v1.1 frequency model; no nag on unscheduled weekdays
- **Done/freeze suppression** — no reminder after check-in or on frozen today
- **Notification tap → open app** — `notificationclick` deep-link to today or habit
- **Installable PWA (PWA-01)** — manifest, maskable 192/512 icons, `display: standalone`, dark theme tokens
- **Offline app shell (PWA-02)** — Workbox precache; first visit needs network, repeat visits load shell offline
- **Full offline core loop (PWA-03)** — check-in, streaks, export/import via Dexie + cached shell (already true at data layer)
- **Update prompt (PWA-05)** — user-controlled reload via `useRegisterSW`
- **`navigator.storage.persist()` + eviction UX (PWA-04)** — after meaningful engagement; export CTA if denied

**Should have (differentiators):**
- **Reminders without accounts** — anonymous `deviceId` in Dexie; relay stores delivery metadata only
- **Freeze + quota-aware suppression** — unique to this codebase vs Loop/Streaks daily-only checks
- **Minimal dark installable PWA** — restraint vs cluttered wellness apps
- **Honest storage durability UX** — plain-language persist status; export remains real backup
- **Deferred install prompt** — tie install value to enabling first reminder

**Defer (v2.x+):**
- Check-in/dismiss from notification actions — P2; platform-gated (iOS limited)
- Global quiet hours / DND window — P2
- Multiple reminder times per habit — duplicate habit workaround for v2.0
- Home screen widgets — v3+ (PROJECT.md)
- Cloud sync for reminders — contradicts local-first
- Firebase/OneSignal — vendor lock-in

### Architecture Approach

v2.0 extends the existing four-layer SPA with a **Platform Layer** (SW lifecycle, push, storage persist) and an **external minimal relay** for closed-app delivery. Dexie remains authoritative for habits, completions, freezes, reminder prefs, and push subscription; the relay holds only `deviceId → { subscription, schedule[] }`. Domain logic stays pure in `domain/reminders.ts`; `platform/` adapters wrap browser APIs for testability. See [ARCHITECTURE.md](./ARCHITECTURE.md).

**Major components:**
1. **Platform Layer (`src/sw/`, `src/platform/`)** — Workbox precache, `push`/`notificationclick` handlers, `persist()`, subscribe adapters — no React in SW bundle
2. **Reminder domain (`domain/reminders.ts`)** — pure next-fire time, eligibility per frequency, skip-if-done/frozen — shares `schedule.ts` / `dates.ts`
3. **Infrastructure extensions** — `settingsRepository`, `pushSubscriptionRepository`, `reminderSyncService` (Dexie → relay POST, debounced)
4. **Push relay (`push-relay/`)** — VAPID-signed cron scheduler; separate deploy; no habit/completion data
5. **PWA UI (`ReloadPrompt`, `InstallPrompt`, `NotificationSettings`)** — update prompt, A2HS, permission recovery diagnostics

**Critical invariant:** Reminder preferences in Dexie; delivery via platform. Never store "notification sent" as completion state.

### Critical Pitfalls

See [PITFALLS.md](./PITFALLS.md) for full checklist and recovery strategies.

1. **Client-side scheduling for closed-app reminders** — `setTimeout`, Periodic Background Sync, and Notification Triggers cannot reliably fire when PWA is killed. Use relay cron + Web Push; optional Notification Triggers only as Chrome/Android boost.
2. **Reminder time in UTC instead of user local time** — store `timeLocal: "HH:mm"` + IANA timezone per subscription; relay matches local wall clock including DST. Reuse `getLocalDateString()` discipline from streaks.
3. **Push permission at wrong time** — drive-by prompts yield ~12% grant vs ~30%+ after contextual gesture. Default reminders off; ask only after user enables reminder + sets time.
4. **Weekly/X×week logic copied from daily streaks** — naive daily blast on Mon/Wed/Fri habits or after quota met. Evaluate `isHabitDueOnDate()`, freeze, and completion at fire time.
5. **Relay schedules without completion state** — relay cannot see Dexie. Either SW reads Dexie at `push` event and gates `showNotification()`, or client syncs minimal due-bitmap on toggle/freeze/visibilitychange. Never copy full completions to server.
6. **iOS push treated like Android** — iOS 16.4+ requires installed PWA; `showNotification()` must run synchronously in `event.waitUntil`. Guide A2HS before push opt-in.
7. **SW cache fighting Dexie** — never cache IndexedDB data in Cache API; `skipWaiting()` only after user accepts update prompt.

## Implications for Roadmap

Based on research, suggested phase structure continues from v1.1 Phase 8. Critical path: **SW registration → push client → relay**. Phase 12 (REM-01 UI) can parallelize with Phases 9–10 once Dexie v3 schema is defined.

### Phase 9: PWA Install & Manifest (PWA-01)
**Rationale:** Installability is prerequisite for iOS Web Push (16.4+ standalone mode) and user trust for "app on home screen." Low complexity; unblocks install prompt UX.
**Delivers:** Web app manifest, maskable icons (192/512), theme/background colors matching dark aesthetic, `InstallPrompt` component, `beforeinstallprompt` capture.
**Addresses:** PWA-01, iOS A2HS-before-push guide (foundation)
**Avoids:** iOS push silently failing in Safari tab (Pitfall 7)

### Phase 10: Service Worker & Offline Shell (PWA-02, PWA-05)
**Rationale:** Shared SW foundation required before push subscription (`navigator.serviceWorker.ready`). Establishes cache strategy before adding push handlers.
**Delivers:** `vite-plugin-pwa` + `injectManifest`, `src/sw/cache.ts` (precache + SPA fallback), `SKIP_WAITING` handler, `ReloadPrompt` via `useRegisterSW`, offline check-in verified on `dist/`.
**Uses:** vite-plugin-pwa 1.3.0, Workbox 7.4.1, `registerType: 'prompt'`
**Avoids:** SW cache vs Dexie desync (Pitfall 6); mid-session auto-reload (Pitfall 6, UX)

### Phase 11: Storage Durability & Eviction UX (PWA-04)
**Rationale:** Complements export/import; can parallelize with Phases 9–10. Chrome grants `persist()` more readily for installed PWAs — benefits from Phase 9.
**Delivers:** `platform/storage.ts`, `useStoragePersistence`, Settings diagnostics (`persisted()`, quota estimate), eviction-risk banner with export CTA on denial.
**Addresses:** PWA-04, honest storage durability differentiator
**Avoids:** Safari 7-day proactive eviction surprise (Pitfall 9); false "data saved permanently" claims

### Phase 12: Reminder Preferences & Domain Logic (REM-01)
**Rationale:** Reminder data model and UI can ship before delivery path exists; defines schedule shape for relay. Contextual permission UX belongs here, before push subscribe.
**Delivers:** `domain/reminders.ts` + tests, `Habit.reminder` field, Dexie v3 migration, `app_settings` table (`deviceId`), HabitForm reminder toggle + time picker, backup v2 schema, frequency-aware eligibility rules.
**Addresses:** REM-01, schedule-aware reminders, global/per-habit disable, permission-on-intent
**Avoids:** Permission permanent deny (Pitfall 3); weekly/X×week wrong-day nag (Pitfall 4)

### Phase 13: Web Push Client (REM-02a)
**Rationale:** Depends on Phase 10 SW registration. Implements client half of REM-02 before relay exists.
**Delivers:** `platform/push.ts`, `platform/notifications.ts`, `pushSubscriptionRepository`, `usePushSubscription`, `NotificationSettings`, `sw/pushHandlers.ts` (`push` + `notificationclick`), `pushsubscriptionchange` handler, completion/freeze gate at display time (Dexie read in SW or due-bitmap — **decide in planning**).
**Uses:** Native PushManager, VAPID public key in client
**Avoids:** Subscription rot without refresh (Pitfall 8); iOS deferred `showNotification` (Pitfall 7)

### Phase 14: Push Relay & Scheduler (REM-02b)
**Rationale:** Closes REM-02 delivery loop. Depends on Phase 12 schedule shape and Phase 13 subscription flow.
**Delivers:** `push-relay/` deployable (CF Worker + D1/KV + Cron), `reminderSyncService` (debounced POST on habit/reminder changes), VAPID keys in env, minute-resolution timezone-aware cron, dedup (`habitId + localDate`), 410/404 subscription cleanup, E2E closed-app push test.
**Uses:** `@pushforge/builder`, Cloudflare Cron Triggers
**Avoids:** Client-side scheduling (Pitfall 1); UTC/DST drift (Pitfall 2); scope creep to accounts (Pitfall 10)

### Phase 15: Integration Hardening & Optional Boosts
**Rationale:** Cross-cutting quality after core path works; optional Notification Triggers tier for Chrome/Android.
**Delivers:** Full suppression matrix tests (done, frozen, unscheduled day, quota met), permission-denied fallback UX, settings diagnostic panel ("why no notifications?"), optional `scheduleLocalTriggers()` behind `showTrigger` feature detect, Vitest relay payload contract tests.
**Addresses:** P1 quality bar from FEATURES.md "Looks Done But Isn't" checklist
**Avoids:** Notification fatigue; silent delivery failure

### Phase Ordering Rationale

- **PWA before push:** Web Push subscription binds to SW registration; iOS requires installed PWA before subscribe — Phases 9–10 precede 13–14.
- **REM-01 before REM-02:** Schedule snapshot shape and permission UX must exist before relay stores schedules; Phase 12 can parallelize with 9–10 for velocity.
- **Storage parallel to PWA:** Phase 11 has no hard dependency on push; benefits from install (Phase 9) for persist grant rate.
- **Relay last on critical path:** Phase 14 is the only phase introducing server infrastructure; keep scope capped (VAPID + cron + send, no accounts).
- **Domain purity preserved:** `reminders.ts` shared between client sync payload and relay scheduler (copy or workspace import) — avoids duplicating schedule logic.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 14:** Push relay timezone cron implementation, `@pushforge/builder` on CF Workers, 410 cleanup patterns, relay scaling index strategy — MEDIUM confidence stack area
- **Phase 13:** Completion suppression architecture decision — SW Dexie read vs due-bitmap sync (ARCHITECTURE and PITFALLS propose slightly different patterns; needs explicit ADR)
- **Phase 12:** `times_per_week` reminder product rule — remind daily until quota met vs mid-week threshold only (FEATURES flags as product decision)

Phases with standard patterns (skip `--research-phase`):
- **Phase 9–10:** vite-plugin-pwa + Workbox — extensive docs, HIGH confidence
- **Phase 11:** `navigator.storage.persist()` — web.dev/MDN well-documented
- **Phase 12 UI:** HabitForm extension, Dexie migration — follows existing v1.1 patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH (PWA), MEDIUM (relay) | vite-plugin-pwa/Workbox verified on npm; `@pushforge/builder` + CF Cron less battle-tested in this codebase |
| Features | MEDIUM-HIGH | PROJECT.md authority + competitor survey; iOS/Android delivery variance remains |
| Architecture | HIGH (PWA/offline), MEDIUM (reminder reliability) | Layered extension fits v1.x; cross-browser push timing is best-effort not alarm-clock |
| Pitfalls | HIGH | MDN/web.dev + PWA post-mortems; completion-suppression data path needs planning decision |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Completion suppression data path:** ARCHITECTURE recommends self-contained push payloads (habit name in relay body); PITFALLS recommends SW Dexie read at `push` time for done/freeze gate. Decide in Phase 13 planning — hybrid (payload for display + SW gate for suppress) is viable.
- **Notification Triggers tier 2:** Chrome/Android optional boost — include in Phase 15 only if Phase 14 core path is stable; API has limited Safari support.
- **`times_per_week` reminder timing:** Whether to nag every scheduled day until quota met vs only after mid-week threshold — document in REM-01 spec during Phase 12.
- **Relay hosting:** CF Worker recommended but requires CF account; validate deploy path and env secret management before Phase 14 execution.
- **Human UAT on real devices:** Closed-app push cannot be fully validated in jsdom — plan Android Chrome + installed iOS PWA manual verification for Phase 14 closeout.

## Sources

### Primary (HIGH confidence)
- [vite-plugin-pwa injectManifest guide](https://vite-pwa-org.netlify.app/guide/inject-manifest.html) — custom SW + push handlers
- [vite-plugin-pwa React integration](https://vite-pwa-org.netlify.app/frameworks/react) — `useRegisterSW`, prompt update
- [Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching) — `precacheAndRoute`, cache cleanup
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — subscription flow
- [MDN StorageManager.persist()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist) — durable IndexedDB
- [web.dev: Persistent storage](https://web.dev/articles/persistent-storage) — persist timing and eviction UX
- [web.dev: Push notifications codelab](https://web.dev/articles/push-notifications-client-codelab) — VAPID, SW handlers
- [web.dev: Permissions best practices](https://web.dev/articles/permissions-best-practices) — gesture-gated prompts
- [Apple: Web Push in web apps](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) — iOS install requirement
- PROJECT.md — v2.0 scope, REM-01/02, PWA-01..05, out-of-scope boundaries

### Secondary (MEDIUM confidence)
- [@pushforge/builder npm](https://www.npmjs.com/package/@pushforge/builder) — edge-compatible Web Push signing
- [Aulvem: Anonymous Web Push](https://aulvem.com/blog/2026-07-07-anonymous-web-push-no-login/) — device token pattern, iOS constraints
- [Steal What Works habit app survey](https://stealwhatworks.com/blogs/news/habit-tracking-app-features) — ~89% reminder penetration
- [Loop Habit Tracker](https://github.com/iSoron/uhabits) — OSS reference for per-habit reminders and notification actions
- [Rehabi-techo](https://github.com/p1xion/rehabi-techo) — Dexie + vite-plugin-pwa reference

### Tertiary (LOW confidence — validate during execution)
- Notification Triggers as tier-2 boost — development ended; Chrome-only viability uncertain
- CF Worker cron at scale (10K+ subscriptions) — indexing strategy untested for this project

---
*Research completed: 2026-07-25*
*Ready for roadmap: yes*
*Baseline: v1.1 stack unchanged; this summary covers v2.0 Reminders & PWA additions only*
