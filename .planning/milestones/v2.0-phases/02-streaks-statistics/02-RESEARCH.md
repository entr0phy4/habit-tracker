# Phase 2: Streaks & Statistics - Research

**Researched:** 2026-07-19
**Domain:** Schedule-aware streak calculation, completion statistics, calendar-week overview (compute-on-read over Dexie completions)
**Confidence:** HIGH

## Summary

Phase 2 adds derived motivation metrics on top of the Phase 1 completion event log. No new persistence fields, no new npm packages, and no backend — streaks, longest streak, completion rate, and the weekly overview are **pure domain functions** fed by `completionRepository.getByHabitInRange()` and rendered reactively via `useLiveQuery`.

The locked CONTEXT decisions define precise streak semantics: schedule-aware backward walks, today-incomplete does not zero the displayed current streak (D-15), lifetime completion rate since habit creation (D-07), and a Mon–Sun calendar week grid replacing the Phase 1 rolling 7-day grid (D-09, D-12). Implementation extends existing modules (`dates.ts`, `HistoryDotGrid`, `HabitRow`, `HabitHistoryPage`) and adds `domain/streak.ts`, `domain/stats.ts`, `useStreak`, and `useHabitStats`.

**Primary recommendation:** Implement schedule-aware streak/rate logic as tested pure functions in `src/domain/`, fetch completions once per habit via `getByHabitInRange(createdAtLocalDate, today)`, derive all three stats in hooks, and extend `HistoryDotGrid` to calendar-week Mon–Sun with completed / missed / hidden-not-scheduled states.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Streak Display on Today View
- **D-01:** Current streak appears inline next to the habit name on Today rows (e.g., flame icon + number beside name)
- **D-02:** Streak uses lucide-react `Flame` icon plus numeric count — classic streak affordance; animated flame deferred to v2 (ENH-02)
- **D-03:** Today shows current streak inline; history page shows fuller stats (current, longest, completion rate) — both views are prominent, not history-only
- **D-04:** Streak badge remains visible when row is completed (strikethrough state) — not muted or hidden after check-in

#### Stats Header on History Page
- **D-05:** Three equal stat cards in a row below habit name: Current | Longest | Rate
- **D-06:** Each card uses label-above-value layout — "Current" / "Longest" / "Rate" in 12px muted text, values in 20px semibold
- **D-07:** Completion rate covers all scheduled days since habit creation — completed scheduled days ÷ total scheduled days (lifetime metric)
- **D-08:** Completion rate formatted as whole-number percent rounded (e.g., "85%")

#### Weekly Overview
- **D-09:** Weekly overview uses calendar week Mon–Sun (not rolling last 7 days)
- **D-10:** Extend existing `HistoryDotGrid` dot pattern with three states: completed (green fill), missed scheduled (red outline empty dot), not scheduled (hidden or dim — planner discretion)
- **D-11:** Missed scheduled days use red/destructive outline on empty circle — explicit but not an X mark
- **D-12:** Same calendar-week grid serves dual purpose — shows completed/missed overview AND remains tappable to toggle past/today completions; replaces the Phase 1 rolling 7-day grid

#### Streak Counting Rules
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

