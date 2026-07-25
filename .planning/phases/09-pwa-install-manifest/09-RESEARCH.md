# Phase 9: PWA Install & Manifest - Research

**Researched:** 2026-07-25
**Domain:** Web App Manifest, installability UX, iOS Add-to-Home-Screen guidance (no service worker)
**Confidence:** HIGH

## Summary

Phase 9 delivers **PWA-01 only**: a valid web app manifest, maskable icons, standalone display, theme colors, contextual install UX, and iOS guidance — explicitly **without** service worker registration, offline shell, or update prompts (Phase 10).

The recommended approach is a **static `public/manifest.webmanifest`** plus manual `index.html` meta/link tags, rather than adding `vite-plugin-pwa` in this phase. Static manifest avoids accidental SW registration, keeps Phase 9 scope minimal, and defers plugin integration to Phase 10 when Workbox precache is actually needed. [CITED: vite-pwa-org.netlify.app/guide/pwa-minimal-requirements] documents that `manifest: false` is the supported path when supplying your own manifest in `public/`; the inverse (manifest via plugin, no SW) still generates a service worker by default on minimal plugin config. [CITED: vite-pwa-org.netlify.app/guide/]

Chrome installability **no longer requires a service worker** — manifest + HTTPS + engagement heuristics suffice for menu install and (when criteria met) `beforeinstallprompt`. [CITED: web.dev/articles/install-criteria] [CITED: developer.chrome.com/blog/update-install-criteria] This validates the ROADMAP split (Phase 9 = install/manifest, Phase 10 = SW/offline).

Install UX should live in a new `src/platform/install.ts` module (pure detection + persistence) and `src/components/pwa/` UI layer. Engagement gating uses **localStorage** (no new dependency; Zustand is not in the project). Dismiss state survives refreshes; 7-day snooze is timestamp-based. The install banner sits at `z-50` above `BottomTabBar` (`z-40`) with Sonner toasts retaining higher stacking via Sonner's default portal z-index and optional `offset` when the banner is visible.

**Primary recommendation:** Ship static manifest + committed PNG icons in `public/icons/`, module-scoped `beforeinstallprompt` capture, localStorage engagement/dismiss state, bottom banner above tab bar, shared iOS modal for banner and Settings — defer `vite-plugin-pwa` to Phase 10.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Web App Manifest & icons | Browser / Client (static assets) | CDN / Static (Vite `public/`) | Manifest is a static JSON file served with `application/manifest+json`; no server generation needed |
| Theme-color / apple-touch-icon | Browser / Client (`index.html`) | — | Browser reads `<head>` before JS boots |
| `beforeinstallprompt` capture & deferred install | Browser / Client (main thread) | — | Event fires on `window`; `prompt()` requires user gesture in same document |
| iOS Add-to-Home-Screen guidance | Browser / Client (UI) | — | No programmatic install on iOS; instructional modal only |
| Engagement & dismiss persistence | Browser / Client (`localStorage`) | — | Survives sessions; not app data — no Dexie migration |
| Install banner layout / z-index | Browser / Client (React presentation) | — | Fixed positioning relative to `BottomTabBar` and Sonner |
| Settings install section | Browser / Client (React) | — | Permanent fallback entry in `SettingsPage` |
| Service worker / offline / update prompt | — (Phase 10) | — | Explicitly out of scope |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### App Icon & Branding
- **D-01:** New icon design featuring a **streak/flame motif** — distinct from the existing green-check favicon, reinforcing streak motivation.
- **D-02:** Flame color **green (#3fb950)** on **dark background (#0d1117)** — matches the existing GitHub-dark palette in `src/index.css`.
- **D-03:** Maskable icon background: **#0d1117 with rounded corners** (consistent with current favicon shape, not full-bleed).
- **D-04:** Manifest `name`: **"Habit Tracker"** (English, matching current `<title>`). Provide a sensible `short_name` (e.g., "Habit Tracker" or abbreviated) for home-screen labels.
- **D-05:** Generate **192×192 and 512×512** PNG icons (maskable variants) plus any required apple-touch-icon sizes.

#### Install Prompt (Android / beforeinstallprompt)
- **D-06:** **No blocking first-visit modal.** Show banner only after **engagement**: 2nd visit OR first check-in (whichever comes first). Store dismiss state in localStorage or Zustand.
- **D-07:** Placement: **bottom banner above the tab bar** — visible but non-blocking; sits above `BottomTabBar` fixed position.
- **D-08:** Copy focus: **offline benefit** — e.g., "Instala para usar sin conexión y acceder más rápido" (Spanish UI, consistent with existing pages).
- **D-09:** Dismiss ("Ahora no"): **hide for 7 days**, then show again if still not installed.
- **D-10:** On supported browsers, tapping "Instalar" triggers the native `beforeinstallprompt` deferred prompt.

#### iOS Install Guidance
- **D-11:** Detect **Safari on iOS, not in standalone mode**. Use the **same engagement trigger** as the Android install banner.
- **D-12:** Format: **numbered steps with icons** — 1) Tap Share 2) Add to Home Screen 3) Confirm.
- **D-13:** **Mention push/reminders now** — copy should state that home-screen install is required to receive habit reminders (anticipates Phase 13; required by roadmap success criterion 4).
- **D-14:** UX flow: **banner + modal on tap** — compact banner with "Instalar app" button; tapping opens modal with full iOS step-by-step instructions.

