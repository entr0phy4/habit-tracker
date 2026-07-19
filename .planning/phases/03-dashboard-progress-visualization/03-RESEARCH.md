# Phase 3: Dashboard & Progress Visualization - Research

**Researched:** 2026-07-19
**Domain:** Dashboard navigation, streak summary cards, GitHub-style contribution heatmap (react-activity-calendar v3)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Bottom Tab Navigation
- **D-01:** Add a fixed bottom tab bar with two tabs: **Hoy** and **Panel**
- **D-02:** Tab labels in Spanish — "Hoy" and "Panel" (not English, not icon-only)
- **D-03:** Today remains the app home at `/`; dashboard lives at `/dashboard` as the second tab — daily check-in loop unchanged
- **D-04:** Tab bar visible on main views (Today and Dashboard at minimum); planner discretion on whether form/edit pages hide it

#### Dashboard Card Layout
- **D-05:** Each dashboard card shows habit name + Flame icon + current streak count only — minimal glanceable summary (no completion rate, no week dots)
- **D-06:** Habits sorted by current streak descending — highest streak at top for motivation
- **D-07:** Tap a dashboard card navigates to `/habits/:id/history` (stats + heatmap detail view)
- **D-08:** Dashboard shows active habits only — archived habits hidden, consistent with Today view

#### Heatmap Placement on History Page
- **D-09:** Replace Phase 2 `HistoryDotGrid` calendar-week grid with the full GitHub-style contribution heatmap — do not keep both week grid and heatmap
- **D-10:** Heatmap lives on existing route `/habits/:id/history` below stat cards — no new detail route
- **D-11:** Section subtitle **"Historial"** replaces Phase 2's "Esta semana" above the heatmap
- **D-12:** History page back link uses browser history (`navigate(-1)`) — returning to Panel when user came from dashboard, to Today when from Today

#### Heatmap Scope & Interaction
- **D-13:** Heatmap shows last 52 weeks (one year) GitHub-style; horizontal scroll on mobile per VIZ-01 responsive requirement
- **D-14:** Non-scheduled days hidden or very dim — only scheduled days are meaningful cells (consistent with Phase 2 schedule-aware stats)
- **D-15:** Cell tooltip shows date + status — e.g., "Lun 14 jul — Completado" / "Perdido" / "No programado" via `react-activity-calendar`
- **D-16:** Tap toggles completion on today and past scheduled days; future dates disabled — same boundary as Phase 2 (`isFutureDate` guard)

### Claude's Discretion
- Tab bar icon pairing with Spanish labels (e.g., Check + LayoutGrid or Flame)
- `react-activity-calendar` theme mapping to existing `#3fb950` accent and dark tokens from Phase 1 UI-SPEC
- Whether `HistoryDotGrid` component is deleted vs kept unused for reference
- Dashboard empty state copy when no active habits exist
- Exact card layout (list vs compact cards) within 480px AppShell max-width
- Heatmap cell size and block margin for 44px touch targets on mobile

### Deferred Ideas (OUT OF SCOPE)
- Three-tab bar including "Gestionar" — user chose two tabs only; manage stays at `/habits/manage`
- Dashboard as app home — user kept Today at `/`
- Dashboard cards with completion rate or week dots — user chose name + streak only
- Heatmap showing full history from habit creation — user chose 52-week window
- Week grid + heatmap coexistence — user chose replace, not supplement
- Numeric/partial completion heatmap intensity levels — ENH scope, binary done/undone for v1
- Streak animations on dashboard (ENH-02) — v2 enhancement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | User can see a dashboard displaying all current streaks at a glance | `useDashboardHabits` batch hook + `DashboardPage` at `/dashboard`; cards with Flame + streak; sorted desc (D-05–D-08) |
| VIZ-01 | User can view a GitHub-style contribution grid showing history for each habit | `react-activity-calendar@3.2.1` on `/habits/:id/history`; `domain/heatmap.ts` builds 52-week Activity array; horizontal scroll wrapper (D-09–D-16) |
</phase_requirements>

## Summary

