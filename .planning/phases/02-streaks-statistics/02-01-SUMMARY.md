---
phase: 02-streaks-statistics
plan: 01
subsystem: domain
tags: [vitest, date-fns, streak, schedule-aware, tdd]

requires:
  - phase: 01-habit-management-daily-logging
    provides: schedule.ts isDueOnDate, dates.ts getLocalDateString, Frequency/Habit types
provides:
  - calculateCurrentStreak schedule-aware backward walk (D-13–D-15)
  - calculateLongestStreak all-time max forward scan (D-16)
  - getPreviousDay, iterateDaysInRange, getHabitStartDate date helpers
affects: [02-02, 02-03, 02-04, useStreak, useHabitStats]

tech-stack:
  added: []
  patterns:
    - "Pure domain streak functions over Set<string> — no Dexie/React in domain layer"
    - "Noon-local T12:00:00 parse for day arithmetic (DST-safe)"
    - "TDD RED/GREEN gate: test commit before implementation commit"

key-files:
  created:
    - src/domain/streak.ts
    - src/domain/streak.test.ts
  modified:
    - src/domain/dates.ts
    - src/domain/dates.test.ts

key-decisions:
  - "D-15: skip today when due but incomplete — start backward walk from yesterday"
  - "getHabitStartDate uses getLocalDateString(new Date(createdAt)) — never UTC slice"

patterns-established:
  - "Every streak step gated by isDueOnDate — weekly rest days never break or increment"
  - "iterateDaysInRange uses addDays/subDays with noon-local parse — no millisecond arithmetic"

requirements-completed: [STRK-01, STRK-02]

coverage:
  - id: D1
    description: "calculateCurrentStreak encodes schedule-aware current streak (D-13–D-15)"
    requirement: STRK-01
    verification:
      - kind: unit
        ref: "src/domain/streak.test.ts#calculateCurrentStreak"
        status: pass
    human_judgment: false
  - id: D2
    description: "calculateLongestStreak returns all-time max consecutive scheduled-day run (D-16)"
    requirement: STRK-02
    verification:
      - kind: unit
        ref: "src/domain/streak.test.ts#calculateLongestStreak"
        status: pass
    human_judgment: false
  - id: D3
    description: "Date iteration helpers (getPreviousDay, iterateDaysInRange, getHabitStartDate)"
    verification:
      - kind: unit
        ref: "src/domain/dates.test.ts#getPreviousDay"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-07-19
status: complete
---

# Phase 02 Plan 01: TDD Schedule-Aware Streak Domain Summary

**Schedule-aware current and longest streak pure functions with DST-safe date iteration helpers — foundation for Today badge and history stat cards**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-19T20:07:00Z
- **Completed:** 2026-07-19T20:12:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `calculateCurrentStreak` backward walk respecting weekly rest days and D-15 today-incomplete skip
- `calculateLongestStreak` forward scan tracking all-time maximum consecutive scheduled completions
- `getPreviousDay`, `iterateDaysInRange`, and `getHabitStartDate` helpers ready for stats module and hooks
- 16 unit tests green across streak and dates modules

## Task Commits

Each task was committed atomically:

1. **Task 1: RED — failing streak and date-iteration tests** - `6b2832e` (test)
2. **Task 2: GREEN — streak.ts and date iteration helpers** - `c439828` (feat)

## Files Created/Modified
- `src/domain/streak.ts` - calculateCurrentStreak and calculateLongestStreak pure functions
- `src/domain/streak.test.ts` - D-13 through D-16 edge case coverage
- `src/domain/dates.ts` - getPreviousDay, iterateDaysInRange, getHabitStartDate exports
- `src/domain/dates.test.ts` - month boundary and inclusive range tests

## Decisions Made
- D-15 implemented by starting backward walk from yesterday when today is scheduled but incomplete
- getHabitStartDate converts habit.createdAt via getLocalDateString — avoids UTC slice pitfall

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Streak domain ready for `domain/stats.ts` (Plan 02-02) and reactive hooks (Plan 02-03)
- Date helpers available for calendar-week and completion-rate calculations

---
*Phase: 02-streaks-statistics*
*Completed: 2026-07-19*

## Self-Check: PASSED

- All key files exist (streak.ts, streak.test.ts, SUMMARY.md)
- All task commits verified (6b2832e, c439828)
