---
phase: 03-dashboard-progress-visualization
plan: 01
subsystem: domain
tags: [heatmap, react-activity-calendar, date-fns, vitest, tdd]

requires:
  - phase: 02-streaks-statistics
    provides: getWeekDayState, iterateDaysInRange, schedule-aware cell states
provides:
  - HEATMAP_WEEKS constant and 52-week date range builder
  - buildHeatmapActivities with Activity[] and cellStates Map
  - formatHeatmapTooltip with Spanish STATUS_LABELS (D-15)
  - react-activity-calendar@3.2.1 installed for Plan 04
affects:
  - 03-04-heatmap-history

tech-stack:
  added: [react-activity-calendar@3.2.1]
  patterns:
    - Pure domain heatmap builder delegating schedule logic to getWeekDayState
    - Binary Activity mapping: completed level 4 / count 1, all others level 0
    - Noon-local T12:00:00 parse for heatmap range boundaries

key-files:
  created:
    - src/domain/heatmap.ts
    - src/domain/heatmap.test.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Completed cells use level 4 (not level 1) per UI-SPEC GitHub green scale"
  - "Human-approved react-activity-calendar@3.2.1 install after package legitimacy checkpoint"
  - "buildHeatmapActivities reuses getWeekDayState — no duplicate schedule predicates"

patterns-established:
  - "Domain heatmap: iterateDaysInRange + getWeekDayState → Activity[] + cellStates Map"
  - "Spanish tooltips via date-fns format with es locale and STATUS_LABELS record"

requirements-completed: [VIZ-01]

coverage:
  - id: D1
    description: "52-week heatmap date range spans HEATMAP_WEEKS from today backward using noon-local parse"
    requirement: VIZ-01
    verification:
      - kind: unit
        ref: "src/domain/heatmap.test.ts#getHeatmapDateRange returns end equal to today"
        status: pass
    human_judgment: false
  - id: D2
    description: "Completed scheduled days map to Activity level 4; missed/not-scheduled/future map to level 0"
    requirement: VIZ-01
    verification:
      - kind: unit
        ref: "src/domain/heatmap.test.ts#maps a completed daily habit day to level 4"
        status: pass
    human_judgment: false
  - id: D3
    description: "formatHeatmapTooltip returns Spanish status labels per D-15"
    requirement: VIZ-01
    verification:
      - kind: unit
        ref: "src/domain/heatmap.test.ts#includes Completado for completed state"
        status: pass
    human_judgment: false
  - id: D4
    description: "buildHeatmapActivities reuses getWeekDayState for MWF not-scheduled cells"
    requirement: VIZ-01
    verification:
      - kind: unit
        ref: "src/domain/heatmap.test.ts#marks Tuesday as not-scheduled for an MWF habit"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-07-19
status: complete
---

# Phase 03 Plan 01: Heatmap Domain Foundation Summary

**Schedule-aware 52-week heatmap domain module with Spanish tooltips and react-activity-calendar@3.2.1 installed for ContributionHeatmap**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-19T21:08:00Z
- **Completed:** 2026-07-19T21:14:00Z
- **Tasks:** 3 (1 checkpoint + 2 TDD)
- **Files modified:** 4

## Accomplishments
- `domain/heatmap.ts` builds 52-week `Activity[]` with `cellStates` Map for renderBlock guards in Plan 04
- `getHeatmapDateRange` uses `subWeeks` with noon-local parse — no UTC slice
- `formatHeatmapTooltip` outputs Spanish labels (Completado, Perdido, No programado, Futuro)
- `react-activity-calendar@3.2.1` installed after human package legitimacy approval

## Task Commits

Each task was committed atomically:

1. **Checkpoint: Verify react-activity-calendar package legitimacy** - approved (no commit)
2. **Task 2: RED — failing heatmap domain tests** - `33a0294` (test)
3. **Task 3: GREEN — heatmap.ts and package install** - `36e1d55` (feat)

**Plan metadata:** pending (docs commit)

## Files Created/Modified
- `src/domain/heatmap.ts` - 52-week range, Activity builder, Spanish tooltip formatter
- `src/domain/heatmap.test.ts` - 7 unit tests covering D-13 through D-15 domain predicates
- `package.json` / `package-lock.json` - react-activity-calendar@3.2.1 dependency

## Decisions Made
- Completed cells use `level: 4` per UI-SPEC (PATTERNS.md draft used level 1; plan/UI-SPEC authoritative)
- Human checkpoint approved react-activity-calendar@3.2.1 before npm install (T-3-SC mitigation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Tuesday fixture date in MWF not-scheduled test**
- **Found during:** Task 3 (GREEN implementation)
- **Issue:** Test used `2026-07-15` which is Wednesday (day 3), not Tuesday — MWF habit correctly returned `missed`
- **Fix:** Changed fixture to `2026-07-14` (Tuesday, day 2)
- **Files modified:** `src/domain/heatmap.test.ts`
- **Verification:** `npm test -- src/domain/heatmap.test.ts` passes (7/7)
- **Committed in:** `36e1d55` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test fixture correction only; no implementation changes required.

## Issues Encountered
- Vitest 4.x does not accept `-x` flag from plan verify command — ran `npm test -- src/domain/heatmap.test.ts` without flag

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Domain foundation ready for Plan 04 `ContributionHeatmap` component and `useHeatmapData` hook
- `cellStates` Map available for renderBlock interaction guards (D-14, D-16)
- Plan 03 (DashboardPage) can proceed independently in parallel

---
*Phase: 03-dashboard-progress-visualization*
*Completed: 2026-07-19*

## Self-Check: PASSED
- FOUND: src/domain/heatmap.ts
- FOUND: src/domain/heatmap.test.ts
- FOUND: 33a0294
- FOUND: 36e1d55
