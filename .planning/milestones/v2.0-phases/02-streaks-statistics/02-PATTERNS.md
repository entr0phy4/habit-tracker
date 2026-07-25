# Phase 2: Streaks & Statistics - Pattern Map

**Mapped:** 2026-07-19
**Files analyzed:** 16
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/dates.ts` | utility | transform | `src/domain/dates.ts` (self) | exact |
| `src/domain/dates.test.ts` | test | — | `src/domain/dates.test.ts` + `schedule.test.ts` | exact |
| `src/domain/streak.ts` | utility | transform | `src/domain/schedule.ts` | role-match |
| `src/domain/streak.test.ts` | test | — | `src/domain/schedule.test.ts` | role-match |
| `src/domain/stats.ts` | utility | transform | `src/domain/schedule.ts` + `dates.ts` | role-match |
| `src/domain/stats.test.ts` | test | — | `src/domain/schedule.test.ts` | role-match |
| `src/hooks/useStreak.ts` | hook | CRUD | `src/hooks/useCompletions.ts` | role-match |
| `src/hooks/useHabitStats.ts` | hook | CRUD | `src/hooks/useCompletions.ts` + `completionRepository.ts` | role-match |
| `src/hooks/useCompletions.ts` | hook | CRUD | `src/hooks/useCompletions.ts` (self) | exact |
| `src/components/habits/StatCards.tsx` | component | transform | `src/components/habits/WeekDayDots.tsx` | role-match |
| `src/components/habits/HabitRow.tsx` | component | event-driven | `src/components/habits/HabitRow.tsx` (self) | exact |
| `src/components/habits/HabitRow.test.tsx` | test | event-driven | `src/components/habits/HabitRow.test.tsx` (self) | exact |
| `src/components/habits/HistoryDotGrid.tsx` | component | CRUD | `src/components/habits/HistoryDotGrid.tsx` (self) | exact |
| `src/components/habits/HistoryDotGrid.test.tsx` | test | CRUD | `src/components/habits/HistoryDotGrid.test.tsx` (self) | exact |
| `src/pages/HabitHistoryPage.tsx` | route | CRUD | `src/pages/HabitHistoryPage.tsx` (self) | exact |
| `src/pages/TodayPage.tsx` | route | CRUD | `src/pages/TodayPage.tsx` (self) | exact |

---

## Pattern Assignments

### `src/domain/dates.ts` (utility, transform) — EXTEND

**Analog:** `src/domain/dates.ts` (existing) + `src/domain/schedule.ts` (noon-local parse convention)

**Imports pattern** (lines 1-3):
```typescript
import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';
import { isAfter, startOfDay } from 'date-fns';
```

**Per-function date-fns import convention** — never barrel-import `date-fns`. Add new helpers with per-function imports:
```typescript
import { addDays } from 'date-fns/addDays';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfWeek } from 'date-fns/endOfWeek';
import { startOfWeek } from 'date-fns/startOfWeek';
```

**Core date key pattern** (lines 5-7):
```typescript
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}
```

**Noon-local parse for day arithmetic** — copy from `schedule.ts` line 5:
```typescript
const day = new Date(`${dateStr}T12:00:00`).getDay();
```

**Future date guard** (lines 15-17) — reuse in `getWeekDayState` and `calculateCompletionRate`:
```typescript
export function isFutureDate(dateStr: string, today: Date = new Date()): boolean {
  return isAfter(startOfDay(new Date(`${dateStr}T00:00:00`)), startOfDay(today));
}
```

**New exports to add:** `getCalendarWeekDates`, `getPreviousDay`, `iterateDaysInRange`, `getHabitStartDate`. Keep `getLast7Days` for backward compat in tests; history flow switches to calendar week only.

---

### `src/domain/dates.test.ts` (test) — EXTEND

**Analog:** `src/domain/dates.test.ts` + `src/domain/schedule.test.ts`

**Test structure** (dates.test.ts lines 1-3):
```typescript
import { describe, expect, it } from 'vitest';
import { getLast7Days, getLocalDateString, isFutureDate } from './dates';
```

**Fixture date pattern** — use `new Date(year, monthIndex, day)` to avoid UTC drift (dates.test.ts lines 5-8):
```typescript
const date = new Date(2026, 6, 19, 23, 30);
expect(getLocalDateString(date)).toBe('2026-07-19');
```

**Week boundary fixture** — copy schedule.test.ts weekday table style (schedule.test.ts lines 21-36):
```typescript
const week = [
  { date: '2026-07-13', day: 'Monday' },
  // ... through Sunday 2026-07-19
];
for (const { date } of week) {
  expect(getCalendarWeekDates(new Date(`${date}T12:00:00`))).toHaveLength(7);
}
```

**Add tests for:** Mon–Sun calendar week when today = Sunday Jul 19 2026; `getPreviousDay` across month boundary; `iterateDaysInRange` inclusive start/end.

---

### `src/domain/streak.ts` (utility, transform) — CREATE

**Analog:** `src/domain/schedule.ts` (pure domain, schedule-gated logic)

**Imports pattern** (schedule.ts lines 1-2):
```typescript
import type { Frequency } from './types';
```

**Schedule gate** — every streak step must call `isDueOnDate` (schedule.ts lines 3-7):
```typescript
export function isDueOnDate(frequency: Frequency, dateStr: string): boolean {
  if (frequency.type === 'daily') return true;
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return frequency.days.includes(day);
}
```

**Core pattern for `calculateCurrentStreak`:** Pure function accepting `Set<string>` + `Frequency` + date bounds. No React, no Dexie. Backward walk using `getPreviousDay` from `dates.ts`. Gate with `isDueOnDate`; skip today when scheduled but incomplete (D-15); break on first missed scheduled day (D-14).

**Core pattern for `calculateLongestStreak`:** Forward scan via `iterateDaysInRange(startDate, endDate)`. Track `current` and `longest` counters; reset `current` on missed scheduled day; skip non-scheduled days without resetting.

**Exports:** `calculateCurrentStreak`, `calculateLongestStreak`.

---

### `src/domain/streak.test.ts` (test) — CREATE

**Analog:** `src/domain/schedule.test.ts`

**Test structure** (schedule.test.ts lines 1-3):
```typescript
import { describe, expect, it } from 'vitest';
import { isDaily, isDueOnDate } from './schedule';
```

**MWF fixture** — reuse exact weekly schedule from schedule.test.ts lines 9-18:
```typescript
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
```

**Edge-case table** — one `it` per CONTEXT decision:
- New habit, no completions → 0 (D-13)
- Daily, 5-day run, today incomplete → 5 (D-15)
- Daily, 5-day run, today complete → 6
- MWF Mon+Wed complete, check Tuesday → streak counts Mon+Wed only (rest day skip)
- Missed scheduled day breaks current streak (D-14)
- Longest > current when past run exceeded recent run (D-16)

---

### `src/domain/stats.ts` (utility, transform) — CREATE

**Analog:** `src/domain/schedule.ts` + `src/domain/dates.ts`

**Type export pattern** (schedule.ts line 1):
```typescript
import type { Frequency } from './types';
```

**Week day state type:**
```typescript
export type WeekDayState = 'completed' | 'missed' | 'not-scheduled' | 'future';
```

**`calculateCompletionRate`:** Iterate `iterateDaysInRange`; gate with `isDueOnDate`; exclude future via `isFutureDate`; return `Math.round((completed / scheduled) * 100)` or 0 when denominator is 0 (D-07, D-08).

**`getWeekDayState`:** Compose `isDueOnDate` + `isFutureDate` + `completedDates.has(date)`. Non-scheduled → `'not-scheduled'`; future scheduled → `'future'`; else completed or missed.

---

### `src/domain/stats.test.ts` (test) — CREATE

**Analog:** `src/domain/schedule.test.ts` + `src/domain/dates.test.ts`

**Rate fixtures:**
- 0% new habit, no completions
- 100% all scheduled days complete
- 2/3 → 67% rounded
- Denominator excludes future scheduled days (use `isFutureDate` with fixed `today`)

**Week state fixtures:** MWF habit — Tue → `not-scheduled`; scheduled yesterday incomplete → `missed`; scheduled future → `future`.

---

### `src/hooks/useStreak.ts` (hook, CRUD) — CREATE

**Analog:** `src/hooks/useCompletions.ts` + `src/infrastructure/completionRepository.ts`

**useLiveQuery pattern** (useCompletions.ts lines 1-3, 8-20):
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalDateString } from '@/domain/dates';
import { completionRepository } from '@/infrastructure/completionRepository';
```

