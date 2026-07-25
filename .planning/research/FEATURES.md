# Feature Research

**Domain:** Habit tracking web application — v2.0 Reminders & PWA (local-first, streak-motivated)
**Researched:** 2026-07-25
**Confidence:** MEDIUM-HIGH

> **Scope:** NEW v2.0 features only. Core loop (habit CRUD, check-in, streaks, heatmap, export/import, colors, delight, overall rate, X/week, streak freeze) is **shipped in v1.0–v1.1** and treated as prerequisites, not re-litigated here.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist once a habit tracker advertises reminders or "install the app." Missing these = v2.0 feels broken or users stay on Loop/Streaks/Productive.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Per-habit optional reminder time** (REM-01) | ~89% of surveyed habit apps ship reminders; Loop, Streaks, Habitify, Productive all offer per-habit schedules at a chosen time of day | MEDIUM | One reminder slot per habit is sufficient for v2.0; multiple times per habit is a v2.x nice-to-have. Reminder must be **off by default** — opt-in per habit |
| **Push notifications when app is closed** (REM-02) | Users install reminder features specifically to be nudged when they forget; in-tab `Notification` API alone fails when the tab is closed | HIGH | Requires service worker + Web Push + server-side send at scheduled time. Cannot deliver reliably with client-only timers when the PWA is not running |
| **Permission flow tied to user intent** | Industry best practice (web.dev, APIScout): asking on first page load yields ~60% denial; asking after user enables a reminder yields ~40% grant | LOW | Show value prop → user toggles reminder → then request `Notification.permission`. Never prompt on cold visit |
| **Global and per-habit reminder disable** | Users expect to silence reminders without deleting habits or uninstalling; Loop and Productive both support dismiss/disable paths | LOW | Per-habit toggle + optional "pause all reminders" in settings. Respect browser-level notification block gracefully |
| **Schedule-aware reminders** | A Mon/Wed/Fri habit should not fire on Tuesday; X×/week habits should not nag daily | MEDIUM | **Depends on v1.1 schedule engine** (`daily`, `weekdays[]`, `times_per_week`). Reminder scheduler must read the same frequency rules as streak logic |
| **Don't remind if already done** | Notification fatigue is the #1 complaint in habit-app reviews; reminding after check-in erodes trust | LOW | Before send (server) or at display (SW): suppress if completion exists for today (local timezone) |
| **Tap notification → open app** | Baseline mobile UX; every major tracker deep-links to the relevant habit or today view | LOW | `notificationclick` in service worker → `clients.openWindow('/?habit=…')` or today panel |
| **Web app manifest + installability** (PWA-01) | Users who want "app-like" experience expect Add to Home Screen / Install; Lighthouse PWA checklist is the bar | MEDIUM | `name`, `short_name`, `start_url`, `display: standalone`, theme/background colors, maskable icons 192+512. Dark theme tokens must match existing aesthetic |
| **Offline app shell** (PWA-02) | "Works offline" is the minimum credible PWA claim; users will toggle airplane mode to verify | MEDIUM | Service worker precaches HTML/JS/CSS/icons via Workbox (`vite-plugin-pwa`). First visit needs network; repeat visits load shell offline |
| **Full offline use of core loop** (PWA-03) | For a local-first habit tracker, offline must mean check-in + streak view + backup — not just a cached landing page | MEDIUM | **Dexie is already source of truth**; v2.0 adds SW shell so UI boots offline. No network calls in normal CRUD path |
| **Update prompt on new version** (PWA-05) | Silent auto-reload during check-in loses in-progress state; Workbox/vite-plugin-pwa default is user-prompted refresh | LOW | `registerType: 'prompt'` + toast/banner with Reload / Later. Defer reload if user is mid-form |
| **HTTPS in production** | Web Push and service workers require secure context; users never see this but it is a hard gate | LOW | Deployment constraint, not a product feature — document in stack phase |

### Differentiators (Competitive Advantage)

