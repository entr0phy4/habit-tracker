# Phase 8: Streak Freeze - Research

**Researched:** 2026-07-24
**Domain:** Explicit streak freeze / skip days (ENH-05) — separate Freeze records, bridge-without-increment streaks, frozen≠done rates, heatmap distinction, Dexie v2 + backup v1 freezes
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Freeze Data Model (ENH-05)
- **D-01:** Persist freezes as a **separate entity** parallel to completions: `{ habitId: string; date: string }` (local `YYYY-MM-DD`). Do **not** overload `Completion`
- **D-02:** Domain name **`Freeze`** (table/array `freezes`). User-facing copy may say omitir/skip
- **D-03:** **Mutual exclusion** with completion on the same `(habitId, date)`: freeze clears completion; completion clears freeze
- **D-04:** Freeze only for **today or past** within habit life (`date >= habit.createdAt` date and `date <= today`). Future rejected
- **D-05:** For `daily` / `weekly`, freeze only meaningful on **due** days. For `times_per_week`, any calendar day in an overlapping Mon–Sun week may be frozen

#### Mark Freeze UX
- **D-06:** Today (`HabitRow`): keep one-tap complete primary; add secondary **Skip/Omitir** for today. Unfreeze from that control or History
- **D-07:** History heatmap: three-state cycle for eligible days — **missed/empty → completed → frozen → missed/empty** (planner picks cycle; ≥44px; mobile-obvious)
- **D-08:** Frozen today → **hide from Hoy** (not actionable)
- **D-09:** Panel `DashboardCard` stays navigation-only

#### Streak Semantics
- **D-10:** Frozen due day **bridges** streak — does not break, does not increment
- **D-11:** Longest streak same bridge rule
- **D-12:** Freeze **never starts** a streak
- **D-13:** Phase 2 D-15 grace: if today due, not complete, **not frozen** → yesterday’s run; if today **frozen**, treat as bridge / non-due for grace
- **D-14:** `times_per_week`: `effectiveTimes = max(0, times - freezeCountInWeek)`; week hit when `completionsInWeek >= effectiveTimes`; past unmet effective quota breaks; current week keeps Phase 7 grace when unmet

#### Rate & Overall Rate
- **D-15:** Frozen ≠ done. `daily`/`weekly`: **exclude** frozen due days from numerator and denominator
- **D-16:** `times_per_week`: `scheduled += effectiveTimes`, `completed += min(completionsInWeek, effectiveTimes)`
- **D-17:** Phase 6 pooled overall continues via updated `countScheduledCompletions`

#### Heatmap & History
- **D-18:** Extend `WeekDayState` with **`'frozen'`**
- **D-19:** Visual distinguishes freeze from complete and missed (ice/muted/dashed — readable on dark + habit color compatible)
- **D-20:** Spanish tooltip distinct from Completado/Perdido
- **D-21:** X/week empty days stay not red-missed; frozen X/week days show `'frozen'`

#### Backup & Dexie
- **D-22:** Dexie **v1 → v2** adding `freezes` store `[habitId+date], habitId, date`
- **D-23:** Backup stays **`version: 1`**; optional **`freezes`** array default `[]`
- **D-24:** Import transactional replace habits + completions + freezes; streaks compute-on-read

#### Integrity
- **D-25:** Unlimited explicit freezes; always visible; no silent auto-freeze
- **D-26:** Soft monthly caps out of scope

### Claude's Discretion (LOCKED in this research)
- Today secondary control: **ghost icon Button** `aria-label="Omitir"` with lucide **`Snowflake`**, ≥44×44px, `stopPropagation`, placed **before** History calendar button
- When already frozen today (edge if still visible): same control becomes **Deshacer omisión** / toggles unfreeze
- History interaction: **cycle** on tap — empty/missed → completed → frozen → empty (clear both). Not long-press (mobile discoverability)
- X/week: past/today cells that are `not-scheduled` or `frozen` or `completed` are interactive for the cycle (expand beyond missed|completed-only)
- daily/weekly: keep interactivity on due past/today (`missed`|`completed`|`frozen`); non-due stay non-interactive
- Tooltip label: **`Omitido`**
- Heatmap frozen visual: muted ice accent `#58a6ff` at ~35% fill + dashed stroke; not solid completion green, not destructive red
- Domain API: add optional `frozenDates: Set<string>` params to streak/stats/heatmap helpers; keep completion-only overloads via default `new Set()` only if all call sites updated in same phase — prefer **required Set** at updated call sites for honesty
- Repository: `freezeRepository` with `set`/`clear`/`toggle` + `getByHabitInRange`; mutual exclusion in both freeze writes and `completionRepository.toggle` / put paths via Dexie transaction
- Hook: extend `useToggleCompletion` to clear freeze on complete; add `useToggleFreeze` (or combined day-state toggle for heatmap); `useHeatmapData` exposes cycle handler
- No toast required on Skip (optional brief existing toast pattern OK); no new celebration system