**Repository range fetch** (completionRepository.ts lines 18-29):
```typescript
async getByHabitInRange(
  habitId: string,
  start: string,
  end: string,
): Promise<string[]> {
  const completions = await db.completions
    .where('[habitId+date]')
    .between([habitId, start], [habitId, end], true, true)
    .toArray();
  return completions.map((completion) => completion.date);
}
```

**Hook shape:**
```typescript
export function useStreak(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(habit.id, startDate, today);
    const completedDates = new Set(dates);
    return calculateCurrentStreak(completedDates, habit.frequency, today, startDate);
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  return { currentStreak: result ?? 0, isLoading: result === undefined };
}
```

**Deps must include** `habit.frequency` and `habit.createdAt` so stats refresh on edit/import.

---

### `src/hooks/useHabitStats.ts` (hook, CRUD) — CREATE

**Analog:** `src/hooks/useCompletions.ts` (single `useLiveQuery` callback)

**Single-query pattern** — one `getByHabitInRange` call, derive all three stats in callback:
```typescript
const result = useLiveQuery(async () => {
  const dates = await completionRepository.getByHabitInRange(habit.id, startDate, today);
  const completedDates = new Set(dates);
  return {
    current: calculateCurrentStreak(completedDates, habit.frequency, today, startDate),
    longest: calculateLongestStreak(completedDates, habit.frequency, startDate, today),
    rate: calculateCompletionRate(completedDates, habit.frequency, startDate, today),
  };
}, [habit.id, habit.frequency, habit.createdAt, today]);
```