Features that set this product apart in the reminders/PWA slice. Not universal, but aligned with core value: effortless logging + impossible-to-ignore progress — **without accounts or cloud sync**.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Reminders without user accounts** | 87% of competitors tie push to cloud accounts; local-first + anonymous device token is a privacy selling point | HIGH | Store push subscription keyed by anonymous device ID (httpOnly cookie or local ID + server mapping). Minimal relay only — no user profile server |
| **Schedule + freeze-aware smart suppression** | Don't nag on frozen days, non-scheduled weekdays, or after weekly quota met — most apps only check "done today" | MEDIUM | **Unique to this codebase:** integrates REM with v1.1 `Freeze` entity and `times_per_week` quota. Loop checks completion but not explicit skip/freeze semantics |
| **Minimal dark installable PWA** | Category is cluttered with colorful wellness apps; GitHub/Linear aesthetic + install = "serious tool on your home screen" | LOW | Differentiator is restraint: no onboarding carousel, no premium upsell in install flow |
| **Honest storage durability UX** (`navigator.storage.persist()`) | Local-first users fear losing years of streaks to browser eviction; most PWAs never explain this | LOW | Call `persist()` after install or first backup; show plain-language status ("Your data is protected from automatic cleanup" / "Export regularly — browser may clear unused sites"). Chrome grants persistence more readily for installed PWAs |
| **Check-in from notification action** (optional PWA enhancement) | Loop's killer UX: complete habit from notification shade without opening app | MEDIUM | `notification.actions` + SW message to IndexedDB or `clients.matchAll` + `postMessage`. Platform support varies (Android Chrome good; iOS limited). Ship as enhancement if feasible, not blocker |
| **"Offline ready" acknowledgment** | First-time offline success is a trust moment; vite-plugin-pwa's `onOfflineReady` is underused | LOW | One-time subtle toast after SW precache completes — reinforces local-first promise |
| **Quiet hours / Do Not Disturb window** | Power users with 5+ habits want control over evening/morning boundaries; open-source Rehabi-techo ships this | MEDIUM | Optional v2.x: global window that suppresses server-side send. Not in PROJECT.md v2.0 list — flag for roadmap if scope allows |
| **Deferred install prompt** | Better conversion than browser default banner; matches minimal UX | LOW | Listen for `beforeinstallprompt`, show custom "Install for reminders" only after user enables first reminder — ties install value to feature |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems — or are explicitly out of scope per PROJECT.md.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Aggressive / guilt-based notification copy** | Duolingo-style retention hacks | Damages brand; users disable all notifications; conflicts with minimal respectful UX | Neutral copy: habit name + "Time to check in" — no streak shaming |
| **Multiple reminders per habit** | Power users want morning + evening nudges | Scheduling matrix explodes; notification fatigue; Loop uses separate habits instead | One time per habit in v2.0; duplicate habit workaround documented |
| **Client-only scheduling (no push server)** | Avoid backend cost entirely | `setTimeout` / Alarm API do not fire when PWA is fully closed on most platforms; Periodic Background Sync is Chrome-only and unreliable for exact times | Minimal push relay (VAPID + cron/worker) as PROJECT.md specifies |
| **Firebase Cloud Messaging / OneSignal / full push SaaS** | Faster integration | Vendor lock-in, privacy policy overhead, account coupling — overkill for accountless local-first app | `web-push` npm + tiny self-hosted or edge relay (Cloudflare Worker pattern) |
| **Cloud sync to enable reminders** | "Sync reminders across devices" | Contradicts local-first constraint; conflict resolution is a separate product | Per-device reminders; export/import for data (not reminder state) |
| **Email / SMS reminders** | Reach users off-device | Requires accounts, deliverability, cost, compliance | Web Push only for v2.0 |
| **Home screen widgets** | Loop/Streaks retention driver on native | Requires native APIs or immature Web Widget APIs; explicitly deferred past v2.0 in PROJECT.md | Installable PWA icon + push is the web equivalent |
| **Auto-update without user prompt** | Always latest code | Reload mid-check-in loses state; jarring on mobile | `registerType: 'prompt'` per PROJECT.md PWA-05 |
| **Reminding for habits already frozen** | Simplicity — "remind daily at 8am" | Nagging on intentional skip days undermines streak-freeze trust built in v1.1 | Suppress when `Freeze` record exists for today |
| **Mandatory reminders on habit create** | "More engagement" | Permission prompt fatigue; users abandon during onboarding | Default `reminderEnabled: false` |
| **Snooze chains / escalating nag frequency** | Recover missed habits | Notification spam; users uninstall PWA | Single daily fire; optional one manual snooze (v2.x) |
| **Background Sync for habit data upload** | "True offline-first" pattern for server apps | No server in this app; adds complexity with zero user value | Dexie write-first; export/import remains backup |
| **Social accountability reminders** | "Your friend hasn't checked in" | Out of scope; needs backend + social graph | Private reminders only |
| **Smart AI reminder timing** | Habitify premium marketing | ML scope creep, no training data in local-first model | User-chosen fixed time |