Phase 3 adds the app's first persistent navigation (bottom tab bar: Hoy + Panel) and delivers two complementary views: a streak leaderboard dashboard and a per-habit GitHub-style contribution heatmap on the existing history page. The codebase already has the critical foundations — `useStreak`, `useHabits`, `useToggleCompletion`, schedule-aware `getWeekDayState`, and the Flame badge pattern in `HabitRow`. This phase wires them into new UI surfaces and replaces `HistoryDotGrid` with `react-activity-calendar`.

The heatmap integration is the highest-risk work item. `react-activity-calendar` v3 removed the `eventHandlers` prop; click-to-toggle must use `renderBlock` with `React.cloneElement` to attach `onClick` handlers [CITED: github.com/grubersjoe/react-activity-calendar releases v3]. Tooltips use the `tooltips.activity.text` callback (D-15). Schedule-aware styling (non-scheduled dim, missed destructive ring, future disabled) belongs in a pure `domain/heatmap.ts` module that maps each day to a cell state, then applies visual/interaction rules in `renderBlock` — reusing `getWeekDayState` from `domain/stats.ts`.

Dashboard sorting (D-06) requires streak values in the parent list. A batch `useDashboardHabits` hook (single `useLiveQuery` over all active habits) is preferable to N parallel `useStreak` calls when sorting is required. The dashboard shows summary cards only — no heatmaps — per PITFALLS.md Pitfall 5.

