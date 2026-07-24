# Phase 7: Flexible Weekly Frequency - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** yolo / non-interactive cloud agent — recommended defaults locked (same pattern as Phases 5–6)

<domain>
## Phase Boundary

Users can define habits as "X times per week" and see correct due-today, streak, and completion-rate behavior. This phase delivers (1) a new frequency shape alongside existing daily / specific-weekday schedules, (2) Today due rules based on remaining weekly quota, (3) streak and rate math that respect weekly quotas rather than weekday lists, and (4) export/import round-trip of the new shape without data loss. Habit colors, overall Panel rate UI, and streak freeze remain in other phases (reuse Phase 6 pooled-rate plumbing; freeze is Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Frequency Data Model (ENH-04)
- **D-01:** Add a third `Frequency` variant: `{ type: 'times_per_week'; times: number }` with **`times` ∈ 1..7** (integer). Do **not** overload `{ type: 'weekly'; days }` for quotas
- **D-02:** Keep existing `{ type: 'daily' }` and `{ type: 'weekly'; days: number[] }` unchanged in semantics and storage. **`times: 7` is not equivalent to daily** — daily remains the explicit all-days schedule; users who want "any 7 days" still use daily / all weekday toggles
- **D-03:** Schedule modes are **mutually exclusive** in create/edit: specific weekdays **or** times-per-week (not both). Switching mode clears the other shape

### Week Boundary & Due-Today Quota
- **D-04:** Week boundary is **Monday–Sunday**, matching Phase 2 D-09 and `src/domain/dates.ts` (`weekStartsOn: 1`)
- **D-05:** A `times_per_week` habit is **due today** when completions in the **current Mon–Sun week** are **&lt; `times`**. Any calendar day in the week may receive a completion that counts toward the quota
- **D-06:** Once the weekly quota is met, the habit is **not due** — **hide it from Today** (Phase 1 D-02: only actionable habits). User may still add/remove completions for days in that week via History/heatmap
- **D-07:** **Over-completion allowed** (more than `times` check-ins in a week via History); Today stays hidden once `completionsThisWeek >= times`. Rate math **caps** credit at `times` per week (see D-14)
- **D-08:** Pure `isDueOnDate(frequency, date)` is insufficient for quotas — introduce a schedule helper that can consider **completions + week context** (name/signature at planner discretion). Weekday `daily` / `weekly` paths keep current boolean due checks

### Streak Rules (Weekly Quota Unit)
- **D-09:** For `times_per_week`, the streak unit is a **week**, not a calendar day: a week is a **hit** when `completionsInWeek >= times`
- **D-10:** A **fully past** Mon–Sun week with `completionsInWeek < times` **breaks** the current streak
- **D-11:** The **current (in-progress) week** does **not** break the streak while quota is still unmet — same spirit as Phase 2 D-15 (today incomplete does not zero the displayed streak)
- **D-12:** If the current week already meets quota, it **counts** toward the current streak
- **D-13:** New `times_per_week` habit shows streak **0** until at least one week is a hit (Phase 2 D-13 spirit). Longest streak = max consecutive hit weeks across history. Daily / specific-weekday streak rules stay as Phase 2 D-13–D-16

### Completion Rate & Dashboard Aggregate
- **D-14:** Lifetime rate for `times_per_week`: for each Mon–Sun week overlapping habit life through today, **`scheduled += times`** and **`completed += min(completionsInWeek, times)`**. Include the current week; exclude future weeks. First week starts from the week containing `createdAt` (still full `times` target for that week — no mid-week proration)
- **D-15:** Reuse / extend `countScheduledCompletions` (and thus per-habit rate + Phase 6 pooled overall rate) so X/week habits feed the same plumbing — **no denormalized rate fields**
- **D-16:** `getWeekDayState` / heatmap: for `times_per_week`, days **with** completion → completed; days **without** completion → **dim / not-scheduled** (not red "missed"). Quota failure is communicated via streak + rate, not by painting every empty day red (any day can satisfy the quota)

### HabitForm & List Chrome
- **D-17:** HabitForm gains an explicit schedule-mode choice: **specific days** (existing day toggles) vs **times per week** (control for 1–7). Default for new habits remains **daily** (all seven days selected in specific-days mode) — Phase 1 D-07
- **D-18:** On Today / `HabitRow`, keep `WeekDayDots` for `daily` and `weekly`. For `times_per_week`, show a compact **week quota indicator** (e.g. `2/3` = completions this week / `times`) using the habit color accent — not fake weekday dots
- **D-19:** Edit can convert freely among daily, weekly days, and times-per-week; streaks/rates **recompute on read** after save

### Backup Compatibility
- **D-20:** Keep backup payload **`version: 1`**. Extend Zod `frequencySchema` with the new union member (additive, same approach as optional `color` in Phase 5). Old backups without the variant still validate; new exports round-trip `times_per_week` without data loss
- **D-21:** Reject out-of-range `times` (not 1–7) at schema validation / write boundaries

### Claude's Discretion
- Exact Spanish/English copy for mode labels, stepper/segmented control, and quota chip (`2/3` vs "2 de 3")
- Whether the 1–7 control is a numeric stepper, segmented buttons, or select — must meet ≥44px touch targets
- Domain API shape (`isDueOnDate` overload vs `isDueWithQuota(...)` vs schedule strategy object)
- How partial weeks at the start/end of a lifetime range interact with heatmap tooltips
- Whether Manage/edit summary lines mention "3×/semana" when listing habits

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value; v1.1 active ENH-04; streak integrity constraint
- `.planning/REQUIREMENTS.md` — ENH-04 (X times per week); ENH-05 deferred to Phase 8
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, depends on Phase 6 + Phase 1–2 schedule engine
- `.planning/STATE.md` — Milestone position; Phase 7 before Phase 8 freeze

### Research
- `.planning/research/FEATURES.md` — X/week deferred from v1; P2; streak complexity note
- `.planning/research/SUMMARY.md` — 98% of apps support X/week; v1.x priority
- `.planning/research/ARCHITECTURE.md` — Current `daily` \| `weekly`+days model; compute-on-read
- `.planning/research/PITFALLS.md` — Pitfall 2: weekly/custom frequency treated as daily streaks; ISO-week tip

### Prior phase decisions (carry-forward)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — D-02 hide non-due; D-06–D-07 day toggles + default daily; HabitForm page flow
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — D-07 lifetime rate; D-09 Mon–Sun week; D-13–D-16 streak counting rules
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — Versioned Zod backup; transactional import
- `.planning/phases/05-visual-identity-check-in-delight/05-CONTEXT.md` — Habit.color accents on rows (quota chip should use habit color)
- `.planning/phases/06-dashboard-aggregate-uat-residual/06-CONTEXT.md` — Pooled overall rate via schedule-aware counts; must keep working when X/week lands

### Code (integration anchors)
- `src/domain/types.ts` — `Frequency` union to extend
- `src/domain/schedule.ts` — `isDueOnDate` / `isDaily` (weekday-only today)
- `src/domain/streak.ts` — Day-walk streaks for daily/weekly
- `src/domain/stats.ts` — `countScheduledCompletions`, rates, `getWeekDayState`
- `src/domain/dates.ts` — Mon–Sun week helpers (`weekStartsOn: 1`)
- `src/domain/backupSchema.ts` — Zod frequency union
- `src/components/habits/HabitForm.tsx` — Day toggles + `toFrequency`
- `src/components/habits/WeekDayDots.tsx` / `HabitRow.tsx` — Schedule chrome on Today
- `src/hooks/useTodayHabits.ts` — Due-today filter consumer

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/types.ts` — Discriminated `Frequency` union (`daily` | `weekly`+days)
- `src/domain/schedule.ts` — Weekday due checks; needs quota-aware path for X/week
- `src/domain/dates.ts` — Local `YYYY-MM-DD` + Mon–Sun week bounds already match D-04
- `src/domain/streak.ts` / `stats.ts` — Pure compute-on-read; natural extension points
- `src/domain/backupSchema.ts` — Zod union ready for an additive variant
- `src/components/habits/HabitForm.tsx` — Create/edit frequency UI
- `src/components/habits/WeekDayDots.tsx` — Keep for weekday schedules; replace visually for X/week
- `src/hooks/useTodayHabits.ts` — Filter due habits for Today list

### Established Patterns
- Completions keyed by local date string; no persisted streak/rate columns
- Domain pure functions + Vitest; hooks compose via `useLiveQuery`
- Backup v1 extended additively (optional fields / union members) rather than hard bumps when backward compatible
- Spanish UI on Hoy/Panel; HabitForm frequency chrome still largely English — new copy at Claude's discretion for consistency

### Integration Points
- Every `Frequency` switch/exhaustive check in domain + form + backup
- Today due filter must pass completions (or precomputed quota) for X/week
- Streak/stats/dashboard/heatmap all call schedule-aware helpers — update once in domain, reuse everywhere
- Phase 8 freeze will further wrap streak math — keep X/week streak rules localized in domain for that follow-on

</code_context>

<specifics>
## Specific Ideas

- Quota chip `2/3` on Today rows — glanceable remaining work without faking weekday dots
- Week-level streak matches "3× per week" mental model better than pretending three ghost weekdays
- Additive backup union — no forced re-export for existing users
- Hide from Today when weekly goal is done — reinforces "only actionable" Today (Phase 1)

</specifics>

<deferred>
## Deferred Ideas

- Streak freeze / explicit skip days (ENH-05) — **Phase 8** (must come after this frequency model)
- Interval schedules ("every N days") — not in v1.1 roadmap
- Numeric/partial completions inside a day — out of scope (PROJECT.md)
- Reminding users mid-week that quota is unmet — reminders are v2.0 (REM-01/02)

</deferred>

---

*Phase: 7-Flexible Weekly Frequency*
*Context gathered: 2026-07-24*
