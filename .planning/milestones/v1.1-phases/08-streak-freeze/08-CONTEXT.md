# Phase 8: Streak Freeze - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** yolo / `--auto` (cloud agent — recommended defaults locked; same pattern as Phases 5–7)

<domain>
## Phase Boundary

Users can mark an explicit skip/freeze on a scheduled day so that day does not break the streak. This phase delivers (1) persisted freeze records distinct from completions, (2) Today + History affordances to freeze/unfreeze today or past days, (3) streak and completion-rate math that treat freeze as excused (not done, not miss), (4) heatmap/history visuals that distinguish freeze from complete and incomplete, and (5) export/import round-trip of freeze records with streaks recomputed on read after restore. Habit colors, overall Panel rate UI, and X/week frequency are already shipped — reuse those surfaces; do not rework schedule modes.

</domain>

<decisions>
## Implementation Decisions

### Freeze Data Model (ENH-05)
- **D-01:** Persist freezes as a **separate entity** parallel to completions: `{ habitId: string; date: string }` (local `YYYY-MM-DD`). Do **not** overload `Completion` with a status/type field — freeze ≠ done (ROADMAP SC2; PROJECT streak-integrity constraint)
- **D-02:** Domain name **`Freeze`** (table/array `freezes`). User-facing copy may say omitir/skip — exact Spanish labels at Claude's discretion
- **D-03:** **Mutual exclusion** with completion on the same `(habitId, date)`: writing a freeze clears any completion for that day; writing a completion clears any freeze for that day. At most one of {complete, freeze} per day
- **D-04:** Freeze only for **today or past** within the habit's life (`date >= habit.createdAt` date and `date <= today`). Future dates rejected (same rule as completions)
- **D-05:** For `daily` / `weekly` frequencies, freeze is only meaningful on **due** days (`isDueOnDate`). For `times_per_week`, any calendar day in an overlapping Mon–Sun week may be frozen (same flexibility as completions toward quota)

### Mark Freeze UX
- **D-06:** **Today (`HabitRow`):** keep **one-tap complete** as the primary action (core value). Add an explicit secondary **Skip/Omitir** control that freezes **today** (does not replace the row tap). Unfreeze today is available from that control or from History
- **D-07:** **History heatmap:** scheduled interactive cells support freeze. Prefer a clear three-state interaction for today/past due (or freeze-eligible) days: **missed/empty → completed → frozen → missed/empty** (cycle), or tap=complete + long-press/secondary=freeze — planner picks one pattern; must meet ≥44px targets and remain obvious on mobile
- **D-08:** Once today is frozen, treat the habit as **not actionable on Today** — **hide from Hoy** (Phase 1 D-02), same spirit as X/week quota met. User recovers via History (or secondary unfreeze if still visible elsewhere)
- **D-09:** Panel `DashboardCard` stays navigation-only (no day editing) — Phase 3/6 card chrome unchanged

### Streak Semantics
- **D-10:** A frozen due day **bridges** the streak: it does **not** break current streak and does **not** increment the streak count. In the day-walk, treat freeze like a **non-scheduled gap** (continue walking; only completions increment)
- **D-11:** Longest streak uses the same bridge rule (frozen days never break a consecutive completion run; they also never add a “fake” completion day)
- **D-12:** Freeze **never starts** a streak — new habit stays **0** until the first real completion (Phase 2 D-13). Freeze-before-first-completion does not create a chain
- **D-13:** Phase 2 **D-15 grace** remains: if today is due, not complete, and **not frozen**, display yesterday’s run. If today is **frozen**, today is neither miss nor due-incomplete — walk treats it as bridge / non-due for grace purposes
- **D-14:** For `times_per_week`, freezes are day-level records that **reduce that week’s effective quota**: `effectiveTimes = max(0, times - freezeCountInWeek)`. Week is a **hit** when `completionsInWeek >= effectiveTimes`. Past week with unmet effective quota still breaks; in-progress current week keeps Phase 7 grace when unmet