#### Settings Permanent Entry
- **D-15:** New **"Instalar app"** section in `SettingsPage`, placed **above** the existing "Copia de seguridad" section.
- **D-16:** **Hide the section entirely** when app is already running in standalone/display-mode installed state.
- **D-17:** Android/Chrome in Settings: **"Instalar" button + fallback text** — attempt native `beforeinstallprompt`; if unavailable, show browser menu instructions (⋮ → Instalar app).
- **D-18:** iOS in Settings: **"Cómo instalar" button** opens the **same modal** used by the install banner.

#### Manifest & Theme
- **D-19:** `display: "standalone"`, `theme_color: "#0d1117"`, `background_color: "#0d1117"` — match `src/index.css` tokens.
- **D-20:** Add `theme-color` meta tag to `index.html` for browser chrome consistency before install.
- **D-21:** UI copy in **Spanish** throughout install flows (consistent with existing app: "Ajustes", "Exportar datos", etc.).

### Claude's Discretion
- **Install trigger threshold:** 2nd visit OR first check-in — implement whichever is simpler to detect reliably; both are acceptable.
- **iOS detection:** Use `navigator.standalone === false` + iOS user-agent / platform check; show iOS flow instead of `beforeinstallprompt` banner.
- **Android Settings fallback:** Show native install button when `beforeinstallprompt` is captured; otherwise inline browser instructions.
- **`short_name`:** Abbreviate only if "Habit Tracker" truncates poorly on iOS home screen; default to full name.

