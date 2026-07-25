# Phase 9: PWA Install & Manifest - Context

**Gathered:** 2026-07-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can install Habit Tracker to their home screen as a standalone app with proper manifest, maskable icons, dark theme colors, a contextual install prompt, and iOS-specific "Add to Home Screen" guidance. This phase delivers **PWA-01 only** — installability and manifest. Service worker, offline shell, update prompts (PWA-02/03/05), storage durability (PWA-04), and reminders (REM-*) belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### App Icon & Branding
- **D-01:** New icon design featuring a **streak/flame motif** — distinct from the existing green-check favicon, reinforcing streak motivation.
- **D-02:** Flame color **green (#3fb950)** on **dark background (#0d1117)** — matches the existing GitHub-dark palette in `src/index.css`.
- **D-03:** Maskable icon background: **#0d1117 with rounded corners** (consistent with current favicon shape, not full-bleed).
- **D-04:** Manifest `name`: **"Habit Tracker"** (English, matching current `<title>`). Provide a sensible `short_name` (e.g., "Habit Tracker" or abbreviated) for home-screen labels.
- **D-05:** Generate **192×192 and 512×512** PNG icons (maskable variants) plus any required apple-touch-icon sizes.

### Install Prompt (Android / beforeinstallprompt)
- **D-06:** **No blocking first-visit modal.** Show banner only after **engagement**: 2nd visit OR first check-in (whichever comes first). Store dismiss state in localStorage or Zustand.
- **D-07:** Placement: **bottom banner above the tab bar** — visible but non-blocking; sits above `BottomTabBar` fixed position.
- **D-08:** Copy focus: **offline benefit** — e.g., "Instala para usar sin conexión y acceder más rápido" (Spanish UI, consistent with existing pages).
- **D-09:** Dismiss ("Ahora no"): **hide for 7 days**, then show again if still not installed.
- **D-10:** On supported browsers, tapping "Instalar" triggers the native `beforeinstallprompt` deferred prompt.

### iOS Install Guidance
- **D-11:** Detect **Safari on iOS, not in standalone mode**. Use the **same engagement trigger** as the Android install banner.
- **D-12:** Format: **numbered steps with icons** — 1) Tap Share 2) Add to Home Screen 3) Confirm.
- **D-13:** **Mention push/reminders now** — copy should state that home-screen install is required to receive habit reminders (anticipates Phase 13; required by roadmap success criterion 4).
- **D-14:** UX flow: **banner + modal on tap** — compact banner with "Instalar app" button; tapping opens modal with full iOS step-by-step instructions.

### Settings Permanent Entry
- **D-15:** New **"Instalar app"** section in `SettingsPage`, placed **above** the existing "Copia de seguridad" section.
- **D-16:** **Hide the section entirely** when app is already running in standalone/display-mode installed state.
- **D-17:** Android/Chrome in Settings: **"Instalar" button + fallback text** — attempt native `beforeinstallprompt`; if unavailable, show browser menu instructions (⋮ → Instalar app).
- **D-18:** iOS in Settings: **"Cómo instalar" button** opens the **same modal** used by the install banner.

### Manifest & Theme
- **D-19:** `display: "standalone"`, `theme_color: "#0d1117"`, `background_color: "#0d1117"` — match `src/index.css` tokens.
- **D-20:** Add `theme-color` meta tag to `index.html` for browser chrome consistency before install.
- **D-21:** UI copy in **Spanish** throughout install flows (consistent with existing app: "Ajustes", "Exportar datos", etc.).

### Claude's Discretion
- **Install trigger threshold:** 2nd visit OR first check-in — implement whichever is simpler to detect reliably; both are acceptable.
- **iOS detection:** Use `navigator.standalone === false` + iOS user-agent / platform check; show iOS flow instead of `beforeinstallprompt` banner.
- **Android Settings fallback:** Show native install button when `beforeinstallprompt` is captured; otherwise inline browser instructions.
- **`short_name`:** Abbreviate only if "Habit Tracker" truncates poorly on iOS home screen; default to full name.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 9 goal, success criteria, dependency on v1.1
- `.planning/REQUIREMENTS.md` — **PWA-01** (installable manifest, icons, standalone display)
- `.planning/PROJECT.md` — v2.0 scope, local-first constraints, dark-mode aesthetic

### Research & Pitfalls
- `.planning/research/PITFALLS.md` — Pitfall 7 (iOS requires home-screen install for push); Pitfall 3 (don't combine install + notification permission prompts — permission is Phase 12)
- `.planning/research/ARCHITECTURE.md` — Install prompt patterns (`beforeinstallprompt`, Zustand dismiss state); note: phase numbering in this doc predates the ROADMAP split — **ROADMAP.md is authoritative** (Phase 9 = manifest/install only; SW/offline = Phase 10)

### Theme & Existing UI
- `src/index.css` — canonical color tokens (`#0d1117` background, `#3fb950` primary)
- `public/favicon.svg` — existing brand reference (green check); new flame icon is a deliberate departure
- `index.html` — entry point for manifest link and theme-color meta

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/SettingsPage.tsx` — integration point for permanent "Instalar app" section above backup controls
- `src/components/layout/BottomTabBar.tsx` — fixed bottom nav; install banner sits above it (`z-index` coordination needed)
- `src/components/layout/AppShell.tsx` — page shell pattern for Settings content sections
- `src/components/ui/button.tsx` — shadcn Button for install CTAs (min-h-11 touch targets already established)
- `src/components/habits/ConfirmDialog.tsx` — potential pattern for iOS install modal (or new dedicated modal component)
- `public/favicon.svg` — source color reference; flame icon is new asset in `public/icons/`

### Established Patterns
- **Spanish UI copy** across all pages — install strings must follow same language
- **Dark GitHub aesthetic** — `#0d1117` / `#3fb950` palette; no light mode
- **Mobile-first layout** — max-width 480px, min 44px touch targets
- **Sonner toasts** (`src/components/ui/sonner.tsx`) — bottom-center; install banner must not conflict visually
- **No service worker yet** — Phase 9 adds manifest + install UX only; `vite-plugin-pwa` setup may begin here but SW registration/offline is Phase 10

### Integration Points
- `index.html` — add `<link rel="manifest">`, `theme-color`, apple-touch-icon links
- `src/App.tsx` — mount `InstallPrompt` component (banner + iOS modal)
- New `src/components/pwa/` or `src/platform/install.ts` — `beforeinstallprompt` capture, standalone detection, dismiss persistence
- `vite.config.ts` — manifest generation (via `vite-plugin-pwa` manifest config or static `public/manifest.webmanifest`)

</code_context>

<specifics>
## Specific Ideas

- Flame/streak icon reinforces the core motivation loop ("don't break the chain")
- iOS modal should use numbered steps with Share icon — familiar pattern from other PWAs
- Banner copy emphasizes offline; iOS modal additionally mentions reminders as future benefit
- Settings section is the permanent fallback when user dismisses the 7-day banner

</specifics>

<deferred>
## Deferred Ideas

- Service worker, offline shell, update prompt — **Phase 10** (PWA-02, PWA-03, PWA-05)
- `navigator.storage.persist()` durability UX — **Phase 11** (PWA-04)
- Notification permission and per-habit reminder toggles — **Phase 12** (REM-01, REM-03, REM-04)
- Web Push subscription and notification click handling — **Phase 13** (REM-05, REM-06)
- Push relay for closed-app delivery — **Phase 14** (REM-02)

</deferred>

---

*Phase: 9-PWA Install & Manifest*
*Context gathered: 2026-07-25*
