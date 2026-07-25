# Phase 2: Streaks & Statistics - Context

**Gathered:** 2026-07-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see streak motivation and completion stats that respect each habit's schedule. This phase delivers compute-on-read streak calculation (current and longest), per-habit completion rate, and a calendar-week overview showing completed vs missed scheduled days. Stats update immediately when the user toggles a completion for today or a past day. Dashboard, GitHub heatmap, export/import, streak freeze, and streak animations belong in later phases.

</domain>

<decisions>
## Implementation Decisions

### Streak Display on Today View
- **D-01:** Current streak appears inline next to the habit name on Today rows (e.g., flame icon + number beside name)
- **D-02:** Streak uses lucide-react `Flame` icon plus numeric count — classic streak affordance; animated flame deferred to v2 (ENH-02)
- **D-03:** Today shows current streak inline; history page shows fuller stats (current, longest, completion rate) — both views are prominent, not history-only
- **D-04:** Streak badge remains visible when row is completed (strikethrough state) — not muted or hidden after check-in

### Stats Header on History Page
- **D-05:** Three equal stat cards in a row below habit name: Current | Longest | Rate
- **D-06:** Each card uses label-above-value layout — "Current" / "Longest" / "Rate" in 12px muted text, values in 20px semibold
- **D-07:** Completion rate covers all scheduled days since habit creation — completed scheduled days ÷ total scheduled days (lifetime metric)
- **D-08:** Completion rate formatted as whole-number percent rounded (e.g., "85%")

### Weekly Overview
- **D-09:** Weekly overview uses calendar week Mon–Sun (not rolling last 7 days)
- **D-10:** Extend existing `HistoryDotGrid` dot pattern with three states: completed (green fill), missed scheduled (red outline empty dot), not scheduled (hidden or dim — planner discretion)
- **D-11:** Missed scheduled days use red/destructive outline on empty circle — explicit but not an X mark
- **D-12:** Same calendar-week grid serves dual purpose — shows completed/missed overview AND remains tappable to toggle past/today completions; replaces the Phase 1 rolling 7-day grid

### Streak Counting Rules
- **D-13:** New habit shows streak 0 until the first scheduled day is completed — no streak before first completion
- **D-14:** Missing any scheduled day breaks the current streak — walk backward counting only scheduled days; non-scheduled gaps on weekly habits do not count
- **D-15:** Current streak counts from today if due and complete, else from yesterday — if today is scheduled but not yet done, display yesterday's consecutive run (today incomplete does not zero the displayed streak)
- **D-16:** Longest streak is the all-time maximum consecutive scheduled-day run across full completion history

### Claude's Discretion
- Stat cards responsive layout — horizontal row on desktop, stack or scroll on narrow mobile
- Non-scheduled days in calendar week grid — hidden vs dimmed (either acceptable; prefer hidden to reduce noise)
- Exact placement/spacing of inline flame+number relative to habit name and `WeekDayDots`
- Whether to show subtle "personal best" indicator when current streak equals longest
- Repository vs hook query pattern for fetching full completion history (centralize `getByHabitInRange` per Phase 1 review note)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints (local-first, dark mode, no auth), key decisions
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: STRK-01–04
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, MVP mode, depends on Phase 1

### Phase 1 Context (carry-forward decisions)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — Today layout, history page route, week day dots, compute-on-read architecture
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — Dark mode tokens, typography scale, touch targets, accent color usage

### Research (stack & architecture)
- `.planning/research/STACK.md` — Vite 8 + React 19 + Dexie 4 + date-fns + lucide-react
- `.planning/research/ARCHITECTURE.md` — Layered SPA, compute-on-read streaks, planned `domain/streak.ts` and `domain/stats.ts`
- `.planning/research/PITFALLS.md` — Timezone/DST pitfalls with local `YYYY-MM-DD` date keys
- `.planning/research/SUMMARY.md` — Build order: streaks before dashboard/heatmap

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/types.ts` — `Habit`, `Completion`, `Frequency` types for streak inputs
- `src/domain/schedule.ts` — `isDueOnDate()` for schedule-aware streak walks
- `src/domain/dates.ts` — `getLocalDateString()`, `isFutureDate()` for date boundaries
- `src/infrastructure/completionRepository.ts` — `getByHabitInRange()` for bulk completion fetch
- `src/components/habits/HabitRow.tsx` — Today row; add inline flame+number streak badge
- `src/components/habits/HistoryDotGrid.tsx` — 7-day dot grid to extend into calendar-week overview
- `src/components/habits/WeekDayDots.tsx` — Schedule dot pattern reference
- `src/pages/HabitHistoryPage.tsx` — History page; add stat cards header above dot grid
- `src/hooks/useCompletions.ts` — Reactive completion query pattern via `useLiveQuery`

### Established Patterns
- Pure domain functions in `src/domain/` with Vitest unit tests (see `dates.test.ts`, `schedule.test.ts`)
- Compute-on-read via `useLiveQuery` — no persisted streak fields on `Habit` records
- Local `YYYY-MM-DD` date keys with noon-local parse (DST-safe per Phase 1)
- GitHub-dark accent `#3fb950` for completed states; `#f85149` destructive for missed indicators

### Integration Points
- `HabitRow` on Today page (`/`) — inline current streak badge per due habit
- `HabitHistoryPage` (`/habits/:id/history`) — stat cards + calendar-week dot grid
- `useToggleCompletion` — completion writes trigger `useLiveQuery` recalc for immediate stat updates
- New domain modules: `domain/streak.ts`, `domain/stats.ts`; new hooks: `useStreak`, `useHabitStats` (names at planner discretion)

</code_context>

<specifics>
## Specific Ideas

- Flame icon + number inline on Today rows — motivation visible at check-in time
- Three stat cards on history page echo dashboard-style glanceability before Phase 3 ships full dashboard
- Calendar week Mon–Sun aligns with M T W T F S S frequency picker mental model
- Red outline for missed scheduled days — honest feedback without harsh X marks
- Lifetime completion rate (all scheduled days since creation) — honest metric, not a rolling window

</specifics>

<deferred>
## Deferred Ideas

- Streak freeze / skip day without breaking streak (ENH-05) — v2 enhancement
- Flame animation and streak visual rewards on check-in (ENH-02) — v2 enhancement
- Dashboard showing all streaks at a glance (DASH-01) — Phase 3
- GitHub contribution heatmap (VIZ-01) — Phase 3
- Overall completion rate across all habits — ENH-03, not Phase 2

</deferred>

---

*Phase: 2-Streaks & Statistics*
*Context gathered: 2026-07-19*