## Feature Dependencies

```
[v1.1 Habit CRUD + schedules + Freeze]  (SHIPPED — prerequisite)
    └──requires──> [Per-habit reminder time field] (REM-01)
    └──requires──> [Schedule-aware "is due today?" logic]
    └──requires──> [Completion + freeze lookup for suppression]

[Service worker registration]  (PWA foundation)
    └──requires──> [HTTPS production deploy]
    └──enables──> [App shell offline cache] (PWA-02)
    └──enables──> [Web Push subscription] (REM-02)
    └──enables──> [Update prompt lifecycle] (PWA-05)

[Web app manifest + icons]  (PWA-01)
    └──enables──> [Install prompt / A2HS]
    └──enhances──> [iOS Web Push eligibility] (must be installed standalone on iOS 16.4+)

[Minimal push relay server]  (REM-02)
    └──requires──> [VAPID key pair]
    └──requires──> [Subscription storage keyed by anonymous device]
    └──requires──> [Cron/scheduler to fire at reminder times]
    └──requires──> [Service worker push + notificationclick handlers]

[Full offline core loop]  (PWA-03)
    └──requires──> [Dexie persistence] (SHIPPED)
    └──requires──> [SW precached app shell] (PWA-02)
    └──conflicts──> [Network-only code paths in UI] (audit for fetch calls)

[navigator.storage.persist()]  (PWA-04)
    └──enhances──> [IndexedDB durability under storage pressure]
    └──enhances──> [User trust in long-term streak data]
    └──optional──> [PWA install] (Chrome persistence heuristic)

[Update prompt]  (PWA-05)
    └──requires──> [Service worker with versioned precache]
    └──conflicts──> [autoUpdate during active check-in session]

[Check-in from notification action]
    └──requires──> [REM-02 push handler]
    └──requires──> [SW → client Dexie write or API-less postMessage]
    └──conflicts──> [iOS limited action button support]

[Quiet hours / DND window]
    └──requires──> [REM-02 server-side send logic]
    └──enhances──> [REM-01 user control]
```

### Dependency Notes

- **REM-01 requires v1.1 schedule model:** Reminder time is meaningless without `frequency`, `weekdays`, and `times_per_week` from existing habit schema. Reuse `isHabitDueOnDate()` (or equivalent) — do not duplicate schedule logic.
- **REM-02 requires PWA service worker:** Web Push subscription is bound to SW registration; build PWA shell phase before or alongside push, not after.
- **REM-02 requires minimal backend (PROJECT.md constraint):** Pure client cannot schedule exact-time pushes when app is killed. The relay stores subscriptions and fires at `reminderTime` per timezone — smallest possible server, no accounts.
- **iOS Web Push requires installed PWA:** Safari only subscribes in standalone mode (iOS 16.4+). Install flow (PWA-01) must precede or accompany push permission on iOS — show A2HS guide before `PushManager.subscribe()`.
- **PWA-03 is mostly already true at data layer:** Dexie handles offline CRUD today; v2.0 work is SW precaching + ensuring no network assumptions in UI routes.
- **PWA-04 is complementary, not a substitute for export/import:** `persist()` reduces eviction risk but users can still clear site data manually — backup UX remains essential.
- **Freeze-aware suppression bridges v1.1 → v2.0:** Phase 8 explicitly deferred "reminders about frozen days" to v2.0; implement suppression when `freezes` record exists for `today`.

