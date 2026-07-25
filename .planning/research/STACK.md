# Stack Research

**Domain:** Local-first habit tracker — v2.0 Reminders & PWA additions
**Researched:** 2026-07-25
**Confidence:** HIGH (PWA/Workbox), MEDIUM (push relay scheduling)

## Scope

This document covers **stack additions and changes only** for v2.0 (REM-01/02, PWA-01..05). The v1.1 baseline is unchanged:

> Vite 8 · React 19 · TypeScript · Dexie 4 · Tailwind 4 · shadcn/ui · react-activity-calendar · Zod 4 · date-fns · Zustand · Vitest

See prior research (2026-07-19) for v1 rationale. Everything below is new or updated for reminders, Web Push, and PWA offline.

---

## Recommended Stack — v2.0 Additions

### Core Technologies (New)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| `vite-plugin-pwa` | 1.3.0 | PWA manifest, service worker build, offline precache, update prompt hooks | De-facto Vite PWA plugin; peers `vite@^8.0.0` and Workbox 7.4.1; ships `virtual:pwa-register/react` for `useRegisterSW` update UX; supports `injectManifest` for custom push handlers | HIGH |
| Workbox 7 (`workbox-precaching`, `workbox-core`, `workbox-routing`) | 7.4.1 | Service worker precaching, cleanup, push event handler | Bundled via `vite-plugin-pwa`; `injectManifest` strategy lets you add `push` listener alongside `precacheAndRoute` — required for REM-02 | HIGH |
| `workbox-window` | 7.4.1 | Runtime SW registration and update lifecycle | Peer dep of `vite-plugin-pwa`; used by `virtual:pwa-register` under the hood | HIGH |
| `@pushforge/builder` | 2.0.5 | Web Push payload encryption + VAPID signing on edge relay | Zero-dep, Web Crypto API — works on Cloudflare Workers/Vercel Edge; `web-push` fails on Workers (`crypto.createECDH` unavailable) | MEDIUM |
| Cloudflare Workers + Cron Triggers | — | Minimal push relay host (subscriptions + scheduled sends) | Free tier, HTTPS by default, no server to maintain; pairs with `@pushforge/builder`; stores subscriptions in KV/D1 | MEDIUM |

### Supporting Libraries (New)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `@vite-pwa/assets-generator` | 1.0.2 | Generate PWA icons (192/512 maskable) from source | One-time asset pipeline for manifest icons; optional but saves manual resize work | HIGH |
| `web-push` | 3.6.7 | Web Push on Node.js relay | **Only** if relay runs on Node (not Workers); includes VAPID key CLI (`npx web-push generate-vapid-keys`) | HIGH |
| `idb` | 8.0.3 | Thin IndexedDB wrapper | **Only if** service worker must read reminder state directly; prefer keeping Dexie in main thread and passing data via `postMessage` | MEDIUM |

### Native Browser APIs (No Package)

| API | Purpose | Integration |
|-----|---------|-------------|
| `PushManager` / `PushSubscription` | Subscribe browser to push endpoint | Call from main thread after SW registered; store subscription JSON in Dexie + sync to relay |
| `Notification` / `Notification.permission` | Permission gate before subscribe | Request only when user enables reminders; never on first visit |
| `navigator.storage.persist()` | Request durable IndexedDB (PWA-04) | Call after install or first data write; pair with `navigator.storage.estimate()` for eviction-risk UX |
| `navigator.serviceWorker.ready` | Gate push subscribe on SW activation | Required before `pushManager.subscribe()` |

### Development Tools (New)

| Tool | Purpose | Notes |
|------|---------|-------|
| `vite-plugin-pwa` `devOptions` | SW debugging in dev | Set `devOptions: { enabled: true, type: 'module' }` only when debugging push/SW; disable by default (v1 DX) |
| Chrome DevTools → Application → Service Workers | Push/SW testing | Simulate push events; verify precache manifest |
| `fake-indexeddb` (existing) | Vitest Dexie tests | Already in devDeps; no change needed for offline data tests |

---

## Installation

