# Phase 3: Dashboard & Progress Visualization - Pattern Map

**Mapped:** 2026-07-19
**Files analyzed:** 20
**Analogs found:** 18 / 20

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/heatmap.ts` | utility | transform | `src/domain/stats.ts` + `src/domain/dates.ts` | role-match |
| `src/domain/heatmap.test.ts` | test | — | `src/domain/stats.test.ts` | role-match |
| `src/hooks/useDashboardHabits.ts` | hook | CRUD | `src/hooks/useTodayHabits.ts` + `src/hooks/useHabitStats.ts` | role-match |
| `src/hooks/useDashboardHabits.test.ts` | test | — | `src/hooks/useTodayHabits.test.ts` | role-match |
| `src/hooks/useHeatmapData.ts` | hook | CRUD | `src/hooks/useStreak.ts` + `src/hooks/useHabitStats.ts` | role-match |
| `src/components/layout/BottomTabBar.tsx` | component | request-response | `src/pages/ManageHabitsPage.tsx` + `src/components/layout/AppShell.tsx` | partial |
| `src/components/layout/BottomTabBar.test.tsx` | test | — | `src/pages/TodayPage.test.tsx` | role-match |
| `src/components/layout/MainLayout.tsx` | layout | request-response | `src/App.tsx` + `src/components/layout/AppShell.tsx` | partial |
| `src/components/dashboard/DashboardCard.tsx` | component | event-driven | `src/components/habits/HabitRow.tsx` + `src/pages/ManageHabitsPage.tsx` | role-match |
| `src/components/dashboard/DashboardCard.test.tsx` | test | event-driven | `src/components/habits/HabitRow.test.tsx` | role-match |
| `src/components/heatmap/ContributionHeatmap.tsx` | component | CRUD | `src/components/habits/HistoryDotGrid.tsx` | exact |
| `src/components/heatmap/ContributionHeatmap.test.tsx` | test | CRUD | `src/components/habits/HistoryDotGrid.test.tsx` | exact |
| `src/pages/DashboardPage.tsx` | route | CRUD | `src/pages/TodayPage.tsx` + `src/pages/ManageHabitsPage.tsx` | role-match |
| `src/pages/DashboardPage.test.tsx` | test | — | `src/pages/TodayPage.test.tsx` | role-match |
| `src/pages/HabitHistoryPage.tsx` | route | CRUD | `src/pages/HabitHistoryPage.tsx` (self) | exact |
| `src/pages/HabitHistoryPage.test.tsx` | test | — | `src/components/habits/HabitRow.test.tsx` | role-match |
| `src/App.tsx` | config | request-response | `src/App.tsx` (self) | exact |
| `src/components/layout/AppShell.tsx` | component | — | `src/components/layout/AppShell.tsx` (self) | exact |
| `src/components/habits/HistoryDotGrid.tsx` | component | CRUD | — (delete after migration) | — |
| `src/components/habits/HistoryDotGrid.test.tsx` | test | — | — (migrate to heatmap tests) | — |

---

## Pattern Assignments

### `src/domain/heatmap.ts` (utility, transform) — CREATE

**Analog:** `src/domain/stats.ts` + `src/domain/dates.ts`

**Imports pattern** (stats.ts lines 1-3):
```typescript
import type { Frequency } from './types';
import { isDueOnDate } from './schedule';
import { isFutureDate, iterateDaysInRange } from './dates';
```

**Add per-function date-fns import** (dates.ts lines 1-7 convention):
```typescript
import { subWeeks } from 'date-fns/subWeeks';
import type { Activity } from 'react-activity-calendar';
import { getWeekDayState, type WeekDayState } from './stats';
import { getLocalDateString } from './dates';
```

**Reuse `getWeekDayState` for every cell** (stats.ts lines 27-36) — do not duplicate schedule logic:
```typescript
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

