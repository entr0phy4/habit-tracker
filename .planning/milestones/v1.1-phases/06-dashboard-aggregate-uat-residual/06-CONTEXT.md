# Phase 6: Dashboard Aggregate & UAT Residual - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning
**Mode:** auto (yolo / non-interactive cloud agent — recommended defaults locked)

<domain>
## Phase Boundary

Users see one overall completion rate across active habits on the Panel dashboard, and the Phase 2 human UAT residual is closed. This phase delivers (1) a Panel-level aggregate completion rate that updates when completions toggle, and (2) QA closeout for reactive streak/stats updates plus Dexie read-failure safe empty/zero UI with no raw exception text. Habit colors, check-in micro-animations, X/week frequency, and streak freeze remain in other v1.1 phases.

</domain>

<decisions>
## Implementation Decisions

### Overall Rate Placement on Panel (ENH-03)
- **D-01:** Overall completion rate is a **Panel-level summary** above the habit card list — not a field on each `DashboardCard` (preserves Phase 3 D-05: cards stay name + Flame + streak only)
- **D-02:** Presentation mirrors History `StatCards` pattern: **label above value**, single metric (not a three-card row). Value is whole-number percent (e.g. `72%`) consistent with Phase 2 D-08
- **D-03:** Spanish UI label for the metric (e.g. "Tasa general" / "Completado" — exact copy at Claude's discretion, must match existing Spanish Panel/Hoy tone)
- **D-04:** When there are **no active habits**, keep the existing empty state and **hide** the overall-rate summary (empty state already owns the viewport). When active habits exist but denominator is 0 (no scheduled days yet), show **`0%`**

### Overall Rate Aggregation Formula
- **D-05:** Rate covers **active habits only** — archived habits excluded (same filter as Panel / Today)
- **D-06:** Use a **pooled** formula: (sum of completed scheduled days across active habits) ÷ (sum of scheduled days across active habits since each habit's creation), then `Math.round` to whole percent — **not** the arithmetic mean of per-habit rates (avoids overweighting new/short habits)
- **D-07:** Reuse per-habit schedule-aware lifetime logic from `calculateCompletionRate` / `domain/stats.ts` as the building block; new aggregate helper composes those inputs rather than inventing a different window (no rolling 7/30 — lifetime, matching Phase 2 D-07)
- **D-08:** Overall rate must update immediately when the user toggles a completion (Today, History heatmap, or any path that writes via `useToggleCompletion`) — same `useLiveQuery` reactivity contract as streaks

### Reactive Stats Closeout (QA-01)
- **D-09:** Close Phase 2 UAT item **#1 (Reactive stats on toggle)** by verifying Flame on Today + Current/Longest/Rate on History update without reload. Reinterpret the obsolete "dot grid" wording as **heatmap cell state** where relevant; roadmap success criteria already name Flame/streak badges and History stat cards
- **D-10:** Close UAT item **#4 (Large integers >999)** by confirming `StatCards` already renders full `String(n)` with no K/M abbreviation — treat as verification, not a redesign
- **D-11:** Prefer adding at least one **automated** reactivity check (Vitest + jsdom) where feasible for toggle → live query → displayed value; remaining human UAT items may be marked passed once code + tests/UAT evidence land in this phase's verification

### Dexie Failure Fallbacks (QA-01)
- **D-12:** Mirror the proven `useTodayHabits` pattern (`QUERY_ERROR` Symbol + `{ status: 'error' }` or equivalent safe defaults) in **`useStreak`**, **`useHabitStats`**, and **`useDashboardHabits`** (and any new overall-rate hook) so IndexedDB read failures never surface raw exception text
- **D-13:** On streak/stat read failure: show **0** (or hide flame/cards after load resolves to error) — never crash the page, never show stack traces / Dexie messages
- **D-14:** On dashboard/overall-rate read failure: show safe empty list and/or hide overall rate / show `0%` — same "no raw exception" rule as Phase 4 D-14 for user-facing errors
- **D-15:** Phase 2 UAT items **#2** (`useStreak` fallback) and **#3** (`useHabitStats` fallback) are in-scope for this phase's closeout; update `02-UAT.md` results when closed

### Claude's Discretion
- Exact Spanish copy for the overall-rate label and any helper text
- Whether the summary sits in content above the `<ul>` or as a compact header strip under `AppShell title="Panel"`
- Domain function / hook naming (`calculateOverallCompletionRate`, extend `useDashboardHabits` vs dedicated hook)
- Whether dashboard error state uses a Spanish message like TodayPage or silently shows empty + `0%`
- How far to push automated failure-injection tests vs documenting human backstop verification for Dexie corruption

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, local-first constraints, v1.1 active requirements
- `.planning/REQUIREMENTS.md` — ENH-03 (overall completion rate), QA-01 (Phase 2 UAT residual)
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, depends on Phase 5 visuals + Phase 2 domain
- `.planning/STATE.md` — Milestone v1.1 position

### Phase 2 residual (must close)
- `.planning/phases/02-streaks-statistics/02-UAT.md` — Four pending human checks (reactive toggle, useStreak fallback, useHabitStats fallback, large integers)
- `.planning/phases/02-streaks-statistics/02-VERIFICATION.md` — Human verification §1–4 and SKIP→human reactivity note
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — Lifetime rate (D-07/D-08), Flame badge, compute-on-read
- `.planning/phases/02-streaks-statistics/02-UI-SPEC.md` — Stat card tokens; silent fallback assumption for corrupted data

### Phase 3 dashboard patterns
- `.planning/phases/03-dashboard-progress-visualization/03-CONTEXT.md` — Panel at `/dashboard`; cards = name + Flame + streak only (D-05); active-only; streak sort
- `.planning/phases/03-dashboard-progress-visualization/03-UI-SPEC.md` — Panel visual tokens (if present)

### Phase 4 error UX precedent
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — D-14 no raw Zod/Dexie text in UI

### Research
- `.planning/research/ARCHITECTURE.md` — Compute-on-read streaks/stats; dashboard summary pattern
- `.planning/research/PITFALLS.md` — Dexie/reactivity and date-key pitfalls

### Code (error-pattern reference)
- `src/hooks/useTodayHabits.ts` — Canonical `QUERY_ERROR` + status union for Dexie read failures
- `src/domain/stats.ts` — `calculateCompletionRate` (per-habit lifetime %)
- `src/hooks/useDashboardHabits.ts` — Panel batch live query (extend or compose for overall rate)
- `src/pages/DashboardPage.tsx` — Panel render target for overall-rate summary

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/stats.ts` — `calculateCompletionRate` for per-habit lifetime scheduled completion %
- `src/hooks/useHabitStats.ts` — Per-habit current / longest / rate via `useLiveQuery`
- `src/hooks/useDashboardHabits.ts` — Batch active habits + current streaks for Panel (natural place to attach overall rate)
- `src/hooks/useTodayHabits.ts` — **Reference implementation** for Dexie failure containment (`QUERY_ERROR` Symbol)
- `src/components/habits/StatCards.tsx` — Label-above-value + `${rate}%` + full integer display (`String(n)`)
- `src/components/dashboard/DashboardCard.tsx` — Keep unchanged for rate (D-01); streak Flame pattern
- `src/pages/DashboardPage.tsx` — Insert overall-rate summary above card list
- `src/hooks/useToggleCompletion.ts` / `completionRepository.toggle` — Write path that must trigger live updates
- `src/hooks/useStreak.ts` — Today Flame data; needs failure backstop for QA-01 #2

### Established Patterns
- Compute-on-read: no persisted streak/rate fields on `Habit`
- Reactivity: Dexie write → all `useLiveQuery` observers refresh (no manual invalidation)
- Loading: `result === undefined` → `isLoading`; pages often return `null` until ready
- Safe defaults: `?? 0` / `?? []` today — insufficient alone when the query **throws** (need try/catch + sentinel like Today)
- Spanish UI copy on Panel / Hoy / Settings
- Active-only lists on Panel and Today

### Integration Points
- `DashboardPage` — ENH-03 UI surface
- `useDashboardHabits` (or sibling hook) — compute pooled overall rate in same live query batch for one round-trip
- `useStreak` / `useHabitStats` / `useDashboardHabits` — QA-01 failure containment parity with `useTodayHabits`
- `.planning/phases/02-streaks-statistics/02-UAT.md` — Update results when residual items close
- Phase 5 color tokens (if shipped before execute) may tint Panel accents — do not block Phase 6 aggregate math on colors

</code_context>

<specifics>
## Specific Ideas

- Pooled overall rate (not average of averages) so one glance matches "how much of my scheduled work did I actually do"
- Panel summary above streak-sorted cards — glanceable without cluttering each card
- Close the four Phase 2 UAT residuals in the same phase that touches stats/dashboard hooks, so failure backstops and the new aggregate share one verification pass
- Reuse `useTodayHabits` error containment as the template — don't invent a second error UX language

</specifics>

<deferred>
## Deferred Ideas

- Per-card completion rate on Panel — rejected; stays deferred (Phase 3 D-05 / user chose name + streak only)
- Rolling 7/30-day overall rate windows — not in ENH-03; lifetime pooled rate only
- Habit colors / check-in micro-animations — Phase 5 (ENH-01, ENH-02)
- X times per week frequency — Phase 7 (ENH-04)
- Streak freeze / skip day — Phase 8 (ENH-05)
- Reminders / push — v2.0 (REM-01/02)

</deferred>

---

*Phase: 6-Dashboard Aggregate & UAT Residual*
*Context gathered: 2026-07-23*
