# Architecture Research

**Domain:** Local-first habit tracker — v2.0 Reminders, Web Push, and PWA offline
**Researched:** 2026-07-25
**Confidence:** HIGH (PWA/offline + push patterns); MEDIUM (cross-browser reminder reliability)

## Standard Architecture

### System Overview

v2.0 extends the existing four-layer SPA (Presentation → Hooks → Domain → Infrastructure) with a **Platform Layer** that owns service worker lifecycle, push delivery, and browser storage durability. Dexie remains the single source of truth for habits, completions, freezes, and reminder preferences. The service worker does **not** own business logic — it precaches the app shell, displays push notifications, and routes clicks back into the React app.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (UI) — existing + new             │
├──────────────────────────────────────────────────────────────────────────┤
│  Today / Dashboard / Heatmap / Settings  │  HabitForm (+ reminder time) │
│  ReloadPrompt / InstallPrompt            │  NotificationSettings        │
│         │                                        │                        │
├─────────┴────────────────────────────────────────┴────────────────────────┤
│              Application Layer (Hooks / Use Cases) — extended            │
├──────────────────────────────────────────────────────────────────────────┤
│  useHabits / useToggleCompletion / useStreak  │  usePushSubscription     │
│  useBackup (existing)                         │  useReminderSync         │
│                                               │  useStoragePersistence   │
│         │                                              │                   │
├─────────┴──────────────────────────────────────────────┴──────────────────┤
│                     Domain Layer (Pure Logic) — extended                 │
├──────────────────────────────────────────────────────────────────────────┤
│  streak / stats / heatmap / dates (existing)  │  reminders.ts (new)      │
│  — compute next fire time, isDueToday,        │  — frequency-aware       │
│    shouldSkipReminder (already done/frozen)   │    reminder eligibility  │
│         │                                              │                   │
├─────────┴──────────────────────────────────────────────┴──────────────────┤
│              Infrastructure Layer (Persistence + Platform) — extended      │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────── Dexie IndexedDB ────────────────────────────┐ │
│  │ habits │ completions │ freezes │ app_settings │ push_subscription  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  habitRepository / completionRepository / freezeRepository (existing)    │
│  reminderRepository / pushSubscriptionRepository / settingsRepository    │
│  backupService (extended export/import)                                  │
│         │                                                                │
├─────────┴────────────────────────────────────────────────────────────────┤
│                     Platform Layer (NEW — browser APIs)                  │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────── Service Worker (src/sw.ts) ────────────────────┐  │
│  │ Workbox precache + SPA navigation fallback                          │  │
│  │ push event → showNotification (self-contained payload)              │  │
│  │ notificationclick → clients.openWindow('/?habit=:id')               │  │
│  │ message: SKIP_WAITING (update prompt)                               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│  navigator.storage.persist()  │  Notification Triggers (optional boost)  │
│         │                                                                │
├─────────┴────────────────────────────────────────────────────────────────┤
│              External — minimal push relay only (REM-02)                   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Stateless relay (Worker/Function + cron): VAPID-signed Web Push   │  │
│  │ Stores: deviceId → PushSubscription + reminder schedule snapshot    │  │
│  │ No accounts, no habit/completion data — schedule metadata only      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Key architectural invariants (unchanged from v1.x):**
- Domain logic never imports from UI or infrastructure.
- Streaks and stats remain compute-on-read from completions/freezes.
- Dexie is the authoritative store; push relay holds only delivery metadata.