### Deferred Ideas (OUT OF SCOPE)
- Soft freeze quotas / monthly caps / nag copy
- Auto-freeze (travel, weekends)
- Reminders about frozen days — v2.0 REM-01/02
- Numeric/partial completions
- Backup version bump to 2 — rejected (additive `freezes`)
- Overloading Completion with status — rejected (D-01)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENH-05 | User can skip a day without breaking a streak (streak freeze) | Separate `Freeze` + Dexie v2; mutual exclusion writes; streak bridge + X/week effectiveTimes; rate exclude/excused; heatmap `'frozen'` + Omitido; Today Omitir + hide frozen; History cycle; backup v1 `freezes[]` round-trip |
</phase_requirements>

## Summary

Phase 8 adds an explicit, countable **freeze** parallel to completions so users can skip a scheduled day without breaking streaks or inflating completion rates. Freezes live in a new Dexie `freezes` store (schema v2) and an additive backup `freezes` array (payload version stays 1). Streak math treats frozen due days as bridges (non-incrementing gaps); rates exclude them (frozen ≠ done); X/week weeks use `effectiveTimes = times - freezesInWeek`. UI keeps one-tap complete on Today and adds a secondary **Omitir** control; History uses a three-state cell cycle. No new npm packages.

**Primary recommendation:** Ship data + mutual exclusion first (TDD), then pure domain freeze-aware streak/stats/heatmap, then hooks + HabitRow + ContributionHeatmap cycle. Thread `frozenDates: Set<string>` through the same call paths that already pass `completedDates`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `Freeze` type + BackupPayload.freezes | Domain | — | Types/Zod source of truth |
| Dexie `freezes` store v2 | Infrastructure | — | Schema migration; leave v1 data intact |
| Mutual exclusion freeze↔completion | Infrastructure (repos) | — | Transactional multi-table writes |
| Bridge streak + effectiveTimes week hits | Domain (`streak.ts`) | — | Pure compute-on-read |
| Rate exclude / effectiveTimes scheduled | Domain (`stats.ts`) | — | Feeds per-habit + Panel overall |
| `WeekDayState` + `'frozen'` + tooltip | Domain (`stats`/`heatmap`) | Browser | Enum drives heatmap chrome |
| Today hide frozen + Omitir control | Application + Browser | Domain | Filter + secondary button |
| History three-state cycle | Browser (`ContributionHeatmap`) | Application hooks | Cell toggle orchestration |
| Backup parse/import freezes | Domain + Infrastructure | — | Additive v1; transactional replace |

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie schema versioning | 4.4.4 | `this.version(2).stores({ freezes: ... })` | Existing DB class [VERIFIED: db.ts] |
| Zod | installed | Optional `freezes` array | Additive backup pattern [VERIFIED: backupSchema.ts] |
| date-fns via `dates.ts` | installed | Week freeze counts for X/week | Phase 7 week helpers [VERIFIED: dates.ts] |
| lucide-react | installed | `Snowflake` Omitir icon | Existing icon set |
| shadcn Button | in-repo | Secondary Skip control | HabitRow History button analog |
| Vitest + Testing Library | installed | Domain + repo + UI tests | Established harness |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| `Completion.status = 'frozen'` | Violates frozen≠done; pollutes rate queries; D-01 forbids |
| Soft-delete completion as freeze | Invisible / not countable; integrity pitfall |
| Auto-freeze weekends | Violates explicit-only PROJECT constraint |
| Long-press freeze on heatmap | Poor mobile discoverability vs cycle |
| Backup `version: 2` | Unnecessary — additive `freezes` default `[]` (D-23) |
| Persist streak after freeze | Violates compute-on-read |
| New npm freeze library | Overkill — Set + pure walks |

**Installation:**

```bash
# None — Phase 8 uses existing dependencies only
```

**Package legitimacy:** N/A — no new packages.