### Rate & Overall Rate
- **D-15:** Frozen ≠ done. For `daily` / `weekly`: **exclude** frozen due days from **both** numerator and denominator in `countScheduledCompletions` (excused, not missed, not completed)
- **D-16:** For `times_per_week`: per overlapping week, `scheduled += effectiveTimes` and `completed += min(completionsInWeek, effectiveTimes)` (same cap spirit as Phase 7 D-14, with freeze-reduced target)
- **D-17:** Phase 6 pooled overall rate continues to compose the same schedule-aware counts — no denormalized rate fields; freezes flow through domain helpers automatically

### Heatmap & History Distinction
- **D-18:** Extend `WeekDayState` with **`'frozen'`** (fourth user-visible status alongside completed / missed / not-scheduled / future)
- **D-19:** Heatmap/tooltips must distinguish freeze from complete and missed (ROADMAP SC3). Visual: not solid completion green and not missed red — e.g. ice/muted accent, dashed, or slash; exact tokens at Claude's discretion, readable on dark UI and compatible with habit color accents
- **D-20:** Spanish tooltip label for freeze (e.g. "Omitido" / "Congelado") — Claude's discretion; must not reuse "Completado" or "Perdido"
- **D-21:** X/week empty days remain **not** red-missed (Phase 7 D-16). Frozen X/week days show `'frozen'`; unfrozen empty days stay dim `not-scheduled`

### Backup & Dexie Schema
- **D-22:** Dexie schema **version bump** (v1 → v2) adding a `freezes` store keyed like completions: `[habitId+date], habitId, date`. Migrations must leave existing habits/completions intact
- **D-23:** Keep backup payload **`version: 1`**. Add optional **`freezes`** array (default `[]` when missing) validated with Zod like completions — additive, same approach as optional `color` / `times_per_week`. Old backups without `freezes` still import; new exports round-trip freezes without data loss
- **D-24:** Import remains transactional replace of habits + completions **+ freezes**; streaks stay compute-on-read after restore (ROADMAP SC4)

### Integrity Limits
- **D-25:** Freezes are **unlimited in count** but **always explicit and visible** on History/heatmap (and countable in export). No silent auto-freeze, no weekend forgiveness, no invisible grace beyond Phase 2 D-15 / Phase 7 in-progress week
- **D-26:** Soft monthly caps / nag copy are **out of scope** for v1.1 — integrity is “explicit + visible + frozen ≠ done,” not quota rationing

### Claude's Discretion
- Exact Spanish/English copy for Skip/Omitir, tooltips, and empty/error strings
- Today secondary control chrome (icon button vs text vs overflow menu) and History cycle vs long-press pattern
- Freeze cell color/token algorithm and reduced-motion behavior
- Repository/hook naming (`freezeRepository`, `useToggleFreeze`, extend toggle hooks, etc.)
- Whether Today shows a brief toast/feedback on skip (no new celebration system beyond existing check-in reward)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value; streak-integrity constraint (freeze explicit & countable); ENH-05 active
- `.planning/REQUIREMENTS.md` — ENH-05 (skip day without breaking streak); out-of-scope note that binary done/undone includes explicit skip
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria SC1–SC4, depends on Phase 7 frequency model
- `.planning/STATE.md` — Milestone position; Phase 7 complete → Phase 8 next

### Research
- `.planning/research/FEATURES.md` — Habitify-style skip praised; over-forgiving risk; v1.x candidate
- `.planning/research/SUMMARY.md` — Freeze/skip as post-validation polish
- `.planning/research/ARCHITECTURE.md` — Compute-on-read streaks; completion keyed by date
- `.planning/research/PITFALLS.md` — Punitive streak psychology; prefer honest breaks + explicit skip over silent dilution

### Prior phase decisions (carry-forward)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — D-02 hide non-due/non-actionable from Today; local date keys; one-tap complete
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — D-07 lifetime rate; D-13–D-16 streak rules (freeze is explicit exception to miss=break)
- `.planning/phases/03-dashboard-progress-visualization/03-CONTEXT.md` — Heatmap on history; Panel cards navigate only
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — Versioned Zod backup; transactional import
- `.planning/phases/05-visual-identity-check-in-delight/05-CONTEXT.md` — Habit.color accents on rows/heatmap
- `.planning/phases/06-dashboard-aggregate-uat-residual/06-CONTEXT.md` — Pooled overall rate via schedule-aware counts
- `.planning/phases/07-flexible-weekly-frequency/07-CONTEXT.md` — Week-unit streaks/rates for X/week; heatmap never red-misses empty X/week days; freeze wraps streak math next

