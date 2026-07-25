# Phase 7: Flexible Weekly Frequency - Research

**Researched:** 2026-07-24
**Domain:** X times per week frequency (ENH-04) — quota due-today, week-unit streaks, capped rate, additive backup
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Frequency Data Model (ENH-04)
- **D-01:** Add `{ type: 'times_per_week'; times: number }` with **`times` ∈ 1..7** (integer). Do **not** overload `{ type: 'weekly'; days }` for quotas
- **D-02:** Keep `{ type: 'daily' }` and `{ type: 'weekly'; days }` unchanged. **`times: 7` ≠ daily** — daily remains the explicit all-days schedule
- **D-03:** Schedule modes are **mutually exclusive** in create/edit: specific weekdays **or** times-per-week. Switching mode clears the other shape

#### Week Boundary & Due-Today Quota
- **D-04:** Week boundary is **Monday–Sunday** (`dates.ts` `weekStartsOn: 1`, Phase 2 D-09)
- **D-05:** `times_per_week` is **due today** when completions in the current Mon–Sun week are **&lt; `times`**. Any day in the week may receive a completion toward the quota
- **D-06:** Once quota is met, habit is **not due** — **hide from Today** (Phase 1 D-02). History/heatmap may still toggle days in that week
- **D-07:** **Over-completion allowed** via History; Today stays hidden when `completionsThisWeek >= times`. Rate math **caps** at `times` per week (D-14)
- **D-08:** Pure `isDueOnDate(frequency, date)` is insufficient for quotas — introduce a completions-aware due helper. Weekday `daily` / `weekly` paths keep boolean due checks

#### Streak Rules (Weekly Quota Unit)
- **D-09:** Streak unit is a **week**: hit when `completionsInWeek >= times`
- **D-10:** A **fully past** Mon–Sun week with `completionsInWeek < times` **breaks** the current streak
- **D-11:** The **current (in-progress) week** does **not** break the streak while quota is unmet (Phase 2 D-15 spirit)
- **D-12:** If the current week already meets quota, it **counts** toward the current streak
- **D-13:** New habit shows streak **0** until at least one hit week. Longest = max consecutive hit weeks. Daily / specific-weekday rules stay Phase 2 D-13–D-16

#### Completion Rate & Dashboard Aggregate
- **D-14:** Lifetime rate: for each Mon–Sun week overlapping habit life through today, **`scheduled += times`** and **`completed += min(completionsInWeek, times)`**. Include current week; exclude future weeks. First week = week containing `createdAt` (full `times` target — no mid-week proration)
- **D-15:** Extend `countScheduledCompletions` so X/week feeds per-habit rate + Phase 6 pooled overall rate — **no denormalized rate fields**
- **D-16:** `getWeekDayState` / heatmap: completion → `completed`; empty past/today → **`not-scheduled`** (never `missed`). Quota failure via streak + rate only

#### HabitForm & List Chrome
- **D-17:** HabitForm schedule-mode choice: **specific days** vs **times per week** (1–7). New-habit default remains **daily** (all seven days in specific-days mode) — Phase 1 D-07
- **D-18:** Today / `HabitRow`: keep `WeekDayDots` for `daily`/`weekly`; for `times_per_week` show quota chip (e.g. `2/3`) with habit color accent
- **D-19:** Edit may convert freely among modes; streaks/rates **recompute on read** after save

#### Backup Compatibility
- **D-20:** Keep backup **`version: 1`**. Extend Zod `frequencySchema` additively. Old backups still validate; new exports round-trip `times_per_week`
- **D-21:** Reject out-of-range `times` (not 1–7) at schema validation / write boundaries

### Claude's Discretion (LOCKED in this research)
- HabitForm copy (English, matches existing form): mode label **"Schedule"**; options **"Specific days"** / **"Times per week"**; times control aria **"Times per week"** (aligns with `07-UI-SPEC.md`)
- Times control: **single-select ToggleGroup** segments `1`…`7`, each ≥44×44px — not a free-text stepper
- Default when switching to times-per-week mode: **`times = 3`** if unset; create default mode remains Specific days → all 7 → `daily`
- Quota chip text: **`{done}/{times}`** (e.g. `2/3`); aria-label **`{done} of {times} this week`**
- Domain API: keep `isDueOnDate` for weekday schedules only (`times_per_week` → `false`); add **`isHabitDueOnDate(frequency, dateStr, completedDates)`** as the universal due entry point; add **`countCompletionsInCalendarWeek`**; branch streaks/stats inside existing exports
- Manage list summary: **no** mandatory "3×/semana" line this phase — quota chip on Today is enough; optional later
- Flame aria: keep numeric streak; prefer **"N week streak"** when `frequency.type === 'times_per_week'`, else existing day wording
- Partial first/last weeks for rate: **no proration** (D-14) — heatmap tooltips stay day-level; empty X/week days are dim/`not-scheduled`