**Primary recommendation:** Install `react-activity-calendar@3.2.1`, add a layout route with bottom tab bar for `/` and `/dashboard`, build `domain/heatmap.ts` + `ContributionHeatmap` component with `renderBlock` toggle wiring, and delete `HistoryDotGrid` after migration.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Bottom tab navigation (Hoy/Panel) | Browser / Client | — | Pure React Router layout + fixed CSS nav; no server |
| Dashboard streak cards + sort | Browser / Client | Domain (streak calc) | UI renders; `calculateCurrentStreak` in domain layer |
| 52-week heatmap visualization | Browser / Client | Domain (heatmap builder) | Library renders SVG; domain builds Activity[] + cell states |
| Heatmap tap-to-toggle | Browser / Client | Infrastructure (Dexie) | `renderBlock` onClick → `useToggleCompletion` → `completionRepository` |
| Schedule-aware cell states | Domain | — | Pure functions; reuse `isDueOnDate`, `getWeekDayState`, `isFutureDate` |
| Completion persistence | Database / Storage | — | IndexedDB via Dexie; unchanged from Phase 1–2 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-activity-calendar` | 3.2.1 | GitHub-style contribution heatmap on history page | Locked in STACK.md and CONTEXT; native dark mode, tooltips, `renderBlock` for click handlers [CITED: github.com/grubersjoe/react-activity-calendar] |
| `react-router` | 8.2.0 (installed) | Bottom tab layout routes, card → history navigation | Already in project; nested layout + `NavLink` for tab bar [ASSUMED] |
| `dexie` + `dexie-react-hooks` | 4.4.4 / 4.4.0 (installed) | Reactive completion reads for heatmap + dashboard | Established compute-on-read pattern from Phase 1–2 |
| `date-fns` | 4.4.0 (installed) | 52-week range, Spanish tooltip date formatting | Already used for local `YYYY-MM-DD` keys; tree-shake per-function imports |
| `lucide-react` | 1.25.0 (installed) | Flame icon on dashboard cards, tab bar icons | Matches Phase 2 `HabitRow` streak badge |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns/locale` (`es`) | 4.4.0 | Spanish tooltip dates (D-15) | `format(date, 'EEE d MMM', { locale: es })` in tooltip text |
| `react-activity-calendar/tooltips.css` | 3.2.1 | Default tooltip styling | Import in `ContributionHeatmap.tsx` if built-in tooltips used |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-activity-calendar` | Custom SVG grid | 2–3 days extra dev; locked decision — do not explore |
| `react-activity-calendar` | `react-calendar-heatmap` | Older API, manual dark mode; STACK.md rejects for v1 |
| Batch `useDashboardHabits` | Per-card `useStreak` | Per-card works on Today page but cannot sort parent without batch hook |
| Layout route tab bar | Zustand tab state | Over-engineering; URL-driven tabs are shareable and back-button friendly |

**Installation:**

```bash
npm install react-activity-calendar@3.2.1
```

**Version verification (2026-07-19):**

```bash
npm view react-activity-calendar version  # 3.2.1
```

Published 2026-07-07; package created 2021-06-15; ~49,700 weekly downloads [VERIFIED: npm registry].

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `react-activity-calendar` | npm | pkg since 2021; v3.2.1 published 2026-07-07 | ~49.7K/wk | github.com/grubersjoe/react-activity-calendar | SUS | Flagged — planner adds `checkpoint:human-verify` before install |

**Packages removed due to [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** `react-activity-calendar` — seam flagged `too-new` for v3.2.1 release date; package itself is established (5+ years, official GitHub, Storybook docs, no postinstall script). Proceed with locked STACK.md version after human checkpoint.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     App (BrowserRouter)                              │
├─────────────────────────────────────────────────────────────────────┤
│  MainLayout (tab bar: Hoy / Panel)                                   │
│    ├── TodayPage (/)          ──→ HabitRow + useStreak (existing)    │
│    └── DashboardPage (/dashboard) ──→ useDashboardHabits (new)     │
│                                         └── DashboardCard → history  │
├─────────────────────────────────────────────────────────────────────┤
│  HabitHistoryPage (/habits/:id/history) — no tab bar (D-04 disc.)   │
│    ├── StatCards (unchanged)                                         │
│    └── ContributionHeatmap (new)                                     │
│          ├── useHeatmapData → completionRepository (52-week range)   │
│          ├── domain/heatmap.buildHeatmapActivities()                 │
│          └── ActivityCalendar + renderBlock → useToggleCompletion    │
├─────────────────────────────────────────────────────────────────────┤
│  Domain: heatmap.ts, stats.ts (getWeekDayState), streak.ts, dates.ts │
├─────────────────────────────────────────────────────────────────────┤
│  Infrastructure: completionRepository.getByHabitInRange()            │
│  Storage: Dexie IndexedDB (habits + completions)                     │
└─────────────────────────────────────────────────────────────────────┘

User tap on heatmap cell
    → renderBlock onClick (scheduled, not future)
    → useToggleCompletion.toggle(habitId, date)
    → completionRepository.toggle()
    → useLiveQuery refresh
    → buildHeatmapActivities() recomputes levels
    → ActivityCalendar re-renders
    → StatCards + dashboard streaks update via same completion data
```

### Recommended Project Structure

```
src/
├── domain/
│   └── heatmap.ts              # NEW: 52-week range, Activity[] builder, cell state map
├── hooks/
│   ├── useDashboardHabits.ts   # NEW: active habits + streaks, sorted desc
│   └── useHeatmapData.ts       # NEW: 52-week completion query for one habit
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # MODIFY: bottom padding for tab bar
│   │   ├── BottomTabBar.tsx    # NEW: Hoy + Panel NavLinks
│   │   └── MainLayout.tsx      # NEW: Outlet + fixed bottom tab bar
│   ├── dashboard/
│   │   └── DashboardCard.tsx   # NEW: name + Flame + streak, tap → history
│   └── heatmap/
│       └── ContributionHeatmap.tsx  # NEW: ActivityCalendar wrapper
├── pages/
│   ├── DashboardPage.tsx       # NEW
│   └── HabitHistoryPage.tsx    # MODIFY: replace HistoryDotGrid, navigate(-1)
└── App.tsx                     # MODIFY: layout route + /dashboard
```

### Pattern 1: Bottom Tab Layout Route

**What:** Nest Today and Dashboard under a `MainLayout` route with a fixed bottom tab bar. Form/edit/history routes remain outside the layout so the tab bar can be hidden (D-04 discretion).

**When to use:** D-01–D-04; first persistent navigation in the app.

**Example:**