### Deferred Ideas (OUT OF SCOPE)
- Streak freeze / skip day without breaking streak (ENH-05) — v2 enhancement
- Flame animation and streak visual rewards on check-in (ENH-02) — v2 enhancement
- Dashboard showing all streaks at a glance (DASH-01) — Phase 3
- GitHub contribution heatmap (VIZ-01) — Phase 3
- Overall completion rate across all habits — ENH-03, not Phase 2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STRK-01 | User can see the current streak for each habit | `calculateCurrentStreak()` + `useStreak` + inline `Flame` badge on `HabitRow` (D-01–D-04, D-13–D-15) |
| STRK-02 | User can see the longest streak for each habit | `calculateLongestStreak()` forward scan + `useHabitStats` + history stat card (D-05, D-16) |
| STRK-03 | User can see completion rate percentage per habit | `calculateCompletionRate()` lifetime since `createdAt` + stat card "Rate" (D-07, D-08) |
| STRK-04 | User can see a weekly overview of habit completions | `getCalendarWeekDates()` + extended `HistoryDotGrid` with completed/missed/hidden states (D-09–D-12) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Current streak calculation | Browser / Client (Domain) | Hooks | Pure backward walk over `Set<date>`; no server |
| Longest streak calculation | Browser / Client (Domain) | Hooks | Forward scan over habit lifetime; compute-on-read |
| Completion rate (lifetime) | Browser / Client (Domain) | Hooks | Scheduled-day ratio since `createdAt` local date |
| Calendar week date range (Mon–Sun) | Browser / Client (Domain) | — | `date-fns` week helpers + `getLocalDateString` |
| Completion history fetch | Browser / Storage | Hooks | `completionRepository.getByHabitInRange` over Dexie |
| Inline streak badge (Today) | Browser / Client (UI) | Hooks | `HabitRow` renders `useStreak` result |
| Stat cards (History) | Browser / Client (UI) | Hooks | `HabitHistoryPage` renders `useHabitStats` |
| Weekly dot grid (3 states) | Browser / Client (UI) | Domain | `HistoryDotGrid` maps `getWeekDayState()` per date |
| Reactive stat refresh on toggle | Browser / Client (Hooks) | Storage | `useLiveQuery` re-fires on `completions` write |

## Standard Stack

### Core (pre-installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | 4.4.0 | Calendar week range, day iteration | Already used in Phase 1; per-function ESM imports [VERIFIED: npm registry] |
| Dexie | 4.4.4 | Completion range queries | Compound `[habitId+date]` index supports bounded fetch [CITED: dexie.org/docs] |
| dexie-react-hooks | 4.4.0 | Reactive derived stats | `useLiveQuery` auto-recalcs on toggle [CITED: dexie.org/docs/dexie-react-hooks/useLiveQuery] |
| lucide-react | 1.25.0 | `Flame` streak icon | Locked in CONTEXT D-02; already installed |
| Vitest | 4.1.10 | Domain unit tests | Existing test infra in `vite.config.ts` |

### Supporting (existing domain modules)

| Module | Purpose | When to Use |
|--------|---------|-------------|
| `domain/schedule.ts` → `isDueOnDate()` | Schedule-aware day filter | Every streak walk and rate denominator |
| `domain/dates.ts` → `getLocalDateString()`, `isFutureDate()` | Local `YYYY-MM-DD` keys | All date boundaries; extend with week helpers |
| `infrastructure/completionRepository.ts` | `getByHabitInRange()` | Single bulk fetch per habit in hooks |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Compute-on-read streaks | Persist `habit.currentStreak` | Corrupts on past-day edit/import — rejected per ARCHITECTURE |
| Rolling last-7-days grid | Calendar week Mon–Sun | User locked D-09; rolling grid is Phase 1 only |
| `startOfISOWeek` | `startOfWeek({ weekStartsOn: 1 })` | Equivalent for Mon start; use explicit `weekStartsOn: 1` to match D-09 |
| Separate `useLongestStreak` hook | Single `useHabitStats` | One Dexie query serves all three stats — prefer combined on history page |

**Installation:** None required — all dependencies already in `package.json`.

**Version verification:**
```bash
npm view date-fns version    # 4.4.0
npm view dexie version       # 4.4.4
npm view dexie-react-hooks version  # 4.4.0
```

## Package Legitimacy Audit

> Phase 2 installs **no new packages**. Audit covers existing dependencies used by this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| date-fns | npm | 8+ yrs | 20M+/wk | github.com/date-fns/date-fns | OK | Approved (pre-installed) |
| dexie | npm | 10+ yrs | 1M+/wk | github.com/dexie/Dexie.js | OK | Approved (pre-installed) |
| dexie-react-hooks | npm | 4+ yrs | 200K+/wk | github.com/dexie/Dexie.js | OK | Approved (pre-installed) |
| lucide-react | npm | 3+ yrs | 5M+/wk | github.com/lucide-icons/lucide | OK | Approved (pre-installed) |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none (seam returned incomplete signals in sandbox; packages verified via `npm view` and official docs)

## Architecture Patterns