### Deferred Ideas (OUT OF SCOPE)
- Service worker, offline shell, update prompt — **Phase 10** (PWA-02, PWA-03, PWA-05)
- `navigator.storage.persist()` durability UX — **Phase 11** (PWA-04)
- Notification permission and per-habit reminder toggles — **Phase 12** (REM-01, REM-03, REM-04)
- Web Push subscription and notification click handling — **Phase 13** (REM-05, REM-06)
- Push relay for closed-app delivery — **Phase 14** (REM-02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | User can install the app to their home screen (manifest, icons, standalone display) | Static manifest with `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, 192/512 icons with separate `maskable` purpose; `index.html` manifest link + `theme-color` + `apple-touch-icon`; `beforeinstallprompt` deferred install on Chromium; iOS numbered-step modal; Settings permanent install entry hidden when standalone |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Static `manifest.webmanifest` | — | PWA manifest in `public/` | Zero SW side effects; Vite serves as-is; plugin deferred to Phase 10 [CITED: vite-pwa-org.netlify.app/guide/pwa-minimal-requirements] |
| PNG icons (`public/icons/`) | 192, 512, 180 (apple) | Install + home screen | Chrome requires 192+512; iOS uses `apple-touch-icon` 180×180 [CITED: web.dev/articles/install-criteria] |
| `window` PWA events | Platform API | `beforeinstallprompt`, `appinstalled` | Standard Chromium install flow [CITED: developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event] |
| `matchMedia('(display-mode: standalone)')` | Platform API | Installed/standalone detection | Cross-browser; combine with `navigator.standalone` on iOS [CITED: web.dev/learn/pwa/detection] |
| `localStorage` | Platform API | Visit count, dismiss snooze, check-in flag | Persists across sessions; no new dependency; aligns with ephemeral UI state pattern in ARCHITECTURE.md |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^1.25.0 (installed) | Share/Install step icons in iOS modal | Already used project-wide |
| shadcn `Button` | installed | Install CTAs (min-h-11) | Matches Settings/touch targets |
| `ConfirmDialog` pattern | existing | Reference for modal overlay | iOS install modal can mirror `z-50` overlay pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static manifest | `vite-plugin-pwa` manifest config | Plugin minimal config auto-generates SW — violates Phase 9 boundary; add in Phase 10 |
| `vite-plugin-pwa` manifest-only | `injectRegister: false` + custom setup | Possible but still pulls Workbox devDeps now; static manifest is simpler for Phase 9 |
| localStorage dismiss state | Zustand | Zustand not in `package.json`; localStorage persists without hydration; sufficient for banner snooze |
| Visit-count engagement | First-check-in hook | Visit count on `App` mount is simpler; check-in flag optional enhancement via `useToggleCompletion` callback |
| Module-scope event listener | `useEffect` only in React | `useEffect` can miss early `beforeinstallprompt`; module init or `index.html` inline script is safer [CITED: web.dev/articles/codelab-make-installable] |

**Installation (Phase 9):** No new npm packages required for core delivery. Icon PNGs committed to `public/icons/`. Optional Phase 10 prep: `npm install -D vite-plugin-pwa` (defer to Phase 10 plan).

**Version verification:**
```bash
# Phase 10 only (not installed in Phase 9):
npm view vite-plugin-pwa version   # 1.3.0 (verified 2026-07-25)
```

## Package Legitimacy Audit

> Phase 9 core implementation installs **zero new npm packages**. Audit covers packages considered for manifest/SW tooling.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| vite-plugin-pwa | npm | ~4 yrs | ~3.8M/wk | github.com/vite-pwa/vite-plugin-pwa | OK | **Deferred to Phase 10** — not installed in Phase 9 |
| workbox-window | npm | mature | ~8.4M/wk | github.com/googlechrome/workbox | OK | **Deferred to Phase 10** (peer of vite-plugin-pwa) |
| @vite-pwa/assets-generator | npm | — | — | — | [ASSUMED] | Optional icon pipeline; not required if PNGs committed manually |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

**Postinstall scripts:** `vite-plugin-pwa` and `workbox-window` have no `postinstall` script [VERIFIED: npm registry query 2026-07-25].

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Entry                             │
│  index.html: manifest link, theme-color, apple-touch-icon       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Static Assets (public/)                      │
│  manifest.webmanifest ──► icons/icon-192.png, icon-512.png,     │
│                           maskable-192.png, maskable-512.png     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    React App (src/App.tsx)                       │
│  ┌──────────────────┐    ┌─────────────────────────────────┐   │
│  │ platform/install │───►│ InstallPrompt (banner + modal)  │   │
│  │ .ts (singleton)  │    │ SettingsInstallSection          │   │
│  └────────┬─────────┘    └─────────────────────────────────┘   │
│           │ reads/writes                                         │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │ localStorage     │ visitCount, dismissedUntil, hasCheckedIn  │
│  └──────────────────┘                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   beforeinstallprompt   iOS Safari         standalone?
   (Chromium)            (no BIP event)     hide all install UX
          │                  │
          ▼                  ▼
   prompt() on tap      numbered-step modal
   (user gesture)       (Share → Añadir → Confirmar)
```

### Recommended Project Structure

```
public/
├── manifest.webmanifest          # PWA manifest (static)
├── icons/
│   ├── icon-192.png              # purpose: any
│   ├── icon-512.png              # purpose: any
│   ├── maskable-192.png          # purpose: maskable, safe zone
│   ├── maskable-512.png          # purpose: maskable, safe zone
│   ├── apple-touch-icon.png      # 180×180 for iOS
│   └── icon-source.svg           # design source (flame motif)
src/
├── platform/
│   └── install.ts                # detection, BIP capture, localStorage helpers
├── components/
│   └── pwa/
│       ├── InstallBanner.tsx     # bottom banner above tab bar
│       ├── IosInstallModal.tsx   # numbered steps + reminder copy
│       └── SettingsInstallSection.tsx
├── pages/
│   └── SettingsPage.tsx          # mount SettingsInstallSection above backup
└── App.tsx                       # mount InstallBanner; init install module
```

### Pattern 1: Static Manifest (Phase 9) — Defer Plugin to Phase 10

**What:** Commit `public/manifest.webmanifest` and link from `index.html`. Do not add `vite-plugin-pwa` until Phase 10.

**When to use:** Manifest-only phases where SW registration is explicitly deferred.

**Why over vite-plugin-pwa now:** Minimal `VitePWA()` config generates and registers a service worker by default [CITED: vite-pwa-org.netlify.app/guide/]. Phase 9 success criteria do not need SW. Static manifest is the lowest-risk path; Phase 10 can migrate manifest into plugin config or keep static file with `manifest: false` on plugin.

**Example manifest:**
```json
{
  "$schema": "https://json.schemastore.org/web-manifest-combined.json",
  "name": "Habit Tracker",
  "short_name": "Habit Tracker",
  "description": "Seguimiento de hábitos con rachas y progreso visual",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0d1117",
  "background_color": "#0d1117",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**index.html additions:**
```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0d1117" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Habit Tracker" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
```

### Pattern 2: Module-Scoped `beforeinstallprompt` Capture (React 19)

**What:** Initialize listener at module load in `src/platform/install.ts`, not only inside `useEffect`, to avoid missing the event when it fires before React hydrates. [CITED: web.dev/articles/codelab-make-installable]

**When to use:** Any Chromium install button that calls deferred `prompt()`.

**Example:**
```typescript
// src/platform/install.ts
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

export function subscribeInstallPrompt(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export async function triggerInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
}
```

React hook wrapper uses `useSyncExternalStore(subscribeInstallPrompt, () => !!getDeferredPrompt())` for React 19 compatibility.

### Pattern 3: Standalone & iOS Detection

**What:** Hide all install UX when running as installed PWA. Route iOS Safari users to instructional modal instead of `beforeinstallprompt`.

```typescript
export function isStandaloneDisplayMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    // iOS legacy (web.dev/learn/pwa/enhancements)
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Exclude Chrome/Firefox on iOS if needed; CriOS still lacks beforeinstallprompt
  return isIOS;
}

