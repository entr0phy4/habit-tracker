---
phase: 02-streaks-statistics
plan: 02
subsystem: domain
tags: [vitest, date-fns, completion-rate, calendar-week, tdd]

requires:
  - phase: 02-streaks-statistics
    provides: iterateDaysInRange, isFutureDate, isDueOnDate from Plan 01 and Phase 1
provides:
  - calculateCompletionRate lifetime scheduled-day ratio (D-07, D-08)
  - getWeekDayState for HistoryDotGrid four-state rendering (D-10)
  - getCalendarWeekDates Mon–Sun calendar week (D-09)
affects: [02-03, 02-04, useHabitStats, HistoryDotGrid]

tech-stack:
  added: []
  patterns:
    - "Pure domain stats functions over Set<string> — no Dexie/React in domain layer"
    - "Calendar week via date-fns startOfWeek/endOfWeek weekStartsOn 1"
    - "TDD RED/GREEN gate: test commit before implementation commit"

key-files:
  created:
    - src/domain/stats.ts
    - src/domain/stats.test.ts
  modified:
    - src/domain/dates.ts
    - src/domain/dates.test.ts

key-decisions:
  - "getWeekDayState uses today string param converted to noon-local Date for isFutureDate"
  - "Future scheduled days excluded from completion rate denominator via isFutureDate"

patterns-established:
  - "WeekDayState union: completed | missed | not-scheduled | future"
  - "Completion rate returns 0 when scheduled denominator is zero"

requirements-completed: [STRK-03, STRK-04]

coverage:
  - id: D1
    description: "calculateCompletionRate lifetime rate with rounding and future-day exclusion (D-07, D-08)"
    requirement: STRK-03
    verification:
      - kind: unit
        ref: "src/domain/stats.test.ts#calculateCompletionRate"
        status: pass
    human_judgment: false
  - id: D2
    description: "getWeekDayState maps schedule + completions to four grid states (D-10, D-11)"
    requirement: STRK-04
    verification:
      - kind: unit
        ref: "src/domain/stats.test.ts#getWeekDayState"
        status: pass
    human_judgment: false
  - id: D3
    description: "getCalendarWeekDates returns Mon–Sun week containing today (D-09)"
    requirement: STRK-04
    verification:
      - kind: unit
        ref: "src/domain/dates.test.ts#getCalendarWeekDates"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-19
status: complete
---

# Phase 02 Plan 02: TDD Completion Rate + Calendar-Week State Domain Summary

**Lifetime completion rate with future-day exclusion and Mon–Sun calendar week state predicates — foundation for history stat cards and weekly dot grid**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-19T20:08:00Z
- **Completed:** 2026-07-19T20:12:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `calculateCompletionRate` iterates habit lifetime, gates by schedule, excludes future days, rounds to whole percent
- `getWeekDayState` composes `isDueOnDate`, `isFutureDate`, and completion set for four grid states
- `getCalendarWeekDates` returns Mon–Sun local date strings via `weekStartsOn: 1`
- 16 unit tests green across stats and dates modules

## Task Commits

Each task was committed atomically:

1. **Task 1: RED — failing stats and calendar-week tests** - `f06d272` (test)
2. **Task 2: GREEN — stats.ts and getCalendarWeekDates** - `c7a8055` (feat)

## Files Created/Modified
- `src/domain/stats.ts` - calculateCompletionRate and getWeekDayState pure functions
- `src/domain/stats.test.ts` - STRK-03 rate and STRK-04 week-state edge cases
- `src/domain/dates.ts` - getCalendarWeekDates export with date-fns week helpers
- `src/domain/dates.test.ts` - Sunday anchor calendar week boundary test

## Decisions Made
- getWeekDayState accepts today as YYYY-MM-DD string, converted to noon-local Date for isFutureDate consistency
- getLast7Days retained for backward compat; history flow switches in Plan 04

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected MWF test fixture calendar dates**
- **Found during:** Task 2 (GREEN implementation)
- **Issue:** RED test dates (Jul 14–18) did not align with MWF day-of-week mapping — Tuesday/Monday/Friday assertions used wrong weekdays
- **Fix:** Updated fixtures to Jul 20 (Mon), Jul 21 (Tue), Jul 24 (Fri) with today Jul 23 (Thu)
- **Files modified:** src/domain/stats.test.ts
- **Verification:** All 16 unit tests pass
- **Committed in:** c7a8055 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fixture correction required for correct TDD validation; no scope change.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Stats domain ready for `useHabitStats` hook (Plan 02-03) and `HistoryDotGrid` wiring (Plan 02-04)
- getCalendarWeekDates available to replace getLast7Days in useCompletions

---
*Phase: 02-streaks-statistics*
*Completed: 2026-07-19*

## Self-Check: PASSED

- All key files exist (stats.ts, stats.test.ts, dates.ts, SUMMARY.md)
- All task commits verified (f06d272, c7a8055)