## Project Constraints (non-negotiable)

- Local-first only — no backend/auth/sync
- Frozen ≠ done — never count freeze as completion in rates (D-15)
- Freeze always explicit + visible on History (D-25)
- One-tap complete remains primary Today action (core value / D-06)
- Backup stays `version: 1`; Dexie may bump to v2 for new store (D-22, D-23)
- No silent auto-freeze / monthly caps (D-26)
- No new npm packages
- Preserve Phase 7 X/week week-unit math; wrap with effectiveTimes (D-14, D-16)
- Panel cards remain navigation-only (D-09)

## Architecture Patterns

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│  Hoy HabitRow                                                   │
│    tap → complete (clears freeze)   [❄ Omitir] → freeze today   │
│    frozen today → hidden from list                              │
└──────────────────────────────▲──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│  History ContributionHeatmap                                    │
│    cycle: empty → completed → frozen → empty                    │
└──────────────────────────────▲──────────────────────────────────┘
                               │ useLiveQuery + repos
┌──────────────────────────────┴──────────────────────────────────┐
│  Dexie v2: habits | completions | freezes                       │
│  Mutual exclusion txn on (habitId, date)                        │
└──────────────────────────────▲──────────────────────────────────┘
                               │ Sets
┌──────────────────────────────┴──────────────────────────────────┐
│  Domain                                                         │
│    streak: frozen bridges (no increment) / X/week effectiveTimes│
│    stats: exclude frozen due days / effectiveTimes scheduled    │
│    heatmap: WeekDayState 'frozen' + tooltip Omitido             │
│    backupSchema: version 1 + freezes[]                          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Skip today:** User taps Omitir → `freezeRepository` puts freeze and deletes any completion for that day in one transaction → `useTodayHabits` reloads → habit hidden.
2. **Complete today:** Existing toggle puts completion and clears freeze in the same transaction → streak may increment; freeze gone.
3. **History cycle:** Cell tap advances state via repository helpers (clear both / put completion / put freeze).
4. **Streak read:** Hooks load completions + freezes for habit range → `calculateCurrentStreak(..., frozenDates)`.
5. **Rate / Panel:** `countScheduledCompletions` receives frozen set → excused days out of daily/weekly denom; X/week uses effectiveTimes → pooled overall updates.
6. **Export/import:** Export includes `freezes`; import Zod-defaults missing to `[]`; transactional replace three tables; streaks recompute on read.

### Recommended APIs

```typescript
// ── types.ts ──────────────────────────────────────────────────
export interface Freeze {
  habitId: string;
  date: string; // YYYY-MM-DD local
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
  freezes?: Freeze[]; // optional on read; always present on new export
}

// ── db.ts ─────────────────────────────────────────────────────
// Keep version(1) stores for upgrade path; add:
this.version(2).stores({
  habits: 'id, archived, createdAt',
  completions: '[habitId+date], habitId, date',
  freezes: '[habitId+date], habitId, date',
});

// ── freezeRepository.ts (NEW) ─────────────────────────────────
export const freezeRepository = {
  /** Put freeze; clear completion for same key. Rejects future dates. */
  set(habitId: string, date: string): Promise<void>,
  /** Delete freeze if present. */
  clear(habitId: string, date: string): Promise<void>,
  /** If frozen → clear; else set (and clear completion). */
  toggle(habitId: string, date: string): Promise<void>,
  getByHabitInRange(habitId: string, start: string, end: string): Promise<string[]>,
};

// completionRepository.toggle / put path MUST clear freeze in same txn

// ── streak.ts ─────────────────────────────────────────────────
export function calculateCurrentStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  today: string,
  habitStartDate: string,
  frozenDates: Set<string>,
): number;
// daily/weekly day-walk:
//   if due && frozen → continue (bridge, no increment)  // D-10
//   if due && !completed → break (unless D-15 grace for today incomplete+unfrozen)
//   if today due && !completed && !frozen → start from yesterday (D-13)
//   if today frozen → treat as bridge (do not apply miss grace as break)
// times_per_week:
//   effectiveTimes = max(0, times - freezeCountInWeek)
//   hit iff completionsInWeek >= effectiveTimes
//   freeze never starts streak (D-12)

export function calculateLongestStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  frozenDates: Set<string>,
): number;

// ── stats.ts ──────────────────────────────────────────────────
export type WeekDayState =
  | 'completed'
  | 'missed'
  | 'not-scheduled'
  | 'future'
  | 'frozen';

export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today?: Date,
  frozenDates?: Set<string>, // or required — update all call sites
): ScheduledCompletionCounts;
// daily/weekly: skip frozen due days entirely (not scheduled, not completed)
// times_per_week: effectiveTimes = max(0, times - freezeCount); scheduled+=effectiveTimes;
//   completed += min(completionsInWeek, effectiveTimes)

export function getWeekDayState(
  date: string,
  frequency: Frequency,
  completedDates: Set<string>,
  today: string,
  frozenDates: Set<string>,
): WeekDayState;
// if frozenDates.has(date) → 'frozen' (even if somehow also completed — repos prevent)
// else existing rules; X/week still never 'missed' for empty

// ── heatmap.ts ────────────────────────────────────────────────
export function buildHeatmapActivities(
  frequency: Frequency,
  completedDates: Set<string>,
  start: string,
  end: string,
  today: string,
  frozenDates: Set<string>,
): { activities: Activity[]; cellStates: Map<string, WeekDayState> };
// frozen → count 0, level 0 (or dedicated level); cellState 'frozen'
// formatHeatmapTooltip: frozen → 'Omitido'

// ── backupSchema.ts ───────────────────────────────────────────
// freezes: z.array(freezeSchema).optional().default([])
// version remains z.literal(1)
```