### Deferred Ideas (OUT OF SCOPE)
- Streak freeze / skip days (ENH-05) — **Phase 8** (must follow this frequency model)
- Interval schedules ("every N days") — not in v1.1
- Numeric/partial completions inside a day — out of scope (PROJECT.md)
- Reminders for unmet mid-week quota — v2.0 (REM-01/02)
- Backup version bump to 2 — rejected (D-20 additive v1)
- Treating `times: 7` as alias of `daily` — rejected (D-02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENH-04 | User can set "X times per week" frequency for habits | Extend `Frequency` + Zod; HabitForm mode toggle + 1–7 control; `isHabitDueOnDate` + week quota for Today; week-unit streak branches; `countScheduledCompletions` week-cap rate (feeds Phase 6 overall); `getWeekDayState` never `missed` for X/week; backup v1 round-trip |
</phase_requirements>

## Summary

Phase 7 adds a third frequency shape — `{ type: 'times_per_week', times }` — and teaches the schedule/streak/stats stack to treat the Mon–Sun week as the scheduling unit for those habits. Today due-ness becomes quota-aware (`completionsThisWeek < times`); streaks count consecutive **hit weeks** with in-progress-week grace; lifetime and pooled Panel rates accumulate `times` per overlapping week capped by `min(n, times)`. Heatmap days never paint red-missed for X/week (any day can satisfy the quota). Backup stays `version: 1` with an additive Zod union member. No new npm packages; no Phase 8 freeze.

**Primary recommendation:** Extend `Frequency` + `frequencySchema` first (TDD), land pure helpers `countCompletionsInCalendarWeek` / `isHabitDueOnDate` / week-iteration for rates, branch `calculateCurrentStreak` / `calculateLongestStreak` / `countScheduledCompletions` / `getWeekDayState`, then wire `useTodayHabits` + HabitForm mode UI + HabitRow quota chip. Keep `isDueOnDate` weekday-only so accidental day filters do not invent fake due days for quotas.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `Frequency` union + Habit persistence shape | Domain | Infrastructure (Dexie stores opaque JSON) | Types + Zod are source of truth |
| Week quota count / due-with-completions | Domain (`schedule.ts` / `dates.ts`) | — | Pure; unit-testable; reused by hooks |
| Week-unit current/longest streak | Domain (`streak.ts`) | — | Compute-on-read; Phase 8 will wrap here |
| Week-capped scheduled/completed counts + rate | Domain (`stats.ts`) | — | Feeds per-habit + Phase 6 pooled overall |
| Heatmap day state (no missed for X/week) | Domain (`stats.ts`) | Browser (heatmap) | State enum already drives UI |
| Today filter (quota-aware) | Application (`useTodayHabits`) | Domain | Load week completions; call `isHabitDueOnDate` |
| HabitForm mode + times control | Browser / Client | Domain types only | Presentational; maps to Frequency |
| Quota chip on Today row | Browser (`HabitRow`) | Application (pass week counts) | Glanceable chrome; habit color accent |
| Backup parse/reject invalid `times` | Domain (`backupSchema.ts`) | — | Additive v1; D-21 at boundary |

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript discriminated unions | project | `Frequency` third variant | Existing pattern [VERIFIED: types.ts] |
| `date-fns` via `dates.ts` | installed | Mon–Sun `startOfWeek` / `endOfWeek` / `getCalendarWeekDates` | Phase 2 week contract [VERIFIED: dates.ts] |
| Zod | installed | Additive `frequencySchema` member | Phase 4/5 backup pattern [VERIFIED: backupSchema.ts] |
| Dexie + `dexie-react-hooks` | 4.4.4 / 4.4.0 | Persist frequency JSON; live Today/streak | Existing [VERIFIED: package.json] |
| shadcn `ToggleGroup` | in-repo | Mode + 1–7 segments | HabitForm already uses it [VERIFIED: HabitForm.tsx] |
| Vitest + Testing Library + jsdom | installed | Domain + form + hook tests | Established harness |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| Overload `{ type: 'weekly', days }` with a count | Ambiguous storage; D-01 forbids |
| Alias `times: 7` → daily | Different mental model / due rules; D-02 forbids |
| Day-walk streak pretending 3 ghost weekdays | Pitfall 2; breaks on empty days that are valid quota slots |
| Persist `completionsThisWeek` / streak columns | Violates compute-on-read; Phase 6 rate already pools live |
| Backup `version: 2` | Unnecessary — additive union is backward compatible (D-20) |
| Soft-delete / hide empty heatmap days only in UI | Domain must return `not-scheduled` so all consumers agree (D-16) |
| New scheduling library | Overkill; `dates.ts` already Mon–Sun |

**Installation:**

```bash
# None — Phase 7 uses existing dependencies only
```

**Package legitimacy:** N/A — no new packages.

## Project Constraints (non-negotiable)

- Local-first only — no backend/auth/sync
- Mon–Sun week everywhere (D-04) — never Sun–Sat or rolling 7 for quota
- Today shows **only** actionable (due) habits — hide when weekly quota met (D-06)
- Over-complete allowed; rate credit capped at `times`/week (D-07, D-14)
- No denormalized streak/rate fields — recompute on read (D-15, D-19)
- Backup stays `version: 1`; reject `times` ∉ 1..7 (D-20, D-21)
- No new npm packages
- **No Phase 8 streak freeze** in this phase — keep X/week streak logic localized in `streak.ts` for a clean follow-on wrap
- Phase 6 pooled overall rate must keep working when X/week habits enter the pool (same `countScheduledCompletions`)

## Architecture Patterns

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│  HabitForm                                                      │
│    Schedule: [Specific days] | [Times per week]                 │
│    → Frequency: daily | weekly{days} | times_per_week{times}    │
└──────────────────────────────▲──────────────────────────────────┘
                               │ save Habit.frequency
┌──────────────────────────────┴──────────────────────────────────┐
│  Dexie habits + completions (unchanged tables)                  │
└──────────────────────────────▲──────────────────────────────────┘
                               │ useLiveQuery
┌──────────────────────────────┴──────────────────────────────────┐
│  useTodayHabits                                                 │
│    load active habits + completions in current Mon–Sun week     │
│    filter: isHabitDueOnDate(freq, today, completedDates)        │
└──────────┬───────────────────────────────┬──────────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐    ┌─────────────────────────────────────┐
│ HabitRow             │    │ useStreak / useHabitStats / Panel   │
│ WeekDayDots │ 2/3 chip│    │ calculateCurrentStreak (week branch)│
└──────────────────────┘    │ countScheduledCompletions (cap)     │
                            │ getWeekDayState (never missed)      │
                            └─────────────────────────────────────┘

Domain core:
  dates.ts     → Mon–Sun week bounds + (optional) week iteration
  schedule.ts  → isDueOnDate (weekday) + isHabitDueOnDate (all)
                 + countCompletionsInCalendarWeek
  streak.ts    → day-walk OR week-hit walk by frequency.type
  stats.ts     → day loop OR per-week scheduled+=times / completed+=min
  backupSchema → frequencySchema ∪ times_per_week
```

### Data Flow

1. **Create/edit:** User picks Specific days → existing `toFrequency(days)`; or Times per week → `{ type: 'times_per_week', times }`. Modes mutually exclusive.
2. **Today load:** For each active habit, build `completedDates` for the habit (at least current week). Call `isHabitDueOnDate`. `daily`/`weekly` ignore the set for due (weekday boolean); `times_per_week` due iff `countCompletionsInCalendarWeek(...) < times`.
3. **Check-in today:** Existing toggle writes a completion for local today. Live query refreshes → quota may reach `times` → row disappears from Today; streak may increment if week becomes a hit.
4. **History over-complete:** User can add more than `times` days in a week; Today already hidden; rate uses `min(n, times)`.
5. **Streak read:** `times_per_week` walks Mon–Sun weeks backward from the week containing `today`; past miss breaks; current unmet does not; current hit counts.
6. **Rate / Panel overall:** `countScheduledCompletions` week-branches → same `{ completed, scheduled }` → `calculateCompletionRate` + `calculateOverallCompletionRate` unchanged at call sites.
7. **Export/import:** Zod accepts new union member; invalid `times` → `invalid`; old backups without member still parse.

### Recommended APIs

Concrete TypeScript signatures for planners/implementers:

```typescript
// ── types.ts ──────────────────────────────────────────────────
export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }
  | { type: 'times_per_week'; times: number }; // times ∈ 1..7