**Iterate 52-week range** using existing `iterateDaysInRange` (dates.ts lines 38-46):
```typescript
export function* iterateDaysInRange(start: string, end: string): Generator<string> {
  let cursor = start;
  while (cursor <= end) {
    yield cursor;
    if (cursor === end) break;
    const date = new Date(`${cursor}T12:00:00`);
    cursor = getLocalDateString(addDays(date, 1));
  }
}
```

**Core builder pattern** — pure function, no React/Dexie; binary `Activity` levels:
```typescript
export const HEATMAP_WEEKS = 52;

export function getHeatmapDateRange(today: string): { start: string; end: string } {
  const startDate = subWeeks(new Date(`${today}T12:00:00`), HEATMAP_WEEKS);
  return { start: getLocalDateString(startDate), end: today };
}

export function buildHeatmapActivities(
  frequency: Frequency,
  completedDates: Set<string>,
  start: string,
  end: string,
  today: string,
): { activities: Activity[]; cellStates: Map<string, WeekDayState> } {
  const cellStates = new Map<string, WeekDayState>();
  const activities: Activity[] = [];
  for (const date of iterateDaysInRange(start, end)) {
    const state = getWeekDayState(date, frequency, completedDates, today);
    cellStates.set(date, state);
    activities.push({
      date,
      count: state === 'completed' ? 1 : 0,
      level: state === 'completed' ? 1 : 0,
    });
  }
  return { activities, cellStates };
}
```

**Spanish tooltip helper** — reuse noon-local parse + `date-fns/locale`:
```typescript
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale';

const STATUS_LABELS: Record<WeekDayState, string> = {
  completed: 'Completado',
  missed: 'Perdido',
  'not-scheduled': 'No programado',
  future: 'Futuro',
};

export function formatHeatmapTooltip(date: string, state?: WeekDayState): string {
  const label = format(new Date(`${date}T12:00:00`), 'EEE d MMM', { locale: es });
  return `${label} — ${STATUS_LABELS[state ?? 'not-scheduled']}`;
}
```

---

### `src/domain/heatmap.test.ts` (test) — CREATE

**Analog:** `src/domain/stats.test.ts`

**Test structure** (stats.test.ts lines 1-9):
```typescript
import { describe, expect, it } from 'vitest';
import { calculateCompletionRate, getWeekDayState } from './stats';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

function completed(...dates: string[]): Set<string> {
  return new Set(dates);
}
```

**Fixed today fixture** — use `new Date(year, monthIndex, day)` (stats.test.ts line 12):
```typescript
const fixedToday = '2026-07-19';
```

**Add tests for:** 52-week range length; completed → `level: 1`; missed → `level: 0`; `not-scheduled` in `cellStates`; `formatHeatmapTooltip` Spanish output (D-15).

---

### `src/hooks/useDashboardHabits.ts` (hook, CRUD) — CREATE

**Analog:** `src/hooks/useTodayHabits.ts` (batch active habits) + `src/hooks/useHabitStats.ts` (streak derivation)

**Active habits filter** (useHabits.ts lines 4-9):
```typescript
const habits = useLiveQuery(() =>
  db.habits.filter((habit) => !habit.archived).toArray(),
);
```

**Batch query + streak sort** — combine `useTodayHabits` habit fetch with `useHabitStats` range pattern:
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';