```bash
# PWA + service worker (app)
pnpm add -D vite-plugin-pwa@1.3.0 workbox-precaching@7.4.1 workbox-core@7.4.1 workbox-routing@7.4.1

# workbox-window is installed transitively by vite-plugin-pwa; add explicitly if importing directly
pnpm add workbox-window@7.4.1

# Optional: PWA icon generation
pnpm add -D @vite-pwa/assets-generator@1.0.2

# Push relay (separate deploy — NOT in main app bundle)
# Edge (recommended):
pnpm add @pushforge/builder@2.0.5   # in relay/ workspace or workers project

# Node relay (alternative):
pnpm add web-push@3.6.7               # in relay/ only
```

**No new runtime dependencies in the main SPA** beyond `workbox-window` (small, only loaded for SW registration). Push subscribe and storage persist use native APIs.

---

## Integration with Vite 8 + Dexie

### Vite config pattern

```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'prompt',           // PWA-05: user confirms before SW update
  strategies: 'injectManifest',     // Required: custom push handler in src/sw.ts
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  manifest: {
    name: 'Habit Tracker',
    short_name: 'Habits',
    theme_color: '#0d1117',
    background_color: '#0d1117',
    display: 'standalone',
    icons: [/* 192 + 512 maskable */],
  },
  devOptions: { enabled: false },   // enable only when debugging SW
})
```

### Service worker (`src/sw.ts`)

```typescript
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Habit reminder', {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? '/'))
})
```

### React update prompt (`virtual:pwa-register/react`)

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'

