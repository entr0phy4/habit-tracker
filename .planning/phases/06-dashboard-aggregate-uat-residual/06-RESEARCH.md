# Phase 6: Dashboard Aggregate & UAT Residual - Research

**Researched:** 2026-07-23
**Domain:** Panel pooled overall completion rate + Phase 2 UAT residual (reactivity + Dexie failure fallbacks)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Overall Rate Placement on Panel (ENH-03)
- **D-01:** Overall completion rate is a **Panel-level summary** above the habit card list — not a field on each `DashboardCard` (preserves Phase 3 D-05: cards stay name + Flame + streak only)
- **D-02:** Presentation mirrors History `StatCards` pattern: **label above value**, single metric (not a three-card row). Value is whole-number percent (e.g. `72%`) consistent with Phase 2 D-08
- **D-03:** Spanish UI label for the metric (e.g. "Tasa general" / "Completado" — exact copy at Claude's discretion, must match existing Spanish Panel/Hoy tone)
- **D-04:** When there are **no active habits**, keep the existing empty state and **hide** the overall-rate summary (empty state already owns the viewport). When active habits exist but denominator is 0 (no scheduled days yet), show **`0%`**

#### Overall Rate Aggregation Formula
- **D-05:** Rate covers **active habits only** — archived habits excluded (same filter as Panel / Today)
- **D-06:** Use a **pooled** formula: (sum of completed scheduled days across active habits) ÷ (sum of scheduled days across active habits since each habit's creation), then `Math.round` to whole percent — **not** the arithmetic mean of per-habit rates (avoids overweighting new/short habits)
- **D-07:** Reuse per-habit schedule-aware lifetime logic from `calculateCompletionRate` / `domain/stats.ts` as the building block; new aggregate helper composes those inputs rather than inventing a different window (no rolling 7/30 — lifetime, matching Phase 2 D-07)
- **D-08:** Overall rate must update immediately when the user toggles a completion (Today, History heatmap, or any path that writes via `useToggleCompletion`) — same `useLiveQuery` reactivity contract as streaks

#### Reactive Stats Closeout (QA-01)
- **D-09:** Close Phase 2 UAT item **#1 (Reactive stats on toggle)** by verifying Flame on Today + Current/Longest/Rate on History update without reload. Reinterpret the obsolete "dot grid" wording as **heatmap cell state** where relevant; roadmap success criteria already name Flame/streak badges and History stat cards
- **D-10:** Close UAT item **#4 (Large integers >999)** by confirming `StatCards` already renders full `String(n)` with no K/M abbreviation — treat as verification, not a redesign
- **D-11:** Prefer adding at least one **automated** reactivity check (Vitest + jsdom) where feasible for toggle → live query → displayed value; remaining human UAT items may be marked passed once code + tests/UAT evidence land in this phase's verification

#### Dexie Failure Fallbacks (QA-01)
- **D-12:** Mirror the proven `useTodayHabits` pattern (`QUERY_ERROR` Symbol + `{ status: 'error' }` or equivalent safe defaults) in **`useStreak`**, **`useHabitStats`**, and **`useDashboardHabits`** (and any new overall-rate hook) so IndexedDB read failures never surface raw exception text
- **D-13:** On streak/stat read failure: show **0** (or hide flame/cards after load resolves to error) — never crash the page, never show stack traces / Dexie messages
- **D-14:** On dashboard/overall-rate read failure: show safe empty list and/or hide overall rate / show `0%` — same "no raw exception" rule as Phase 4 D-14 for user-facing errors
- **D-15:** Phase 2 UAT items **#2** (`useStreak` fallback) and **#3** (`useHabitStats` fallback) are in-scope for this phase's closeout; update `02-UAT.md` results when closed

### Claude's Discretion (LOCKED in this research)
- Spanish label: **"Tasa general"** (matches Spanish Panel chrome; History keeps English StatCards labels)
- Summary placement: **content region above the `<ul>`**, under `AppShell title="Panel"` — not inside the AppShell title string
- Domain API: export `countScheduledCompletions` + `calculateOverallCompletionRate` from `src/domain/stats.ts`
- Dashboard error UX: soft Spanish/English muted message parity with TodayPage ("Couldn't load…" style) — **no raw exception text**; hide overall-rate summary on error
- Hook shape: extend `useDashboardHabits` (do not invent a second live query for overall rate alone)
- Failure-injection: automate Dexie throw → safe 0/error status in hook tests; human UAT remains documentation closeout in `02-UAT.md`

### Deferred Ideas (OUT OF SCOPE)
- Per-card completion rate on Panel
- Rolling 7/30-day overall rate windows
- Habit colors / check-in micro-animations (Phase 5)
- X times per week frequency (Phase 7)
- Streak freeze / skip day (Phase 8)
- Reminders / push (v2.0)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENH-03 | User can see overall completion rate across all habits on the dashboard | Pooled lifetime helper in `stats.ts`; `useDashboardHabits` computes `overallRate`; Panel summary above card list; hide when empty; `0%` when denominator 0 |
| QA-01 | Phase 2 human UAT residual closed — reactive stats on toggle and Dexie failure fallbacks show safe empty/zero UI with no raw exceptions | `QUERY_ERROR` in `useStreak` / `useHabitStats` / `useDashboardHabits`; Vitest reactivity + failure-injection; StatCards full integers; update `02-UAT.md` |
</phase_requirements>

## Summary

Phase 6 adds one glanceable **pooled lifetime completion rate** to Panel and closes the Phase 2 UAT residual around live-query reactivity and IndexedDB read failures. No schema changes, no new npm packages, no backup version bump. Domain stays compute-on-read: extract countable `{ completed, scheduled }` from the same schedule-aware loop as `calculateCompletionRate`, then pool across active habits. Hooks that still lack try/catch (`useStreak`, `useHabitStats`, `useDashboardHabits`) adopt the `useTodayHabits` `QUERY_ERROR` sentinel so throws become safe zeros / empty / soft error UI.

**Primary recommendation:** Add `countScheduledCompletions` + `calculateOverallCompletionRate` in `stats.ts` (TDD), extend `useDashboardHabits` to return `{ items, overallRate, status }` with try/catch, mirror failure containment in `useStreak`/`useHabitStats`, render a compact Panel "Tasa general" summary, and mark Phase 2 UAT #1–#4 closed with automated evidence.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Per-habit scheduled completed/scheduled counts | Domain | — | Pure; same loop as `calculateCompletionRate` |
| Pooled overall % | Domain | — | Pure composition; unit-testable without Dexie |
| Batch active habits + streaks + overallRate | Application (hooks) | Domain + Infrastructure | One `useLiveQuery` round-trip |
| Streak / History stats failure containment | Application (hooks) | — | Mirror `useTodayHabits` |
| Panel overall-rate summary UI | Browser / Client | Application | Presentational; no domain imports |
| UAT residual documentation | Planning | Tests | Update `02-UAT.md` when evidence lands |

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `dexie` + `dexie-react-hooks` | 4.4.4 / 4.4.0 | `useLiveQuery` reactivity | Existing local-first layer [VERIFIED: package.json] |
| `date-fns` helpers via `dates.ts` / `schedule.ts` | installed | Schedule-aware day iteration | Existing domain [VERIFIED: codebase] |
| `@testing-library/react` + `vitest` + `jsdom` | 16.3.2 / 4.1.10 | Hook + page + reactivity tests | Established harness [VERIFIED: package.json] |
| `fake-indexeddb` | 6.2.5 | Dexie failure / toggle integration | Existing pattern [VERIFIED: package.json] |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| Mean of per-habit rates | Overweights short habits (D-06 rejected) |
| Persist overallRate on Habit/settings | Violates compute-on-read; schema churn for no gain |
| Separate `useOverallCompletionRate` live query | Double IndexedDB read; CONTEXT prefers compose in dashboard batch |
| Progress bar without numeric % | Weaker glanceability; D-02 wants StatCards-style % |
| Per-card rate on Panel | Phase 3 D-05 / D-01 — deferred |
| Playwright E2E for reactivity | Out of v1.1 stack; Vitest + jsdom sufficient (D-11) |

**Installation:**

```bash
# None — Phase 6 uses existing dependencies only
```

**Package legitimacy:** N/A — no new packages.

## Project Constraints (non-negotiable)

- Local-first only — no backend/auth/sync
- Active habits only for Panel aggregate (D-05)
- Lifetime pooled window — not rolling 7/30 (D-07)
- No raw Dexie/exception text in UI (D-12–D-14, Phase 4 D-14)
- `DashboardCard` remains name + Flame + streak only (D-01)
- Spanish Panel chrome; History StatCards English labels unchanged
- Phase 5 color accents optional if already shipped — **do not block** aggregate math on colors
- No new npm packages; no backup schema / version changes

## Architecture Patterns

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│  DashboardPage (Panel)                                      │
│    ├── OverallRateSummary ("Tasa general" + N%)  [NEW]      │
│    └── DashboardCard[] (name + Flame + streak)  [unchanged] │
└──────────────────────────▲──────────────────────────────────┘
                           │ status / items / overallRate
┌──────────────────────────┴──────────────────────────────────┐
│  useDashboardHabits (useLiveQuery + QUERY_ERROR)            │
│    active habits → streaks + countScheduledCompletions pool │
└──────────────────────────▲──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  Domain: stats.ts                                           │
│    countScheduledCompletions → { completed, scheduled }     │
│    calculateOverallCompletionRate → Math.round pooled %     │
│    calculateCompletionRate (existing) = compose of counts   │
└─────────────────────────────────────────────────────────────┘

QA-01 parallel:
  useStreak / useHabitStats → try/catch + QUERY_ERROR → 0 values
  toggle (useToggleCompletion) → Dexie write → all live queries refresh
```

### Data Flow

1. User opens Panel → `useDashboardHabits` loads active habits + completions in range
2. For each habit: `calculateCurrentStreak` + `countScheduledCompletions`
3. Pool Σ completed / Σ scheduled → `overallRate`
4. User toggles on Hoy or Historial → `completionRepository.toggle` → live queries re-run → Flame, StatCards, Panel rate update without reload
5. On IndexedDB throw → hooks return error/0 — pages never render exception strings

### Recommended Domain API

```typescript
export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): { completed: number; scheduled: number } {
  // Same loop body as calculateCompletionRate; skip non-due + future
}

export function calculateOverallCompletionRate(
  habits: Array<{
    frequency: Frequency;
    completedDates: Set<string>;
    startDate: string;
  }>,
  endDate: string,
  today: Date = new Date(),
): number {
  let completed = 0;
  let scheduled = 0;
  for (const h of habits) {
    const part = countScheduledCompletions(
      h.completedDates,
      h.frequency,
      h.startDate,
      endDate,
      today,
    );
    completed += part.completed;
    scheduled += part.scheduled;
  }
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

// Optional refactor: calculateCompletionRate delegates to countScheduledCompletions
```

### Recommended Hook Shape

```typescript
export type DashboardHabitsState =
  | { status: 'loading'; items: []; overallRate: 0; isLoading: true }
  | { status: 'error'; items: []; overallRate: 0; isLoading: false }
  | {
      status: 'ready';
      items: Array<{ habit: Habit; currentStreak: number }>;
      overallRate: number;
      isLoading: false;
    };

// Backward-compatible fields: keep `items` + `isLoading` for existing DashboardPage tests;
// add `status` + `overallRate`.
```

`useStreak` / `useHabitStats`: wrap live query body in try/catch; on `QUERY_ERROR` return zeros with `isLoading: false` (consumers already treat missing as 0 — D-13). Prefer keeping existing return shape to avoid HabitRow / History churn.

## File Structure (expected touches)

| Path | Action | Notes |
|------|--------|-------|
| `src/domain/stats.ts` | MODIFY | Add count + overall helpers; optionally refactor rate |
| `src/domain/stats.test.ts` | MODIFY | Pooled vs mean cases; denominator 0 → 0 |
| `src/hooks/useDashboardHabits.ts` | MODIFY | try/catch, overallRate, status |
| `src/hooks/useDashboardHabits.test.ts` | MODIFY | overallRate + error path |
| `src/hooks/useStreak.ts` | MODIFY | QUERY_ERROR → 0 |
| `src/hooks/useStreak.test.ts` | CREATE | Failure injection + happy path |
| `src/hooks/useHabitStats.ts` | MODIFY | QUERY_ERROR → 0 |
| `src/hooks/useHabitStats.test.ts` | CREATE | Failure injection |
| `src/pages/DashboardPage.tsx` | MODIFY | Overall summary + error UI |
| `src/pages/DashboardPage.test.tsx` | MODIFY | Rate visible; hidden on empty; error safe |
| `src/components/habits/StatCards.test.tsx` | MODIFY | Assert full integers >999 (QA-01 #4) |
| `src/hooks/useToggleCompletion.ts` / HabitRow / History | VERIFY | Reactivity via existing live query — add automated check |
| `.planning/phases/02-streaks-statistics/02-UAT.md` | MODIFY | Mark #1–#4 passed with evidence pointers |

**Optional small presentational extract:** inline summary in `DashboardPage` is fine; only extract `OverallRateSummary` if page gets noisy — Claude's discretion defaults to **inline** first.

## Implementation Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| Averaging per-habit % | Pool raw counts (D-06) |
| Including archived habits | Filter `!archived` before pool (D-05) |
| Double-counting today future | Reuse `isFutureDate` skip from existing rate loop |
| Showing rate on empty Panel | Hide summary when `items.length === 0` and status ready (D-04) |
| Uncaught Dexie throw leaves `isLoading` forever | try/catch + sentinel (Phase 3 WR-02) |
| Surfacing `error.message` | Soft copy only; never stringify exception |
| Blocking on Phase 5 colors | Aggregate works without `habit.color` |
| Mean vs pooled regression | Unit test: habit A 100% of 1 day + habit B 0% of 99 days → overall ≈ 1%, not 50% |

## Security / Threat Notes

| Threat ID | Category | Severity | Mitigation |
|-----------|----------|----------|------------|
| T-06-01 | Information Disclosure | low | Never render Dexie/DOMException messages in Panel/Today/History |
| T-06-02 | Denial of Service (UX) | low | Failed reads degrade to 0/empty — app remains usable |
| T-06-03 | Tampering | n/a | No new untrusted input surfaces; no backup parse changes |

Local-only app — ASVS L1 relevant items are error-message hygiene only.

## Open Questions

| Question | Resolution |
|----------|------------|
| Exact Spanish label? | **RESOLVED:** "Tasa general" |
| Dedicated hook vs extend dashboard? | **RESOLVED:** Extend `useDashboardHabits` |
| Error UI copy language? | **RESOLVED:** Soft muted message (Today parity); English ok if matching existing Today error string style, or Spanish "No se pudieron cargar los hábitos." — prefer Spanish for Panel chrome |
| Refactor `calculateCompletionRate` to use counts? | **RESOLVED:** Yes — preferred DRY; keep public API of `calculateCompletionRate` stable |

## Sources

- `.planning/phases/06-dashboard-aggregate-uat-residual/06-CONTEXT.md` — locked decisions
- `.planning/phases/02-streaks-statistics/02-UAT.md` — residual items #1–#4
- `.planning/phases/03-dashboard-progress-visualization/03-REVIEW.md` — WR-02 dashboard error gap
- `src/hooks/useTodayHabits.ts` — QUERY_ERROR reference implementation
- `src/domain/stats.ts` — existing lifetime rate loop
- `.planning/research/ARCHITECTURE.md` — compute-on-read invariant

**Confidence:** HIGH — all building blocks exist in-repo; no external API research required.