export function useDashboardHabits(todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());

  const result = useLiveQuery(async () => {
    const habits = await db.habits.filter((h) => !h.archived).toArray();
    const items = await Promise.all(
      habits.map(async (habit) => {
        const start = getHabitStartDate(habit);
        const dates = await completionRepository.getByHabitInRange(
          habit.id, start, today,
        );
        const completed = new Set(dates);
        return {
          habit,
          currentStreak: calculateCurrentStreak(
            completed, habit.frequency, today, start,
          ),
        };
      }),
    );
    return items.sort((a, b) => b.currentStreak - a.currentStreak);
  }, [today]);

  return { items: result ?? [], isLoading: result === undefined };
}
```

**Why not per-card `useStreak`:** Parent needs sorted array (D-06); child hooks cannot sort parent list.

---

### `src/hooks/useDashboardHabits.test.ts` (test) — CREATE

**Analog:** `src/hooks/useTodayHabits.test.ts`

**Dexie setup** (useTodayHabits.test.ts lines 7-20):
```typescript
beforeEach(async () => {
  vi.setSystemTime(new Date('2026-07-21T12:00:00'));
  await db.delete();
  await db.open();
  await db.habits.clear();
  await db.completions.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
```

**Add tests for:** archived habits excluded (D-08); sort descending by streak (D-06); `isLoading` when `result === undefined`.

---

### `src/hooks/useHeatmapData.ts` (hook, CRUD) — CREATE

**Analog:** `src/hooks/useStreak.ts` + `src/hooks/useHabitStats.ts`

**Single-habit range query** (useStreak.ts lines 7-29):
```typescript
const result = useLiveQuery(async () => {
  const dates = await completionRepository.getByHabitInRange(
    habit.id,
    startDate,
    today,
  );
  const completedDates = new Set(dates);
  return calculateCurrentStreak(/* ... */);
}, [habit.id, habit.frequency, habit.createdAt, today]);
```

**52-week hook shape:**
```typescript
import { buildHeatmapActivities, getHeatmapDateRange } from '@/domain/heatmap';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';

export function useHeatmapData(habitId: string, frequency: Frequency, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const { start, end } = getHeatmapDateRange(today);
  const { toggle } = useToggleCompletion();

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(habitId, start, end);
    const completedDates = new Set(dates);
    return buildHeatmapActivities(frequency, completedDates, start, end, today);
  }, [habitId, frequency, start, end, today]);

  return {
    activities: result?.activities ?? [],
    cellStates: result?.cellStates ?? new Map(),
    isLoading: result === undefined,
    toggle: (date: string) => toggle(habitId, date),
  };
}
```

---

### `src/components/layout/BottomTabBar.tsx` (component, request-response) — CREATE

**Analog:** `src/pages/ManageHabitsPage.tsx` (Link styling) + `src/components/layout/AppShell.tsx` (480px max-width)

**Max-width container** (AppShell.tsx lines 11-16):
```typescript
<div className="min-h-dvh bg-background text-foreground">
  <header className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-6 md:mx-auto">
```

**NavLink tab bar** — Spanish labels (D-02), `min-h-11` touch targets, `cn()` active state:
```typescript
import { NavLink } from 'react-router';
import { Check, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-[480px]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Check className="h-5 w-5" aria-hidden />
          Hoy
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <LayoutGrid className="h-5 w-5" aria-hidden />
          Panel
        </NavLink>
      </div>
    </nav>
  );
}
```

**Back link styling reference** (ManageHabitsPage.tsx lines 23-28) — same `text-muted-foreground hover:text-foreground` tokens for inactive tabs.

---

### `src/components/layout/BottomTabBar.test.tsx` (test) — CREATE

**Analog:** `src/pages/TodayPage.test.tsx`

**MemoryRouter wrapper** (TodayPage.test.tsx lines 17-22):
```typescript
function renderPage() {
  return render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );
}
```

**Add tests for:** "Hoy" and "Panel" labels visible; active tab gets `text-primary` when route matches; `aria-label="Navegación principal"`.

---

### `src/components/layout/MainLayout.tsx` (layout, request-response) — CREATE

**Analog:** `src/App.tsx` + `src/components/layout/AppShell.tsx`

**No existing `Outlet` in codebase** — first nested layout route. Pattern from App.tsx flat routes (lines 9-21):
```typescript
import { BrowserRouter, Route, Routes } from 'react-router';
```

**MainLayout shape:**
```typescript
import { Outlet } from 'react-router';
import { BottomTabBar } from './BottomTabBar';