export function shouldShowIosInstallFlow(): boolean {
  return isIosSafari() && !isStandaloneDisplayMode();
}

export function shouldShowChromiumInstallFlow(): boolean {
  return !isIosSafari() && !isStandaloneDisplayMode() && getDeferredPrompt() !== null;
}
```

**iOS note:** `navigator.standalone` is WebKit-only; `undefined` on non-iOS. Manifest may load lazily on iOS when Share sheet opens — pre-cache icons in `public/` to avoid shortcut-without-app-experience. [CITED: web.dev/learn/pwa/enhancements]

### Pattern 4: Engagement Gating + 7-Day Dismiss (localStorage)

**What:** Persist engagement and snooze in `localStorage` with namespaced keys. Recommend **visit count** as primary trigger (increment once per browser session on `App` mount).

```typescript
const KEYS = {
  visitCount: 'ht_pwa_visit_count',
  dismissedUntil: 'ht_pwa_dismissed_until',
  hasCheckedIn: 'ht_pwa_has_checked_in',
} as const;

export function recordSessionVisit(): void {
  const count = Number(localStorage.getItem(KEYS.visitCount) ?? '0') + 1;
  localStorage.setItem(KEYS.visitCount, String(count));
}

export function markFirstCheckIn(): void {
  localStorage.setItem(KEYS.hasCheckedIn, '1');
}