### System Architecture Diagram

```
User toggle (Today or History dot)
        │
        ▼
useToggleCompletion ──► completionRepository.toggle()
        │
        ▼
Dexie completions table write
        │
        ▼ useLiveQuery observes change
        ├──────────────────────┬─────────────────────────┐
        ▼                      ▼                         ▼
   useStreak(habit)     useHabitStats(habit)      useCompletions(habitId)
        │                      │                         │
        ▼                      ▼                         ▼
getByHabitInRange      getByHabitInRange          getByHabitInRange
(createdAt → today)    (createdAt → today)        (weekStart → weekEnd)
        │                      │                         │
        ▼                      ▼                         ▼
calculateCurrentStreak   streak.ts + stats.ts    getWeekDayState()
        │                      │                         │
        ▼                      ▼                         ▼
HabitRow (Flame+N)     StatCards (3 cards)      HistoryDotGrid (dots)
```

### Recommended Project Structure

```
src/
├── domain/
│   ├── dates.ts              # EXTEND: getCalendarWeekDates, iterateDaysInRange, getHabitStartDate
│   ├── schedule.ts           # unchanged — isDueOnDate is the schedule gate
│   ├── streak.ts             # NEW: calculateCurrentStreak, calculateLongestStreak
│   └── stats.ts              # NEW: calculateCompletionRate, getWeekDayState, WeekDayState type
├── hooks/
│   ├── useStreak.ts          # NEW: current streak for Today rows
│   ├── useHabitStats.ts      # NEW: current + longest + rate for history page
│   └── useCompletions.ts     # MODIFY: calendar week range instead of getLast7Days
├── components/habits/
│   ├── HabitRow.tsx          # MODIFY: inline Flame + streak count
│   ├── HistoryDotGrid.tsx    # MODIFY: calendar week, 3 visual states, pass frequency
│   └── StatCards.tsx         # NEW: Current | Longest | Rate row
└── pages/
    └── HabitHistoryPage.tsx  # MODIFY: stat cards header, "This week" subtitle
```

### File-Level Implementation Map

| File | Action | Responsibility | Key exports / changes |
|------|--------|----------------|------------------------|
| `src/domain/dates.ts` | EXTEND | Calendar week + day iteration | `getCalendarWeekDates(today?)`, `iterateDaysInRange(start, end)`, `getPreviousDay(dateStr)` |
| `src/domain/dates.test.ts` | EXTEND | Week boundary tests | Mon–Sun range for known `today` fixture |
| `src/domain/streak.ts` | CREATE | Streak pure functions | `calculateCurrentStreak()`, `calculateLongestStreak()` |
| `src/domain/streak.test.ts` | CREATE | Streak edge-case tests | Weekly, today-incomplete, first completion, DST |
| `src/domain/stats.ts` | CREATE | Rate + week state | `calculateCompletionRate()`, `getWeekDayState()`, `WeekDayState` |
| `src/domain/stats.test.ts` | CREATE | Rate + week state tests | 0%, 100%, missed detection, future days |
| `src/hooks/useStreak.ts` | CREATE | Reactive current streak | `useStreak(habit, todayKey?)` → `{ currentStreak, isLoading }` |
| `src/hooks/useHabitStats.ts` | CREATE | Reactive all stats | `useHabitStats(habit, todayKey?)` → `{ current, longest, rate, isLoading }` |
| `src/hooks/useCompletions.ts` | MODIFY | Calendar week query | Replace `getLast7Days` with `getCalendarWeekDates` |
| `src/components/habits/StatCards.tsx` | CREATE | History stat header | Three label-above-value cards per D-05/D-06 |
| `src/components/habits/HabitRow.tsx` | MODIFY | Inline streak badge | `Flame` + count after name, visible when completed (D-04) |
| `src/components/habits/HabitRow.test.tsx` | EXTEND | Streak badge render | Mock `useStreak`; assert flame + number present |
| `src/components/habits/HistoryDotGrid.tsx` | MODIFY | Calendar week 3-state grid | Accept `frequency` prop; completed/missed/hidden; keep toggle |
| `src/components/habits/HistoryDotGrid.test.tsx` | MODIFY | Week grid tests | 7 columns Mon–Sun; missed outline class; hidden non-scheduled |
| `src/pages/HabitHistoryPage.tsx` | MODIFY | Stats + week label | `StatCards` below name; subtitle "This week"; pass `frequency` to grid |
| `src/pages/TodayPage.tsx` | MINOR | Pass `todayKey` to rows | Optional: thread `todayKey` into `useStreak` for midnight consistency |

