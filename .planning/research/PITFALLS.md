# Pitfalls Research

**Domain:** Local-first habit tracker — adding reminders, Web Push, and PWA offline to an existing Dexie/React SPA
**Researched:** 2026-07-25
**Confidence:** HIGH (storage/permission guidance from MDN/web.dev; push scheduling from cross-checked PWA post-mortems)

## Critical Pitfalls

### Pitfall 1: Client-Side Scheduling for Closed-App Reminders

**What goes wrong:**
Reminders never fire, fire hours late, or only work while the tab is open. Users report "reminders are broken on iOS" after shipping `setTimeout`, `setInterval`, Periodic Background Sync, or the abandoned Notification Triggers API.

**Why it happens:**
Developers assume service workers run timers like native apps. In reality, SWs are event-driven and suspended; background sync APIs have no Safari/iOS support; Notification Triggers development ended without cross-platform reliability. The v1 codebase has no service worker — adding client timers feels like the "local-first, no backend" path.

**How to avoid:**
- Treat **server-triggered Web Push** as the only reliable closed-app path for REM-02 (minimal relay, no accounts).
- Use a **minute-resolution cron** on the relay that evaluates each subscription's IANA timezone + local reminder time.
- Optionally evaluate due-ness **in the service worker at `push` time** by reading IndexedDB (see Pitfall 5) — never assume the relay knows completion state.
- Document platform limits in settings: iOS requires home-screen install; delivery is best-effort, not alarm-clock exact.

**Warning signs:**
- Scheduling code lives in `useEffect` or main-thread timers.
- No relay/cron endpoint in architecture diagram.
- Tests only pass with DevTools "offline" unchecked and tab focused.
- README claims "works offline" for reminders without mentioning push relay.

**Phase to address:**
Phase 13–14 (Web Push client + relay scheduler) — decide scheduling architecture before building REM-01 UI.

---

### Pitfall 2: Reminder Time Evaluated in Server UTC Instead of User Local Time

**What goes wrong:**
A user sets "8:00 AM" reminder; notifications arrive at 3:00 AM or 2:00 PM after DST. Travelers get wrong-time nudges. Weekly quota reminders fire on the wrong calendar day.

**Why it happens:**
The relay cron runs at a single UTC time and compares raw `HH:mm` strings without timezone conversion. Or reminder time is stored as `Date.toISOString()` / UTC offset, which breaks across DST boundaries. The v1 app already uses local `YYYY-MM-DD` via `getLocalDateString()` — reminder scheduling must follow the same rule.