```tsx
// Source: React Router nested routes pattern [ASSUMED]
import { BrowserRouter, Route, Routes } from 'react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { TodayPage } from '@/pages/TodayPage';
import { HabitHistoryPage } from '@/pages/HabitHistoryPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
        {/* existing form/manage routes unchanged */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Pattern 2: Batch Dashboard Hook with Streak Sort

**What:** Single `useLiveQuery` fetches all active habits, computes each current streak, returns array sorted by streak descending (D-06).

**When to use:** `DashboardPage` — parent needs sorted streak values; per-row `useStreak` alone cannot sort in parent.

**Example:**

```typescript
// Source: mirrors useHabitStats / useStreak patterns in codebase
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

### Pattern 3: Domain Heatmap Builder (52-Week Window)

**What:** Pure function builds `Activity[]` for `react-activity-calendar` from completions + schedule. Uses binary levels (`minLevel={0}` `maxLevel={1}`): level 1 = completed, level 0 = not completed. Parallel `Map<string, HeatmapCellState>` drives `renderBlock` styling for missed/non-scheduled/future.

**When to use:** Every heatmap render; unit-testable without React or IndexedDB.

**Example:**

```typescript
// Source: react-activity-calendar index.d.ts + domain/stats.ts getWeekDayState
import { subWeeks } from 'date-fns/subWeeks';
import type { Activity } from 'react-activity-calendar';
import { getWeekDayState, type WeekDayState } from './stats';
import { getLocalDateString, iterateDaysInRange } from './dates';

export const HEATMAP_WEEKS = 52;

export function getHeatmapDateRange(today: string): { start: string; end: string } {
  const end = today;
  const startDate = subWeeks(new Date(`${today}T12:00:00`), HEATMAP_WEEKS);
  return { start: getLocalDateString(startDate), end };
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

### Pattern 4: Heatmap Click-to-Toggle via renderBlock

**What:** v3 attaches event handlers through `renderBlock` + `cloneElement`. Guard clicks by cell state: only today/past scheduled days toggle (D-16).

**When to use:** `ContributionHeatmap` component — replaces `HistoryDotGrid` toggle behavior.

**Example:**

```tsx
// Source: react-activity-calendar v3 upgrade guide + index.d.ts
import { cloneElement, useCallback } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';

function ContributionHeatmap({ habitId, frequency }: Props) {
  const { activities, cellStates, isLoading, toggle } = useHeatmapData(habitId, frequency);

  const renderBlock = useCallback(
    (block, activity) => {
      const state = cellStates.get(activity.date);
      const isInteractive =
        state === 'completed' || state === 'missed';

      return cloneElement(block, {
        style: {
          ...block.props.style,
          opacity: state === 'not-scheduled' ? 0.15 : 1,
          cursor: isInteractive ? 'pointer' : 'default',
        },
        onClick: isInteractive
          ? () => void toggle(activity.date)
          : undefined,
      });
    },
    [cellStates, toggle],
  );

  return (
    <div className="overflow-x-auto">
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
            text: ({ date }) => formatTooltip(date, cellStates.get(date)),
          },
        }}
        renderBlock={renderBlock}
      />
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Full heatmaps on dashboard:** PITFALLS.md Pitfall 5 — dashboard is streak cards only; heatmap on detail view only.
- **Per-card `useStreak` without sort strategy:** Dashboard cards won't sort by streak; use batch hook.
- **Keeping `HistoryDotGrid` alongside heatmap:** D-09 forbids coexistence; delete component and migrate tests.
- **`eventHandlers` prop on ActivityCalendar:** Removed in v3; use `renderBlock`.
- **UTC date keys in heatmap range:** Reuse `getLocalDateString` / noon-local parse from `domain/dates.ts`.
- **Link `to="/"` on history back button:** D-12 requires `navigate(-1)` for context-aware return.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub-style SVG heatmap grid | Custom 53×7 SVG/canvas renderer | `react-activity-calendar` | Week padding, month labels, dark theme, tooltips already solved |
| Tooltip positioning on cells | Custom hover state + absolute div | `tooltips.activity.text` prop | Floating UI built into library v3 |
| Bottom tab active state | Manual pathname string compare | `NavLink` with `aria-current` | React Router handles active class + a11y |
| 52-week grid layout math | Manual column/row iteration | Library `groupByWeeks` (internal) + `weekStart={1}` | Edge cases for week padding handled by library |
| Streak values on dashboard | Persisted streak counters | `calculateCurrentStreak` compute-on-read | Import/edit safety; established Phase 2 pattern |

