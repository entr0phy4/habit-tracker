---
phase: 09-pwa-install-manifest
plan: 03
subsystem: ui
tags: [pwa, settings, install]
requires:
  - phase: 09-01
    provides: platform/install.ts
  - phase: 09-02
    provides: IosInstallModal
provides:
  - Settings permanent Instalar app section above backup
  - Phase 9 scope fence verification (no SW, no new PWA deps)
affects: [phase-10-offline]
tech-stack:
  added: []
  patterns:
    - Settings install section inline matching Copia de seguridad layout
key-files:
  created: []
  modified:
    - src/pages/SettingsPage.tsx
    - src/pages/SettingsPage.test.tsx
key-decisions:
  - "Install section hidden entirely in standalone mode (no empty placeholder)"
patterns-established: []
requirements-completed: [PWA-01]
coverage:
  - id: D1
    description: Settings install section with iOS/Android variants and standalone hide
    requirement: PWA-01
    verification:
      - kind: unit
        ref: src/pages/SettingsPage.test.tsx
        status: pass
    human_judgment: false
  - id: D2
    description: Phase 9 scope fence — no service worker or vite-plugin-pwa
    requirement: PWA-01
    verification:
      - kind: other
        ref: "npm test && npm run build && ! dist/sw.js"
        status: pass
    human_judgment: false
duration: 8min
completed: 2026-07-25
status: complete
---

# Phase 9 Plan 03: Settings Install Section Summary

**Permanent Instalar app entry in Ajustes with platform-specific CTAs and scope fence verified.**

## Performance

- **Duration:** 8 min
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Extended `SettingsPage.test.tsx` with TDD RED→GREEN install section coverage
- Added "Instalar app" section above "Copia de seguridad" with Spanish copy
- iOS: "Cómo instalar" opens shared `IosInstallModal`
- Android: "Instalar" when deferred prompt available; fallback menu instructions otherwise
- Section hidden when `isStandaloneDisplayMode()`
- Full suite green (236 tests); build includes manifest/icons, no SW artifacts

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: src/pages/SettingsPage.tsx install section
- FOUND: commits d59004c, 858512e
- FOUND: dist/manifest.webmanifest
