---
phase: 09-pwa-install-manifest
plan: 02
subsystem: ui
tags: [pwa, install-banner, ios-modal, react]
requires:
  - phase: 09-01
    provides: platform/install.ts exports and icon assets
provides:
  - InstallBanner contextual bottom banner on tabbed routes
  - IosInstallModal shared numbered-step guidance
  - MainLayout mount and App session visit tracking
affects: [09-03]
tech-stack:
  added: []
  patterns:
    - useSyncExternalStore for deferred install prompt reactivity
    - Banner at z-50 above BottomTabBar with safe-area offset
key-files:
  created:
    - src/components/pwa/InstallBanner.tsx
    - src/components/pwa/IosInstallModal.tsx
    - src/components/pwa/InstallBanner.test.tsx
    - src/components/pwa/IosInstallModal.test.tsx
  modified:
    - src/components/layout/MainLayout.tsx
    - src/App.tsx
    - src/hooks/useToggleCompletion.ts
    - src/pages/TodayPage.tsx
    - src/pages/DashboardPage.tsx
key-decisions:
  - "InstallBanner mounted in MainLayout (tabbed routes only) not global App"
  - "Chromium fallback text shown when eligible but no deferred prompt"
patterns-established:
  - "components/pwa/ for install UX components"
requirements-completed: [PWA-01]
coverage:
  - id: D1
    description: iOS install modal with Spanish steps and reminders intro
    requirement: PWA-01
    verification:
      - kind: unit
        ref: src/components/pwa/IosInstallModal.test.tsx
        status: pass
    human_judgment: false
  - id: D2
    description: Contextual install banner with engagement gating and platform branches
    requirement: PWA-01
    verification:
      - kind: unit
        ref: src/components/pwa/InstallBanner.test.tsx
        status: pass
    human_judgment: true
    rationale: 320px banner wrap and real-device install flow need manual UAT
duration: 10min
completed: 2026-07-25
status: complete
---

# Phase 9 Plan 02: Install Banner & iOS Modal Summary

**Contextual Spanish install banner above tab bar with shared iOS step-by-step modal.**

## Performance

- **Duration:** 10 min
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- `IosInstallModal` with numbered Spanish steps, Share icon, reminders prerequisite copy, Escape/backdrop close
- `InstallBanner` fixed above tab bar with engagement/dismiss/standalone gating and Chromium fallback
- Mounted in `MainLayout`; early BIP capture via side-effect import in `App.tsx`
- `recordSessionVisit` on App mount; `markFirstCheckIn` wired in `useToggleCompletion`
- Content padding increased on Today/Dashboard pages (`pb-36`)
- Build verified: no `sw.js` or `registerSW` in dist

## Deviations from Plan

None - plan executed as written (tsconfig fix documented in Plan 01 summary).

## Self-Check: PASSED

- FOUND: src/components/pwa/InstallBanner.tsx
- FOUND: src/components/pwa/IosInstallModal.tsx
- FOUND: commits 26ce667, 304c9ad, 3ee8b0c
