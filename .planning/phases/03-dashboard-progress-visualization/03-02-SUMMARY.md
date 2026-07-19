---
phase: 03-dashboard-progress-visualization
plan: 02
subsystem: ui
tags: [react-router, dexie, bottom-tab-bar, dashboard-hook]

requires:
  - phase: 02-streaks-statistics
    provides: calculateCurrentStreak, completionRepository range queries
provides:
  - useDashboardHabits batch hook with streak-desc sort
  - BottomTabBar with Spanish Hoy/Panel tabs
  - MainLayout nested routing shell
  - DashboardPage stub at /dashboard
  - AppShell hasTabBar padding and Today FAB clearance
affects:
  - 03-03-dashboard-page
  - 03-04-heatmap-history

tech-stack:
  added: []
  patterns:
    - Batch useLiveQuery for dashboard streak sort (no per-card useStreak)
    - MainLayout + BottomTabBar for tab-bar routes only

key-files:
  created:
    - src/hooks/useDashboardHabits.ts
    - src/hooks/useDashboardHabits.test.ts
    - src/components/layout/BottomTabBar.tsx
    - src/components/layout/BottomTabBar.test.tsx
    - src/components/layout/MainLayout.tsx
    - src/pages/DashboardPage.tsx
  modified:
    - src/App.tsx
    - src/components/layout/AppShell.tsx
    - src/pages/TodayPage.tsx
    - src/components/habits/FloatingAddButton.tsx

key-decisions:
  - "MainLayout nests /, /dashboard, and /habits/:id/history — form routes stay outside for hidden tab bar"
  - "useDashboardHabits batch-computes streaks and sorts descending — avoids per-card useStreak anti-pattern"
  - "AppShell hasTabBar applies pb-20; Today list uses pb-28 with FAB at bottom-[4.5rem]"

patterns-established:
  - "Tab-bar routes: MainLayout wraps Outlet + fixed BottomTabBar"
  - "Dashboard data: single useLiveQuery over active habits with calculateCurrentStreak per habit"

requirements-completed: [DASH-01]

coverage:
  - id: D1
    description: "useDashboardHabits returns active habits sorted by currentStreak descending"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "src/hooks/useDashboardHabits.test.ts#sorts habits by currentStreak descending"
        status: pass
    human_judgment: false
  - id: D2
    description: "Bottom tab bar shows Spanish Hoy and Panel labels with icons"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "src/components/layout/BottomTabBar.test.tsx#renders Hoy and Panel labels"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tab bar visible on / and /dashboard; hidden on form routes"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "Route nesting verified by build; visual tab-bar hide/show on form routes needs manual navigation check"
  - id: D4
    description: "Today FAB and list clear fixed tab bar without overlap"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "Spacing tokens applied per UI-SPEC; visual clearance requires manual mobile check"

duration: 3min
completed: 2026-07-19
status: complete
---

# Phase 03 Plan 02: Navigation Shell & Dashboard Hook Summary

**Spanish bottom tab bar (Hoy/Panel), nested MainLayout routing, and batch useDashboardHabits hook sorted by streak**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-19T21:05:20Z
- **Completed:** 2026-07-19T21:08:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- `useDashboardHabits` batch-fetches active habits, computes streaks, sorts descending
- `BottomTabBar` with CalendarCheck/LayoutGrid icons and Spanish Hoy/Panel labels
- `MainLayout` nests Today, Dashboard stub, and history under tab bar; form routes excluded
- Today page FAB raised and list padded for tab bar clearance

## Task Commits

Each task was committed atomically:

1. **Task 1: useDashboardHabits batch hook and tests** - `ebd617e` (test), `0aa05fe` (feat)
2. **Task 2: BottomTabBar, MainLayout, and App routing** - `84f4703` (test), `e6751be` (feat)
3. **Task 3: AppShell tab-bar padding and Today FAB clearance** - `bafbea7` (feat)

## Files Created/Modified

- `src/hooks/useDashboardHabits.ts` - Batch reactive hook for dashboard habit list with streak sort
- `src/hooks/useDashboardHabits.test.ts` - Sort order, archived filter, loading state tests
- `src/components/layout/BottomTabBar.tsx` - Fixed bottom nav with Hoy/Panel tabs
- `src/components/layout/BottomTabBar.test.tsx` - Label and route assertions
- `src/components/layout/MainLayout.tsx` - Outlet + BottomTabBar layout shell
- `src/pages/DashboardPage.tsx` - Panel stub for Plan 03 full dashboard UI
- `src/App.tsx` - Nested routes under MainLayout
- `src/components/layout/AppShell.tsx` - Optional `hasTabBar` prop with pb-20
- `src/pages/TodayPage.tsx` - hasTabBar and pb-28 list padding
- `src/components/habits/FloatingAddButton.tsx` - Raised to bottom-[4.5rem]

## Decisions Made

- History route kept inside MainLayout so tab bar shows per UI-SPEC D-04
- Batch streak computation in hook rather than per-card useStreak (D-06, RESEARCH Pitfall 4)
- AppShell hasTabBar landed in Task 2 commit alongside DashboardPage stub to satisfy TypeScript compile

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AppShell hasTabBar added in Task 2 instead of Task 3**
- **Found during:** Task 2 (DashboardPage stub)
- **Issue:** DashboardPage stub requires `hasTabBar` prop before AppShell supported it
- **Fix:** Added `hasTabBar` optional prop to AppShell in Task 2 commit; Task 3 only adjusted Today/FAB
- **Files modified:** `src/components/layout/AppShell.tsx`
- **Committed in:** `e6751be`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal — Task 3 scope reduced to Today/FAB only; no behavior change.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03 can wire `DashboardPage` to `useDashboardHabits` and render habit cards
- Tab navigation shell ready for dashboard list and heatmap history routes

---
*Phase: 03-dashboard-progress-visualization*
*Completed: 2026-07-19*

## Self-Check: PASSED

- FOUND: src/hooks/useDashboardHabits.ts
- FOUND: src/components/layout/BottomTabBar.tsx
- FOUND: src/components/layout/MainLayout.tsx
- FOUND: src/pages/DashboardPage.tsx
- FOUND: ebd617e, 0aa05fe, 84f4703, e6751be, bafbea7
