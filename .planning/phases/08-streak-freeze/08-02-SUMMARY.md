---
phase: 08-streak-freeze
plan: 02
subsystem: domain
tags: [streak, stats, heatmap, freeze, vitest, tdd]

requires:
  - phase: 08-01
    provides: Freeze persistence, freezeRepository, mutual exclusion with completions
provides:
  - Freeze-aware streak bridge + effectiveTimes for times_per_week
  - Rate exclusion for frozen due days and effectiveTimes scheduled counts
  - WeekDayState 'frozen' with Omitido heatmap tooltip
affects:
  - 08-03 (hooks/UI wiring for frozenDates sets)

tech-stack:
  added: []
  patterns:
    - frozenDates Set<string> threaded through domain calculators (default empty Set)
    - countFreezesInCalendarWeek mirrors completion week counting
    - Bridge-without-increment day-walk for daily/weekly streaks

key-files:
  created: []
  modified:
    - src/domain/dates.ts
    - src/domain/streak.ts
    - src/domain/stats.ts
    - src/domain/heatmap.ts
    - src/domain/streak.test.ts
    - src/domain/stats.test.ts
    - src/domain/heatmap.test.ts

key-decisions:
  - "frozenDates optional param defaults to empty Set to keep hooks compiling until Plan 08-03"
  - "countFreezesInCalendarWeek added to dates.ts for shared streak/stats week math"

patterns-established:
  - "Domain freeze math: bridge (no increment), effectiveTimes = max(0, times - freezesInWeek)"
  - "Frozen due days excluded from rate numerator and denominator"

requirements-completed: [ENH-05]

coverage:
  - id: D1
    description: Frozen due days bridge streaks without incrementing; freeze never starts a streak
    requirement: ENH-05
    verification:
      - kind: unit
        ref: src/domain/streak.test.ts#bridges frozen due day without incrementing
        status: pass
      - kind: unit
        ref: src/domain/streak.test.ts#returns 0 when only freezes exist on a new habit
        status: pass
    human_judgment: false
  - id: D2
    description: times_per_week uses effectiveTimes for week hits and rate scheduled counts
    requirement: ENH-05
    verification:
      - kind: unit
        ref: src/domain/streak.test.ts#counts times_per_week week as hit with 1 freeze + 2 completions
        status: pass
      - kind: unit
        ref: src/domain/stats.test.ts#uses effectiveTimes for times_per_week with freezes
        status: pass
    human_judgment: false
  - id: D3
    description: Frozen due days excluded from daily/weekly rate numerator and denominator
    requirement: ENH-05
    verification:
      - kind: unit
        ref: src/domain/stats.test.ts#excludes frozen due days from scheduled and completed
        status: pass
    human_judgment: false
  - id: D4
    description: WeekDayState frozen and heatmap Omitido tooltip
    requirement: ENH-05
    verification:
      - kind: unit
        ref: src/domain/stats.test.ts#returns frozen for a frozen date
        status: pass
      - kind: unit
        ref: src/domain/heatmap.test.ts#includes Omitido for frozen state
        status: pass
      - kind: unit
        ref: src/domain/heatmap.test.ts#marks frozen due days with frozen cell state
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-25
status: complete
---

# Phase 8 Plan 2: Freeze Domain Math Summary

**Freeze-aware streak bridge, effectiveTimes X/week rates, and heatmap 'frozen' / Omitido state in pure domain layer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-25T15:41:00Z
- **Completed:** 2026-07-25T15:44:46Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `calculateCurrentStreak` / `calculateLongestStreak` accept `frozenDates` — bridge without increment, D-13 grace when today frozen
- `isWeekHit` uses `effectiveTimes = max(0, times - freezeCountInWeek)` for times_per_week
- `countScheduledCompletions` excludes frozen due days; X/week uses effectiveTimes for scheduled/completed caps
- `WeekDayState` extended with `'frozen'`; heatmap tooltip label `Omitido`
- `countFreezesInCalendarWeek` in dates.ts shared by streak and stats

## Task Commits

1. **Task 1: RED — freeze streak + rate + heatmap tests** - `9e41e1b` (test)
2. **Task 2: GREEN — freeze-aware streak, stats, heatmap** - `ebbb9e4` (feat)

## Files Created/Modified

- `src/domain/dates.ts` - `countFreezesInCalendarWeek` helper
- `src/domain/streak.ts` - bridge day-walk, effectiveTimes week hits, frozenDates param
- `src/domain/stats.ts` - rate exclusion, effectiveTimes, `'frozen'` WeekDayState
- `src/domain/heatmap.ts` - frozenDates param, Omitido tooltip label
- `src/domain/*.test.ts` - RED/GREEN freeze contract tests (51 domain tests pass)

## Decisions Made

- `frozenDates` defaults to `new Set()` on domain APIs so existing hooks compile until Plan 08-03 wires freeze queries
- Reused Mon–Sun week counting pattern from `countCompletionsInCalendarWeek` for freeze counts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Domain freeze math ready for Plan 08-03 hook/UI wiring (`useStreak`, `useHabitStats`, `useHeatmapData`, HabitRow Omitir, heatmap cycle)
- Hooks must pass `frozenDates` from `freezeRepository.getByHabitInRange` at call sites

---
*Phase: 08-streak-freeze*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: src/domain/streak.ts (frozenDates)
- FOUND: src/domain/stats.ts ('frozen' WeekDayState)
- FOUND: src/domain/heatmap.ts (Omitido)
- FOUND: 9e41e1b
- FOUND: ebbb9e4