### Recommended Hook / UI Shape

```typescript
// useTodayHabits: also load freezes for today (or week);
// filter: due AND !frozenToday
// TodayHabitEntry may include isFrozen?: boolean (usually absent if hidden)

// HabitRow props:
//   onSkip?: () => void
//   Show Snowflake button when onSkip provided; aria-label "Omitir"

// useHeatmapData:
//   load completions + freezes
//   cycle(date):
//     missed/not-scheduled → set completion
//     completed → set freeze (clears completion)
//     frozen → clear freeze (and completion)
//   interactive predicate expands for freeze-eligible cells

// useStreak / useHabitStats: pass frozenDates into domain calculators
```

## File Structure (expected touches)

| Path | Action | Notes |
|------|--------|-------|
| `src/domain/types.ts` | MODIFY | `Freeze` + `BackupPayload.freezes` |
| `src/domain/backupSchema.ts` | MODIFY | Optional freezes array |
| `src/domain/backupSchema.test.ts` | MODIFY | Round-trip + old backups |
| `src/domain/streak.ts` | MODIFY | Bridge + effectiveTimes |
| `src/domain/streak.test.ts` | MODIFY | Freeze fixtures |
| `src/domain/stats.ts` | MODIFY | Exclude / effectiveTimes / `'frozen'` |
| `src/domain/stats.test.ts` | MODIFY | Rate + getWeekDayState |
| `src/domain/heatmap.ts` | MODIFY | frozen activities + Omitido |
| `src/domain/heatmap.test.ts` | MODIFY | Frozen tooltip/state |
| `src/infrastructure/db.ts` | MODIFY | version 2 + freezes |
| `src/infrastructure/db.test.ts` | MODIFY | Schema v2 |
| `src/infrastructure/freezeRepository.ts` | CREATE | set/clear/toggle/range |
| `src/infrastructure/freezeRepository.test.ts` | CREATE | Mutual exclusion |
| `src/infrastructure/completionRepository.ts` | MODIFY | Clear freeze on toggle put |
| `src/infrastructure/completionRepository.test.ts` | MODIFY | Clears freeze |
| `src/infrastructure/backupService.ts` | MODIFY | Export/import freezes |
| `src/infrastructure/backupService.test.ts` | MODIFY | Round-trip freezes |
| `src/hooks/useTodayHabits.ts` | MODIFY | Hide frozen today |
| `src/hooks/useTodayHabits.test.ts` | MODIFY | Frozen hide |
| `src/hooks/useStreak.ts` | MODIFY | Load freezes |
| `src/hooks/useHabitStats.ts` | MODIFY | Load freezes |
| `src/hooks/useHeatmapData.ts` | MODIFY | Freezes + cycle |
| `src/hooks/useToggleCompletion.ts` | MODIFY | Ensure freeze clear (via repo) |
| `src/hooks/useToggleFreeze.ts` | CREATE | Optional thin wrapper |
| `src/components/habits/HabitRow.tsx` | MODIFY | Omitir button |
| `src/components/habits/HabitRow.test.tsx` | MODIFY | Skip control |
| `src/components/heatmap/ContributionHeatmap.tsx` | MODIFY | Cycle + frozen style |
| `src/components/heatmap/ContributionHeatmap.test.tsx` | MODIFY | Cycle + frozen |
| `src/pages/TodayPage.tsx` | MODIFY | Wire onSkip |
| Hook/page tests as needed | MODIFY | Integration |