### Code (integration anchors)
- `src/domain/types.ts` — `Completion` / `BackupPayload` to extend with `Freeze` + `freezes`
- `src/domain/streak.ts` — Day-walk + week-hit streaks; wrap with freeze bridge / effectiveTimes
- `src/domain/stats.ts` — `countScheduledCompletions`, `getWeekDayState` / `WeekDayState`
- `src/domain/heatmap.ts` — Activities + Spanish tooltips; frozen level/label
- `src/domain/backupSchema.ts` — Zod backup; additive `freezes`
- `src/infrastructure/db.ts` — Dexie v1 stores → v2 + `freezes`
- `src/infrastructure/completionRepository.ts` — Pattern for freeze repository + mutual exclusion writes
- `src/components/habits/HabitRow.tsx` — Today primary complete; add Skip secondary
- `src/components/heatmap/ContributionHeatmap.tsx` — Cell interactivity for freeze state
- `src/hooks/useTodayHabits.ts` — Hide frozen-today / non-actionable habits
- `src/hooks/useToggleCompletion.ts` (or equivalent) — Clear freeze when completing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/types.ts` — Binary `Completion`; `BackupPayload` currently habits + completions only
- `src/domain/streak.ts` — Pure compute-on-read; daily/weekly day-walk + `times_per_week` week-hit branch (Phase 7)
- `src/domain/stats.ts` — `WeekDayState` without frozen; schedule-aware counts feed per-habit + Panel overall rate
- `src/domain/heatmap.ts` + `ContributionHeatmap.tsx` — Cell state map drives color, tooltip, click-to-toggle
- `src/infrastructure/db.ts` — Dexie v1: `habits`, `completions` compound `[habitId+date]`
- `src/components/habits/HabitRow.tsx` — One-tap/swipe complete + history affordance; natural Skip secondary home
- `src/domain/backupSchema.ts` — Proven additive Zod extensions (color optional, frequency union)

### Established Patterns
- Completions keyed by local date string; no persisted streak/rate columns
- Domain pure functions + Vitest; hooks compose via `useLiveQuery`
- Backup `version: 1` extended additively when backward compatible; Dexie store adds may still bump DB version
- Spanish UI on Hoy/Panel/Historial tooltips; touch targets ≥44px
- Mutual exclusion and transactional multi-table writes belong in repository layer

### Integration Points
- Every streak/stats/heatmap path that today takes only `completedDates: Set<string>` must also consider freezes (pass a freeze set or richer day-status helper)
- `useTodayHabits` due filter: frozen today → not actionable (hide)
- Toggle completion must clear freeze; freeze write must clear completion
- Export/import + Dexie migration must include `freezes` without wiping v1 data
- Phase 6 overall rate and Phase 7 X/week math should keep working via updated `countScheduledCompletions` / streak helpers

</code_context>

<specifics>
## Specific Ideas

- Separate `freezes` table mirrors completions — clearest “frozen ≠ done” story for backup and UI
- Bridge-without-increment keeps streaks honest: skip preserves the chain length you earned from real check-ins
- X/week `effectiveTimes = times - freezesInWeek` makes day-level freezes meaningful for week-unit streaks without inventing a second “freeze week” product concept
- Hide frozen-today from Hoy — Today stays an action queue, History is the ledger
- Additive backup `freezes: []` avoids forcing a backup version bump for all users

</specifics>

<deferred>
## Deferred Ideas

- Soft freeze quotas / monthly caps / “you’ve frozen a lot” nag — not in ROADMAP SC; revisit if motivation dilution appears
- Auto-freeze rules (travel mode, weekends) — violates explicit-only integrity constraint
- Reminders about frozen days or unfinished weeks — v2.0 REM-01/02
- Numeric/partial completions — still out of scope (REQUIREMENTS)
- Light mode / PWA — unchanged deferrals

</deferred>

---

*Phase: 8-Streak Freeze*
*Context gathered: 2026-07-24*