// ── dates.ts (reuse / thin helpers) ───────────────────────────
/** Count YYYY-MM-DD keys that fall in the Mon–Sun week containing dateInWeek. */
export function countCompletionsInCalendarWeek(
  completedDates: Set<string>,
  dateInWeek: string,
): number;

/**
 * Optional Wave 0 helper: yield each Mon–Sun week overlapping [startDate, endDate]
 * as { weekStart, weekEnd } (inclusive local date strings).
 * Used by countScheduledCompletions + streak week walks.
 */
export function iterateCalendarWeeksInRange(
  startDate: string,
  endDate: string,
): Generator<{ weekStart: string; weekEnd: string }>;

// ── schedule.ts ───────────────────────────────────────────────
/**
 * Weekday-only due check. For times_per_week ALWAYS returns false
 * (quotas are not "due on a weekday"). Callers that need all three
 * frequencies MUST use isHabitDueOnDate.
 */
export function isDueOnDate(frequency: Frequency, dateStr: string): boolean;

/**
 * Universal due helper (D-08).
 * - daily / weekly: same as isDueOnDate (completedDates ignored)
 * - times_per_week: true iff countCompletionsInCalendarWeek(completedDates, dateStr) < frequency.times
 */
export function isHabitDueOnDate(
  frequency: Frequency,
  dateStr: string,
  completedDates: Set<string>,
): boolean;