export function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  );
}
```

**App.tsx nesting** — wrap Today + Dashboard only; history/form routes stay outside (D-04):
```typescript
<Route element={<MainLayout />}>
  <Route path="/" element={<TodayPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
<Route path="/habits/:id/history" element={<HabitHistoryPage />} />
```

---

### `src/components/dashboard/DashboardCard.tsx` (component, event-driven) — CREATE

**Analog:** `src/components/habits/HabitRow.tsx` (Flame badge) + `src/pages/ManageHabitsPage.tsx` (tappable list card)

**Flame + streak badge** (HabitRow.tsx lines 107-116):
```typescript
<span
  className="flex shrink-0 items-center gap-1"
  aria-label={`${currentStreak} day streak`}
>
  <Flame className="h-4 w-4 text-primary" aria-hidden />
  <span className="text-xs font-semibold text-foreground">
    {currentStreak}
  </span>
</span>
```

**Tappable card container** (ManageHabitsPage.tsx lines 36-43):
```typescript
<button
  type="button"
  className="flex min-h-11 items-center rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:bg-[#1c2128]"
  onClick={() => navigate(`/habits/${habit.id}/history`)}
>
  <span className="truncate">{habit.name}</span>
</button>
```

**DashboardCard composition** — name left, Flame+streak right (D-05); navigate to history (D-07):
```typescript
interface DashboardCardProps {
  habit: Habit;
  currentStreak: number;
}

export function DashboardCard({ habit, currentStreak }: DashboardCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:bg-[#1c2128]"
      onClick={() => navigate(`/habits/${habit.id}/history`)}
    >
      <span className="min-w-0 flex-1 truncate">{habit.name}</span>
      <span className="flex shrink-0 items-center gap-1" aria-label={`${currentStreak} day streak`}>
        <Flame className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-xs font-semibold text-foreground">{currentStreak}</span>
      </span>
    </button>
  );
}
```

---

### `src/components/dashboard/DashboardCard.test.tsx` (test, event-driven) — CREATE

**Analog:** `src/components/habits/HabitRow.test.tsx`

**Navigate mock** (HabitRow.test.tsx lines 7-15):
```typescript
const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});
```

**Add tests for:** habit name + streak visible; Flame `aria-label`; click navigates to `/habits/:id/history` (D-07).

---

### `src/components/heatmap/ContributionHeatmap.tsx` (component, CRUD) — CREATE

**Analog:** `src/components/habits/HistoryDotGrid.tsx` (toggle + schedule states)

**Toggle + toast error** (HistoryDotGrid.tsx lines 30-36):
```typescript
async function handleDotClick(date: string) {
  try {
    await toggle(habitId, date);
  } catch {
    toast.error("Couldn't update. Try again.");
  }
}
```

**Schedule state guard** (HistoryDotGrid.tsx lines 41-56) — only `completed`/`missed` are interactive (D-16):
```typescript
const state = getWeekDayState(date, frequency, completedDates, today);
// ...
if (state === 'not-scheduled') { /* hidden/dim */ }
const isMissed = state === 'missed';
const isFuture = state === 'future';
```

**renderBlock click-to-toggle** (v3 API — no `eventHandlers`):
```typescript
import { cloneElement, useCallback } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';

const renderBlock = useCallback(
  (block, activity) => {
    const state = cellStates.get(activity.date);
    const isInteractive = state === 'completed' || state === 'missed';
    return cloneElement(block, {
      style: {
        ...block.props.style,
        opacity: state === 'not-scheduled' ? 0.15 : 1,
        cursor: isInteractive ? 'pointer' : 'default',
      },
      onClick: isInteractive
        ? () => void handleCellClick(activity.date)
        : undefined,
    });
  },
  [cellStates],
);
```

**ActivityCalendar props** — dark theme tokens from Phase 2 UI-SPEC:
```typescript
<div className="overflow-x-auto" data-testid="contribution-heatmap">
  <ActivityCalendar
    data={activities}
    colorScheme="dark"
    weekStart={1}
    minLevel={0}
    maxLevel={1}
    showColorLegend={false}
    showTotalCount={false}
    blockSize={14}
    blockMargin={3}
    theme={{ dark: ['#21262d', '#3fb950'] }}
    tooltips={{
      activity: {
        text: ({ date }) => formatHeatmapTooltip(date, cellStates.get(date)),
      },
    }}
    renderBlock={renderBlock}
  />
