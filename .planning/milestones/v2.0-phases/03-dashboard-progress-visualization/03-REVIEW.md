---
phase: 03-dashboard-progress-visualization
reviewed: 2026-07-19T21:15:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - src/domain/heatmap.ts
  - package.json
  - src/hooks/useDashboardHabits.ts
  - src/components/layout/BottomTabBar.tsx
  - src/components/layout/MainLayout.tsx
  - src/components/layout/AppShell.tsx
  - src/pages/DashboardPage.tsx
  - src/components/dashboard/DashboardCard.tsx
  - src/App.tsx
  - src/pages/TodayPage.tsx
  - src/components/habits/FloatingAddButton.tsx
  - src/hooks/useHeatmapData.ts
  - src/components/heatmap/ContributionHeatmap.tsx
  - src/pages/HabitHistoryPage.tsx
  - src/test/setup.ts
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-07-19T21:15:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 03 delivers the dashboard navigation shell, streak-sorted habit cards, heatmap domain layer, and GitHub-style contribution grid on the history page. The implementation is generally well-structured, reuses `getWeekDayState` for schedule logic, and follows established Dexie hook patterns. However, the heatmap does not account for habit creation date — days before a habit existed are incorrectly classified as **missed** and remain tappable, which misleads users and allows backdated completions. Several tab-bar-route pages also omit required bottom padding, and dashboard data fetching lacks the error containment pattern used on Today.

## Critical Issues

### CR-01: Pre-creation days shown as missed and tappable on heatmap

**File:** `src/domain/heatmap.ts:23-44`, `src/hooks/useHeatmapData.ts:20-34`, `src/components/heatmap/ContributionHeatmap.tsx:42-72`

**Issue:** `buildHeatmapActivities` iterates the full 52-week window and delegates every cell to `getWeekDayState`, which has no concept of habit start date. For a habit created recently, all scheduled days before `getHabitStartDate(habit)` are classified as `missed` (destructive ring, tappable) instead of being visually inert. Users can toggle completions on dates before the habit existed, polluting IndexedDB with invalid records. This contradicts how stats hooks bound queries to `getHabitStartDate(habit)` and produces a misleading GitHub-style grid for new habits.

**Fix:**

```typescript
// heatmap.ts — accept habitStartDate and skip pre-creation days
export function buildHeatmapActivities(
  frequency: Frequency,
  completedDates: Set<string>,
  start: string,
  end: string,
  today: string,
  habitStartDate: string,
): { activities: Activity[]; cellStates: Map<string, WeekDayState> } {
  const cellStates = new Map<string, WeekDayState>();
  const activities: Activity[] = [];

  for (const date of iterateDaysInRange(start, end)) {
    if (date < habitStartDate) {
      cellStates.set(date, 'not-scheduled');
      activities.push({ date, count: 0, level: 0 });
      continue;
    }
    const state = getWeekDayState(date, frequency, completedDates, today);
    cellStates.set(date, state);
    activities.push({
      date,
      count: state === 'completed' ? 1 : 0,
      level: state === 'completed' ? 4 : 0,
    });
  }
  return { activities, cellStates };
}

// useHeatmapData.ts — pass habit start into builder
export function useHeatmapData(
  habitId: string,
  frequency: Frequency,
  habitStartDate: string,
  todayKey?: string,
) {
  // ...
  return buildHeatmapActivities(
    frequency,
    completedDates,
    start,
    end,
    today,
    habitStartDate,
  );
}

// ContributionHeatmap.tsx — pass habit.createdAt-derived start
<ContributionHeatmap
  habitId={habit.id}
  frequency={habit.frequency}
  habitStartDate={getHabitStartDate(habit)}
/>
```

Add unit tests for a habit created mid-range asserting pre-creation cells are `not-scheduled` and non-interactive.

## Warnings

### WR-01: HabitHistoryPage missing `hasTabBar` on tab-bar route

**File:** `src/pages/HabitHistoryPage.tsx:57-72`

**Issue:** History is nested under `MainLayout` (tab bar visible per D-04 and UI-SPEC), but `AppShell` is rendered without `hasTabBar`. Default `pb-16` (64px) is insufficient to clear the 56px fixed tab bar plus breathing room; UI-SPEC requires `pb-20` on tab-bar routes. Bottom heatmap rows and horizontally scrollable content can be obscured by the tab bar on mobile.