const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })
// needRefresh[0] → show shadcn toast/dialog; updateServiceWorker() applies new SW
```

### Dexie boundary — keep data in main thread

| Concern | Recommendation |
|---------|----------------|
| Habit/completion data | **Dexie in main thread only** — IndexedDB works offline without SW; no Dexie import in SW |
| Reminder config | New Dexie fields/table: `{ habitId, enabled, timeLocal, timezone? }` |
| Push subscription | Store `PushSubscriptionJSON` in Dexie `settings` table; sync to relay on change |
| SW data access | If SW needs habit name for notification body, relay includes it in push payload — don't query Dexie from SW |
| Schema migration | Dexie v3 bump for reminder fields; export/import Zod schema version bump |

### Reminder scheduling architecture

Browsers **cannot** fire timed notifications when the tab is closed without a server. Client-side `setTimeout` / `setInterval` only work while the app is open.

```
┌─────────────────────────────────────────────────────────────┐
│  Main app (React + Dexie)                                   │
│  • User sets per-habit reminder time → Dexie                │
│  • On save: POST subscription + schedule to relay           │
│  • date-fns: compute next fire time in user's local TZ      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (no auth; capability token)
┌──────────────────────────▼──────────────────────────────────┐
│  Minimal push relay (Cloudflare Worker + D1/KV)             │
│  • Store PushSubscription + [{habitId, time, days}]         │
│  • Cron Trigger (every minute): find due reminders → push   │
│  • @pushforge/builder: encrypt + VAPID sign → FCM/Mozilla   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Web Push Protocol
┌──────────────────────────▼──────────────────────────────────┐
│  Service Worker (src/sw.ts)                                 │
│  • push event → showNotification(habit name, check-in link) │
└─────────────────────────────────────────────────────────────┘
```

**date-fns** (already installed): `format`, `parse`, `setHours`, `setMinutes` for local time → next UTC fire time sent to relay. No new scheduling library on client.

### Storage persistence (PWA-04)

```typescript
// No library — call from settings or post-install flow
const persisted = await navigator.storage.persist()
const estimate = await navigator.storage.estimate()
// Show shadcn alert if !persisted && estimate.quota < threshold
```

Dexie data survives offline once the app shell is cached; `persist()` reduces eviction risk on mobile.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `vite-plugin-pwa` + `injectManifest` | Hand-rolled Workbox + manual manifest | Never for this project — plugin handles precache manifest injection and dev/build parity |
| `vite-plugin-pwa` `generateSW` | Simpler zero-config SW | Only if you drop Web Push (no custom `push` handler) — **not viable for REM-02** |
| `@pushforge/builder` on Cloudflare Workers | `web-push` on Node/VPS | Use `web-push` if team already runs Node and won't use Workers; `@pushforge/builder` for edge/free-tier |
| `@pushforge/builder` | `go-notify-server` (Go binary) | Self-hosted VPS with SQLite; more ops, but zero vendor dependency |
| Cloudflare Worker relay | `push-relay` (Django + PostgreSQL) | Heavier stack; only if you need multi-tenant admin UI out of the box |
| Native Push API (no client lib) | `one-signal` / `firebase` SDK | Adds vendor lock-in and accounts — contradicts PROJECT.md constraints |
| Relay cron scheduling | Periodic Background Sync API | Chrome-only, ≥12h interval — **unsuitable for daily reminders** |
| Relay cron scheduling | Client `setTimeout` when app open | Supplement only; cannot replace relay for closed-tab delivery |
| Dexie main thread only | Dexie in service worker | Possible (separate instance, same DB) but adds complexity; relay payload avoids it |
| `registerType: 'prompt'` | `registerType: 'autoUpdate'` | Auto-update silently reloads mid-session — bad for check-in flow; prompt matches PWA-05 |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| OneSignal / Firebase Cloud Messaging SDK | Vendor lock-in, accounts, analytics creep; contradicts local-first/no-auth | Native Push API + minimal self-hosted relay |
| `generateSW` only (no `injectManifest`) | Cannot register custom `push` / `notificationclick` handlers | `strategies: 'injectManifest'` with `src/sw.ts` |
| Periodic Background Sync as primary scheduler | Chrome-only; minimum 12h interval; not reliable for daily habit times | Relay cron + Web Push |
| `node-cron` / `setInterval` in browser for reminders | Browser throttles background tabs; no delivery when app closed | Relay-side cron |
| Dexie Cloud / sync addons | Introduces auth, cloud, conflict resolution — out of scope | Dexie local + relay stores only push metadata |
| Full backend (Express/Fastify/Django) for relay | Over-engineered for store-subscription + cron-send | Single Cloudflare Worker (~100 LOC) |
| `web-push` on Cloudflare Workers | `crypto.createECDH` unavailable in Workers runtime | `@pushforge/builder` |
| `localStorage` for push subscription | 5 MB cap; synchronous; unavailable in SW | Dexie settings table |
| PWA in v1 (deferred) | Was correct for v1 scope | **Now in scope** — use `vite-plugin-pwa` |
| Service worker for Dexie offline | IndexedDB is already offline-capable; SW caches JS/CSS shell | Precache app shell; Dexie handles data offline |
| `workbox-strategies` NetworkFirst for API | No API in local-first app | Precache-only (`precacheAndRoute`) sufficient |
| Home screen widgets (v2.0) | Requires native or advanced PWA APIs | Deferred per PROJECT.md |

---

## Stack Patterns by Variant

**If you need Web Push (REM-02):**
- Use `injectManifest` + custom `src/sw.ts` with `push` and `notificationclick` listeners
- Because `generateSW` cannot add push handlers without `importScripts` hacks

**If you need update prompt (PWA-05):**
- Set `registerType: 'prompt'` and wire `useRegisterSW` from `virtual:pwa-register/react`
- Add `SKIP_WAITING` message listener in SW (see above)
- Because `autoUpdate` reloads without user consent during active check-in

**If you need offline check-in (PWA-03):**
- Precache all app assets via Workbox; Dexie reads/writes IndexedDB offline in main thread
- Because data layer does not need SW — only the JS bundle must load offline

**If you need per-habit reminders (REM-01):**
- Store `{ habitId, enabled, hour, minute }` in Dexie; sync schedule array to relay on every change
- Relay cron matches current UTC minute against stored schedules per subscription
- Because no browser API schedules arbitrary future notifications without a server

**If you need no-account relay:**
- Generate opaque `deviceId` (crypto.randomUUID) stored in Dexie; relay keys subscriptions by `deviceId`
- Because PROJECT.md forbids auth; capability token = knowing `deviceId` + subscription endpoint

**If iOS Safari matters:**
- Web Push requires PWA installed to Home Screen (iOS 16.4+)
- Show explicit "Add to Home Screen" guidance before requesting `Notification.permission`
- Because Safari tabs do not support Web Push

**If testing push in Vitest:**
- Mock `PushManager`, `Notification`, `serviceWorker` in jsdom tests
- Do not bundle `web-push` or `@pushforge/builder` in app tests — test relay separately

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `vite-plugin-pwa@1.3.0` | `vite@8.1.5` | Peer `^8.0.0` confirmed in npm registry |
| `vite-plugin-pwa@1.3.0` | `workbox-build@7.4.1` | Bundled; precache manifest injection |
| `workbox-precaching@7.4.1` | `workbox-core@7.4.1` | Match Workbox major.minor |
| `vite-plugin-pwa@1.3.0` | `react@19.2.7` | `virtual:pwa-register/react` uses React hooks |
| `@pushforge/builder@2.0.5` | Cloudflare Workers | Web Crypto API; no Node `crypto` |
| `web-push@3.6.7` | Node.js 18+ | **Not** compatible with Workers |
| `dexie@4.4.4` | Service worker context | Supported but separate instance; avoid unless necessary |
| `fake-indexeddb@6.2.5` | `vitest@4.1.10` | Existing; covers Dexie offline tests |

---

## Architecture Sketch (v2.0)

```
┌──────────────────────────────────────────────────────────────┐
│  React 19 + React Router 8                                   │
│  shadcn/ui + Tailwind v4                                     │
│  virtual:pwa-register/react (update prompt)                  │
│  date-fns (reminder time math)                               │
├──────────────────────────────────────────────────────────────┤
│  Zustand (UI)  │  Reminder settings UI  │  Persist UX       │
├──────────────────────────────────────────────────────────────┤
│  Dexie 4 (habits, completions, freezes, reminders, pushSub) │
│  Zod 4 (export/import + relay payload validation)            │
├──────────────────────────────────────────────────────────────┤
│  Service Worker (src/sw.ts via vite-plugin-pwa)             │
│  workbox-precaching │ push │ notificationclick              │
└──────────────────────────────────────────────────────────────┘
         ↕ IndexedDB (offline)          ↕ HTTPS (no auth)