### Pattern 1: Schedule-Aware Current Streak (Backward Walk)

**What:** Walk backward from `today`, counting only scheduled days with completions. Skip non-scheduled days. If today is scheduled but incomplete, skip today without breaking (D-15).

**When to use:** `calculateCurrentStreak()` — every current streak display.

**Example:**
```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 2 + 02-CONTEXT D-13–D-15
import { isDueOnDate } from './schedule';
import { getPreviousDay } from './dates';
import type { Frequency } from './types';

export function calculateCurrentStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  today: string,
  habitStartDate: string,
): number {
  let streak = 0;
  let cursor = today;

  while (cursor >= habitStartDate) {
    if (!isDueOnDate(frequency, cursor)) {
      cursor = getPreviousDay(cursor);
      continue;
    }
    // D-15: scheduled today but incomplete — skip, don't break
    if (cursor === today && !completedDates.has(cursor)) {
      cursor = getPreviousDay(cursor);
      continue;
    }
    if (completedDates.has(cursor)) {
      streak++;
      cursor = getPreviousDay(cursor);
    } else {
      break; // D-14: missed scheduled day breaks streak
    }
  }
  return streak;
}
```

### Pattern 2: Longest Streak (Forward Scan)

**What:** Iterate forward from habit start to today; track longest run of consecutive completed scheduled days.

**When to use:** `calculateLongestStreak()` — history stat card.

**Example:**
```typescript
// Source: .planning/research/ARCHITECTURE.md + 02-CONTEXT D-16
export function calculateLongestStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
): number {
  let longest = 0;
  let current = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) continue;
    if (completedDates.has(date)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}
```

### Pattern 3: Lifetime Completion Rate

**What:** `completed scheduled days ÷ total scheduled days` from habit creation through today; exclude future dates from denominator; round to whole percent (D-07, D-08).

**Example:**
```typescript
// Source: 02-CONTEXT D-07, D-08
import { isFutureDate } from './dates';

export function calculateCompletionRate(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): number {
  let scheduled = 0;
  let completed = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) continue;
    if (isFutureDate(date, today)) continue;
    scheduled++;
    if (completedDates.has(date)) completed++;
  }
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}
```

### Pattern 4: Calendar Week Dates (Mon–Sun)

**What:** Replace `getLast7Days()` with ISO-style calendar week anchored to Monday.

**Example:**
```typescript
// Source: [CITED: github.com/date-fns/date-fns startOfWeek]
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfWeek } from 'date-fns/endOfWeek';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getLocalDateString } from './dates';

const WEEK_OPTS = { weekStartsOn: 1 as const }; // Monday

export function getCalendarWeekDates(today: Date = new Date()): string[] {
  return eachDayOfInterval({
    start: startOfWeek(today, WEEK_OPTS),
    end: endOfWeek(today, WEEK_OPTS),
  }).map(getLocalDateString);
}
```

### Pattern 5: Week Day Visual State

**What:** Map each calendar-week date to `completed | missed | not-scheduled | future` for `HistoryDotGrid`.

**Example:**
```typescript
// Source: 02-CONTEXT D-10, D-11
export type WeekDayState = 'completed' | 'missed' | 'not-scheduled' | 'future';

export function getWeekDayState(
  date: string,
  frequency: Frequency,
  completedDates: Set<string>,
  today: string,
): WeekDayState {
  if (!isDueOnDate(frequency, date)) return 'not-scheduled';
  if (isFutureDate(date, new Date(`${today}T12:00:00`))) return 'future';
  return completedDates.has(date) ? 'completed' : 'missed';
}
```