**Fix:**

```tsx
<AppShell title="History" hasTabBar>
  <BackButton onClick={() => navigate(-1)} />
  <HabitHistoryContent habit={habit} />
</AppShell>
```

Apply `hasTabBar` to both the loading shell (line 57) and loaded shell (line 68).

### WR-02: `useDashboardHabits` lacks IndexedDB error containment

**File:** `src/hooks/useDashboardHabits.ts:10-36`

**Issue:** Unlike `useTodayHabits`, which wraps its `useLiveQuery` callback in try/catch and returns a `QUERY_ERROR` sentinel, `useDashboardHabits` lets Dexie failures propagate. Plan 03 backstop requires IndexedDB read failure to show empty state without raw exception text; an unhandled rejection can leave the dashboard stuck loading (`null`) or surface an error boundary.

**Fix:** Mirror the `useTodayHabits` pattern — catch errors inside the query, return a sentinel, and expose `{ status: 'error' }` or treat errors as empty `items` in `DashboardPage`.

### WR-03: Heatmap does not scroll to recent weeks on mount

**File:** `src/components/heatmap/ContributionHeatmap.tsx:98-124`

**Issue:** The `overflow-x-auto` wrapper renders with default `scrollLeft = 0`, showing the oldest weeks first. UI-SPEC backstop (line 396) expects recent dates visible without manual horizontal scroll on mobile. Users opening history for a new habit must swipe right across ~52 weeks to find today.

**Fix:** Add a `ref` on the scroll container and set `scrollLeft = scrollWidth` in a `useLayoutEffect` after activities load:

```tsx
const scrollRef = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
  const el = scrollRef.current;
  if (el) el.scrollLeft = el.scrollWidth;
}, [activities]);

return (
  <div ref={scrollRef} className="overflow-x-auto -mx-4 px-4" ...>
```

### WR-04: No date rollover refresh on history/heatmap views

**File:** `src/pages/HabitHistoryPage.tsx`, `src/components/heatmap/ContributionHeatmap.tsx:21`

**Issue:** `TodayPage` refreshes `todayKey` on `visibilitychange` to handle midnight rollover, but `HabitHistoryPage` and `ContributionHeatmap` compute `today` once per mount/render without a visibility listener. A tab left open overnight can show stale today rings, incorrect future/missed states, and wrong tooltip labels until a full navigation occurs.

**Fix:** Lift `todayKey` state with a `visibilitychange` listener (same pattern as `TodayPage`) and pass it to `useHeatmapData` and the `isToday` check in `renderBlock`.

### WR-05: Bottom tab `role="tab"` missing `aria-selected`

**File:** `src/components/layout/BottomTabBar.tsx:13-45`

**Issue:** `NavLink` elements use `role="tab"` inside `role="tablist"`, but neither tab sets `aria-selected`. Screen readers cannot reliably announce which tab is active. `NavLink` sets `aria-current="page"` by default, which is not the expected attribute for tab semantics.

**Fix:** Set `aria-selected={isActive}` inside the `className` render prop callback, or remove `role="tab"` / `role="tablist"` and rely on `aria-current` from `NavLink` alone.

## Info

### IN-01: Nested `aria-label` on dashboard card button

**File:** `src/components/dashboard/DashboardCard.tsx:17-24`

**Issue:** The outer `<button>` has an `aria-label`, and the inner streak `<span>` also has `aria-label`. Nested accessible names can cause redundant or conflicting announcements for screen reader users.

**Fix:** Remove the inner `aria-label` on the streak span; the outer button label already includes the streak count per UI-SPEC.

### IN-02: Not-scheduled cell opacity differs from UI-SPEC

**File:** `src/components/heatmap/ContributionHeatmap.tsx:50`

**Issue:** UI-SPEC specifies `opacity-20` (0.2) for not-scheduled cells; implementation uses `0.15`. Minor visual inconsistency with the design contract.

**Fix:** Change `opacity: isNotScheduled ? 0.15 : ...` to `0.2`.

---

_Reviewed: 2026-07-19T21:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