┌─────────────────────┐    ┌───────────────────────────────────┐
│  export/import JSON │    │  Push relay (CF Worker + D1/KV)   │
│  (user-owned)       │    │  @pushforge/builder + Cron Trigger │
└─────────────────────┘    └───────────────────────────────────┘
```

---

## Relay Deploy Options (Minimal)

| Option | Stack | Pros | Cons |
|--------|-------|------|------|
| **Recommended** | CF Worker + `@pushforge/builder` + D1/KV + Cron | Free tier, no server, edge latency | CF account required |
| Node VPS | `web-push` + SQLite + `node-cron` | Familiar Node DX | Hosting cost, TLS setup |
| Self-hosted Go | `go-notify-server` | Single binary, topic-based notify | Ops burden |

Relay is **not** part of the main `package.json` — deploy as separate `relay/` workspace to keep the SPA bundle zero-backend.

---

## Sources

- [vite-plugin-pwa npm](https://www.npmjs.com/package/vite-plugin-pwa) — v1.3.0, Vite 8 peer dep (HIGH)
- [vite-plugin-pwa injectManifest guide](https://vite-pwa-org.netlify.app/guide/inject-manifest.html) — custom SW + push (HIGH)
- [vite-plugin-pwa React integration](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/frameworks/react.md) — `useRegisterSW` (HIGH)
- [Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching) — `precacheAndRoute`, `cleanupOutdatedCaches` (HIGH)
- [@pushforge/builder npm](https://www.npmjs.com/package/@pushforge/builder) — v2.0.5, edge-compatible Web Push (MEDIUM)
- [web-push npm](https://www.npmjs.com/package/web-push) — v3.6.7, Node relay (HIGH)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — subscription flow (HIGH)
- [MDN Storage API persist](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist) — durable IndexedDB (HIGH)
- [Dexie.js service worker support](https://github.com/dfahlander/Dexie.js/issues/789) — separate instances, same DB (MEDIUM)
- npm registry `npm view` — all versions verified 2026-07-25 (HIGH)

---
*Stack research for: Habit Tracker v2.0 Reminders & PWA*
*Researched: 2026-07-25*
*Baseline stack unchanged from 2026-07-19 research*