**Return shape:** `{ current, longest, rate, isLoading }` with `isLoading: result === undefined`.

**Error handling reference** — optional: follow `useTodayHabits` try/catch + `QUERY_ERROR` sentinel (useTodayHabits.ts lines 22-37) if history page needs error state; otherwise keep simple like `useCompletions`.

---

### `src/hooks/useCompletions.ts` (hook, CRUD) — MODIFY

**Analog:** `src/hooks/useCompletions.ts` (self)

**Current pattern** (lines 5-28):
```typescript
export function useCompletions(habitId: string) {
  const dates = getLast7Days();

  const completions = useLiveQuery(
    () =>
      db.completions
        .where('[habitId+date]')
        .between(
          [habitId, dates[0]],
          [habitId, dates[dates.length - 1]],
          true,
          true,
        )
        .toArray(),
    [habitId, dates[0], dates[dates.length - 1]],
  );

  const completedDates = new Set((completions ?? []).map((completion) => completion.date));

  return { dates, completedDates, isLoading: completions === undefined };
}
```

**Change:** Replace `getLast7Days()` with `getCalendarWeekDates()`. Keep same `useLiveQuery` + `Set` + `isLoading` return shape. Update deps to `[habitId, dates[0], dates[dates.length - 1]]` where `dates` is now Mon–Sun calendar week.

**Alternative (planner discretion):** Route through `completionRepository.getByHabitInRange` for consistency with stat hooks — either approach is valid; prefer repository if centralizing per Phase 1 review note.

---

### `src/components/habits/StatCards.tsx` (component, transform) — CREATE

**Analog:** `src/components/habits/WeekDayDots.tsx` (label-above-indicator layout)

**Label-above-value layout** (WeekDayDots.tsx lines 30-38):
```typescript
<div key={dayIndex} className="flex flex-col items-center gap-1">
  <span className="text-xs text-muted-foreground">{label}</span>
  <span className={cn('h-2 w-2 rounded-full', ...)} aria-hidden />
</div>
```

**StatCards pattern** — three equal cards, D-05/D-06 typography:
```typescript
interface StatCardsProps {
  current: number;
  longest: number;
  rate: number;
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

**Card border tokens** — match HabitRow container (HabitRow.tsx line 68): `rounded-lg border border-border bg-card`.

---

### `src/components/habits/HabitRow.tsx` (component, event-driven) — MODIFY

**Analog:** `src/components/habits/HabitRow.tsx` (self) + lucide icon usage from line 2

**Lucide import pattern** (line 2):
```typescript
import { CalendarDays } from 'lucide-react';
```

**Add:** `import { Flame } from 'lucide-react'` and `import { useStreak } from '@/hooks/useStreak'`.

**Name + inline badge layout** — insert between name span and WeekDayDots (lines 96-104):
```typescript
<span className={cn('min-w-0 flex-1 truncate text-sm', isCompleted && 'text-muted-foreground line-through')}>
  {habit.name}
</span>
{/* NEW: inline streak badge — visible when completed (D-04), not muted */}
<span className="flex shrink-0 items-center gap-1 text-sm text-foreground">
  <Flame className="h-4 w-4 text-primary" aria-hidden />
  <span>{currentStreak}</span>