export function isDaily(frequency: Frequency): boolean;
// times_per_week (even times===7) → false

// ── streak.ts ─────────────────────────────────────────────────
export function calculateCurrentStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  today: string,
  habitStartDate: string,
): number;
// times_per_week branch:
//   walk weeks backward from week(today) down to week(habitStartDate)
//   if week === current && completions < times → skip (do not break, do not count)
//   if week === current && completions >= times → count hit, continue
//   if week past && completions >= times → count hit
//   if week past && completions < times → break
//   weeks before habitStartDate's week excluded

export function calculateLongestStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
): number;
// times_per_week: max consecutive hit weeks in [startDate, endDate]
// (include current week only if already a hit; unmet current does not extend or break longest scan — treat as non-hit trailing)

// Optional internal helpers (export if tests clearer):
export function isWeekHit(
  completedDates: Set<string>,
  times: number,
  dateInWeek: string,
): boolean; // countCompletionsInCalendarWeek >= times

// ── stats.ts ──────────────────────────────────────────────────
export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): ScheduledCompletionCounts;
// times_per_week branch (D-14):
//   for each Mon–Sun week overlapping [startDate, endDate] whose weekStart <= todayLocal:
//     scheduled += frequency.times
//     completed += min(countCompletionsInCalendarWeek(completedDates, weekStart), frequency.times)
//   do NOT day-walk with isDueOnDate
// daily/weekly: keep existing day loop

export function getWeekDayState(
  date: string,
  frequency: Frequency,
  completedDates: Set<string>,
  today: string,
): WeekDayState;
// times_per_week:
//   if completedDates.has(date) → 'completed'
//   if isFutureDate(date, today) → 'future'
//   else → 'not-scheduled'  // NEVER 'missed'
// daily/weekly: unchanged (missed still possible)

// calculateCompletionRate / calculateOverallCompletionRate — no signature change;
// they already compose countScheduledCompletions.