## MVP Definition

### Launch With (v2.0)

Minimum for milestone success per PROJECT.md — validates "remember to check in when app is closed" + "installable offline app."

- [ ] **Per-habit optional reminder time** (REM-01) — opt-in toggle + time picker on habit edit; persisted on habit record
- [ ] **Web Push delivery when app closed** (REM-02) — VAPID, SW push handler, minimal relay, subscription on permission grant
- [ ] **Installable PWA** (PWA-01) — manifest, maskable icons, standalone display, theme colors
- [ ] **Offline app shell** (PWA-02) — SW precache via vite-plugin-pwa; app loads after first visit without network
- [ ] **Full offline habit use** (PWA-03) — check-in, streak view, export/import work offline (Dexie + cached shell)
- [ ] **`navigator.storage.persist()` + eviction-risk UX** (PWA-04) — request persistence; surface status and backup nudge if denied
- [ ] **Update prompt on new version** (PWA-05) — user-controlled reload via `registerType: 'prompt'`
- [ ] **Schedule-aware + done/freeze suppression** — table-stakes quality for this codebase's schedule/freeze model
- [ ] **Notification tap opens today/habit** — baseline deep-link behavior

### Add After Validation (v2.x)

Features to add once v2.0 core is stable in production.

- [ ] **Check-in / dismiss from notification actions** — Loop parity; platform-gated
- [ ] **Global quiet hours (Do Not Disturb window)** — suppress sends between user-chosen times
- [ ] **One-tap snooze (e.g., +30 min)** — single snooze only to avoid nag chains
- [ ] **Multiple reminder times per habit** — only if user research demands it
- [ ] **Weekly-quota mid-week nudge** — "2 of 3 workouts done this week" for `times_per_week` habits
- [ ] **Custom deferred install prompt** — after first reminder enabled, not on cold visit
- [ ] **Reminder sync across devices via export** — reminder *settings* in export JSON (not push subscription)

### Future Consideration (v3+)

Explicitly deferred past v2.0 per PROJECT.md.

- [ ] **Home screen widgets** — native/advanced PWA APIs; major retention lever but separate project
- [ ] **Cloud sync + cross-device reminder state** — needs accounts
- [ ] **Local alarm scheduling without server** — revisit only if Web Alarms API matures cross-browser
- [ ] **Email/SMS fallback reminders** — needs identity + deliverability stack
- [ ] **AI-optimized reminder timing** — out of product vision

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Per-habit optional reminder time (REM-01) | HIGH | MEDIUM | P1 |
| Web Push when app closed (REM-02) | HIGH | HIGH | P1 |
| Service worker + offline shell (PWA-02) | HIGH | MEDIUM | P1 |
| Web manifest + installability (PWA-01) | HIGH | LOW | P1 |
| Full offline core loop (PWA-03) | HIGH | LOW | P1 |
| Schedule-aware + done/freeze suppression | HIGH | MEDIUM | P1 |
| Permission-on-intent UX | HIGH | LOW | P1 |
| Update prompt (PWA-05) | MEDIUM | LOW | P1 |
| `storage.persist()` + eviction UX (PWA-04) | MEDIUM | LOW | P1 |
| Notification deep-link to habit/today | HIGH | LOW | P1 |
| iOS A2HS-before-push guide | MEDIUM | LOW | P1 |
| Check-in from notification action | MEDIUM | MEDIUM | P2 |
| Global quiet hours | MEDIUM | MEDIUM | P2 |
| Snooze (+30 min, once) | LOW | MEDIUM | P2 |
| Multiple times per habit | LOW | MEDIUM | P3 |
| Weekly-quota mid-week nudge | MEDIUM | MEDIUM | P3 |
| Home screen widgets | HIGH | HIGH | P3 (v3+) |
| Cloud sync for reminders | MEDIUM | HIGH | P3 (never v2) |

**Priority key:**
- P1: Must have for v2.0 launch
- P2: Should have, add when P1 stable
- P3: Nice to have or explicitly deferred

## Competitor Feature Analysis