**Grid rendering (D-10 discretion — prefer hidden):**
- `completed` → green filled dot (`bg-primary` / `#3fb950`)
- `missed` → empty circle with destructive ring (`ring-destructive` / `#f85149`)
- `not-scheduled` → render `null` (no dot button) but keep day label for Mon–Sun alignment
- `future` + scheduled → dimmed/disabled dot (not tappable); not counted as missed

### Pattern 6: Reactive Hooks with `useLiveQuery`

**What:** Fetch completions in hook callback, derive stats with pure functions, return loading sentinel.

**When to use:** `useStreak`, `useHabitStats`, refactored `useCompletions`.

**Example:**
```typescript
// Source: [CITED: dexie.org/docs/dexie-react-hooks/useLiveQuery] + useTodayHabits pattern
import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalDateString, getHabitStartDate } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import { completionRepository } from '@/infrastructure/completionRepository';
import type { Habit } from '@/domain/types';

export function useStreak(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(
      habit.id, startDate, today,
    );
    const completedDates = new Set(dates);
    return calculateCurrentStreak(
      completedDates, habit.frequency, today, startDate,
    );
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  return {
    currentStreak: result ?? 0,
    isLoading: result === undefined,
  };
}
```

**`useHabitStats`:** Same query pattern; compute `currentStreak`, `longestStreak`, `completionRate` in one callback to avoid triple Dexie reads on history page.

**Habit start date helper:**
```typescript
export function getHabitStartDate(habit: Habit): string {
  return getLocalDateString(new Date(habit.createdAt));
}
```

### Anti-Patterns to Avoid

- **Persisting `currentStreak` on `Habit`:** Breaks on past-day toggle and import — derive only [CITED: .planning/research/PITFALLS.md Pitfall 6]
- **Using `toISOString().slice(0,10)` for day keys:** UTC shift bugs near midnight [CITED: .planning/research/PITFALLS.md Pitfall 1]
- **Treating all calendar days as streak units for weekly habits:** Breaks on rest days [CITED: .planning/research/PITFALLS.md Pitfall 2]
- **Computing streaks inside React components:** Untestable; duplicates logic across Today and History
- **Separate Dexie queries per stat on history page:** Wasteful; one range fetch serves all three

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar week boundaries | Manual day-of-month math | `date-fns` `startOfWeek` / `endOfWeek` with `weekStartsOn: 1` | DST-safe when combined with `getLocalDateString` |
| Streak counter persistence | `habit.streak++` on toggle | `calculateCurrentStreak()` on read | Past edits desync stored counters |
| Day iteration | `while` with millisecond += 86400000 | `iterateDaysInRange` using `subDays` + string compare | DST 23/25-hour days break ms arithmetic |
| Reactive DB subscription | Custom IndexedDB listeners | `useLiveQuery` | Already established in Phase 1 |
| Streak freeze / grace period | Custom skip logic | Defer to ENH-05 | Out of scope per CONTEXT deferred |

**Key insight:** The completion event log is the only source of truth. All motivation metrics are projections — cheap to recompute, impossible to desync.

## Common Pitfalls

### Pitfall 1: Today-Incomplete Zeros Streak Display

**What goes wrong:** Daily habit at 8 AM shows streak 0 because today isn't checked in yet.

**Why it happens:** Naive backward walk breaks on first incomplete day (today).

**How to avoid:** D-15 rule — skip scheduled-today when incomplete; count from yesterday's run.

**Warning signs:** Users report streak "disappears every morning."

### Pitfall 2: Weekly Habit Streak Breaks on Rest Days

**What goes wrong:** Mon/Wed/Fri habit shows streak 0 on Tuesday.

**Why it happens:** Streak walk treats every calendar day as required.

**How to avoid:** `isDueOnDate()` gate on every streak step; only scheduled days count.

**Warning signs:** Streak resets on days greyed out in `WeekDayDots`.

### Pitfall 3: Rate Denominator Includes Future Days

**What goes wrong:** New habit shows 50% on Wednesday because Thu–Sun counted as missed.

**Why it happens:** Denominator includes all scheduled days in range without `isFutureDate` filter.

**How to avoid:** Exclude future scheduled days from denominator in `calculateCompletionRate`.

