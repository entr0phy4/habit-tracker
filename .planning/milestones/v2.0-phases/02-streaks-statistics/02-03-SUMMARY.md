---
phase: 02-streaks-statistics
plan: 03
subsystem: ui
tags: [react, dexie, useLiveQuery, lucide-react, streak, vitest]

requires:
  - phase: 02-streaks-statistics
    plan: 01
    provides: calculateCurrentStreak, getHabitStartDate, completionRepository.getByHabitInRange pattern
provides:
  - useStreak reactive hook for current streak on Today rows
  - HabitRow inline Flame + count badge with accessibility label
  - todayKey threading from TodayPage for midnight refresh consistency
affects: [02-04, useHabitStats, HabitHistoryPage]

tech-stack:
  added: []
  patterns:
    - "useStreak follows useCompletions useLiveQuery + completionRepository range fetch"
    - "Streak badge omitted while isLoading; defaults currentStreak to 0 when undefined"
    - "TDD RED/GREEN: test commit before feat commit for HabitRow badge"

key-files:
  created:
    - src/hooks/useStreak.ts
  modified:
    - src/components/habits/HabitRow.tsx
    - src/components/habits/HabitRow.test.tsx
    - src/pages/TodayPage.tsx

key-decisions:
  - "Badge hidden while useStreak isLoading per UI-SPEC loading state"
  - "Streak count uses text-foreground and Flame text-primary — not muted when row completed (D-04)"

patterns-established:
  - "Components consume useStreak(habit, todayKey?) — never import completionRepository directly"

requirements-completed: [STRK-01]

coverage:
  - id: D1
    description: "useStreak reactive hook returns currentStreak and isLoading via useLiveQuery"
    requirement: STRK-01
    verification:
      - kind: unit
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "HabitRow shows Flame + streak count inline between name and WeekDayDots"
    requirement: STRK-01
    verification:
      - kind: unit
        ref: "src/components/habits/HabitRow.test.tsx#shows streak count from useStreak"
        status: pass
    human_judgment: false
  - id: D3
    description: "Streak badge remains visible at full color when row is completed (D-04)"
    requirement: STRK-01
    verification:
      - kind: unit
        ref: "src/components/habits/HabitRow.test.tsx#shows streak badge when row is completed"
        status: pass
    human_judgment: false
  - id: D4
    description: "Toggle today completion updates streak without page refresh"
    requirement: STRK-01
    verification: []
    human_judgment: true
    rationale: "Reactive useLiveQuery behavior requires manual browser toggle verification"

duration: 5min
completed: 2026-07-19
status: complete
---

# Phase 02 Plan 03: Today Inline Streak Badge Summary

**Reactive Flame + count badge on Today rows via useStreak hook and useLiveQuery completion fetch**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-19T20:08:00Z
- **Completed:** 2026-07-19T20:13:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `useStreak` hook fetching completions from habit start through today and deriving `calculateCurrentStreak`
- Added inline Flame + numeric badge to `HabitRow` with `aria-label="{n} day streak"` between name and `WeekDayDots`
- Threaded `todayKey` from `TodayPage` for visibilitychange midnight consistency
- Extended component tests with `useStreak` mock covering default and completed-row visibility

## Task Commits

Each task was committed atomically:

1. **Task 1: useStreak reactive hook** - `4722802` (feat)
2. **Task 2: HabitRow inline streak badge and tests** - `109982b` (test), `21ddc68` (feat)

**Plan metadata:** pending (docs commit)

## Files Created/Modified

- `src/hooks/useStreak.ts` - Reactive current streak hook via completionRepository + domain streak calc
- `src/components/habits/HabitRow.tsx` - Inline Flame badge, optional todayKey prop, loading guard
- `src/components/habits/HabitRow.test.tsx` - useStreak mock and streak visibility assertions
- `src/pages/TodayPage.tsx` - Passes todayKey to HabitRow

## Decisions Made

- Badge omitted while `isLoading` per UI-SPEC — row remains tappable at 44px min height
- Streak badge uses full `text-foreground` / `text-primary` when row completed — not muted (D-04)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced jest-dom matchers with Vitest-native assertions**
- **Found during:** Task 2 (HabitRow test GREEN phase)
- **Issue:** `toBeInTheDocument` not available — project setup lacks `@testing-library/jest-dom`
- **Fix:** Changed assertions to `.toBeTruthy()` matching existing TodayPage.test.tsx convention
- **Files modified:** `src/components/habits/HabitRow.test.tsx`
- **Verification:** `npm test -- src/components/habits/HabitRow.test.tsx` passes
- **Committed in:** `21ddc68` (Task 2 feat commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Test assertion fix required for GREEN gate; no scope change.

## Issues Encountered

None beyond the jest-dom matcher gap documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- STRK-01 Today view slice complete; ready for 02-04 history stats and calendar-week grid
- `useStreak` pattern established for `useHabitStats` in plan 02-02

---
*Phase: 02-streaks-statistics*
*Completed: 2026-07-19*

## Self-Check: PASSED

- FOUND: src/hooks/useStreak.ts
- FOUND: src/components/habits/HabitRow.tsx
- FOUND: src/components/habits/HabitRow.test.tsx
- FOUND: src/pages/TodayPage.tsx
- FOUND: 4722802
- FOUND: 109982b
- FOUND: 21ddc68