| Feature | Loop (Android) | Streaks (iOS) | Productive | Habitify | Our v2.0 Approach |
|---------|----------------|---------------|------------|----------|-------------------|
| Per-habit reminder time | ✓ one time each | ✓ | ✓ smart summary | ✓ (premium smart) | ✓ optional, off by default |
| Push when app closed | ✓ native | ✓ native | ✓ native | ✓ native | ✓ Web Push + minimal relay |
| Check-in from notification | ✓ check/dismiss/snooze | ✓ | ✓ | ✓ | P2 — action buttons where supported |
| Schedule-aware reminders | ✓ | ✓ | ✓ | ✓ | ✓ incl. `times_per_week` + freeze |
| Offline use | ✓ local SQLite | ✓ local | partial cloud | cloud | ✓ Dexie + SW shell (full offline) |
| Installable / home screen | widget | native app | native app | native + web | ✓ PWA install (no app store) |
| Account required for reminders | ✗ | ✗ (iCloud implicit) | ✓ | ✓ | ✗ anonymous device token |
| Quiet hours | ✗ (OS DND only) | OS DND | ✓ smart | ✓ | P2 global window |
| Data model | local SQLite | iCloud | cloud | cloud | **local-first + export/import** |
| Widgets | ✓ Android | ✓ iOS | ✓ | ✓ | Deferred v3+ (PROJECT.md) |

## Sources

- [PROJECT.md](../PROJECT.md) — v2.0 milestone scope, REM-01/02, PWA targets, explicit out-of-scope (HIGH confidence)
- [v1.1-REQUIREMENTS.md](../milestones/v1.1-REQUIREMENTS.md) — REM deferred rationale; freeze/quota reminder hooks (HIGH confidence)
- [Steal What Works: 114 Habit Tracking Apps](https://stealwhatworks.com/blogs/news/habit-tracking-app-features) — ~89% reminder penetration (MEDIUM confidence, 2025 survey)
- [Loop Habit Tracker (GitHub / Play Store)](https://github.com/iSoron/uhabits) — per-habit reminder, notification actions, schedule flexibility (HIGH confidence — primary OSS reference)
- [web.dev: Persistent storage](https://web.dev/articles/persistent-storage) — `navigator.storage.persist()` behavior, eviction (HIGH confidence)
- [web.dev: PWA offline data](https://web.dev/learn/pwa/offline-data) — IndexedDB + SW split, persist request timing (HIGH confidence)
- [MDN: StorageManager.persist()](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist) — API contract, browser support (HIGH confidence)
- [vite-plugin-pwa: prompt-for-update](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) — `registerType: 'prompt'`, `onNeedRefresh` / `onOfflineReady` (HIGH confidence)
- [Chrome Developers: Workbox SW updates](https://developer.chrome.com/docs/workbox/handling-service-worker-updates) — skipWaiting prompt pattern (HIGH confidence)
- [Aulvem: Web Push without login](https://aulvem.com/blog/2026-07-07-anonymous-web-push-no-login/) — anonymous device token, iOS standalone constraint, VAPID on edge (MEDIUM confidence)
- [APIScout: Web Push 2026 guide](https://apiscout.dev/guides/how-to-add-push-notifications-web-app-2026) — permission timing, iOS PWA requirements (MEDIUM confidence)
- [LongGame notification system (Mxo Masuku)](https://www.mxomasuku.com/blog/how-i-built-the-long-game-notification-system-a-journey-into-notifications-and-behavioral-engineering) — local vs push tradeoffs for habit nudges (MEDIUM confidence)
- [Rehabi-techo (GitHub)](https://github.com/p1xion/rehabi-techo) — Dexie + vite-plugin-pwa + DND window reference implementation (MEDIUM confidence)
- [jcortesdev/habit-tracker](https://github.com/jcortesdev/habit-tracker) — offline-first PWA without push; push cost/benefit note (MEDIUM confidence)

---
*Feature research for: Habit Tracker v2.0 Reminders & PWA*
*Researched: 2026-07-25*
*Prior v1.0 feature research (2026-07-19) superseded for landscape sections; v1 shipped features are prerequisites only.*