</div>
```

**Missed cell ring** — mirror `ring-destructive` from HistoryDotGrid (line 69) via `renderBlock` stroke or wrapper.

---

### `src/components/heatmap/ContributionHeatmap.test.tsx` (test, CRUD) — CREATE

**Analog:** `src/components/habits/HistoryDotGrid.test.tsx`

**Hook mocks** (HistoryDotGrid.test.tsx lines 12-24):
```typescript
vi.mock('@/hooks/useHeatmapData', () => ({
  useHeatmapData: () => ({
    activities: [/* fixture */],
    cellStates: new Map([['2026-07-13', 'missed']]),
    isLoading: false,
    toggle: mockToggle,
  }),
}));
```

**Fixed today mock** (HistoryDotGrid.test.tsx lines 26-32):
```typescript
vi.mock('@/domain/dates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/dates')>();
  return { ...actual, getLocalDateString: () => todayKey };
});
```

**Migrate assertions:** toggle on scheduled past day; no toggle on future; `overflow-x-auto` wrapper present; `data-testid="contribution-heatmap"`.

---

### `src/pages/DashboardPage.tsx` (route, CRUD) — CREATE

**Analog:** `src/pages/TodayPage.tsx` + `src/pages/ManageHabitsPage.tsx`

**Page shell + loading** (TodayPage.tsx lines 26-28, 44-55):
```typescript
if (state.status === 'loading') {
  return null;
}