**Key insight:** The library owns grid layout and tooltip infrastructure; the app owns schedule-aware semantics (which cells are tappable, what status text means) via domain layer + `renderBlock`.

## Common Pitfalls

### Pitfall 1: v3 Breaking Change — eventHandlers Removed

**What goes wrong:** Planner tasks reference `onClick` or `eventHandlers` on `ActivityCalendar` directly; implementation fails at compile time.

**Why it happens:** v2 → v3 migration removed `eventHandlers`, `hideColorLegend` (renamed `showColorLegend`), `children` prop.

**How to avoid:** Use `renderBlock` + `cloneElement` for all cell interactions [CITED: github.com/grubersjoe/react-activity-calendar releases v3].

**Warning signs:** TypeScript errors on `eventHandlers`; Storybook examples from pre-v3 blogs.

### Pitfall 2: Non-Scheduled Days Look Like Missed Days

**What goes wrong:** Weekly habits show empty red-ring cells on rest days; users think they failed.

**Why it happens:** Library `fillHoles` assigns `level: 0` to all days without entries; binary theme treats level 0 as "empty/missed."

**How to avoid:** Use `getWeekDayState` → `renderBlock` sets `opacity: 0.15` and `pointer-events: none` for `not-scheduled`; only `missed` gets destructive ring via SVG stroke or wrapper [CITED: Phase 2 getWeekDayState pattern].

**Warning signs:** Tuesday cells interactive on Mon/Wed/Fri habit; tooltip says "Perdido" on rest days.

### Pitfall 3: Touch Targets Too Small on Mobile

**What goes wrong:** `blockSize={12}` (library default) yields ~15px cells; fails UI-02 44px touch target requirement.

**Why it happens:** GitHub desktop heatmap uses small blocks; mobile needs larger hit areas.

**How to avoid:** Set `blockSize={14}`–`16` with `blockMargin={3}`; wrap in `overflow-x-auto` for 52-week width (~900px); consider invisible padding in `renderBlock` if profiling shows miss-taps (D-16 discretion).

**Warning signs:** Users tap adjacent days; Lighthouse tap-target audit failures.

### Pitfall 4: Dashboard Sort Race with Per-Card Hooks

**What goes wrong:** Dashboard renders habits in creation order; streak sort flickers or never applies.

**Why it happens:** `useStreak` in child components doesn't expose values to parent sorter.

**How to avoid:** `useDashboardHabits` batch hook returns pre-sorted `{ habit, currentStreak }[]`.

**Warning signs:** Dashboard order doesn't change when streak values differ.

### Pitfall 5: History Page Back Always Returns to Today

**What goes wrong:** User navigates Panel → history → back lands on Today instead of Panel.

**Why it happens:** Hardcoded `<Link to="/">` in `HabitHistoryPage` (current code).

**How to avoid:** Replace with `<button onClick={() => navigate(-1)}>` per D-12.

**Warning signs:** Back link href is `/` regardless of entry point.

## Code Examples

### Spanish Tooltip Text (D-15)

```typescript
// Source: date-fns v4 locale + CONTEXT D-15
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale';
import type { WeekDayState } from '@/domain/stats';

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

### Bottom Tab Bar (D-01, D-02)

```tsx
// Source: Phase 1 AppShell tokens + CONTEXT D-01/D-02
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

### 52-Week Completion Query Hook

