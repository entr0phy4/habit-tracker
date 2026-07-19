---
phase: 01-habit-management-daily-logging
plan: 02
subsystem: ui
tags: [react, shadcn, toggle-group, vitest, dexie]

requires:
  - phase: 01-01
    provides: Walking skeleton with Dexie repositories, Today page, and schedule domain helpers
provides:
  - Shared HabitForm with weekday ToggleGroup and validation
  - WeekDayDots schedule indicator on habit rows
  - Toast + redirect on habit create (D-08)
  - Weekly due-today filtering verified by hook tests (LOG-03)
affects:
  - 01-03-PLAN.md
  - 01-04-PLAN.md

tech-stack:
  added: ["@radix-ui/react-toggle", "@radix-ui/react-toggle-group"]
  patterns:
    - "HabitForm maps all-7-selected to daily frequency, partial selection to weekly days array"
    - "WeekDayDots read-only schedule indicator separate from completion state"

key-files:
  created:
    - src/components/habits/HabitForm.tsx
    - src/components/habits/WeekDayDots.tsx
    - src/components/habits/WeekDayDots.test.tsx
    - src/components/ui/toggle.tsx
    - src/components/ui/toggle-group.tsx
    - src/hooks/useTodayHabits.test.ts
  modified:
    - src/pages/HabitNewPage.tsx
    - src/components/habits/HabitRow.tsx
    - src/infrastructure/habitRepository.test.ts
    - src/domain/schedule.test.ts

key-decisions:
  - "Manual toggle components in src/components/ui because shadcn CLI wrote to literal @/ path"
  - "HabitForm client-side empty-name validation before repository call per T-01-04 mitigation"
  - "useTodayHabits tests use vi.setSystemTime without fake timers to avoid IndexedDB hangs"

patterns-established:
  - "Frequency picker: 7 day toggles default all selected; maps to daily or weekly on submit"
  - "Schedule dots on rows use isDaily helper for filled-state, not completion data"

requirements-completed: [HABT-01, LOG-03]

coverage:
  - id: D1
    description: "User can create habits with weekday frequency via M-S toggle buttons"
    requirement: HABT-01
    verification:
      - kind: unit
        ref: src/infrastructure/habitRepository.test.ts#persists weekly frequency with selected days
        status: pass
    human_judgment: false
  - id: D2
    description: "Empty habit name shows inline validation error on submit"
    requirement: HABT-01
    verification:
      - kind: unit
        ref: src/infrastructure/habitRepository.test.ts#rejects empty habit names
        status: pass
    human_judgment: true
    rationale: "Inline form error copy and UX require visual smoke check in browser"
  - id: D3
    description: "Toast confirmation and redirect to Today after habit create"
    requirement: HABT-01
    verification: []
    human_judgment: true
    rationale: "Sonner toast appearance and navigation flow need browser verification"
  - id: D4
    description: "Habit rows show WeekDayDots schedule indicator beside name"
    requirement: HABT-01
    verification:
      - kind: unit
        ref: src/components/habits/WeekDayDots.test.tsx
        status: pass
    human_judgment: true
    rationale: "Row layout and dot colors need visual confirmation against UI-SPEC"
  - id: D5
    description: "Weekly habits not due today are hidden from Today list"
    requirement: LOG-03
    verification:
      - kind: unit
        ref: src/hooks/useTodayHabits.test.ts#returns an empty list when no habits are due today
        status: pass
      - kind: unit
        ref: src/domain/schedule.test.ts#evaluates each weekday boundary for Mon/Wed/Fri schedule
        status: pass
    human_judgment: false
  - id: D6
    description: "Weekly habits due today appear in Today list"
    requirement: LOG-03
    verification:
      - kind: unit
        ref: src/hooks/useTodayHabits.test.ts#includes weekly habits due on the mocked today date
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-07-19
status: complete
---

# Phase 01 Plan 02: HabitForm & Weekly Filtering Summary

**Shared HabitForm with S-S day toggles, WeekDayDots on rows, toast on create, and hook tests proving weekly due-today filtering**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-19T18:04:00Z
- **Completed:** 2026-07-19T18:12:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- HabitForm with ToggleGroup day picker (default all 7 days), empty-name validation, and daily/weekly frequency mapping
- HabitNewPage composes HabitForm with back link, sonner toast, and redirect to Today (D-08)
- WeekDayDots schedule indicator integrated into HabitRow (D-04)
- Extended schedule and useTodayHabits tests proving non-due weekly habits are excluded (LOG-03, D-02)
- All 27 vitest tests pass

## Task Commits

1. **Task 1: HabitForm with day toggles and validation** - `0827fe2` (feat)
2. **Task 2: WeekDayDots schedule indicator on habit rows** - `4f43983` (feat)
3. **Task 3: Weekly due-today filtering integration tests** - `29d95f2` (test)

## Files Created/Modified

- `src/components/habits/HabitForm.tsx` - Shared create/edit form with day toggles and validation
- `src/components/ui/toggle.tsx` - Radix toggle styled for 44px touch targets
- `src/components/ui/toggle-group.tsx` - Multi-select day picker primitive
- `src/pages/HabitNewPage.tsx` - Composes HabitForm with toast and navigation
- `src/components/habits/WeekDayDots.tsx` - Read-only 7-day schedule indicator
- `src/components/habits/HabitRow.tsx` - Name + WeekDayDots inline layout
- `src/hooks/useTodayHabits.test.ts` - Hook tests for due/non-due/archived filtering

## Decisions Made

- Recreated toggle components manually after shadcn CLI wrote to wrong `@/` directory
- Used `@radix-ui/react-toggle` packages matching existing Radix dependency pattern
- Hook tests use `vi.setSystemTime` only (no `useFakeTimers`) to keep IndexedDB async working

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn CLI wrote toggle files to literal `@/` directory**
- **Found during:** Task 1
- **Issue:** `npx shadcn add toggle toggle-group` created `@/components/ui/` instead of `src/components/ui/`
- **Fix:** Removed stray directory; manually authored toggle components in correct path with project tokens
- **Files modified:** src/components/ui/toggle.tsx, src/components/ui/toggle-group.tsx
- **Committed in:** 0827fe2

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for correct component paths and styling. No scope creep.

## Issues Encountered

None beyond the shadcn path deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HABT-01 weekday frequency and LOG-03 filtering complete
- Plan 03 can add swipe gesture, edit/archive/manage routes, and Today polish
- Plan 04 can add history dot grid for past-day toggling

## Self-Check: PASSED

- FOUND: .planning/phases/01-habit-management-daily-logging/01-02-SUMMARY.md
- FOUND: 0827fe2
- FOUND: 4f43983
- FOUND: 29d95f2

---
*Phase: 01-habit-management-daily-logging*
*Completed: 2026-07-19*