**How to avoid:**
- Store per-subscription **`reminderTime` as `HH:mm` in local time** + **IANA timezone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`), refreshed on app focus and when user changes system TZ.
- Cron loop: for each subscription, compute `localTime` with `toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false })` and match against `reminderTime`.
- Derive **"today" for dedup** in the user's timezone, not server timezone — same calendar-string discipline as streaks.
- Add test fixtures: US spring-forward, fall-back, Sydney UTC+10, traveler changing TZ mid-week.

**Warning signs:**
- `new Date().getUTCHours()` used in scheduler.
- Subscription record has no `timezone` field.
- Unit tests run only in CI UTC with no TZ matrix.
- Users report one-hour drift exactly on DST weekends.

**Phase to address:**
Phase 14 (Push relay & scheduler) — timezone must be in subscription schema from day one.

---

### Pitfall 3: Push Permission Asked at Wrong Time (Permanent Deny)

**What goes wrong:**
Users block notifications on first visit. Grant rate ~12% for drive-by prompts vs ~30%+ after contextual gesture. Recovery requires digging into browser settings — most users never do. Reminders feature is effectively dead for that cohort.

**Why it happens:**
PWA install flows and "enable notifications" banners trigger `Notification.requestPermission()` on load, after manifest install, or before the user configures any reminder. Chrome's quieter UI hides repeat offenders.

**How to avoid:**
- **Default reminders off.** Show native permission prompt only after user enables a per-habit reminder toggle AND sets a time (REM-01).
- Use a **custom pre-prompt** explaining value ("Get a nudge at 8:00 for habits you haven't checked in yet").
- Call `Notification.requestPermission()` only inside a **user gesture** handler (button click).
- If denied: show **recovery instructions** (browser settings path per platform), never re-prompt automatically.
- Separate **Notification permission** from **Push subscription** — both are required; handle each state in UI.

**Warning signs:**
- `requestPermission()` in `main.tsx` or route mount.
- No `permission === 'denied'` branch in settings.
- Install prompt and notification prompt shown back-to-back.
- Analytics show high `default` → `denied` on day 0.

**Phase to address:**
Phase 12 (Reminder preferences UI) for contextual ask; Phase 13 for subscription flow.

---

### Pitfall 4: Weekly / X×Week Reminder Logic Copied from Daily Streaks

**What goes wrong:**
Mon/Wed/Fri habit sends reminders on Tuesday. `times_per_week` habit nags every day at 8 AM even when quota is already met Wednesday. Frozen days still get "don't forget!" pushes. Users disable notifications entirely.

**Why it happens:**
Reminder scheduler reuses `isDueOnDate()` or daily cron without re-checking v1.1 frequency models (`specific_days`, `times_per_week`, freeze records). REM-01 spec says "daily reminder at a set time" but the product already has flexible schedules — naive daily blast contradicts them.

**How to avoid:**
- **At send time**, evaluate due-ness with the same domain helpers as check-in (`isHabitDueOnDate`, freeze exclusion, already-completed skip).
- **Weekly/specific_days:** only include habits where today is a scheduled day.
- **times_per_week:** only remind if `countCompletionsInCalendarWeek < times` AND optionally only after mid-week threshold (product decision — document in REM-01).
- **Frozen today:** suppress reminder for that habit.
- **Already completed today:** suppress (requires Pitfall 5 data path).
- One notification per habit per local calendar day max (dedup key: `habitId + localDate`).

**Warning signs:**
- Scheduler iterates all habits with `reminderEnabled` without frequency branch.
- No freeze/completion check in relay or SW push handler.
- Users with 3×/week habits get 7 notifications/week.

**Phase to address:**
Phase 12 (REM-01 UI + due rules) and Phase 14 (scheduler dedup logic).

---

### Pitfall 5: Relay Schedules Without Access to Local Completions

**What goes wrong:**
User checks in at 7:55 AM; reminder still fires at 8:00 AM. Or relay stores a stale "due snapshot" from yesterday. Server can't see Dexie — the "no accounts" constraint blocks querying habit state from the relay.

**Why it happens:**
Architecture splits push relay (server) from data (IndexedDB) but reminder logic assumes server knows completion state. Teams either (a) send reminders regardless of completion, or (b) sync full habit DB to server — both violate product intent.

**How to avoid:**
- **Preferred pattern for this project:** relay sends a lightweight **"evaluate reminders" push** (or per-habit push with `habitId`); **service worker reads Dexie** at `push` event time and calls `showNotification()` only if habit is still due. Same-origin IndexedDB is available in SW.
- **Alternative:** client syncs a minimal **due bitmap** (`{ habitId, localDate, due: boolean }`) to relay on every toggle/freeze and on `visibilitychange` — relay skips send when `due: false`.
- Never copy full completions to server "for convenience."
- Share Zod schema / due functions between app and SW bundle (build-time import of pure `domain/` modules).

**Warning signs:**
- Relay database has `completions` table.
- Push payload is the final notification text with no SW-side gate.
- No IndexedDB open in `push` event handler.
- Check-in after subscribe doesn't update relay state.

**Phase to address:**
Phase 13 (SW push handler + Dexie read) and Phase 14 (relay payload contract).

---

### Pitfall 6: Service Worker Cache Fighting Dexie as Source of Truth

**What goes wrong:**
Offline check-in writes to IndexedDB but UI shows stale streaks from cached JS bundle. After deploy, users run old scheduler logic against new Dexie schema. Import/backup breaks because cached app shell is v1.1 while DB migrated to v3.

**Why it happens:**
PWA setup precaches `index.html` + hashed assets aggressively. Teams cache API responses or duplicate habit data into Cache API. SW `skipWaiting()` forces immediate activation mid-session. v1 app has zero SW — first PWA phase introduces a new persistence layer that can desync from Dexie.

**How to avoid:**
- **Never cache IndexedDB data in Cache API.** Dexie is the only data store; SW caches only static shell (JS/CSS/fonts/icons).
- Precache **content-hashed assets** (Vite default); use **network-first for `index.html`** or user-prompted reload on update.
- **`skipWaiting()` only after user accepts** update prompt — preserve in-flight check-ins.
- Tag releases: `appVersion` + `dexieSchemaVersion` in `app_metadata`; migration runs in app thread before UI renders.
- SW update flow: `updatefound` → toast "New version available" → reload on confirm.

**Warning signs:**
- Workbox `runtimeCaching` rules for `/api/*` when there is no API.
- Habit/completion data in `postMessage` caches.
- Users report "fixed bug still happens" after deploy until hard refresh.
- Dexie migration runs in SW instead of controlled app bootstrap.

**Phase to address:**
Phase 10 (Service worker & offline shell) — cache strategy is architectural, not polish.

---

### Pitfall 7: iOS Push Treated Like Android Chrome

**What goes wrong:**
Push works in desktop Chrome dev but silently fails on iPhone Safari. Users install PWA but never get notifications. Or SW receives push but doesn't call `showNotification()` immediately — Safari revokes permission.

**Why it happens:**
iOS Web Push (16.4+) requires **Add to Home Screen** installed PWA, uses APNs under the hood, and disallows silent/invisible push. Testing only on Android. Install prompt not surfaced before push opt-in.

**How to avoid:**
- Feature-detect: `('PushManager' in window) && ('serviceWorker' in navigator)`.
- **iOS path:** guide install-to-home-screen first; then enable reminders.
- SW `push` handler must **`showNotification()` synchronously** in `event.waitUntil` — no deferred fetch before display.
- Test on real iOS installed PWA, not Safari tab alone.
- Document Android battery optimization / Doze as cause of delayed delivery.

**Warning signs:**
- Push QA checklist has only Chromium entries.
- No `beforeinstallprompt` / iOS install instructions in REM settings.
- `push` handler awaits network before `showNotification()`.
- Permission granted in Safari tab but no subscription on iOS.

**Phase to address:**
Phase 9 (PWA install) before Phase 13 (push client); iOS install gate in Phase 12 settings copy.

---

### Pitfall 8: Subscription Rot Without `pushsubscriptionchange` Handling

**What goes wrong:**
Reminders work for weeks then stop for a subset of users. Relay logs fill with `410 Gone`. Re-enabling reminders requires user to toggle off/on. No alert when delivery is broken.

**Why it happens:**
Browsers rotate push endpoints. Relay keeps stale `endpoint` + `p256dh` + `auth`. No cleanup on 410; no client listener for subscription refresh.

**How to avoid:**
- SW: listen for `pushsubscriptionchange`, re-subscribe, `POST` new subscription to relay (same anonymous device id).
- Relay: on `410`/`404`, **delete subscription immediately** — never retry terminal errors.
- Client: periodic `registration.pushManager.getSubscription()` health check on app open.
- UI: "Notifications paused — tap to re-enable" when subscription missing but prefs on.

**Warning signs:**
- Relay retry loop on 410.
- No `pushsubscriptionchange` in SW source.
- Subscription stored only in `localStorage` once at opt-in.
- Growing dead rows in relay DB.

**Phase to address:**
Phase 13 (SW lifecycle) and Phase 14 (relay error classification).

---

### Pitfall 9: `navigator.storage.persist()` Called Wrong or Not at All

**What goes wrong:**
Safari tab users lose months of habits after 7 days without visiting the site (ITP proactive eviction). Or `persist()` called on first paint, denied silently, and team assumes data is safe. PWA install is marketed as "backup" but tab users still evicted.

**Why it happens:**
v1 deferred `persist()` to v2. Teams either forget it entirely, call it before engagement (low grant rate), or assume install alone guarantees persistence without calling `persist()`.

**How to avoid:**
- Call `navigator.storage.persist()` **after meaningful engagement** (e.g., 3rd check-in or enabling backup reminder) — idempotent, skip if `persisted()` already true.
- On denial: show **eviction-risk banner** with export CTA (especially Safari non-installed users).
- Installed home-screen PWA: largely exempt from 7-day rule — still call `persist()` and promote install.
- Surface `navigator.storage.persisted()` in settings diagnostics.
- **Export/import remains the real backup** — persist reduces risk, doesn't eliminate it.

**Warning signs:**
- No `storage.persist` call anywhere in v2 diff.
- Settings claim "data saved permanently" without qualification.
- No UX for `persisted() === false` on Safari.
- User reports empty app after two weeks idle in Safari tab.

**Phase to address:**
Phase 11 (Storage durability & eviction UX).

---

### Pitfall 10: Scope Creep — Accounts, Full Backend, or Notification Triggers Revival

**What goes wrong:**
"v2 needs a server anyway" becomes user accounts, cloud sync, analytics pipeline, or betting on dead APIs. Milestone slips; local-first contract breaks.

**Why it happens:**
Push relay feels like "half a backend." Product pressure for multi-device sync. Developer discovers Notification Triggers docs and tries to avoid server entirely.

**How to avoid:**
- Relay scope: **VAPID sign + subscription store + cron + send** — anonymous `deviceId` in IndexedDB, no login.
- Reject Notification Triggers / Periodic Background Sync as primary path (no Safari; Triggers deprecated).
- Cap relay storage: subscription + per-habit reminder prefs + optional due bitmap — not full habit export.
- Any sync proposal → parking lot with explicit milestone promotion.

**Warning signs:**
- `users` table with email/password in relay schema.
- Sprint includes "OAuth for push."
- Dependency on `notification-triggers` polyfill.
- REM-02 blocked waiting for account system.

**Phase to address:**
Roadmap / Phase 14 scope gate before implementation.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Generic "check your habits" push (no per-habit due check) | Ships relay without SW Dexie read | Notification fatigue; users disable | Never for REM-01 per-habit promise |
| `skipWaiting()` on every deploy | Users always on latest SW | Mid-session check-in lost; confused state | Never — user-confirmed reload only |
| Store reminder prefs only in `localStorage` | Faster than Dexie migration | Desync from habit edits; lost on eviction | Never — extend Dexie habit schema |
| Relay sends based on morning cron snapshot | Simple server code | Wrong after midday check-in | Never — evaluate at send time (SW or sync) |
| Single global reminder time for all habits | Simpler settings UI | Violates REM-01 per-habit requirement | Never |
| Skip iOS install guidance | Less UI | Push appears "broken" for largest mobile cohort | Never for REM-02 |
| Test push only on localhost HTTP | Dev convenience | SW/push require HTTPS production build | Dev only; prod HTTPS required |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Web Push / VAPID relay** | Treating push as "free local notifications" | Minimal HTTPS relay; cron + timezone; 410 cleanup; no accounts |
| **VAPID keys** | Committing private key; no rotation plan | Env var on relay; document rotation; support overlapping keys during transition |
| **Push subscription** | Storing subscription only client-side | POST to relay on subscribe/change; tie to anonymous `deviceId` |
| **Dexie ↔ Service Worker** | Assuming SW can't read IDB | Open same Dexie DB in SW `push` handler; import pure `domain/` due functions |
| **vite-plugin-pwa / Workbox** | Precache everything including `index.html` without update UX | Hashed assets precache; prompt reload on `waiting` SW; record `appVersion` |
| **iOS APNs (via Web Push)** | Testing in Safari tab only | Require installed PWA; immediate `showNotification` in SW |
| **`navigator.storage.persist()`** | Call on first load; assume grant | After engagement; handle denial; pair with export CTA |
| **date-fns / `getLocalDateString`** | Different "today" in relay vs app | Single timezone per subscription; refresh on focus; calendar strings for dedup |
| **Export/import (v1)** | Import while old SW serves stale bundle | Reload after import; ensure SW doesn't cache backup files |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| SW opens full Dexie on every push | Battery drain; slow notification display | Index only `habitId + today completions`; keep push handler <50ms | 50+ habits, large history |
| Cron scans all subscriptions every minute unindexed | Relay CPU spikes | Index `(timezone, reminderTime)`; bucket by minute | 10K+ subscriptions (unlikely v2) |
| Precache unbounded static assets | First install slow; quota pressure | Precache shell only; lazy routes unchanged from v1 | Low-end Android install |
| Duplicate push dedup in memory only | Double notifications after relay restart | Persist `lastSentAt` per `habitId+localDate` on relay or client | Relay redeploy mid-day |
| `showNotification` with large images | Slow display; iOS failures | Text + small icon only; habit color in title | Custom habit icons in push |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| VAPID private key in client bundle | Anyone can send push to your users | Private key only on relay; public key in client |
| Relay accepts subscribe POST without origin check | Subscription spam / abuse | Validate `Origin`/`Referer`; rate limit; CAPTCHA only if abused |
| Push payload contains habit names | Sensitive data in push service logs | Send `habitId` only; SW loads name from Dexie |
| Cron endpoint public | Arbitrary push fan-out | Protect with secret header / signed cron token |
| Storing PII in relay for "future accounts" | Scope creep + GDPR surface | Anonymous `deviceId` UUID only |
| `dangerouslySetInnerHTML` in notification actions | XSS via crafted backup import | Notifications are plain text; validate all imports (existing v1 rule) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Reminder after check-in | Feels broken; trust erodes | SW/relay due check at fire time |
| Nagging on rest days (weekly habits) | Disables all notifications | Frequency-aware schedule |
| Permission prompt before explaining value | Permanent deny | Pre-prompt → gesture → native dialog |
| Install PWA + enable push in one modal | Overwhelming; both denied | Sequence: use app → install (optional) → enable reminder |
| No "why am I not getting notifications?" | Silent failure | Settings diagnostic: permission, subscription, install, persisted |
| Update reload mid-check-in | Lost tap; anger | Defer reload until idle or confirm |
| Reminder for frozen day | Contradicts streak freeze UX | Suppress when `Freeze` exists for today |
| Generic "you have habits due" with 8 habits | Noise | Per-habit notification or count with deep link |

## "Looks Done But Isn't" Checklist

- [ ] **REM-01:** Per-habit time stored in Dexie and survives export/import round-trip
- [ ] **REM-02:** Push fires with app fully closed (not just background tab) on Android + installed iOS PWA
- [ ] **Timezone:** Reminder fires at local 8:00 AM for user in `America/New_York` on DST transition weekend
- [ ] **Completion suppress:** Check-in 5 minutes before reminder → no notification
- [ ] **Weekly habit:** No reminder on unscheduled weekday
- [ ] **times_per_week:** No reminder when week quota already met
- [ ] **Freeze:** No reminder on frozen today
- [ ] **Permission:** No `requestPermission()` on page load; verify Chrome audit passes
- [ ] **iOS:** Tested installed PWA, not Safari tab only
- [ ] **410 cleanup:** Stale subscription removed; `pushsubscriptionchange` updates relay
- [ ] **PWA offline:** Check-in + streak view work airplane mode after first load
- [ ] **SW update:** New deploy shows update prompt; old broken shell not stuck forever
- [ ] **persist():** Called after engagement; denial shows export banner
- [ ] **Safari 7-day:** Documented risk for non-installed tab users
- [ ] **Dedup:** Max one push per habit per local day

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong timezone scheduler shipped | MEDIUM | Fix relay TZ math; no client migration; monitor delivery logs |
| Mass permission deny on launch | HIGH | Cannot un-deny programmatically; ship better pre-prompt in next version; in-app guide to browser settings |
| SW cache serving stale app | LOW | Bump cache version; force `skipWaiting` once with migration notice; users reload |
| 410 subscription rot | LOW | Client `pushsubscriptionchange` + relay purge; user re-toggle reminders |
| Data evicted on Safari | HIGH (data) | Only recoverable via prior export; add persist + install prompt + backup CTA |
| Reminder fatigue (over-nagging) | MEDIUM | Patch due rules; add "pause reminders 7 days"; no data migration |
| Dexie schema + old SW mismatch | MEDIUM | Block app render until migration completes; emergency unregister SW instruction in docs |

## Pitfall-to-Phase Mapping

Phase numbers continue from v1.1 (Phase 8) per PROJECT.md. Proposed v2.0 structure:

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Client-side scheduling | Phase 14: Push relay & scheduler | Closed-app push test on Android + iOS PWA |
| UTC / DST reminder time | Phase 14 | TZ fixture tests; manual DST weekend check |
| Permission UX / permanent deny | Phase 12: Reminder preferences | No prompt on load; grant rate tracked; denied recovery UI |
| Weekly / X×week reminder logic | Phase 12 + 14 | Tests: rest day silent; quota met silent; freeze silent |
| Relay without completion state | Phase 13: SW push handler | Check-in then push → no notification |
| SW cache vs Dexie | Phase 10: Offline shell | Deploy v2.0.1; user gets update prompt; check-in survives |
| iOS push requirements | Phase 9 + 13 | Installed iOS PWA receives push; immediate `showNotification` |
| Subscription rot / 410 | Phase 13 + 14 | Simulate 410; subscription refreshed via `pushsubscriptionchange` |
| `persist()` / eviction | Phase 11: Storage durability | `persisted()` surfaced; Safari idle doc; export CTA on deny |
| Scope creep (accounts) | Roadmap gate | Relay schema review: no `users` table |

### Suggested phase ordering rationale

1. **Phase 9 — PWA install & manifest:** Icons, manifest, install prompt — prerequisite for iOS push (Pitfall 7).
2. **Phase 10 — Service worker & offline shell:** Cache strategy, update prompt — prevents Pitfall 6 before adding push SW code.
3. **Phase 11 — Storage durability:** `persist()`, eviction UX — extends v1 backup story (Pitfall 9).
4. **Phase 12 — Reminder preferences (REM-01):** Per-habit time, contextual permission, frequency-aware rules (Pitfalls 3, 4).
5. **Phase 13 — Web Push client (REM-02a):** SW push handler, subscription, Dexie due check (Pitfalls 5, 7, 8).
6. **Phase 14 — Push relay & scheduler (REM-02b):** VAPID, cron, timezone, dedup, 410 cleanup (Pitfalls 1, 2, 8, 10).

**Dependency note:** Phase 10 before 13 (shared SW foundation). Phase 12 before 13 (permission in context). Phase 11 can parallel Phase 9–10.

## Carry-Forward from v1 (Still Relevant)

These v1 pitfalls remain active during v2 integration — do not regress:

| v1 Pitfall | v2 Risk | Guard |
|------------|---------|-------|
| UTC calendar-day streaks | Reminder "today" dedup wrong | Reuse `getLocalDateString()` everywhere |
| `times_per_week` conflated with daily | Wrong reminder days | Use `isHabitDueOnDate()` at fire time |
| Unsafe import | SW stale after restore | Reload prompt post-import |
| Frozen "today" at page load | Wrong due check in SW | Pass `localDate` at interaction/push time |

## Sources

- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — best-effort vs persistent, Safari 7-day proactive eviction (HIGH)
- [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) — `persist()`, home-screen quota (HIGH)
- [web.dev: Push notifications overview](https://web.dev/articles/push-notifications-overview) — push vs notifications, VAPID, subscription shape (HIGH)
- [web.dev: Permissions best practices](https://web.dev/articles/permissions-best-practices) — gesture-gated prompts, 12% vs 30% allow rates (HIGH)
- [web.dev: Push notifications permission UX](https://web.dev/articles/push-notifications-permissions-ux) — pre-prompt pattern, permanent deny (HIGH)
- [web.dev: PWA update](https://web.dev/learn/pwa/update) — SW update strategies, don't block render (HIGH)
- [Chrome Developers: Handling service worker updates](https://developer.chrome.com/docs/workbox/handling-service-worker-updates) — when to prompt reload (HIGH)
- [Chrome: Notification Triggers](https://developer.chrome.com/docs/web-platform/notification-triggers) — development ended; not a solution (HIGH)
- [Apple: Sending web push in web apps](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) — iOS install requirement, immediate display (HIGH)
- [DEV: When notifications matter, PWAs show limits](https://dev.to/nishchaldev/when-notifications-matter-pwas-start-to-show-their-limits-5ebl) — best-effort delivery, server cron pattern (MEDIUM)
- [Yundrox: Building robust PWA push](https://yundrox.dev/posts/claritybox/building-robust-pwa-push-notifications/) — timezone grouping, battery/Doze (MEDIUM)
- [Web Push: Handling 410 Gone at scale](https://www.web-push-notifications.com/backend-delivery-architecture-queue-management/delivery-tracking-acknowledgment/handling-410-gone-responses-at-scale/) — terminal errors, subscription cleanup (MEDIUM)
- [GitHub: LenoreChore PR #72](https://github.com/Novanglus96/LenoreChore/pull/72) — per-user timezone in relay, `pushsubscriptionchange` (MEDIUM)
- [GitHub: kaya-go PR #119](https://github.com/kaya-go/kaya/pull/119) — `persist()` after engagement pattern (MEDIUM)
- PROJECT.md — v2.0 scope: REM-01/02, PWA, no accounts (HIGH, project authority)
- `src/domain/dates.ts`, `src/domain/schedule.ts` — existing local-date and due helpers to reuse (HIGH, codebase)

---
*Pitfalls research for: Habit Tracker v2.0 — Reminders & PWA (integration with local-first Dexie SPA)*
*Researched: 2026-07-25*