// ── backupSchema.ts ───────────────────────────────────────────
const frequencySchema = z.union([
  z.object({ type: z.literal('daily') }),
  z.object({
    type: z.literal('weekly'),
    days: z.array(z.number().int().min(0).max(6)),
  }),
  z.object({
    type: z.literal('times_per_week'),
    times: z.number().int().min(1).max(7),
  }),
]);
// backupPayloadSchema.version remains z.literal(1)
```

### Recommended Hook / UI Shape

```typescript
// useTodayHabits — must load more than today's completions for X/week:
// Option A (preferred): for active habits, fetch completions in current Mon–Sun week
//   (getCalendarWeekDates), build per-habit Set, filter with isHabitDueOnDate.
// Option B: fetch all completions since min(createdAt) — heavier; avoid unless needed.

export type TodayHabitEntry = {
  habit: Habit;
  isCompleted: boolean; // completion on `today` specifically
  // Optional for chip without second query:
  weekCompletions?: number; // for times_per_week chrome
};

// HabitRow:
//   if habit.frequency.type === 'times_per_week' → <WeekQuotaChip done={n} times={times} accent={color} />
//   else → <WeekDayDots ... />
```

## File Structure (expected touches)

| Path | Action | Notes |
|------|--------|-------|
| `src/domain/types.ts` | MODIFY | Add `times_per_week` variant |
| `src/domain/dates.ts` | MODIFY | `countCompletionsInCalendarWeek`; optional `iterateCalendarWeeksInRange` |
| `src/domain/dates.test.ts` | MODIFY | Week membership / boundary fixtures |
| `src/domain/schedule.ts` | MODIFY | `isDueOnDate` false for X/week; add `isHabitDueOnDate` |
| `src/domain/schedule.test.ts` | MODIFY | Quota due / hide-when-met / over-complete still not due |
| `src/domain/streak.ts` | MODIFY | Week-hit branch in current + longest |
| `src/domain/streak.test.ts` | MODIFY | Hit weeks, in-progress grace, past miss break, longest |
| `src/domain/stats.ts` | MODIFY | Week-cap counts; `getWeekDayState` never missed |
| `src/domain/stats.test.ts` | MODIFY | Cap, over-complete, pooled overall with X/week |
| `src/domain/backupSchema.ts` | MODIFY | Union member; keep version 1 |
| `src/domain/backupSchema.test.ts` | MODIFY | Round-trip + reject times 0/8 |
| `src/hooks/useTodayHabits.ts` | MODIFY | Week completions + `isHabitDueOnDate` |
| `src/hooks/useTodayHabits.test.ts` | MODIFY/CREATE | Quota hide/show |
| `src/components/habits/HabitForm.tsx` | MODIFY | Mode toggle + times control |
| `src/components/habits/HabitForm.test.tsx` | MODIFY | Mode mutual exclusion + submit shapes |
| `src/components/habits/HabitRow.tsx` | MODIFY | Quota chip vs WeekDayDots |
| `src/components/habits/WeekQuotaChip.tsx` | CREATE | Small presentational chip (optional inline) |
| `src/components/habits/WeekDayDots.tsx` | VERIFY | Still weekday-only; do not fake dots for X/week |
| `src/integration/walkingSkeleton.test.ts` | MODIFY | Stop using bare `isDueOnDate` for Today filter if it asserts list |
| Heatmap / History consumers of `getWeekDayState` | VERIFY | Dim empty days; no red miss for X/week |

## Implementation Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| **Pitfall 2 (research):** treating X/week as daily day-streaks | Week-hit unit only; never require specific weekdays for `times_per_week` |
| Using `isDueOnDate` alone for Today | Always `isHabitDueOnDate` + week completions for list filter |
| `isDueOnDate` returning `true` every day for X/week | Returns **`false`** — forces quota path; prevents fake "scheduled every day" rate loops |
| Day-walking `countScheduledCompletions` with due=true every day | Dedicated week branch: `scheduled += times` per week |
| Painting empty X/week days as `missed` | D-16: only `completed` \| `future` \| `not-scheduled` |
| Current unmet week zeros streak | D-11: skip current week when `completions < times` |
| Prorating first partial week | D-14: full `times` target for week containing `createdAt` |
| Equating `times: 7` with `daily` | D-02: separate types forever |
| Bumping backup to v2 | Additive Zod member only (D-20) |
| Accepting `times: 0` / `8` / float | Zod `.int().min(1).max(7)` + form only emits 1–7 |
| Showing WeekDayDots for X/week | Quota chip only (D-18) |
| Building Phase 8 freeze into streak walk now | Out of scope — localize week branch; freeze wraps later |
| Forgetting Phase 6 overall pool | Same `countScheduledCompletions` — add X/week unit tests on `calculateOverallCompletionRate` |
| `useTodayHabits` only loading today's completions | X/week needs **week** completions to evaluate quota |

## Security / Threat Notes

| Threat ID | Category | Severity | Mitigation |
|-----------|----------|----------|------------|
| T-07-01 | Tampering (backup) | medium | Zod rejects out-of-range `times` and unknown frequency shapes; transactional import unchanged |
| T-07-02 | Information Disclosure | low | No new error surfaces; keep soft Dexie fallbacks from Phase 6 |
| T-07-03 | Denial of Service (UX) | low | Week iteration bounded by habit lifetime → today; no unbounded loops |

Local-only app — ASVS L1 relevant items are input validation on import frequency and existing React text escaping for habit names on the quota row.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| Quick run command | `npm test -- src/domain/schedule.test.ts src/domain/streak.test.ts src/domain/stats.test.ts src/domain/dates.test.ts src/domain/backupSchema.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ENH-04 | `Frequency` accepts `times_per_week` 1..7 | unit | `npm test -- src/domain/backupSchema.test.ts -x` | ✅ extend |
| ENH-04 | Zod rejects `times` 0/8; version stays 1; round-trip export shape | unit | `npm test -- src/domain/backupSchema.test.ts -x` | ✅ extend |
| ENH-04 | `isDueOnDate` false for X/week; `isHabitDueOnDate` respects remaining quota | unit | `npm test -- src/domain/schedule.test.ts -x` | ✅ extend |
| ENH-04 | `countCompletionsInCalendarWeek` Mon–Sun boundaries | unit | `npm test -- src/domain/dates.test.ts -x` | ✅ extend |
| ENH-04 | Current streak: hit weeks + in-progress grace + past miss break | unit | `npm test -- src/domain/streak.test.ts -x` | ✅ extend |
| ENH-04 | Longest streak = max consecutive hit weeks | unit | `npm test -- src/domain/streak.test.ts -x` | ✅ extend |
| ENH-04 | Rate: per week `scheduled+=times`, `completed+=min(n,times)`; over-complete capped | unit | `npm test -- src/domain/stats.test.ts -x` | ✅ extend |
| ENH-04 | Overall pooled rate includes X/week habits correctly | unit | `npm test -- src/domain/stats.test.ts -x` | ✅ extend |
| ENH-04 | `getWeekDayState` never `missed` for X/week | unit | `npm test -- src/domain/stats.test.ts -x` | ✅ extend |
| ENH-04 | HabitForm mode toggle → correct Frequency payload | component | `npm test -- src/components/habits/HabitForm.test.tsx -x` | ✅ extend |
| ENH-04 | Today hides when weekly quota met; shows when under | hook/component | `npm test -- src/hooks/useTodayHabits.test.ts -x` | ❌ Wave 0 gap |
| ENH-04 | HabitRow shows quota chip not WeekDayDots for X/week | component | `npm test -- src/components/habits/HabitRow.test.tsx -x` | ⚠️ extend or create |