**New v2.0 invariant:**
- Reminder **preferences** live in Dexie; reminder **delivery** is delegated to platform (local triggers + push relay). Never store "notification sent" as completion state.

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Habit (extended)** | Optional per-habit reminder: enabled flag + local time `HH:mm` | Field on `Habit` or linked `ReminderConfig` row; Zod-validated |
| **reminders.ts (domain)** | Pure: next fire timestamp, eligible today per frequency, skip if done/frozen | Uses existing `schedule.ts` + `dates.ts`; no browser APIs |
| **reminderRepository** | CRUD reminder settings; query habits with reminders enabled | Dexie read/write on habits or `reminders` table |
| **pushSubscriptionRepository** | Store single active `PushSubscriptionJSON` + anonymous `deviceId` | Dexie `app_settings` key-value or dedicated table |
| **reminderSyncService** | Orchestrate: read Dexie → push schedule snapshot to relay; schedule local triggers | Called after habit save, on app focus, daily rollover |
| **pushSubscriptionService** | Permission flow, `pushManager.subscribe`, VAPID key injection | Main thread only; gated on `Notification.permission` |
| **storagePersistenceService** | `navigator.storage.persist()` + `persisted()` check; surface UX if denied | User-gesture wrapped; not on page load |
| **backupService (modified)** | Export/import includes reminder fields + deviceId (optional) | Bump backup `version` to 2 when schema changes |
| **sw.ts (service worker)** | Precache shell, handle push/click/update — no Dexie reads in hot path | `vite-plugin-pwa` injectManifest + Workbox |
| **ReloadPrompt** | `registerType: 'prompt'` update UX via `useRegisterSW` | `virtual:pwa-register/react` |
| **InstallPrompt** | `beforeinstallprompt` capture for add-to-home-screen | Zustand or local state; dismissible |
| **Push relay (external)** | Cron every minute: match schedules in user TZ → send Web Push | Cloudflare Worker / Vercel cron + `web-push` npm |

### Core Data Model Extensions

```
Habit (extended):
  ...existing fields...
  reminder?: {
    enabled: boolean
    timeLocal: string        // "HH:mm" in user's local timezone
  }

app_settings (new table, key-value):
  deviceId: string           // crypto.randomUUID(), generated once
  pushSubscription?: PushSubscriptionJSON
  storagePersistRequestedAt?: string
  notificationsEnabled: boolean

// Alternative: embed reminder on Habit (recommended for v2.0 scope)
// Keeps one write path in habitRepository; backup stays simple
```

**Backup payload v2:**
```typescript
interface BackupPayload {
  version: 2;
  exportedAt: string;
  habits: Habit[];           // includes reminder?
  completions: Completion[];
  freezes?: Freeze[];
  // Do NOT export push subscription — re-subscribe on new device
}
```

**Push notification payload (self-contained — SW must not query Dexie):**
```typescript
interface ReminderPushPayload {
  type: 'habit-reminder';
  habitId: string;
  habitName: string;
  date: string;              // YYYY-MM-DD local
  url: '/';                  // or /habits/:id/history
}
```

## Recommended Project Structure

```
src/
├── domain/
│   ├── types.ts                    # MODIFIED — Habit.reminder?, AppSettings
│   ├── reminders.ts                # NEW — pure scheduling logic
│   ├── schedule.ts                 # existing — reuse for eligibility
│   └── dates.ts                    # existing — local date strings
├── infrastructure/
│   ├── db.ts                       # MODIFIED — v3: app_settings table
│   ├── habitRepository.ts          # MODIFIED — reminder field CRUD
│   ├── backupService.ts            # MODIFIED — backup v2
│   ├── settingsRepository.ts       # NEW — deviceId, persist flags
│   ├── pushSubscriptionRepository.ts  # NEW
│   └── reminderSyncService.ts      # NEW — relay + local trigger sync
├── platform/                       # NEW — browser API adapters (testable fakes)
│   ├── notifications.ts            # permission, showTrigger feature detect
│   ├── push.ts                     # subscribe/unsubscribe wrappers
│   ├── storage.ts                  # persist(), persisted(), estimate()
│   └── install.ts                  # beforeinstallprompt handler
├── sw/                             # NEW — compiled into service worker
│   ├── sw.ts                       # entry: imports cache + push handlers
│   ├── cache.ts                    # Workbox precache + SPA fallback
│   └── pushHandlers.ts             # push + notificationclick
├── hooks/
│   ├── usePushSubscription.ts      # NEW
│   ├── useReminderSync.ts          # NEW — debounced sync on data change
│   ├── useStoragePersistence.ts    # NEW
│   └── ...existing hooks...
├── components/
│   ├── pwa/
│   │   ├── ReloadPrompt.tsx        # NEW
│   │   └── InstallPrompt.tsx       # NEW
│   ├── settings/
│   │   └── NotificationSettings.tsx  # NEW
│   └── habits/
│       └── HabitForm.tsx           # MODIFIED — reminder toggle + time
├── pages/
│   └── SettingsPage.tsx            # MODIFIED — notifications + storage UX
├── App.tsx                         # MODIFIED — mount PWA prompts
└── main.tsx                        # unchanged — SW via virtual module in App

push-relay/                         # NEW — separate deployable (not in Vite bundle)
├── src/
│   ├── index.ts                    # HTTP: POST /register, POST /schedule
│   ├── scheduler.ts                # cron: fire due reminders
│   └── store.ts                    # KV/D1: deviceId → { sub, reminders[] }
├── wrangler.toml                   # or vercel.json for serverless cron
└── package.json                    # web-push, minimal deps

public/
├── icons/                          # NEW — PWA icon set (192, 512, maskable)
└── (manifest generated by vite-plugin-pwa)
```