return (
  <AppShell title="Panel" /* Spanish title per D-02 */>
```

**Empty state** — mirror TodayPage (lines 56-62):
```typescript
{todayHabits.length === 0 ? (
  <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
    <h2 className="text-[28px] font-semibold">No habits due today</h2>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">...</p>
  </div>
) : (
```

**Dashboard list** — ManageHabitsPage section pattern (lines 31-45) with `useDashboardHabits`:
```typescript
<ul className="flex flex-col gap-2 pb-12">
  {items.map(({ habit, currentStreak }) => (
    <li key={habit.id}>
      <DashboardCard habit={habit} currentStreak={currentStreak} />
    </li>
  ))}
</ul>
```

**No FAB on dashboard** — only Today has `FloatingAddButton`.

---

### `src/pages/DashboardPage.test.tsx` (test) — CREATE

**Analog:** `src/pages/TodayPage.test.tsx`

**Hook mock pattern** (TodayPage.test.tsx lines 7-11):
```typescript
const useDashboardHabitsMock = vi.fn();

vi.mock('@/hooks/useDashboardHabits', () => ({
  useDashboardHabits: () => useDashboardHabitsMock(),
}));
```

**Add tests for:** empty state copy; cards rendered in streak order; loading returns null.

---

### `src/pages/HabitHistoryPage.tsx` (route, CRUD) — MODIFY

**Analog:** `src/pages/HabitHistoryPage.tsx` (self)

**Habit fetch** (lines 33-36):
```typescript
const habit = useLiveQuery(() => (id ? db.habits.get(id) : undefined), [id]);
```

**Replace HistoryDotGrid** (lines 24-28) with ContributionHeatmap; subtitle "Historial" (D-11):
```typescript
<p className="mt-4 text-xs text-muted-foreground">Historial</p>
<div className="mt-4">
  <ContributionHeatmap habitId={habit.id} frequency={habit.frequency} />
</div>
```

**Back navigation** — replace `<Link to="/">` (lines 62-67) with `navigate(-1)` (D-12):
```typescript
import { useNavigate } from 'react-router';

const navigate = useNavigate();

<button
  type="button"
  className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
  onClick={() => navigate(-1)}
>
  <ChevronLeft className="h-4 w-4" aria-hidden />
  Back
</button>
```

**Preserve loading/redirect guards** (lines 38-58) — unchanged.

---

### `src/pages/HabitHistoryPage.test.tsx` (test) — CREATE

**Analog:** `src/components/habits/HabitRow.test.tsx`

**Navigate mock for back button:**
```typescript
const navigateMock = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigateMock };
});
```

**Add tests for:** back button calls `navigate(-1)` not `to="/"`; "Historial" subtitle present; ContributionHeatmap rendered (mock component).

---

### `src/App.tsx` (config, request-response) — MODIFY

**Analog:** `src/App.tsx` (self)

**Current flat routes** (lines 9-21):
```typescript
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/habits/new" element={<HabitNewPage />} />
        {/* ... */}
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
```

**Add:** `MainLayout` wrapper route + `/dashboard`; import `DashboardPage`. Keep form/manage/history routes outside layout (no tab bar on detail pages per RESEARCH recommendation).

---

### `src/components/layout/AppShell.tsx` (component) — MODIFY

**Analog:** `src/components/layout/AppShell.tsx` (self)

**Current bottom padding** (line 16):
```typescript
<main className="mx-auto w-full max-w-[480px] px-4 pb-16 md:mx-auto">{children}</main>
```

**Increase padding** for fixed tab bar — e.g. `pb-20` or `pb-24` on main views wrapped by `MainLayout` only. Option A: add optional `hasTabBar` prop; Option B: apply extra padding in `MainLayout` wrapper div around `<Outlet />`. Planner discretion — ensure tab bar does not obscure list bottom (Today `pb-12` on ul + shell padding).

---

### `src/components/habits/HistoryDotGrid.tsx` — DELETE (post-migration)

**Analog:** `src/components/habits/HistoryDotGrid.tsx` (behavior migrates to `ContributionHeatmap.tsx`)

Migrate toggle semantics, `getWeekDayState` usage, and toast error handling to heatmap component. Delete file and `HistoryDotGrid.test.tsx` after `ContributionHeatmap.test.tsx` covers equivalent behaviors (D-09).

---

## Shared Patterns

### Layered Architecture (mandatory)

**Source:** Phase 2 `02-PATTERNS.md` + established codebase

```
Pages/Components → Hooks → Domain (pure) ← Infrastructure (Dexie)
```

`ContributionHeatmap` calls `useHeatmapData`; hook calls `completionRepository`; `buildHeatmapActivities` is pure. Components never import `db` directly except pages fetching habit by id.

---

### Path Alias `@/`

**Source:** All existing `src/` files

```typescript
import { buildHeatmapActivities } from '@/domain/heatmap';
import { useDashboardHabits } from '@/hooks/useDashboardHabits';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
```

---

### Reactive Data Binding via `useLiveQuery`

**Source:** `src/hooks/useStreak.ts`, `src/hooks/useHabitStats.ts`

```typescript
const result = useLiveQuery(async () => { /* fetch + derive */ }, [deps]);
return { value: result ?? defaultValue, isLoading: result === undefined };
```

Heatmap toggle → `useToggleCompletion` → Dexie write → `useHeatmapData` + `useDashboardHabits` + `useStreak` all refresh. No persisted streak fields.

---

### Schedule Gate (`getWeekDayState`)

**Source:** `src/domain/stats.ts` lines 27-36

**Apply to:** `buildHeatmapActivities`, `ContributionHeatmap` `renderBlock`

Non-scheduled days dimmed (`opacity: 0.15`) and non-interactive (D-14). Only `completed`/`missed` toggle. Future days disabled (D-16).

---

### Local Date Keys (never UTC)

**Source:** `src/domain/dates.ts` lines 12-14, 48-50

```typescript
getLocalDateString(new Date())
new Date(`${dateStr}T12:00:00`)  // heatmap range + tooltips
getHabitStartDate(habit)          // NOT createdAt.slice(0,10)
```

---

### Repository Range Query

**Source:** `src/infrastructure/completionRepository.ts` lines 18-29

```typescript
async getByHabitInRange(habitId: string, start: string, end: string): Promise<string[]> {
  const completions = await db.completions
    .where('[habitId+date]')
    .between([habitId, start], [habitId, end], true, true)
    .toArray();
  return completions.map((completion) => completion.date);
}
```

**Apply to:** `useDashboardHabits` (per habit, habit-start → today), `useHeatmapData` (52-week window).

---

### Component `cn()` + Design Tokens

**Source:** `src/components/habits/HabitRow.tsx`, `HistoryDotGrid.tsx`

```typescript
import { cn } from '@/lib/utils';
// Completed heatmap: #3fb950 via theme.dark[1]
// Missed: ring-destructive / #f85149
// Cards: border-border bg-card
// Muted: text-muted-foreground
```

---

### Error Toast on Toggle Failure

**Source:** `src/components/habits/HistoryDotGrid.tsx` lines 30-36

```typescript
} catch {
  toast.error("Couldn't update. Try again.");
}
```

**Apply to:** `ContributionHeatmap` cell click handler.

---

### Test Mocking Conventions

**Source:** `HabitRow.test.tsx`, `HistoryDotGrid.test.tsx`, `TodayPage.test.tsx`

- Mock hooks at module level with `vi.mock('@/hooks/...')`
- Mock `react-router` `useNavigate` when testing navigation
- `MemoryRouter` wrapper for components using `NavLink`/`useNavigate`
- Fixed date: `new Date(2026, 6, 19)` + `todayKey = '2026-07-19'`
- `afterEach(cleanup)` in component tests
- Dexie integration tests: `db.delete()` + `vi.setSystemTime()` in `beforeEach`

---

### AppShell 480px Max-Width

**Source:** `src/components/layout/AppShell.tsx` lines 11-16

Tab bar, header, and main content all use `max-w-[480px] mx-auto` — bottom nav must align with content column.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/layout/MainLayout.tsx` | layout | request-response | First nested layout route; no `Outlet` in codebase yet — follow React Router 8 nested route pattern from RESEARCH.md |
| `src/components/layout/BottomTabBar.tsx` | component | request-response | No bottom navigation exists; partial match from `Link`/`NavLink` styling in ManageHabitsPage |

All other Phase 3 files have direct or role-match analogs in Phase 1–2 code.

---

## Build Order (suggested waves)

```
Wave 0: npm install react-activity-calendar@3.2.1 (checkpoint:human-verify)
Wave 1: domain/heatmap.ts + heatmap.test.ts
Wave 2: hooks/useDashboardHabits.ts + test, hooks/useHeatmapData.ts
Wave 3: BottomTabBar.tsx + test, MainLayout.tsx, App.tsx route nesting, AppShell padding
Wave 4: DashboardCard.tsx + test, DashboardPage.tsx + test
Wave 5: ContributionHeatmap.tsx + test
Wave 6: HabitHistoryPage.tsx modify + test; delete HistoryDotGrid + test
```

---

## Metadata

**Analog search scope:** `src/domain/`, `src/hooks/`, `src/components/`, `src/pages/`, `src/infrastructure/completionRepository.ts`, `src/App.tsx`
**Files scanned:** 28
**Pattern extraction date:** 2026-07-19
**Primary references:** Phase 2 implemented source, `03-RESEARCH.md`, `03-CONTEXT.md`, `02-PATTERNS.md`