### Test Dimensions (Nyquist Edge Cases)

| Dimension | Fixture Scenario | Expected | Test File |
|-----------|------------------|----------|-----------|
| Due under quota | `times: 3`, 2 completions this week | `isHabitDueOnDate` true | `schedule.test.ts` |
| Due at quota | `times: 3`, 3 completions this week | false — hide Today | `schedule.test.ts` |
| Over-complete still not due | 5 completions, `times: 3` | false; rate credit 3 | `schedule.test.ts` + `stats.test.ts` |
| Week boundary Sun→Mon | Completions Sunday; Monday new week | Sunday count not in new week | `dates.test.ts` / `schedule.test.ts` |
| Streak in-progress grace | Last week hit; this week 0 of 3 | current streak ≥ 1 (unmet current does not break) | `streak.test.ts` |
| Streak current hit counts | This week already ≥ times after prior hits | current includes this week | `streak.test.ts` |
| Streak past miss breaks | Two weeks ago miss; last week hit | current = 1 (or 0 if current unmet-only) | `streak.test.ts` |
| New habit streak 0 | Created this week, no hit week yet | current = 0 | `streak.test.ts` |
| Longest across gaps | Hits, miss week, longer hit run | longest = longer run | `streak.test.ts` |
| Rate first week full target | Created Wednesday; `times: 3` | that week still `scheduled += 3` | `stats.test.ts` |
| Rate cap | 5 completions in week, `times: 2` | `completed += 2` for that week | `stats.test.ts` |
| Heatmap empty day | X/week, past day no completion | `not-scheduled` (not `missed`) | `stats.test.ts` |
| Heatmap completed day | X/week with completion | `completed` | `stats.test.ts` |
| `times: 7` ≠ daily | Frequency times_per_week 7 | `isDaily` false; week rate math | `schedule.test.ts` / `stats.test.ts` |
| Form mutual exclusion | Switch Specific ↔ Times | Submit only one shape | `HabitForm.test.tsx` |
| Backup old file | v1 without times_per_week | still `ok: true` | `backupSchema.test.ts` |
| Daily/weekly regression | Existing MWF streak/rate fixtures | unchanged results | `streak.test.ts` / `stats.test.ts` |