### Structure Rationale

- **platform/:** Thin adapters over `navigator.*` APIs. Keeps hooks testable with injected fakes; domain stays pure.
- **sw/:** Separate from React — compiled by `vite-plugin-pwa` injectManifest. No React imports in SW bundle.
- **push-relay/:** Deployed independently. Violates "no backend" only for push delivery metadata — not habit data sync. Keeps relay stateless and replaceable.
- **reminder on Habit:** Avoids join queries and matches "per-habit optional daily reminder" (REM-01). Frequency eligibility reuses `domain/schedule.ts`.

## Architectural Patterns

### Pattern 1: Dexie Source of Truth, Platform as Delivery Adapter

**What:** All reminder configuration is written to Dexie first. A `reminderSyncService` projects Dexie state outward to (a) push relay API and (b) optional local Notification Triggers.

**When to use:** Always. Never configure the relay as authoritative — device may be offline when editing habits.

**Trade-offs:**
- (+) Offline habit editing still works; sync catches up on reconnect
- (+) Export/import restores reminder settings without server state
- (−) Relay schedule can be briefly stale until sync runs

**Example:**
```typescript
// infrastructure/reminderSyncService.ts
export async function syncRemindersToRelay(): Promise<void> {
  const deviceId = await settingsRepo.getDeviceId();
  const sub = await pushRepo.getSubscription();
  if (!sub) return;

  const habits = await db.habits
    .filter((h) => !h.archived && h.reminder?.enabled)
    .toArray();

  const schedule = habits.map((h) => ({
    habitId: h.id,
    name: h.name,
    timeLocal: h.reminder!.timeLocal,
    frequency: h.frequency,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));

  await fetch(`${RELAY_URL}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, subscription: sub, schedule }),
  });
}
```

### Pattern 2: Self-Contained Push Payloads (No Dexie in Service Worker)

**What:** The push relay embeds habit name, id, and date in the encrypted push body. The service worker displays the notification without opening IndexedDB.

**When to use:** All Web Push notifications. SW push handler must be fast and side-effect-free.

**Trade-offs:**
- (+) Reliable display even if Dexie migration is mid-flight
- (+) Avoids dual Dexie instances and schema drift in SW
- (−) Payload may be slightly stale if habit renamed after sync (acceptable for reminders)

**Example:**
```typescript
// sw/pushHandlers.ts
self.addEventListener('push', (event) => {
  const data = event.data?.json() as ReminderPushPayload | undefined;
  if (!data || data.type !== 'habit-reminder') return;

  event.waitUntil(
    self.registration.showNotification(`Time for ${data.habitName}`, {
      body: 'Tap to check in',
      tag: `reminder-${data.habitId}-${data.date}`,
      data: { url: data.url ?? '/' },
      icon: '/icons/icon-192.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(clients.openWindow(url));
});
```

### Pattern 3: Tiered Reminder Delivery

**What:** Combine Web Push (primary, cross-browser when permitted) with Notification Triggers (secondary, Chrome/Android offline boost) and in-app nudges (fallback when permission denied).

| Tier | Mechanism | App closed? | Safari? | Reliability |
|------|-----------|-------------|---------|-------------|
| 1 | Web Push + relay cron | Yes (with network) | Yes (if permission granted) | HIGH |
| 2 | Notification Triggers (`TimestampTrigger`) | Android yes; desktop needs Chrome running | No | MEDIUM |
| 3 | In-app banner on open | N/A | Yes | LOW (engagement-dependent) |

**When to use:** REM-02 requires tier 1. Implement tier 2 as progressive enhancement behind `'showTrigger' in Notification.prototype`.

**Do NOT use:** Periodic Background Sync for reminder timing — browsers throttle by engagement; not suitable for "8:00 AM daily" (HIGH confidence).

### Pattern 4: PWA Shell with Prompted Updates

**What:** `vite-plugin-pwa` with `strategies: 'injectManifest'`, `registerType: 'prompt'`. Workbox precaches hashed assets; navigation fallback serves `index.html` for SPA routes. User explicitly reloads when `needRefresh` is true.

**When to use:** PWA-01 (installable), PWA-02 (offline shell), PWA-05 (update prompt).

**Trade-offs:**
- (+) Avoids mid-form reload from `autoUpdate`
- (+) Full offline check-in — Dexie works without network once shell cached
- (−) Users may run stale SW until they accept update — acceptable with prompt

**Example (vite.config.ts sketch):**
```typescript
VitePWA({
  registerType: 'prompt',
  strategies: 'injectManifest',
  srcDir: 'src/sw',
  filename: 'sw.ts',
  manifest: {
    name: 'Habit Tracker',
    short_name: 'Habits',
    theme_color: '#0d1117',
    background_color: '#0d1117',
    display: 'standalone',
    icons: [/* 192, 512 maskable */],
  },
})
```

### Pattern 5: Storage Persistence on Meaningful Gesture

**What:** After user enables reminders or completes first export, call `navigator.storage.persist()` wrapped in the same user action. Surface `navigator.storage.persisted()` status in Settings with link to export.

**When to use:** PWA-04 eviction-risk UX.

**Trade-offs:**
- (+) Reduces Safari/Chromium proactive eviction of IndexedDB
- (−) May prompt on Firefox — only trigger when user understands why

## Data Flow

### Flow 1: User Enables Reminder on Habit

```
HabitForm submit
    ↓
habitRepository.update({ ...habit, reminder: { enabled: true, timeLocal: '08:00' } })
    ↓
Dexie write → useLiveQuery refreshes habit list
    ↓
useReminderSync (watches habits with reminders)
    ↓
reminderSyncService.syncRemindersToRelay()     // if push subscribed
reminderSyncService.scheduleLocalTriggers()      // if showTrigger supported
```

### Flow 2: Push Reminder Fires (App Closed)

```
Relay cron (every 1 min)
    ↓
For each device: parse schedule + timezone → habits due now
    ↓
web-push.encrypt(payload) → POST subscription.endpoint
    ↓
Browser push service → SW push event
    ↓
showNotification(title, { data: { url } })
    ↓
User taps → notificationclick → clients.openWindow('/')
    ↓
React app loads from precache → Dexie read → Today page shows habit
```

### Flow 3: Offline Check-In (No Network)

```
User opens installed PWA (airplane mode)
    ↓
SW serves precached index.html + JS/CSS
    ↓
React boots → Dexie (IndexedDB) read/write — unchanged from v1.x
    ↓
useToggleCompletion → completionRepository → Dexie
    ↓
useLiveQuery → streak recalc → UI update
    (no relay sync until online)
```

### Flow 4: App Update Available

```
New deploy → SW install (waiting)
    ↓
useRegisterSW sets needRefresh = true
    ↓
ReloadPrompt shows toast
    ↓
User clicks Reload → updateServiceWorker(true) → SKIP_WAITING → page reload
    ↓
New precache active; Dexie data preserved (separate from Cache API)
```

### State Management

```
IndexedDB (Dexie) — source of truth for all persisted app data
    ↓ useLiveQuery
Hooks — habits, completions, streaks (unchanged)
    +
Hooks — push subscription status, persist status (ephemeral + Dexie-backed)
    ↓
Zustand — install prompt dismissed, reload toast dismissed (UI only)

Service Worker — separate execution context
    ↔ postMessage (optional: trigger sync on SW activate)
    ← Web Push (server-initiated)
    → Cache API (app shell only — NOT Dexie data)
```

## Suggested Build Order

Build bottom-up. PWA foundation must land before push (SW registration is shared). Reminder UI can parallelize with PWA shell once Dexie v3 schema is defined.

```
Phase 9: PWA Foundation (PWA-01, PWA-02, PWA-05)
  vite-plugin-pwa + manifest + icons
  → src/sw/cache.ts (precache + SPA fallback)
  → src/sw/sw.ts (SKIP_WAITING handler)
  → ReloadPrompt + InstallPrompt
  → Verify offline: build + serve dist, toggle airplane mode, check in

Phase 10: Storage Durability (PWA-04)
  → platform/storage.ts
  → settingsRepository + useStoragePersistence
  → Settings UX: persist status, export nudge if not persisted
  (Depends: Phase 9 SW registered — install boosts persist grant rate)

Phase 11: Reminder Data Model + UI (REM-01)
  → domain/reminders.ts + tests
  → Habit.reminder field + Dexie v3 migration
  → HabitForm reminder toggle + time picker
  → backup v2 schema
  (Depends: none beyond existing v1.1 — can start parallel to Phase 9)

Phase 12: Web Push Client (REM-02 part 1)
  → platform/push.ts + platform/notifications.ts
  → pushSubscriptionRepository
  → usePushSubscription + NotificationSettings UI
  → sw/pushHandlers.ts
  (Depends: Phase 9 SW — push requires active registration)

Phase 13: Push Relay + Scheduler (REM-02 part 2)
  → push-relay/ deployable
  → reminderSyncService → POST /schedule on habit changes
  → Relay cron + VAPID keys in env
  → E2E: set reminder → wait → receive push
  (Depends: Phase 11 schedule shape + Phase 12 subscription)

Phase 14: Local Trigger Boost (optional enhancement)
  → reminderSyncService.scheduleLocalTriggers()
  → Feature-detect showTrigger; reschedule on app focus + daily rollover
  (Depends: Phase 11 + 12)

Phase 15: Integration Hardening
  → Skip reminder if habit completed/frozen today (domain check in relay + local)
  → frequency-aware: no reminder on non-scheduled days
  → Permission-denied fallback UX
  → Vitest: domain/reminders.ts; integration: sync payload shape
```

**Dependency graph:**
```
Dexie v3 schema ──→ reminder UI (Phase 11)
                 ──→ backup v2

vite-plugin-pwa ──→ SW registration ──→ push handlers (Phase 12)
                 ──→ offline shell (Phase 9)
                 ──→ update prompt (Phase 9)

push subscription (Phase 12) ──→ relay sync (Phase 13)

domain/reminders.ts ──→ relay scheduler logic (shared pure functions, copy or npm workspace)
```

**Critical path:** Phase 9 (SW) → Phase 12 (push client) → Phase 13 (relay). Phase 11 can ship usable "reminder preferences" UI before push works, but REM-01 is not complete until delivery path exists.

## New vs Modified — Explicit Inventory

### New files

| Path | Purpose |
|------|---------|
| `src/domain/reminders.ts` | Pure next-fire and eligibility logic |
| `src/infrastructure/settingsRepository.ts` | deviceId, persist flags |
| `src/infrastructure/pushSubscriptionRepository.ts` | PushSubscription JSON storage |
| `src/infrastructure/reminderSyncService.ts` | Relay + local trigger orchestration |
| `src/platform/notifications.ts` | Permission + feature detection |
| `src/platform/push.ts` | Subscribe/unsubscribe adapter |
| `src/platform/storage.ts` | persist/persisted/estimate adapter |
| `src/platform/install.ts` | beforeinstallprompt |
| `src/sw/sw.ts` | SW entry |
| `src/sw/cache.ts` | Workbox precache |
| `src/sw/pushHandlers.ts` | push + notificationclick |
| `src/hooks/usePushSubscription.ts` | Subscription lifecycle |
| `src/hooks/useReminderSync.ts` | Debounced sync side effect |
| `src/hooks/useStoragePersistence.ts` | Persist request + status |
| `src/components/pwa/ReloadPrompt.tsx` | Update prompt UI |
| `src/components/pwa/InstallPrompt.tsx` | A2HS prompt |
| `src/components/settings/NotificationSettings.tsx` | Permission + push controls |
| `push-relay/*` | Minimal Web Push relay service |
| `public/icons/*` | PWA icons |

### Modified files

| Path | Change |
|------|--------|
| `vite.config.ts` | Add `VitePWA` plugin (injectManifest) |
| `package.json` | Add `vite-plugin-pwa`, `workbox-*` devDeps |
| `src/domain/types.ts` | `Habit.reminder?`, `BackupPayload` v2 |
| `src/infrastructure/db.ts` | Dexie v3: `app_settings` table |
| `src/infrastructure/habitRepository.ts` | Reminder field in create/update |
| `src/infrastructure/backupService.ts` | Export/import v2 fields |
| `src/components/habits/HabitForm.tsx` | Reminder toggle + time input |
| `src/pages/SettingsPage.tsx` | Notifications + storage sections |
| `src/App.tsx` | Mount `ReloadPrompt`, `InstallPrompt` |
| `src/test/setup.ts` | Mock service worker / Notification APIs |

### Unchanged (explicitly)

| Path | Why |
|------|-----|
| `domain/streak.ts`, `stats.ts`, `heatmap.ts` | Streak logic unaffected by reminders |
| `completionRepository.ts`, `freezeRepository.ts` | Check-in path unchanged |
| Repository pattern + `useLiveQuery` | Reactive data binding still correct offline |
| `react-activity-calendar` heatmap | No SW interaction |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1–20 habits, 1 reminder each | Default architecture — single push subscription, one relay row per device |
| 20–50 habits with reminders | Batch relay sync (one POST per change, debounced 2s); cap local triggers to next 7 days per habit |
| Many relay users | Relay store is O(devices) not O(users); cron scans only devices with active subscriptions; no change to client architecture |
| Large backup imports | Unchanged — transactional Dexie write; run reminder sync after import completes |

### Scaling Priorities

1. **First bottleneck: Relay cron scan.** At thousands of devices, naive full-table scan each minute is costly. Mitigation: index by `(timezone, minute)` bucket or use edge cron per region.

2. **Second bottleneck: Notification permission churn.** Users who deny permission still sync schedule unnecessarily. Mitigation: gate `reminderSyncService` on `notificationsEnabled && subscription`.

3. **Third bottleneck: SW cache size.** Heatmap + calendar deps increase precache. Mitigation: default Workbox precache is content-hashed; lazy routes already code-split — verify `globPatterns` excludes test assets.

## Anti-Patterns

### Anti-Pattern 1: Service Worker as Reminder Scheduler

**What people do:** `setInterval` in SW or rely on Periodic Background Sync to fire daily reminders.

**Why it's wrong:** SW can be killed; Periodic Sync is engagement-throttled and imprecise. Safari doesn't support it for this use case.

**Do this instead:** Web Push + server cron for delivery; optional Notification Triggers scheduled from main thread when app is open.

### Anti-Pattern 2: Reading Dexie in push Handler to Build Notification Text

**What people do:** Import `db` in `sw.ts`, query habit name at push time.

**Why it's wrong:** Separate Dexie instance, migration races, slower push handling, harder to test. SW should stay thin.

**Do this instead:** Self-contained push payload from relay. Optionally include `habitName` snapshot.

### Anti-Pattern 3: Storing Push Subscription Only on Server

**What people do:** Subscribe → POST to relay → never persist locally.

**Why it's wrong:** Violates local-first; re-subscribe flow breaks offline; export/import doesn't restore notification state.

**Do this instead:** Persist subscription in Dexie `app_settings`; relay is a projection that can be rebuilt via `reminderSyncService`.

### Anti-Pattern 4: autoUpdate Service Worker

**What people do:** `registerType: 'autoUpdate'` for simplicity.

**Why it's wrong:** Mid-session reload during check-in or import can corrupt UX or lose in-memory form state.

**Do this instead:** `registerType: 'prompt'` + `ReloadPrompt` component.

### Anti-Pattern 5: Reminder Time in UTC

**What people do:** Store `reminder.timeUtc` or convert with `toISOString()`.

**Why it's wrong:** Same class of bugs as streak timezone issues (PITFALLS.md #1). User sets "8 AM" expecting local wall clock.

**Do this instead:** Store `timeLocal: "08:00"` + `Intl` timezone sent to relay; relay computes fire time in user's IANA zone.

### Anti-Pattern 6: Full Account System for Push

**What people do:** Add Firebase Auth + Firestore because "push needs a backend."

**Why it's wrong:** Violates PROJECT.md constraints; scope creep into sync.

**Do this instead:** Anonymous `deviceId` + `PushSubscription` on stateless relay. Habit data never leaves device.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Push relay** (self-hosted Worker/Function) | `POST /register`, `POST /schedule` with deviceId + subscription + schedule snapshot | VAPID keys in env; no PII; GDPR: delete on unsubscribe |
| **Browser push services** (FCM/Mozilla/APNs via browser) | Handled by browser — relay uses `web-push` library | Subscription endpoint expires — listen for `pushsubscriptionchange` in SW |
| **Cache API** (via Workbox) | Build-time precache manifest | Caches JS/CSS/HTML only — never cache Dexie data |
| **File System** (export/import) | Unchanged from v1.x | Still essential; persist() is best-effort not guarantee |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React ↔ Dexie | `useLiveQuery` + repositories | Unchanged; offline-capable once shell cached |
| React ↔ Service Worker | `virtual:pwa-register/react`; optional `postMessage` | SW registration in App mount; don't register in multiple places |
| React ↔ Push relay | `fetch` POST on schedule change | Debounce; retry with exponential backoff; no habit completions in payload |
| Service Worker ↔ React | `notificationclick` → `openWindow` | Deep link to `/` or habit; React reads Dexie on load |
| Service Worker ↔ Dexie | Avoid in v2.0 | Use self-contained payloads instead |
| Domain ↔ Platform | Domain never imports platform | `reminderSyncService` in infrastructure calls platform adapters |
| Backup ↔ Reminders | Export includes `habit.reminder` | Import triggers `reminderSyncService` after transaction |

## Sources

- [vite-plugin-pwa injectManifest guide](https://vite-pwa-org.netlify.app/guide/inject-manifest) — custom SW, SKIP_WAITING, Workbox precache (HIGH)
- [vite-plugin-pwa React framework](https://vite-pwa-org.netlify.app/frameworks/react) — `useRegisterSW`, prompt update pattern (HIGH)
- [web.dev Push Notifications codelab](https://web.dev/articles/push-notifications-client-codelab) — subscribe flow, VAPID, SW push/click handlers (HIGH)
- [Chrome Notification Triggers](https://developer.chrome.com/docs/web-platform/notification-triggers) — TimestampTrigger, platform limits (HIGH)
- [MDN Periodic Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API) — engagement-throttled, not for precise alarms (HIGH)
- [web.dev Persistent storage](https://web.dev/articles/persistent-storage) — `persist()` timing and UX (HIGH)
- [web.dev PWA offline data](https://web.dev/learn/pwa/offline-data) — IndexedDB vs Cache API roles (HIGH)
- [Dexie in service workers (GitHub #789)](https://github.com/dexie/Dexie.js/issues/789) — separate instances, same DB (HIGH)
- [Stack Overflow: Dexie from service worker](https://stackoverflow.com/questions/61409661/how-do-i-access-my-dexie-database-from-my-service-worker) — import pattern (MEDIUM)
- Existing codebase: `src/infrastructure/db.ts`, `domain/types.ts`, layered hooks/repos (HIGH)

---
*Architecture research for: Habit Tracker v2.0 Reminders & PWA*
*Researched: 2026-07-25*