**Warning signs:** Completion rate drops on Monday mornings for the current week.

### Pitfall 4: `createdAt` ISO vs Local Start Date

**What goes wrong:** Habit created 11 PM local stored as next-day UTC; rate/streak start wrong.

**Why it happens:** Using `habit.createdAt.slice(0,10)` (UTC) instead of local conversion.

**How to avoid:** `getHabitStartDate(habit)` via `getLocalDateString(new Date(habit.createdAt))`.

**Warning signs:** Off-by-one-day rate denominator for evening-created habits.

### Pitfall 5: History Grid Still Uses Rolling 7 Days

**What goes wrong:** Week overview shows Wed–Tue instead of Mon–Sun calendar week.

**Why it happens:** `getLast7Days` not replaced in `useCompletions`.

**How to avoid:** Switch to `getCalendarWeekDates` everywhere in history flow (D-09, D-12).

**Warning signs:** Subtitle says "This week" but dates don't align with calendar Mon–Sun.

### Pitfall 6: Stats Don't Refresh After Toggle

**What goes wrong:** User toggles dot; streak number stale until refresh.

**Why it happens:** Stats computed outside `useLiveQuery` or query deps omit `habit.frequency`.

**How to avoid:** All stat hooks use `useLiveQuery`; deps include `habit.id`, `habit.frequency`, `today`.

**Warning signs:** Stale streak after history dot tap.

## Code Examples

### Calendar Week Helper (dates.ts extension)

```typescript
// Source: [CITED: github.com/date-fns/date-fns/blob/main/src/startOfWeek/index.ts]
import { addDays } from 'date-fns/addDays';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfWeek } from 'date-fns/endOfWeek';
import { startOfWeek } from 'date-fns/startOfWeek';
import { subDays } from 'date-fns/subDays';
import { getLocalDateString } from './dates';

const WEEK_OPTS = { weekStartsOn: 1 as const };

export function getCalendarWeekDates(today: Date = new Date()): string[] {
  return eachDayOfInterval({
    start: startOfWeek(today, WEEK_OPTS),
    end: endOfWeek(today, WEEK_OPTS),
  }).map(getLocalDateString);
}

export function getPreviousDay(dateStr: string): string {
  return getLocalDateString(subDays(new Date(`${dateStr}T12:00:00`), 1));
}

export function* iterateDaysInRange(start: string, end: string) {
  let cursor = start;
  while (cursor <= end) {
    yield cursor;
    cursor = getPreviousDay(cursor) === cursor
      ? cursor // safety
      : getLocalDateString(addDays(new Date(`${cursor}T12:00:00`), 1));
  }
}
```

### HistoryDotGrid State Rendering

```typescript
// Source: 02-CONTEXT D-10, D-11 + 01-UI-SPEC tokens
const state = getWeekDayState(date, frequency, completedDates, today);

if (state === 'not-scheduled') {
  return <div key={date} className="w-8" aria-hidden />; // hidden dot, keep column
}

return (
  <button
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-full',
      state === 'completed' && 'bg-primary/10',
      state === 'missed' && 'ring-2 ring-destructive',
      state === 'future' && 'opacity-40',
      isToday && 'ring-2 ring-primary',
    )}
    disabled={state === 'future'}
  >
    <span
      className={cn(
        'h-3 w-3 rounded-full',
        state === 'completed' ? 'bg-primary' : 'bg-transparent',
      )}
    />
  </button>
);
```

### StatCards Component