### Sampling Rate

- **Per task commit:** `npm test -- src/domain/schedule.test.ts src/domain/streak.test.ts src/domain/stats.test.ts src/domain/dates.test.ts -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Extend `src/domain/types.ts` + failing tests for `times_per_week` before implementation
- [ ] `countCompletionsInCalendarWeek` (+ optional `iterateCalendarWeeksInRange`) in `dates.ts` / `dates.test.ts`
- [ ] `isHabitDueOnDate` + `isDueOnDate` X/week contract in `schedule.test.ts`
- [ ] Week-unit streak cases in `streak.test.ts` (grace, break, longest, new=0)
- [ ] Week-cap rate + never-missed `getWeekDayState` + overall pool case in `stats.test.ts`
- [ ] Backup additive union + reject out-of-range `times` in `backupSchema.test.ts`
- [ ] `useTodayHabits` week-completion filter tests — **file may be missing** → create `src/hooks/useTodayHabits.test.ts`
- [ ] HabitForm mode/times submit tests; HabitRow quota chip assertion
- [ ] Confirm `walkingSkeleton` / any Today filter still using bare `isDueOnDate` is updated

## Open Questions

| Question | Resolution |
|----------|------------|
| `isDueOnDate` vs new helper? | **RESOLVED:** Keep `isDueOnDate` weekday-only (`times_per_week` → `false`); add `isHabitDueOnDate` for all consumers that need due-today |
| Exact form / chip copy? | **RESOLVED:** English HabitForm per UI-SPEC; chip `2/3` + aria `2 of 3 this week` |
| 1–7 control widget? | **RESOLVED:** ToggleGroup segments, default times `3` on mode switch |
| Export week iterator from `dates.ts`? | **RESOLVED:** Prefer yes (`iterateCalendarWeeksInRange`) shared by streak + stats — avoids duplicated Mon–Sun math |
| Flame "day" vs "week" aria? | **RESOLVED:** Use "week streak" when `times_per_week`, else keep day wording |
| Manage list "3×/week" subtitle? | **RESOLVED:** Skip this phase — Today chip sufficient |
| Mid-week creation proration? | **RESOLVED:** No proration (D-14) |

## Sources

- `.planning/phases/07-flexible-weekly-frequency/07-CONTEXT.md` — locked decisions D-01–D-21
- `.planning/phases/07-flexible-weekly-frequency/07-UI-SPEC.md` — form mode / chip contract
- `.planning/phases/06-dashboard-aggregate-uat-residual/06-RESEARCH.md` — research format + pooled rate dependency
- `.planning/research/PITFALLS.md` — Pitfall 2 (weekly/custom as daily streaks)
- `.planning/REQUIREMENTS.md` — ENH-04; ENH-05 deferred Phase 8
- `.planning/ROADMAP.md` — Phase 7 success criteria
- `src/domain/types.ts`, `schedule.ts`, `streak.ts`, `stats.ts`, `dates.ts`, `backupSchema.ts` — integration anchors
- `src/hooks/useTodayHabits.ts`, `src/components/habits/HabitForm.tsx`, `HabitRow.tsx` — UI/filter wiring

**Confidence:** HIGH — all building blocks exist in-repo; week helpers already Mon–Sun; Phase 6 count/pool APIs are the intended extension points; no external API research required.

## RESEARCH COMPLETE