</span>
<WeekDayDots frequency={habit.frequency} className="shrink-0" />
```

**Hook call inside component:**
```typescript
const { currentStreak } = useStreak(habit);
```

**Do not mute streak** when `isCompleted` — badge uses `text-foreground`, not `text-muted-foreground` (D-04).

---

### `src/components/habits/HabitRow.test.tsx` (test, event-driven) — EXTEND

**Analog:** `src/components/habits/HabitRow.test.tsx` (self)

**Mock pattern** (lines 9-15):
```typescript
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigateMock };
});
```

**Add mock for useStreak:**
```typescript
vi.mock('@/hooks/useStreak', () => ({
  useStreak: () => ({ currentStreak: 5, isLoading: false }),
}));
```

**New assertions:** Flame icon present (by `aria-hidden` sibling or role); streak number "5" visible; streak still visible when `isCompleted={true}`.

---

### `src/components/habits/HistoryDotGrid.tsx` (component, CRUD) — MODIFY

**Analog:** `src/components/habits/HistoryDotGrid.tsx` (self) + `WeekDayDots.tsx` (day labels)

**Props extension** — add `frequency: Frequency` prop (passed from HabitHistoryPage).

**Current dot render** (lines 34-66) — preserve toggle + today ring + `cn()` classes:
```typescript
<button
  type="button"
  data-testid={`history-dot-${date}`}
  aria-pressed={isComplete}
  disabled={isFutureDate(date)}
  className={cn(
    'flex h-8 w-8 items-center justify-center rounded-full active:scale-90',
    isToday && 'ring-2 ring-primary',
  )}
  onClick={() => void handleDotClick(date)}
>
```

**Three-state rendering** — call `getWeekDayState(date, frequency, completedDates, today)`:
- `not-scheduled` → `<div className="w-8" aria-hidden />` (hidden dot, keep column + day label)
- `missed` → empty circle with `ring-2 ring-destructive` (D-11)
- `completed` → `bg-primary` fill (existing)
- `future` → `opacity-40`, `disabled`, not missed

**Error handling** (lines 22-31) — keep toast on toggle failure:
```typescript
try {
  await toggle(habitId, date);
} catch {
  toast.error("Couldn't update. Try again.");
}
```

**DAY_LABELS** (line 7) — keep Mon–Sun labels via `getDay()` index, same as WeekDayDots line 4.

---

### `src/components/habits/HistoryDotGrid.test.tsx` (test, CRUD) — MODIFY

**Analog:** `src/components/habits/HistoryDotGrid.test.tsx` (self)

**Mock pattern** (lines 11-31) — extend `useCompletions` mock to return calendar week dates; add `frequency` prop to render.

**Fixed today mock** (lines 7-9, 25-30):
```typescript
const fixedToday = new Date(2026, 6, 19);
const todayKey = '2026-07-19';
```

**Update:** Replace `getLast7Days(fixedToday)` with `getCalendarWeekDates(fixedToday)` in mock.

**New assertions:**
- Missed scheduled day has `ring-destructive` class
- Non-scheduled day renders no button (hidden dot placeholder)
- Toggle still calls `mockToggle` with habitId + date

---

### `src/pages/HabitHistoryPage.tsx` (route, CRUD) — MODIFY

**Analog:** `src/pages/HabitHistoryPage.tsx` (self)

**useLiveQuery habit fetch** (lines 9-12):
```typescript
const habit = useLiveQuery(() => (id ? db.habits.get(id) : undefined), [id]);
```

**Page composition** (lines 36-52) — extend between heading and grid:
```typescript
<h2 className="line-clamp-2 break-words text-xl font-semibold">{habit.name}</h2>
{/* NEW: StatCards below name */}
<p className="mt-1 text-xs text-muted-foreground">This week</p>  {/* was "Last 7 days" */}
<div className="mt-8 flex justify-center">
  <HistoryDotGrid habitId={habit.id} frequency={habit.frequency} />
</div>
```

**Wire stats:**
```typescript
import { StatCards } from '@/components/habits/StatCards';
import { useHabitStats } from '@/hooks/useHabitStats';