```typescript
// Source: useHabitStats pattern + D-13 52-week window
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `HistoryDotGrid` 7-day calendar week | 52-week `ActivityCalendar` heatmap | Phase 3 (D-09) | Unified history visualization; horizontal scroll on mobile |
| No bottom navigation | Fixed Hoy/Panel tab bar | Phase 3 (D-01) | First persistent nav; Today stays home |
| `eventHandlers` on ActivityCalendar | `renderBlock` + `cloneElement` | react-activity-calendar v3.0 (2025-11) | Click-to-toggle requires wrapper pattern |
| `hideColorLegend` prop | `showColorLegend={false}` | v3 rename | Use inverted boolean |

**Deprecated/outdated:**
- `HistoryDotGrid` component: replaced, should be deleted (D-09)
- `useCompletions` 7-day hook for history page: superseded by `useHeatmapData` 52-week range on history page only

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React Router 8 nested layout + `NavLink` pattern unchanged from v6/v7 | Pattern 1 | Low — same API; verify during implementation |
| A2 | `blockSize={14}` + horizontal scroll satisfies 44px touch on mobile | Pitfall 3 | Medium — may need larger blocks or hit-area padding |
| A3 | Binary `minLevel=0` `maxLevel=1` sufficient for v1 heatmap | Pattern 3 | Low — matches ENH scope deferral for intensity levels |
| A4 | `opacity: 0.15` acceptable for non-scheduled dim (D-14) | Pattern 4 | Low — CONTEXT allows hidden OR dim; planner can choose |

## Open Questions

1. **Tab bar on history page?**
   - What we know: D-04 leaves to planner discretion; history is a detail drill-down.
   - What's unclear: Whether tab bar helps wayfinding or clutters the heatmap.
   - Recommendation: Hide tab bar on `/habits/:id/history` and form routes; show only on Hoy + Panel (consistent with drill-down pattern).

2. **Delete vs keep `HistoryDotGrid`?**
   - What we know: D-09 replaces it; tests exist in `HistoryDotGrid.test.tsx`.
   - Recommendation: Delete component; migrate behavioral tests to `ContributionHeatmap.test.tsx` and `domain/heatmap.test.ts`.

3. **Dashboard empty state copy (Spanish)?**
   - What we know: D-08 shows active habits only; discretion on copy.
   - Recommendation: Mirror Today empty pattern — e.g., "No tienes hábitos activos" + link to manage habits.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (≥20.19) | Vite 8 build | ✓ | v24.16.0 | — |
| npm | Package install | ✓ | 11.13.0 | — |
| Vitest + jsdom | Phase tests | ✓ | vitest 4.1.10 (package.json) | — |
| `react-activity-calendar` | VIZ-01 heatmap | ✗ | — | `npm install react-activity-calendar@3.2.1` (Wave 0) |

**Missing dependencies with no fallback:**
- `react-activity-calendar@3.2.1` — must install before heatmap implementation

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Dashboard lists all active habits with current streak | unit/component | `npx vitest run src/pages/DashboardPage.test.tsx -x` | ❌ Wave 0 |
| DASH-01 | Habits sorted by streak descending | unit | `npx vitest run src/hooks/useDashboardHabits.test.ts -x` | ❌ Wave 0 |
| DASH-01 | Card tap navigates to `/habits/:id/history` | component | `npx vitest run src/components/dashboard/DashboardCard.test.tsx -x` | ❌ Wave 0 |
| DASH-01 | Archived habits excluded | unit | `npx vitest run src/hooks/useDashboardHabits.test.ts -x` | ❌ Wave 0 |
| VIZ-01 | 52-week Activity array built from completions | unit | `npx vitest run src/domain/heatmap.test.ts -x` | ❌ Wave 0 |
| VIZ-01 | Non-scheduled days dimmed / non-interactive | unit | `npx vitest run src/domain/heatmap.test.ts -x` | ❌ Wave 0 |
| VIZ-01 | Tap toggles today/past scheduled; future disabled | component | `npx vitest run src/components/heatmap/ContributionHeatmap.test.tsx -x` | ❌ Wave 0 |
| VIZ-01 | Spanish tooltip format | unit | `npx vitest run src/domain/heatmap.test.ts -x` | ❌ Wave 0 |
| VIZ-01 | Horizontal scroll container present | component | `npx vitest run src/components/heatmap/ContributionHeatmap.test.tsx -x` | ❌ Wave 0 |
| — | Bottom tab bar renders Hoy + Panel | component | `npx vitest run src/components/layout/BottomTabBar.test.tsx -x` | ❌ Wave 0 |
| — | History back uses navigate(-1) | component | `npx vitest run src/pages/HabitHistoryPage.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run <file> -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/domain/heatmap.ts` + `src/domain/heatmap.test.ts` — 52-week range, cell states, Activity builder
- [ ] `src/hooks/useDashboardHabits.ts` + test — batch streak query, sort desc
- [ ] `src/hooks/useHeatmapData.ts` — 52-week completion query
- [ ] `src/components/layout/BottomTabBar.tsx` + test — Spanish labels, NavLink active state
- [ ] `src/components/layout/MainLayout.tsx` — Outlet + tab bar
- [ ] `src/components/dashboard/DashboardCard.tsx` + test
- [ ] `src/components/heatmap/ContributionHeatmap.tsx` + test — renderBlock toggle
- [ ] `src/pages/DashboardPage.tsx` + test
- [ ] `src/pages/HabitHistoryPage.test.tsx` — back navigation, Historial subtitle
- [ ] Package install: `npm install react-activity-calendar@3.2.1`
- [ ] Delete `HistoryDotGrid.tsx` + migrate/remove `HistoryDotGrid.test.tsx`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth in v1 |
| V3 Session Management | no | Local-only SPA |
| V4 Access Control | no | Single-user local data |
| V5 Input Validation | yes | Date strings validated in domain (`yyyy-MM-dd`); toggle guarded by `isFutureDate` + schedule check |
| V6 Cryptography | no | No sensitive encryption in this phase |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via habit name in dashboard cards | Spoofing/Tampering | React auto-escapes text content; no `dangerouslySetInnerHTML` |
| IndexedDB data tampering via devtools | Tampering | Acceptable for v1 local-first; export/import validation in Phase 4 |
| Click handler on wrong dates | Tampering | Domain guards in `renderBlock`: only `completed`/`missed` states invoke toggle |

## Sources

### Primary (HIGH confidence)
- `react-activity-calendar@3.2.1` `build/index.d.ts` — full Props interface, Activity type, renderBlock, tooltips [VERIFIED: npm package inspection]
- [react-activity-calendar README](https://github.com/grubersjoe/react-activity-calendar) — data shape, v3 upgrade pointer [CITED: github.com/grubersjoe/react-activity-calendar]
- [react-activity-calendar v3 release notes](https://github.com/grubersjoe/react-activity-calendar/releases) — eventHandlers removal, prop renames [CITED: github.com/grubersjoe/react-activity-calendar/releases]
- Existing codebase — `useStreak`, `getWeekDayState`, `HistoryDotGrid` toggle pattern [VERIFIED: codebase grep]

### Secondary (MEDIUM confidence)
- [Context7 react-activity-calendar llms.txt](https://context7.com/grubersjoe/react-activity-calendar/llms.txt) — renderBlock examples, theme/blockSize props [CITED: context7.com]
- `.planning/research/PITFALLS.md` — Pitfall 5 grid DOM explosion; dashboard summary only
- `.planning/research/ARCHITECTURE.md` — `domain/heatmap.ts`, compute-on-read, 53-week window
- `.planning/phases/02-streaks-statistics/02-UI-SPEC.md` — `#3fb950` primary, `#f85149` destructive, 44px touch targets

### Tertiary (LOW confidence)
- React Router 8 nested layout pattern — training knowledge; API assumed stable from v6 [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — locked decision verified via npm + package type definitions
- Architecture: HIGH — extends established Phase 1–2 patterns with clear file map
- Pitfalls: HIGH — v3 API breaking change verified; schedule/touch issues from Phase 2 carry-forward

**Research date:** 2026-07-19
**Valid until:** 2026-08-19 (30 days — stable library, new v3.2.1 release)