export function isEngaged(): boolean {
  const visits = Number(localStorage.getItem(KEYS.visitCount) ?? '0');
  const checkedIn = localStorage.getItem(KEYS.hasCheckedIn) === '1';
  return visits >= 2 || checkedIn;
}

export function dismissInstallBanner(days = 7): void {
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(KEYS.dismissedUntil, String(until));
}

export function isDismissed(): boolean {
  const until = Number(localStorage.getItem(KEYS.dismissedUntil) ?? '0');
  return until > Date.now();
}
```

**Why localStorage over Zustand:** Dismiss must survive full page reload; Zustand is not in dependencies and would need `persist` middleware or duplicate localStorage anyway.

### Pattern 5: Banner Z-Index Above Tab Bar, Below Toasts

**What:** Fixed bottom banner stacked above `BottomTabBar` (`z-40`), below Sonner toasts.

| Layer | z-index | Position |
|-------|---------|----------|
| `BottomTabBar` | `z-40` | `fixed bottom-0` (existing) |
| `InstallBanner` | `z-50` | `fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))]` |
| `IosInstallModal` / `ConfirmDialog` | `z-50` | full-screen overlay (existing pattern) |
| Sonner `Toaster` | default ~`9999`+ | `bottom-center` — stays above banner |

**Content padding:** When banner visible, add `pb-` offset to tabbed pages (`TodayPage` already uses `pb-28`; tune to `pb-36` or dynamic class when banner mounted). Optional: pass `offset` to `<Toaster offset={bannerVisible ? 120 : 16} />` to lift toasts above banner. [ASSUMED: Sonner `offset` prop — verify against installed `sonner@2.0.7` API during implementation]

**Anti-pattern:** Do not show install banner and notification permission prompt in same session flow (Pitfall 3 in PITFALLS.md) — Phase 9 copy may mention future reminders but must not call `Notification.requestPermission()`.

### Anti-Patterns to Avoid

- **Adding `vite-plugin-pwa` with default config in Phase 9:** Registers SW prematurely; violates phase boundary.
- **`useEffect`-only `beforeinstallprompt` listener:** Event may fire before effect runs; use module-scope init.
- **Combined `purpose: "any maskable"` icons:** Logo appears smaller on home screen; use separate files [CITED: web.dev/articles/maskable-icon].
- **Install + notification permission in one modal:** Permanent deny risk (PITFALLS.md Pitfall 3).
- **Blocking first-visit modal:** Violates D-06; conflicts with Chrome engagement heuristics (30s + interaction) [CITED: web.dev/articles/install-criteria].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Manifest JSON schema | Custom TS types from scratch | Static JSON + `$schema` from schemastore | IDE validation; matches web manifest spec |
| Install prompt API | Custom "download app" flow | `beforeinstallprompt` + `prompt()` | Only supported Chromium install API |
| iOS programmatic install | Fake install button that "does nothing" | Instructional modal with Share steps | iOS has no install API — Apple HIG pattern |
| Icon mask safe zone math | Guess padding | 40% radius safe circle (10% edge padding) per W3C [CITED: w3.org/TR/appmanifest/] | Platforms crop aggressively |
| Standalone detection | User-agent hacks alone | `display-mode` media query + `navigator.standalone` | UA strings change; media query is standard |
| Visit/dismiss persistence in Dexie | DB migration for UI flags | `localStorage` | Ephemeral marketing UX, not user data |

**Key insight:** Phase 9 is mostly static assets + thin platform adapters. The complexity is UX gating and cross-platform branching, not new infrastructure.

## Common Pitfalls

### Pitfall 1: Service Worker Accidentally Shipped in Phase 9

**What goes wrong:** `vite-plugin-pwa` default config registers SW; Lighthouse shows offline but update/offline behavior is untested; Phase 10 cache strategy conflicts.

**Why it happens:** Plugin "minimal config" generates SW + injects registration [CITED: vite-pwa-org.netlify.app/guide/].

**How to avoid:** Use static manifest only in Phase 9; grep build output for `sw.js` / `registerSW` before merge.

**Warning signs:** `virtual:pwa-register` import in bundle; Network tab shows SW on first visit.

### Pitfall 2: Missing `beforeinstallprompt` Due to React Timing

**What goes wrong:** Install button never enables; Settings shows only fallback text.

**Why it happens:** Listener attached in `useEffect` after event fired [CITED: Stack Overflow / SvelteKit issue — event fires on load].

**How to avoid:** Module-scope listener in `platform/install.ts`; subscribe from React via `useSyncExternalStore`.

**Warning signs:** `beforeinstallprompt` in DevTools Application panel but `getDeferredPrompt()` always null.

### Pitfall 3: iOS Shortcut Without True PWA Experience

**What goes wrong:** Home screen icon opens Safari tab, not standalone; push won't work in Phase 13.

**Why it happens:** Manifest not loaded before Add to Home Screen; missing `apple-mobile-web-app-capable` [CITED: web.dev/learn/pwa/enhancements].

**How to avoid:** Static manifest in `public/`; correct `apple-touch-icon`; test on real device.

**Warning signs:** No status bar theming; URL bar visible after launch from icon.

### Pitfall 4: Maskable Icon Cropped Flame

**What goes wrong:** Flame clipped to circle/squircle on Android launchers.

**Why it happens:** Flame extends into outer 10% unsafe zone [CITED: web.dev/articles/maskable-icon].

**How to avoid:** Separate maskable PNGs; keep flame in central 80%; `#0d1117` opaque background with rounded rect in safe zone.

