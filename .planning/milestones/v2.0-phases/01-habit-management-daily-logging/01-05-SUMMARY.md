---
phase: 01-habit-management-daily-logging
plan: 05
subsystem: ui
tags: [react, dexie, vitest, indexeddb, error-handling]

requires:
  - phase: 01-04
    provides: TodayPage, useTodayHabits hook, AppShell layout patterns
provides:
  - TodayHabitsState discriminated union (loading | error | ready)
  - TodayPage centered error copy on IndexedDB failure
  - TodayPage.test.tsx automated error-state coverage
affects:
  - phase-02-streaks

tech-stack:
  added: []
  patterns:
    - "useTodayHabits catches Dexie failures via try/catch sentinel instead of rethrow"
    - "TodayPage branches error before ready to avoid blank screen on storage failure"

key-files:
  created:
    - src/pages/TodayPage.test.tsx
  modified:
    - src/hooks/useTodayHabits.ts
    - src/hooks/useTodayHabits.test.ts
    - src/pages/TodayPage.tsx

key-decisions:
  - "Error sentinel Symbol in useLiveQuery callback avoids dexie-react-hooks stuck undefined"
  - "Fixed UI-SPEC copy only — no raw Dexie exception text (T-01-11 mitigation)"

patterns-established:
  - "Hook consumers check status discriminant before accessing habits array"

requirements-completed: [UI-01, DATA-01]

coverage:
  - id: D1
    description: "Today view shows centered error copy when IndexedDB is unavailable"
    requirement: UI-01
    verification:
      - kind: unit
        ref: src/hooks/useTodayHabits.test.ts#returns error status when IndexedDB query fails
        status: pass
      - kind: unit
        ref: src/pages/TodayPage.test.tsx#shows centered error copy when storage is unavailable
        status: pass
    human_judgment: false
  - id: D2
    description: "Error state hides FAB and habit list; loading/empty/populated paths unchanged"
    requirement: DATA-01
    verification:
      - kind: unit
        ref: src/pages/TodayPage.test.tsx#does not render Add habit FAB in error state
        status: pass
      - kind: unit
        ref: src/pages/TodayPage.test.tsx#renders empty state when ready with no habits
        status: pass
      - kind: unit
        ref: src/hooks/useTodayHabits.test.ts#returns loading status while query is pending
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-19
status: complete
---

# Phase 01 Plan 05: IndexedDB Error UI Summary

**useTodayHabits exposes loading/error/ready states; TodayPage renders centered UI-SPEC copy when Dexie queries fail**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-19T18:24:00Z
- **Completed:** 2026-07-19T18:27:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Refactored `useTodayHabits` to return `TodayHabitsState` discriminated union with Dexie try/catch error sentinel
- TodayPage error branch renders exact copy: "Couldn't save your data. Try refreshing the page."
- Added `TodayPage.test.tsx` proving error copy, FAB absence, and empty-state regression

## Task Commits

Each task was committed atomically:

1. **Task 1: Surface IndexedDB failures from useTodayHabits** - `3e7cbe3` (test), `ed51099` (feat)
2. **Task 2: TodayPage error UI and component test** - `98f3f85` (test), `cc5ce5e` (feat)

## Files Created/Modified
- `src/hooks/useTodayHabits.ts` - Exports `TodayHabitsState`, maps query sentinel to error status
- `src/hooks/useTodayHabits.test.ts` - Loading, ready, and error path coverage
- `src/pages/TodayPage.tsx` - Error branch with centered UI-SPEC copy
- `src/pages/TodayPage.test.tsx` - Component tests for error and empty states

## Decisions Made
- Used `Symbol('QUERY_ERROR')` sentinel inside `useLiveQuery` callback to distinguish failures from loading
- Error UI uses fixed copy per UI-SPEC — no toast, no raw exception messages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced jest-dom matchers with Vitest-native assertions**
- **Found during:** Task 2 (TodayPage.test.tsx GREEN)
- **Issue:** `toBeInTheDocument` not available — project setup lacks `@testing-library/jest-dom`
- **Fix:** Used `toBeTruthy()` / `toBeNull()` consistent with existing test files
- **Files modified:** `src/pages/TodayPage.test.tsx`
- **Committed in:** `cc5ce5e`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Matcher change only; test intent unchanged.

## Issues Encountered
None

## Next Phase Readiness
- VERIFICATION.md gap closed for IndexedDB failure on Today view
- Phase 01 complete — ready for Phase 2 streak engine

---
*Phase: 01-habit-management-daily-logging*
*Completed: 2026-07-19*

## Self-Check: PASSED

- SUMMARY.md: FOUND
- TodayPage.test.tsx: FOUND
- Commits 3e7cbe3, ed51099, 98f3f85, cc5ce5e: FOUND