```typescript
// Source: 02-CONTEXT D-05, D-06 + 01-UI-SPEC typography
interface StatCardsProps {
  current: number;
  longest: number;
  rate: number; // 0–100 integer
}

export function StatCards({ current, longest, rate }: StatCardsProps) {
  const items = [
    { label: 'Current', value: current },
    { label: 'Longest', value: longest },
    { label: 'Rate', value: `${rate}%` },
  ];
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rolling 7-day history grid | Calendar week Mon–Sun | Phase 2 (D-09) | `getLast7Days` → `getCalendarWeekDates` |
| No streak display | Compute-on-read inline badge | Phase 2 | New `domain/streak.ts` |
| History page stub | Stats header + week overview | Phase 2 | `HabitHistoryPage` composition |

**Deprecated/outdated:**
- `getLast7Days()` for history UI — keep function for tests if needed, but history flow uses calendar week only

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getHabitStartDate` uses local date from ISO `createdAt` | Pattern 6 | Rate/streak window off by one day |
| A2 | Non-scheduled week days are hidden (not dimmed) | Pattern 5 | UI noise if user preferred dimmed |
| A3 | Future scheduled days in current week show disabled dot, not hidden | Pattern 5 | User may expect no dot at all for future |
| A4 | `useStreak` fetches full `createdAt → today` range | Pattern 6 | Acceptable for v1; optimize later if profiling shows need |

**If A2/A3 wrong:** Planner can flip rendering in `HistoryDotGrid` without domain changes.

## Open Questions

1. **Personal best indicator when current === longest**
   - What we know: Claude's discretion allows subtle indicator
   - What's unclear: Exact visual treatment not specified
   - Recommendation: Defer to UI plan; optional small `*` or `best` label on Current card — skip if schedule tight

2. **Non-scheduled day column alignment**
   - What we know: Prefer hidden dots; calendar week is Mon–Sun
   - What's unclear: Keep all 7 day labels vs only scheduled day labels
   - Recommendation: Keep all 7 Mon–Sun labels for consistent grid; hide dot only (matches M T W T F S S picker mental model)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22+ | Vitest, Vite | ✓ | v24.16.0 | — |