**Warning signs:** Chrome DevTools → Application → Icons → "Show only minimum safe area" crops flame.

### Pitfall 5: Banner Obscures Tab Bar or Fights Toasts

**What goes wrong:** User can't tap "Hoy"/"Panel"; toasts hidden behind banner.

**Why it happens:** Banner at `bottom-0` same as tab bar; identical z-index.

**How to avoid:** Banner `bottom-[calc(3.5rem+env(safe-area-inset-bottom))]`; `z-50` > tab `z-40`; optional Sonner `offset`.

**Warning signs:** Overlapping touch targets in mobile emulation.

### Pitfall 6: Install Copy Promises Notification Permission

**What goes wrong:** Users expect reminders immediately; permission denied if combined prompts.

**Why it happens:** Over-eager iOS copy + Phase 12 permission flow.

**How to avoid:** iOS modal says install is *required for future* reminders; no `requestPermission()` in Phase 9 (PITFALLS.md Pitfall 3).

**Warning signs:** `Notification.requestPermission` anywhere in Phase 9 diff.

## Code Examples

### Chromium Install Button Handler
```typescript
// Source: web.dev/articles/codelab-make-installable
async function handleInstallClick() {
  const outcome = await triggerInstallPrompt();
  if (outcome === 'accepted') {
    dismissInstallBanner(365); // effectively permanent
  }
}
```

### iOS Modal Step Copy (Spanish)
```tsx
// Numbered steps with lucide Share icon — D-12, D-13
const steps = [
  { icon: Share, text: 'Toca el botón Compartir en la barra de Safari' },
  { icon: PlusSquare, text: 'Selecciona "Añadir a pantalla de inicio"' },
  { icon: Check, text: 'Confirma con "Añadir"' },
];
// Footer: "Necesitas instalar la app para recibir recordatorios de hábitos en el futuro."
```

### Install Banner Layout
```tsx
// z-50 above BottomTabBar (z-40)
<aside
  className="fixed inset-x-0 z-50 mx-auto max-w-[480px] border-t border-border bg-card px-4 py-3 shadow-lg"
  style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
  role="region"
  aria-label="Instalar aplicación"
>
  {/* Spanish copy D-08; Ahora no / Instalar */}
</aside>
```

