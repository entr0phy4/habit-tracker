---
phase: 02-streaks-statistics
plan: 04
subsystem: ui
tags: [react, dexie, useLiveQuery, vitest, stats, calendar-week]

requires:
  - phase: 02-streaks-statistics
    plan: 01
    provides: calculateCurrentStreak, calculateLongestStreak, completionRepository pattern
  - phase: 02-streaks-statistics
    plan: 02
    provides: calculateCompletionRate, getWeekDayState, getCalendarWeekDates
provides:
  - useHabitStats hook deriving current, longest, and rate from single range query
  - StatCards three-column stats header on history page
  - Calendar-week HistoryDotGrid with completed/missed/not-scheduled/future states
  - useCompletions switched from rolling 7-day to Mon–Sun calendar week
affects: [phase-3-dashboard, heatmap]

tech-stack:
  added: []
  patterns:
    - "useHabitStats single getByHabitInRange query derives all three stats"
    - "StatCards returns null while isLoading; semantic dl/dt/dd with aria-label"
    - "HistoryDotGrid uses getWeekDayState + frequency prop for schedule-aware dots"
    - "Today ring nested in wrapper div to stack with missed destructive ring"

key-files:
  created:
    - src/hooks/useHabitStats.ts
    - src/components/habits/StatCards.tsx
    - src/components/habits/StatCards.test.tsx
  modified:
    - src/hooks/useCompletions.ts
    - src/components/habits/HistoryDotGrid.tsx
    - src/components/habits/HistoryDotGrid.test.tsx
    - src/pages/HabitHistoryPage.tsx

key-decisions:
  - "HabitHistoryContent sub-component isolates useHabitStats to satisfy Rules of Hooks"
  - "Today primary ring on wrapper div so missed destructive ring stacks per UI-SPEC"
  - "MWF test expects 3 scheduled buttons (Mon/Wed/Fri); Sunday is not-scheduled for MWF"

patterns-established:
  - "History page composes StatCards + HistoryDotGrid with habit.frequency prop"
  - "Missed tappable dots use aria-pressed=false and aria-label with day name"

requirements-completed: [STRK-02, STRK-03, STRK-04]

coverage:
  - id: D1
    description: "History page shows Current, Longest, Rate stat cards below habit name"
    requirement: STRK-02
    verification:
      - kind: unit
        ref: "src/components/habits/StatCards.test.tsx#renders three stat labels and formatted rate"
        status: pass
    human_judgment: false
  - id: D2
    description: "Completion rate formatted as whole-number percent e.g. 85%"
    requirement: STRK-03
    verification:
      - kind: unit
        ref: "src/components/habits/StatCards.test.tsx#renders three stat labels and formatted rate"
        status: pass
    human_judgment: false
  - id: D3
    description: "Calendar-week Mon–Sun grid with completed, missed, and hidden not-scheduled states"
    requirement: STRK-04
    verification:
      - kind: unit
        ref: "src/components/habits/HistoryDotGrid.test.tsx#has no tappable button on a non-scheduled Tuesday column"
        status: pass
      - kind: unit
        ref: "src/components/habits/HistoryDotGrid.test.tsx#applies ring-destructive on a missed scheduled past day"
        status: pass
    human_judgment: false
  - id: D4
    description: "Stats and grid update immediately on dot toggle via useLiveQuery"
    requirement: STRK-02
    verification: []
    human_judgment: true
    rationale: "Reactive Dexie recalc requires manual browser toggle verification"

duration: 8min
completed: 2026-07-19
status: complete
---

# Phase 02 Plan 04: History Stats + Calendar Week Summary

**History page stat cards (current, longest, rate) and schedule-aware Mon–Sun dot grid with 44px touch targets**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-19T20:10:00Z
- **Completed:** 2026-07-19T20:18:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `useHabitStats` derives current streak, longest streak, and completion rate from one `getByHabitInRange` fetch
- `StatCards` renders three equal cards with semantic `<dl>` markup; returns null while loading
- `useCompletions` queries calendar week Mon–Sun via `getCalendarWeekDates`
- `HistoryDotGrid` shows completed (green fill), missed (destructive ring), not-scheduled (spacer), and future (disabled) states
- `HabitHistoryPage` subtitle changed to "This week"; composes StatCards between name and dot grid

## Task Commits

1. **Task 1: useHabitStats hook and StatCards on history page** - `1d09bf3` (feat)
2. **Task 2: Calendar-week HistoryDotGrid and useCompletions** - `e508139` (test), `212d163` (feat)

## Files Created/Modified

- `src/hooks/useHabitStats.ts` - Single-query stats hook for history page
- `src/components/habits/StatCards.tsx` - Three-column stat cards component
- `src/components/habits/StatCards.test.tsx` - Label and rate formatting tests
- `src/hooks/useCompletions.ts` - Calendar week date range query
- `src/components/habits/HistoryDotGrid.tsx` - Schedule-aware dot grid with accessibility
- `src/components/habits/HistoryDotGrid.test.tsx` - MWF fixture and state assertions
- `src/pages/HabitHistoryPage.tsx` - StatCards + frequency prop wiring

## Decisions Made

- Extracted `HabitHistoryContent` to call `useHabitStats` unconditionally (Rules of Hooks)
- Nested today ring in wrapper `div` so destructive missed ring and primary today ring both visible
- MWF test fixture expects 3 buttons (Mon/Wed/Fri) since Sunday is not scheduled for that frequency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] HabitHistoryContent sub-component for hook rules**
- **Found during:** Task 1 (HabitHistoryPage wiring)
- **Issue:** Conditional `useHabitStats(habit)` violated Rules of Hooks
- **Fix:** Extracted `HabitHistoryContent` child that receives loaded `habit` and calls hook unconditionally
- **Files modified:** `src/pages/HabitHistoryPage.tsx`
- **Committed in:** `1d09bf3`

**2. [Rule 2 - Missing Critical] Nested today ring for today+missed stacking**
- **Found during:** Task 2 (HistoryDotGrid implementation)
- **Issue:** Single-element `ring-primary` + `ring-destructive` classes conflicted; today ring invisible on missed today
- **Fix:** Wrapper `div` with `ring-primary` around button carrying `ring-destructive`
- **Files modified:** `src/components/habits/HistoryDotGrid.tsx`, `HistoryDotGrid.test.tsx`
- **Committed in:** `212d163`

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both required for React correctness and UI-SPEC visual contract. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 all four requirements (STRK-01–04) satisfied across plans 02-01 through 02-04
- Ready for Phase 3 dashboard and heatmap visualization

## Self-Check: PASSED

- FOUND: src/hooks/useHabitStats.ts
- FOUND: src/components/habits/StatCards.tsx
- FOUND: src/components/habits/StatCards.test.tsx
- FOUND: src/components/habits/HistoryDotGrid.tsx (modified)
- FOUND: src/hooks/useCompletions.ts (modified)
- FOUND: src/pages/HabitHistoryPage.tsx (modified)
- FOUND: commit 1d09bf3
- FOUND: commit e508139
- FOUND: commit 212d163

---
*Phase: 02-streaks-statistics*
*Completed: 2026-07-19*
