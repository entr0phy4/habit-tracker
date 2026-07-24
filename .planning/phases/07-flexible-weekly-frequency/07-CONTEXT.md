# Phase 7: Flexible Weekly Frequency - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** auto (yolo / non-interactive cloud agent — recommended defaults locked)

<domain>
## Phase Boundary

Users can define habits as "X times per week" (quota of completions in a calendar week, any days) and see correct Today due behavior, streak, completion rate, heatmap semantics, and backup round-trip. This phase extends the existing `daily` / specific-weekday `weekly` model with a new frequency shape and schedule-aware domain rules. Habit colors, overall Panel rate plumbing, and streak freeze remain in other v1.1 phases (freeze builds on this frequency model in Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Frequency Data Model (ENH-04)
- **D-01:** Add a third `Frequency` variant: `{ type: 'times_per_week'; count: number }` with `count` an integer **1–7** — do **not** overload `{ type: 'weekly'; days: number[] }` (that remains specific weekdays only)
- **D-02:** Keep existing variants unchanged: `daily` and `weekly` (specific days, JS `0=Sun…6=Sat`). `times_per_week` is mutually exclusive in the form UI
- **D-03:** Week boundary for quota math is **calendar week Mon–Sun** — same `weekStartsOn: 1` convention as Phase 2 D-09 / `getCalendarWeekDates`
- **D-04:** Domain helpers that today take only `(frequency, date)` must gain completion-aware APIs where needed (e.g. due-today for flexible habits). Prefer extending `schedule.ts` / streak / stats with pure functions rather than persisting derived due flags

### Due-Today / Weekly Quota Rules
- **D-05:** An X/week habit is **due today** when completions in the current Mon–Sun week are **strictly less than** `count` (remaining quota > 0). Any weekday can satisfy the quota
- **D-06:** Once `completionsThisWeek >= count`, the habit is **not due** — hide from Today list (preserves Phase 1 D-02: only actionable habits appear). Unchecking a completion that drops below `count` makes it due again
- **D-07:** Extra completions beyond `count` in the same week are **allowed** on History/heatmap toggles (no hard block), but they do **not** increase rate numerator past `count` for that week (see D-12) and do **not** keep the habit on Today once quota is met
- **D-08:** Do **not** require "remaining calendar days ≥ remaining quota" to show as due — user may still check in; week failure is handled by streak rules (D-10), not by hiding the habit early

### Streak Semantics for X/Week
- **D-09:** Streak unit for `times_per_week` is **consecutive successful ISO weeks**, not consecutive calendar days. A week is successful when `min(completionsInWeek, count) >= count` (i.e. at least `count` distinct completed dates in that week)
- **D-10:** Current-streak mid-week rule (analog of Phase 2 D-15): if the **current** week is not yet a confirmed failure — still possible to reach `count` given remaining days **including today**, or already successful — do **not** zero the streak; count backward from the latest fully successful week. If the current week is already impossible (`remainingDaysIncludingToday < remainingNeeded`) or a past week ended under quota, the streak breaks at that week
- **D-11:** Longest streak = maximum run of consecutive successful weeks across habit history since creation. New habit shows **0** until its first successful week completes (or current week already meets `count`)

### Completion Rate & Heatmap Semantics
- **D-12:** Per-habit lifetime rate for `times_per_week`: for each Mon–Sun week that overlaps the habit's life from creation through the current week, add `count` to the scheduled denominator; add `min(completionsInWeek, count)` to the completed numerator; `Math.round` to whole percent. Exclude future weeks. This feeds both `calculateCompletionRate` and the Phase 6 pooled overall rate via the same counting primitive
- **D-13:** Heatmap / week-dot **day-level "missed"** does **not** apply to flexible habits: non-completed days render as **`not-scheduled`** (empty/neutral), completed days as **`completed`**. Week under-quota is reflected in streak/rate, not by painting arbitrary days red
- **D-14:** Specific-weekday `weekly` and `daily` keep existing day-level due / missed / streak-day walk behavior — no regressions

### HabitForm & Today/History UI
- **D-15:** Habit create/edit exposes three frequency modes: **Daily** (all days / `daily`), **Specific days** (day toggle → `weekly`), **X times per week** (count control → `times_per_week`). Default for new habits remains Daily (Phase 1 D-07)
- **D-16:** Count control is an integer stepper or equivalent for **1–7**; recommended default when switching into X/week mode: **3**
- **D-17:** Today / row chrome for X/week habits replaces weekday-dot schedule affordance with a **weekly progress** cue (e.g. `2/3` or "2 de 3 esta semana") — exact copy/layout at Claude's discretion; must stay glanceable and ≥44px touch-friendly
- **D-18:** Spanish UI copy for mode labels and progress (match Hoy/Panel/Ajustes tone); English ok only if existing form labels are still English — prefer consistency with surrounding Spanish surfaces where already localized

### Backup Compatibility
- **D-19:** Keep backup **`version: 1`**. Extend Zod `frequencySchema` with an additive union member for `times_per_week` + `count` (1–7). Old exports without the new variant continue to validate
- **D-20:** Export/import must round-trip `times_per_week` without data loss; invalid count or unknown frequency shape → existing invalid backup path (no raw Zod text in UI — Phase 4 D-14)

### Claude's Discretion
- Exact TypeScript helper names (`isDueOnDate` overload vs `isHabitDueOnDate(habit, date, completions)`)
- Whether week progress lives on `HabitRow`, `WeekDayDots` variant, or a small sibling component
- Stepper vs select/native input for count in `HabitForm`
- How aggressively to refactor streak/stats into shared "period walker" vs branched functions
- Depth of heatmap tooltip copy for flexible empty cells ("No programado" vs "Libre / sin cuota ese día")
- Whether over-quota completions show any subtle History hint (optional; not required)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value; v1.1 includes X/week frequency; streak integrity constraint
- `.planning/REQUIREMENTS.md` — ENH-04 (X times per week frequency)
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, depends on Phase 6 + Phase 1–2 schedule engine
- `.planning/STATE.md` — Milestone v1.1 position after Phase 6

### Prior phase decisions (schedule / streaks / backup)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — Today hides non-due (D-02); day-toggle frequency UI (D-06/D-07); history toggles
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — Mon–Sun week (D-09); schedule-aware streak walk (D-13–D-16); lifetime rate (D-07/D-08); today-incomplete grace (D-15)
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — Zod validation; no raw error text (D-14); versioned JSON
- `.planning/phases/05-visual-identity-check-in-delight/05-CONTEXT.md` — Backup v1 + additive fields precedent (optional color)
- `.planning/phases/06-dashboard-aggregate-uat-residual/06-CONTEXT.md` — Pooled overall rate composes per-habit scheduled counts (must honor new frequency)

### Research
- `.planning/research/ARCHITECTURE.md` — Frequency shapes; compute-on-read streaks; layered domain
- `.planning/research/PITFALLS.md` — Pitfall 2 (weekly/custom frequency vs daily streak walk)
- `.planning/research/FEATURES.md` — X/week as common schedule type; complexity note
- `.planning/research/SUMMARY.md` — X/week deferred from v1.0; now in v1.1

### Code (must extend)
- `src/domain/types.ts` — `Frequency` union
- `src/domain/schedule.ts` — `isDueOnDate` / `isDaily` (completion-aware due for flexible)
- `src/domain/streak.ts` — current/longest streak (week-unit branch)
- `src/domain/stats.ts` — `countScheduledCompletions` / rate / `getWeekDayState`
- `src/domain/heatmap.ts` — cell state via `getWeekDayState`
- `src/domain/dates.ts` — `getCalendarWeekDates`, Mon-start week helpers (extend if week iteration needed)
- `src/domain/backupSchema.ts` — Zod frequency union
- `src/components/habits/HabitForm.tsx` — frequency UI
- `src/components/habits/WeekDayDots.tsx` / `HabitRow.tsx` — schedule chrome on Today
- `src/hooks/useTodayHabits.ts` — filters with `isDueOnDate` (must use completion-aware due)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/types.ts` — `Frequency` discriminated union; natural place for `times_per_week`
- `src/domain/schedule.ts` — thin due helpers; needs completion context for flexible due
- `src/domain/streak.ts` / `stats.ts` — pure compute-on-read; branch on `frequency.type`
- `src/domain/dates.ts` — Mon–Sun `getCalendarWeekDates`; `iterateDaysInRange` for week scans
- `src/domain/backupSchema.ts` — Zod union pattern ready for additive variant
- `src/components/habits/HabitForm.tsx` — `toFrequency` / day toggles; add mode switch + count
- `src/hooks/useTodayHabits.ts` — live query filters due habits; must pass completions into due check for X/week
- Phase 6 `countScheduledCompletions` — overall Panel rate automatically improves once per-habit counting understands quotas

### Established Patterns
- Local `YYYY-MM-DD` keys; noon-local parsing for DST safety
- Compute-on-read: no persisted streak/rate/due fields
- `weekly.days` uses JS `getDay()` indices
- Backup v1 stays; additive schema changes preferred (Phase 5 color)
- Today list = actionable only; History/heatmap for past toggles
- Spanish user-facing copy on main surfaces

### Integration Points
- `HabitForm` create + edit paths (`HabitNewPage`, `HabitEditPage`)
- `useTodayHabits` due filter + `HabitRow` schedule affordance
- `calculateCurrentStreak` / `calculateLongestStreak` / `countScheduledCompletions` / `getWeekDayState`
- `parseBackupJson` frequency schema + repository persistence (Dexie stores `frequency` as JSON blob — no migration table change expected beyond type acceptance)
- Heatmap tooltips via `formatHeatmapTooltip` / cell states
- Phase 8 freeze will further specialize streak walks — keep X/week week-unit logic centralized and testable

</code_context>

<specifics>
## Specific Ideas

- Distinct `times_per_week` variant keeps specific-weekday habits simple and avoids encoding "any 3 days" as fake `days: []`
- Due = remaining weekly quota — matches "3× gym this week" mental model without forcing Mon/Wed/Fri
- Week-unit streaks + mid-week grace mirror the existing "today not done yet doesn't kill streak" grace for daily habits
- Heatmap stays honest: flexible rest days are not painted as missed
- Additive backup v1 union member — same compatibility strategy as optional `color`

</specifics>

<deferred>
## Deferred Ideas

- Streak freeze / skip day — Phase 8 (ENH-05); must compose with week-quota success rules
- Interval schedules (every N days) — out of v1.1 requirements
- Soft reminders when weekly quota is at risk — v2.0 reminders
- Forcing specific weekdays inside an X/week quota (hybrid) — not in ENH-04
- Changing backup `version` to 2 solely for frequency — rejected in favor of additive v1 union

</deferred>

---

*Phase: 7-Flexible Weekly Frequency*
*Context gathered: 2026-07-24*