## Implementation Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| Overloading Completion | Separate `Freeze` entity (D-01) |
| Counting freeze as done in rate | Exclude from num and denom (D-15) |
| Incrementing streak on freeze | Bridge only — continue walk, no `streak++` (D-10) |
| Freeze starts streak from 0→1 | D-12 — only completions increment |
| Ignoring freezes in X/week week hit | `effectiveTimes = times - freezeCount` (D-14) |
| Leaving frozen habit on Today | Hide when today frozen (D-08) |
| Replacing row tap with Skip | Secondary control + stopPropagation (D-06) |
| Heatmap only toggles complete↔miss | Three-state cycle including frozen (D-07) |
| X/week cells not clickable | Expand interactivity for freeze-eligible empty days |
| Backup version 2 | Additive optional freezes on v1 (D-23) |
| Dexie v2 wiping data | Additive store; keep habits/completions indexes |
| Race: completion and freeze both present | Always transactional mutual exclusion (D-03) |
| Future freeze | Reject via `isFutureDate` like completions (D-04) |
| Panel card freeze chrome | Do not edit DashboardCard day state (D-09) |
| Silent auto-freeze | Explicit user action only (D-25) |

## Security / Threat Notes

| Threat ID | Category | Severity | Mitigation |
|-----------|----------|----------|------------|
| T-08-01 | Tampering (backup freezes) | medium | Zod validates `{habitId, date}` shape; transactional import; mutual exclusion on write |
| T-08-02 | Tampering (orphan freezes) | low | Import replaces all freezes; optional post-import ignore orphans on read (habit missing → unused) |
| T-08-03 | Elevation of Privilege / integrity | medium | No silent freeze; UI always shows Omitido on heatmap; unlimited but visible (D-25) |
| T-08-04 | Denial of Service | low | Range queries bounded by heatmap/habit lifetime; no unbounded loops |

Local-only ASVS L1: validate import freezes; keep QUERY_ERROR soft fallbacks on streak/stats hooks.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`) |
| Quick run command | `npm test -- src/domain/streak.test.ts src/domain/stats.test.ts src/infrastructure/freezeRepository.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ENH-05 | Freeze type + Zod freezes optional/default; version 1 | unit | `npm test -- src/domain/backupSchema.test.ts -x` | ✅ extend |
| ENH-05 | Dexie v2 freezes store | unit | `npm test -- src/infrastructure/db.test.ts -x` | ✅ extend |
| ENH-05 | Mutual exclusion freeze↔completion | unit | `npm test -- src/infrastructure/freezeRepository.test.ts -x` | ❌ Wave 0 create |
| ENH-05 | completion toggle clears freeze | unit | `npm test -- src/infrastructure/completionRepository.test.ts -x` | ✅ extend |
| ENH-05 | Backup export/import round-trips freezes | unit | `npm test -- src/infrastructure/backupService.test.ts -x` | ✅ extend |
| ENH-05 | Streak bridges frozen due day; no increment | unit | `npm test -- src/domain/streak.test.ts -x` | ✅ extend |
| ENH-05 | Freeze never starts streak; longest bridge | unit | `npm test -- src/domain/streak.test.ts -x` | ✅ extend |
| ENH-05 | X/week effectiveTimes hit/break/grace | unit | `npm test -- src/domain/streak.test.ts -x` | ✅ extend |
| ENH-05 | Rate excludes frozen due days | unit | `npm test -- src/domain/stats.test.ts -x` | ✅ extend |
| ENH-05 | X/week rate uses effectiveTimes | unit | `npm test -- src/domain/stats.test.ts -x` | ✅ extend |
| ENH-05 | getWeekDayState `'frozen'`; heatmap Omitido | unit | `npm test -- src/domain/stats.test.ts src/domain/heatmap.test.ts -x` | ✅ extend |
| ENH-05 | Today hides frozen habit | hook | `npm test -- src/hooks/useTodayHabits.test.ts -x` | ✅ extend |
| ENH-05 | HabitRow Omitir control | component | `npm test -- src/components/habits/HabitRow.test.tsx -x` | ✅ extend |
| ENH-05 | Heatmap cycle empty→complete→frozen→empty | component | `npm test -- src/components/heatmap/ContributionHeatmap.test.tsx -x` | ✅ extend |