### Settings Integration
```tsx
// SettingsPage.tsx — above Copia de seguridad (D-15)
{!isStandaloneDisplayMode() && (
  <SettingsInstallSection onOpenIosModal={() => setIosModalOpen(true)} />
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SW + manifest required for install | Manifest + HTTPS sufficient | Chrome 108/112+ [CITED: developer.chrome.com/blog/update-install-criteria] | Phase 9 can ship without SW |
| `purpose: "any maskable"` single icon | Separate `any` and `maskable` entries | web.dev guidance [CITED: web.dev/articles/maskable-icon] | Plan 4 icon files |
| `navigator.standalone` only on iOS | Also use `display-mode: standalone` | Safari 15.4+ [CITED: web.dev/learn/pwa/detection] | Combine both checks |
| Empty SW fetch handler for installability | Discouraged / ignored by Chrome | Chrome perf mitigations | Don't add fake SW in Phase 9 |

**Deprecated/outdated:**
- Requiring service worker for `beforeinstallprompt` in modern Chrome — removed from install criteria [CITED: web.dev/articles/install-criteria]
- ARCHITECTURE.md Phase 9 bundling PWA-02/05 — superseded by ROADMAP split (Phase 9 = manifest/install only)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Sonner `offset` prop lifts toasts above banner | Pattern 5 | Toasts may overlap banner — verify API in sonner@2.0.7 |
| A2 | Visit-count on App mount is sufficient engagement trigger | Pattern 4 | Product may prefer check-in trigger — both acceptable per CONTEXT |
| A3 | `short_name: "Habit Tracker"` fits iOS labels without truncation | Manifest | May need "Hábitos" abbreviation if truncated on device |
| A4 | `@vite-pwa/assets-generator` optional for icon pipeline | Package Audit | Manual PNG export from Figma/CLI is fine if assets committed |

## Open Questions

1. **Check-in vs visit-only engagement trigger**
   - What we know: CONTEXT allows either; visit count is simpler.
   - What's unclear: Product preference if both fire at different times.
   - Recommendation: Implement visit count ≥ 2; optionally call `markFirstCheckIn()` from `useToggleCompletion` when completion created (low-cost additive).

2. **Favicon replacement**
   - What we know: D-01 says flame is deliberate departure from green-check `favicon.svg`.
   - What's unclear: Whether to replace favicon.svg in Phase 9 or only PWA icons.
   - Recommendation: Update `favicon.svg` to flame motif for brand consistency; keep as separate task in icon plan.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 LTS | Vite build | ✓ | per AGENTS.md | — |
| npm/pnpm | package manager | ✓ | lockfile present | — |
| HTTPS or localhost | PWA install testing | ✓ | `vite preview` | `vite dev` for manifest only |
| Real iOS device | iOS install UX QA | ✗ (CI) | — | Manual UAT end-of-phase |
| Chrome Android/desktop | `beforeinstallprompt` QA | ✓ | DevTools | Lighthouse PWA audit on `dist/` |

**Missing dependencies with no fallback:**
- Real iOS Safari device for final iOS modal QA (manual UAT required per human_verify_mode)

**Missing dependencies with fallback:**
- None blocking implementation

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 + @testing-library/react 16.3.2 |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| Quick run command | `npm test -- src/platform/install.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | `isStandaloneDisplayMode()` true when `matchMedia` standalone | unit | `npm test -- src/platform/install.test.ts -x` | ❌ Wave 0 |
| PWA-01 | `isEngaged()` false on first visit, true on second | unit | `npm test -- src/platform/install.test.ts -x` | ❌ Wave 0 |
| PWA-01 | `isDismissed()` respects 7-day snooze | unit | `npm test -- src/platform/install.test.ts -x` | ❌ Wave 0 |
| PWA-01 | `shouldShowIosInstallFlow()` on iOS Safari not standalone | unit | `npm test -- src/platform/install.test.ts -x` | ❌ Wave 0 |
| PWA-01 | Settings hides install section when standalone | component | `npm test -- src/pages/SettingsPage.test.tsx -x` | ❌ extend existing |
| PWA-01 | Install banner renders Spanish copy after engagement | component | `npm test -- src/components/pwa/InstallBanner.test.tsx -x` | ❌ Wave 0 |
| PWA-01 | Manifest has required install fields | unit | `npm test -- src/platform/manifest.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/platform/install.test.ts -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + Lighthouse PWA installability on production build (`npm run build && npm run preview`)

### Wave 0 Gaps

- [ ] `src/platform/install.ts` — pure detection, localStorage, BIP singleton
- [ ] `src/platform/install.test.ts` — covers engagement, dismiss, standalone, iOS branch
- [ ] `src/platform/manifest.test.ts` — parse `public/manifest.webmanifest` for required fields/icons
- [ ] `src/components/pwa/InstallBanner.test.tsx` — engagement gating + dismiss
- [ ] Extend `src/pages/SettingsPage.test.tsx` — install section visibility + Spanish labels
- [ ] `src/test/setup.ts` — mock `matchMedia`, `localStorage`, optional `beforeinstallprompt` CustomEvent helper

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — local-only app |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | no | No user-supplied manifest data; static JSON only |
| V6 Cryptography | no | N/A |

### Known Threat Patterns for Static PWA Install UX

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via install modal `dangerouslySetInnerHTML` | Tampering | Static Spanish strings only; no HTML injection |
| Fake install prompts (phishing pattern) | Spoofing | Use native `prompt()` only on user gesture; don't mimic OS dialogs off-brand |
| Over-broad localStorage keys | Information disclosure | Namespace keys (`ht_pwa_*`); no sensitive data stored |
| Manifest served with wrong MIME | Tampering | Verify server serves `.webmanifest` as `application/manifest+json` on deploy [CITED: vite-pwa-org.netlify.app/guide/pwa-minimal-requirements] |

## Project Constraints (from .cursor/rules/)

No `.cursor/rules/` directory found in the project workspace. Follow `AGENTS.md` constraints: local-first, no backend/auth, Spanish UI for install flows, minimal dark aesthetic, GSD workflow for execution.

## Sources

### Primary (HIGH confidence)
- [vite-pwa-org.netlify.app/guide/pwa-minimal-requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements) — manifest fields, entry point meta, static manifest option
- [web.dev/articles/install-criteria](https://web.dev/articles/install-criteria) — Chrome installability without SW
- [web.dev/articles/maskable-icon](https://web.dev/articles/maskable-icon) — safe zone, separate purposes
- [web.dev/learn/pwa/detection](https://web.dev/learn/pwa/detection) — `display-mode` standalone detection
- [web.dev/learn/pwa/enhancements](https://web.dev/learn/pwa/enhancements) — iOS `navigator.standalone`, manifest loading behavior
- [developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event) — deferred prompt API
- [developer.chrome.com/blog/update-install-criteria](https://developer.chrome.com/blog/update-install-criteria) — SW requirement removed for install
- [w3.org/TR/appmanifest/](https://www.w3.org/TR/appmanifest/) — maskable safe zone (40% radius)
- Codebase: `src/index.css`, `BottomTabBar.tsx` (z-40), `SettingsPage.tsx`, `App.tsx`, `ConfirmDialog.tsx`

### Secondary (MEDIUM confidence)
- [vite-pwa-org.netlify.app/guide/](https://vite-pwa-org.netlify.app/guide/) — default plugin generates SW
- [web.dev/articles/codelab-make-installable](https://web.dev/articles/codelab-make-installable) — beforeinstallprompt capture pattern
- `.planning/research/PITFALLS.md` — Pitfall 3 (permission timing), Pitfall 7 (iOS install before push)
- `.planning/research/ARCHITECTURE.md` — InstallPrompt / platform/install patterns (phase numbers superseded by ROADMAP)

### Tertiary (LOW confidence — verify at implementation)
- Sonner `offset` prop behavior with bottom-center toasts (package API)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — static manifest validated against web.dev + vite-pwa docs; no new deps
- Architecture: HIGH — aligns with existing layout (`z-40` tab bar, Spanish Settings patterns)
- Pitfalls: HIGH — cross-checked PITFALLS.md + Chrome criteria changes

**Research date:** 2026-07-25
**Valid until:** 2026-08-25 (stable PWA install APIs; revisit if Chrome changes `beforeinstallprompt`)