const { current, longest, rate, isLoading } = useHabitStats(habit);
// Render StatCards when !isLoading
```

**Loading/redirect guards** — preserve existing `undefined` / `Navigate` pattern (lines 18-34).

---

### `src/pages/TodayPage.tsx` (route, CRUD) — MINOR

**Analog:** `src/pages/TodayPage.tsx` (self)

**todayKey threading** (lines 11-12, 67-72) — already passes `todayKey` to toggle; optionally pass to `HabitRow` for midnight consistency:
```typescript
const [todayKey, setTodayKey] = useState(() => getLocalDateString(new Date()));
// ...
<HabitRow habit={habit} isCompleted={isCompleted} todayKey={todayKey} onToggle={...} />
```

**Visibility refresh** (lines 15-24) — already updates `todayKey`; ensures streak recalc after tab focus.

---

## Shared Patterns

### Layered Architecture (mandatory)

**Source:** Phase 1 `01-PATTERNS.md` + established codebase

```
Pages/Components → Hooks → Domain (pure) ← Infrastructure (Dexie)
```

Components never import `completionRepository` directly. Stat hooks call repository; domain functions receive `Set<string>` only.

---

### Path Alias `@/`

**Source:** All existing `src/` files

```typescript
import { calculateCurrentStreak } from '@/domain/streak';
import { completionRepository } from '@/infrastructure/completionRepository';
import { useStreak } from '@/hooks/useStreak';
```

---

### Reactive Data Binding via `useLiveQuery`

**Source:** `src/hooks/useCompletions.ts`, `src/hooks/useTodayHabits.ts`

```typescript
const result = useLiveQuery(async () => { /* fetch + derive */ }, [deps]);
return { value: result ?? defaultValue, isLoading: result === undefined };
```

Toggle via `useToggleCompletion` → Dexie write → all `useLiveQuery` hooks re-fire. No persisted streak fields on `Habit`.

---

### Schedule Gate (`isDueOnDate`)

**Source:** `src/domain/schedule.ts` lines 3-7

**Apply to:** `calculateCurrentStreak`, `calculateLongestStreak`, `calculateCompletionRate`, `getWeekDayState`

Every streak/rate step must skip non-scheduled days. Weekly rest days never break or increment streak.

---

### Local Date Keys (never UTC)

**Source:** `src/domain/dates.ts` lines 5-7, 15-17

```typescript
getLocalDateString(new Date(habit.createdAt))  // habit start — NOT createdAt.slice(0,10)
format(date, 'yyyy-MM-dd')                     // never toISOString().slice(0,10)
new Date(`${dateStr}T12:00:00`)               // noon-local for getDay() / day arithmetic
```

---

### Repository Range Query

**Source:** `src/infrastructure/completionRepository.ts` lines 18-29

**Apply to:** `useStreak`, `useHabitStats`

Single `getByHabitInRange(habitId, startDate, today)` per hook invocation. History page uses one combined `useHabitStats` query, not three separate fetches.

---

### Component `cn()` + Design Tokens

**Source:** `src/components/habits/HabitRow.tsx`, `HistoryDotGrid.tsx`

```typescript
import { cn } from '@/lib/utils';
// Completed: bg-primary, text-primary
// Missed: ring-destructive
// Muted labels: text-muted-foreground
// Cards: border-border bg-card
```

---

### Test Mocking Conventions

**Source:** `HabitRow.test.tsx`, `HistoryDotGrid.test.tsx`

- Mock hooks at module level with `vi.mock('@/hooks/...')`
- Mock `react-router` `useNavigate` when component navigates
- Use `data-testid` selectors (`habit-row-toggle`, `history-dot-${date}`)
- Fixed date fixtures via `new Date(2026, 6, 19)` (month index 6 = July)
- `afterEach(cleanup)` in component tests

---

### Error Toast on Toggle Failure

**Source:** `src/components/habits/HistoryDotGrid.tsx` lines 27-31

```typescript
} catch {
  toast.error("Couldn't update. Try again.");
}
```

---

## No Analog Found

All 16 Phase 2 files have close analogs in the existing Phase 1 codebase. New domain modules (`streak.ts`, `stats.ts`) follow the established pure-function pattern from `schedule.ts`. New hooks follow `useCompletions.ts`. New `StatCards` component follows `WeekDayDots.tsx` layout conventions.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | No files without analog |

---

## Build Order (suggested waves)

```
Wave 0: domain/dates extensions + dates.test.ts
Wave 1: domain/streak.ts + streak.test.ts, domain/stats.ts + stats.test.ts
Wave 2: hooks/useStreak.ts, hooks/useHabitStats.ts, hooks/useCompletions.ts modify
Wave 3: StatCards.tsx, HabitRow.tsx + test, HistoryDotGrid.tsx + test
Wave 4: HabitHistoryPage.tsx, TodayPage.tsx minor
```

---

## Metadata

**Analog search scope:** `src/domain/`, `src/hooks/`, `src/components/habits/`, `src/pages/`, `src/infrastructure/completionRepository.ts`
**Files scanned:** 24
**Pattern extraction date:** 2026-07-19
**Primary references:** Phase 1 implemented source, `02-RESEARCH.md`, `02-CONTEXT.md`