### Test Dimensions (Nyquist Edge Cases)

| Dimension | Fixture Scenario | Expected | Test File |
|-----------|------------------|----------|-----------|
| Bridge no increment | Complete Mon, freeze Tue, complete Wed (daily) | current streak 2 (not 3) | `streak.test.ts` |
| Bridge no break | Complete Mon, freeze Tue (due), today Wed incomplete | grace/bridge keeps Mon run | `streak.test.ts` |
| Freeze never starts | New habit, freeze today only | streak 0 | `streak.test.ts` |
| Today frozen grace | Due today frozen, yesterday complete | streak includes yesterday (bridge today) | `streak.test.ts` |
| Miss still breaks | Due day neither complete nor frozen | streak breaks | `streak.test.ts` |
| X/week effectiveTimes | times:3, 1 freeze, 2 completions | week hit | `streak.test.ts` |
| X/week past miss | effectiveTimes unmet in past week | streak breaks | `streak.test.ts` |
| Rate exclude frozen | 2 due days, 1 complete, 1 frozen | rate 100% (1/1) | `stats.test.ts` |
| Rate X/week | times:3, 1 freeze, 2 completions | scheduled 2, completed 2 | `stats.test.ts` |
| Mutual exclusion | set freeze then toggle complete | only completion remains | `freezeRepository.test.ts` |
| Future reject | freeze tomorrow | rejected / no write | `freezeRepository.test.ts` |
| Backup old file | v1 without freezes key | ok; freezes [] | `backupSchema.test.ts` |
| Heatmap tooltip | frozen cell | contains Omitido | `heatmap.test.ts` |
| Today hide | frozen today | absent from list | `useTodayHabits.test.ts` |
| Cycle | three taps on missed cell | complete → frozen → empty | `ContributionHeatmap.test.tsx` |

### Sampling Rate

- **Per task commit:** targeted vitest on changed files
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Create `src/infrastructure/freezeRepository.ts` + `freezeRepository.test.ts`
- [ ] Extend types/Zod/db tests for Freeze + v2 before full domain
- [ ] Thread `frozenDates` through streak/stats/heatmap call sites (hooks)
- [ ] Expand heatmap interactivity for X/week freeze-eligible cells
- [ ] Wire TodayPage `onSkip` → freeze today

## Open Questions

| Question | Resolution |
|----------|------------|
| Cycle vs long-press on History? | **RESOLVED:** Cycle empty→completed→frozen→empty |
| Today Skip chrome? | **RESOLVED:** Snowflake ghost Button, aria "Omitir", before History |
| Tooltip copy? | **RESOLVED:** "Omitido" |
| Frozen cell color? | **RESOLVED:** ice `#58a6ff` muted + dashed stroke |
| `frozenDates` optional vs required? | **RESOLVED:** Required at updated domain signatures; update all in-repo call sites in Phase 8 |
| Combined day-state hook? | **RESOLVED:** Prefer `freezeRepository` + extend completion toggle; heatmap `cycle` in `useHeatmapData` |
| Toast on skip? | **RESOLVED:** Optional; not required for SC |

## Sources

- `.planning/phases/08-streak-freeze/08-CONTEXT.md` — locked D-01–D-26
- `.planning/phases/07-flexible-weekly-frequency/07-CONTEXT.md` / RESEARCH — X/week wrap points
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — D-15 grace baseline
- `.planning/research/PITFALLS.md` — punitive streaks; prefer explicit skip
- `.planning/REQUIREMENTS.md` — ENH-05
- `.planning/ROADMAP.md` — Phase 8 SC1–SC4
- `src/domain/streak.ts`, `stats.ts`, `heatmap.ts`, `backupSchema.ts`, `types.ts`
- `src/infrastructure/db.ts`, `completionRepository.ts`, `backupService.ts`
- `src/components/habits/HabitRow.tsx`, `src/components/heatmap/ContributionHeatmap.tsx`
- `src/hooks/useTodayHabits.ts`, `useHeatmapData.ts`, `useStreak.ts`

**Confidence:** HIGH — all anchors exist; Phase 7 localized week branch for clean effectiveTimes wrap; no external API research required.

## RESEARCH COMPLETE