| npm | Scripts | ✓ | — | — |
| date-fns | Calendar week helpers | ✓ (installed) | 4.4.0 | — |
| Dexie + hooks | Reactive stats | ✓ (installed) | 4.4.4 / 4.4.0 | — |
| Vitest + jsdom | Domain tests | ✓ (configured) | 4.1.10 | — |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** none

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| Quick run command | `npm test -- src/domain/streak.test.ts src/domain/stats.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STRK-01 | Current streak respects schedule + today-incomplete grace | unit | `npm test -- src/domain/streak.test.ts -x` | ❌ Wave 0 |
| STRK-01 | Inline flame badge renders on Today row | component | `npm test -- src/components/habits/HabitRow.test.tsx -x` | ✅ extend |
| STRK-02 | Longest streak finds all-time max run | unit | `npm test -- src/domain/streak.test.ts -x` | ❌ Wave 0 |
| STRK-02 | Longest value shown in stat card | component | `npm test -- src/components/habits/StatCards.test.tsx -x` | ❌ Wave 0 |
| STRK-03 | Completion rate = completed÷scheduled since creation, rounded | unit | `npm test -- src/domain/stats.test.ts -x` | ❌ Wave 0 |
| STRK-03 | Rate excludes future scheduled days from denominator | unit | `npm test -- src/domain/stats.test.ts -x` | ❌ Wave 0 |
| STRK-04 | Calendar week is Mon–Sun (not rolling 7) | unit | `npm test -- src/domain/dates.test.ts -x` | ❌ extend |
| STRK-04 | Missed scheduled day shows destructive outline | component | `npm test -- src/components/habits/HistoryDotGrid.test.tsx -x` | ✅ extend |
| STRK-04 | Non-scheduled days hidden in week grid | component | `npm test -- src/components/habits/HistoryDotGrid.test.tsx -x` | ✅ extend |
| STRK-04 | Toggle on dot still calls `useToggleCompletion` | component | `npm test -- src/components/habits/HistoryDotGrid.test.tsx -x` | ✅ extend |

### Test Dimensions (Nyquist Edge Cases)

| Dimension | Fixture Scenario | Expected | Test File |
|-----------|------------------|----------|-----------|
| Weekly rest day | MWF habit, Mon+Wed complete, check Tue | Current streak = 2 (Tue skipped) | `streak.test.ts` |
| Today incomplete (daily) | Daily, 5-day streak, today not done | Current = 5 (yesterday's run) | `streak.test.ts` |
| Today complete (daily) | Daily, 5-day streak, today done | Current = 6 | `streak.test.ts` |
| First completion | New habit, first check-in today | Current = 1 (was 0 before) | `streak.test.ts` |
| Missed scheduled day | MWF, Mon done, Wed missed, Fri done | Current breaks at Wed gap | `streak.test.ts` |
| Longest > current | Past 10-day run, recent miss | Longest = 10, current < 10 | `streak.test.ts` |
| DST spring forward | Daily completions across `2026-03-08` (US) | Streak continuous; no duplicate/missing day | `streak.test.ts` |
| DST fall back | Daily completions across `2026-11-01` (US) | Streak continuous | `streak.test.ts` |
| Rate 0% new habit | Created today, no completions | Rate = 0% | `stats.test.ts` |
| Rate 100% | All scheduled days since creation complete | Rate = 100% | `stats.test.ts` |
| Rate rounding | 2/3 scheduled days complete | Rate = 67% (rounded) | `stats.test.ts` |
| Week state: missed | Scheduled yesterday, not complete | `missed` + destructive ring | `stats.test.ts` |
| Week state: not-scheduled | Tue for MWF habit | `not-scheduled` → hidden dot | `stats.test.ts` |
| Week state: future | Scheduled day later this week | `future` → disabled, not missed | `stats.test.ts` |
| Calendar week boundary | Today = Sunday Jul 19 2026 | Week = Mon Jul 13 – Sun Jul 19 | `dates.test.ts` |
| Reactive refresh | Toggle completion | `useLiveQuery` returns new streak | hook test or integration |

### Sampling Rate

- **Per task commit:** `npm test -- src/domain/streak.test.ts src/domain/stats.test.ts -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/domain/streak.ts` + `src/domain/streak.test.ts` — covers STRK-01, STRK-02
- [ ] `src/domain/stats.ts` + `src/domain/stats.test.ts` — covers STRK-03, STRK-04 states
- [ ] `src/domain/dates.ts` extensions + `dates.test.ts` calendar week cases — covers STRK-04
- [ ] `src/hooks/useStreak.ts` + `src/hooks/useHabitStats.ts` — reactive wiring
- [ ] `src/components/habits/StatCards.tsx` (+ optional test) — covers STRK-02, STRK-03 display

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in v1 |
| V3 Session Management | no | Local-only app |
| V4 Access Control | no | Single-user local data |
| V5 Input Validation | yes | Date strings validated via `isFutureDate`; no user string in streak math |
| V6 Cryptography | no | No encryption required for v1 local habits |

### Known Threat Patterns for Phase 2

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via habit name in streak badge | Tampering/Spoofing | React text escaping (existing); no `dangerouslySetInnerHTML` |
| Date injection in toggle | Tampering | `completionRepository.toggle` rejects future dates (Phase 1) |
| ReDoS in date iteration | Denial of Service | Bounded ranges (`createdAt → today`, 7-day week); no unbounded user input |

## Sources

### Primary (HIGH confidence)
- Existing codebase — `schedule.ts`, `dates.ts`, `useTodayHabits.ts`, `completionRepository.ts`, `HistoryDotGrid.tsx`
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — locked streak/stat/week decisions
- `.planning/research/ARCHITECTURE.md` — compute-on-read Pattern 2, project structure
- `npm view date-fns version` / `npm view dexie version` — version verification

### Secondary (MEDIUM confidence)
- [date-fns startOfWeek](https://github.com/date-fns/date-fns/blob/main/src/startOfWeek/index.ts) — `weekStartsOn: 1` for Monday
- [Dexie useLiveQuery](https://dexie.org/docs/dexie-react-hooks/useLiveQuery/) — reactive query pattern
- `.planning/research/PITFALLS.md` — timezone, weekly frequency, mutable streak pitfalls

### Tertiary (LOW confidence)
- Web search synthesis for calendar week + streak best practices — cross-checked against CONTEXT locked rules

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; extends Phase 1 patterns
- Architecture: HIGH — domain algorithms specified with CONTEXT-locked rules
- Pitfalls: HIGH — matches PITFALLS.md and Phase 1 date conventions

**Research date:** 2026-07-19
**Valid until:** 2026-08-18 (30 days — stable domain logic)
