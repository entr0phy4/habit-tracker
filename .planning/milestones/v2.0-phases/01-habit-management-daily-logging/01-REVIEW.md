---
phase: 01-habit-management-daily-logging
reviewed: 2026-07-19T18:16:00Z
depth: standard
files_reviewed: 44
files_reviewed_list:
  - src/App.tsx
  - src/main.tsx
  - src/components/habits/ConfirmDialog.tsx
  - src/components/habits/FloatingAddButton.tsx
  - src/components/habits/HabitForm.tsx
  - src/components/habits/HabitRow.tsx
  - src/components/habits/HabitRow.test.tsx
  - src/components/habits/HistoryDotGrid.tsx
  - src/components/habits/HistoryDotGrid.test.tsx
  - src/components/habits/WeekDayDots.tsx
  - src/components/habits/WeekDayDots.test.tsx
  - src/components/layout/AppShell.tsx
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/ui/sonner.tsx
  - src/components/ui/toggle-group.tsx
  - src/components/ui/toggle.tsx
  - src/domain/dates.ts
  - src/domain/dates.test.ts
  - src/domain/schedule.ts
  - src/domain/schedule.test.ts
  - src/domain/types.ts
  - src/hooks/useCompletions.ts
  - src/hooks/useCreateHabit.ts
  - src/hooks/useHabits.ts
  - src/hooks/useTodayHabits.ts
  - src/hooks/useTodayHabits.test.ts
  - src/hooks/useToggleCompletion.ts
  - src/infrastructure/completionRepository.ts
  - src/infrastructure/completionRepository.test.ts
  - src/infrastructure/db.ts
  - src/infrastructure/db.test.ts
  - src/infrastructure/habitRepository.ts
  - src/infrastructure/habitRepository.test.ts
  - src/integration/walkingSkeleton.test.ts
  - src/lib/utils.ts
  - src/pages/HabitEditPage.tsx
  - src/pages/HabitHistoryPage.tsx
  - src/pages/HabitNewPage.tsx
  - src/pages/ManageHabitsPage.tsx
  - src/pages/TodayPage.tsx
  - src/test/setup.ts
  - src/vite-env.d.ts
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-07-19T18:16:00Z
**Depth:** standard
**Files Reviewed:** 44
**Status:** issues_found

## Summary

Phase 01 delivers a coherent walking skeleton: Dexie persistence, repository layer, live-query hooks, and the full create → today → check-in → manage → history loop. Domain date/schedule logic is sound, completion toggling is idempotent, and 39 tests pass. Two blockers remain: users can persist habits with zero scheduled days (never appearing on Today), and the Today view has no IndexedDB failure surface—only a blank screen while `useLiveQuery` is unresolved. Several UI-SPEC error-handling contracts are partially implemented (inline form errors instead of documented toasts; no toggle-failure feedback on Today). Advisory only; no source files were modified.

## Critical Issues

### CR-01: Weekly habit with zero scheduled days can be created

**File:** `src/components/habits/HabitForm.tsx:55-60`
**Issue:** `ToggleGroup` with `type="multiple"` allows deselecting all seven day buttons. Submit only validates the name; `toFrequency([])` produces `{ type: 'weekly', days: [] }`. `isDueOnDate` never returns true for that frequency, so the habit is persisted but never appears on Today—breaking the core loop for that record.
**Fix:**
```typescript
// In handleSubmit, before setIsSubmitting(true):
if (selectedDays.length === 0) {
  setError('Select at least one day to repeat on.');
  return;
}

// Also validate in habitRepository.create/update:
function validateFrequency(frequency: Frequency): Frequency {
  if (frequency.type === 'weekly' && frequency.days.length === 0) {
    throw new Error('Select at least one day to repeat on.');
  }
  return frequency;
}
```

### CR-02: Today view has no IndexedDB failure error state

**File:** `src/pages/TodayPage.tsx:26-28`
**Issue:** While `useTodayHabits` is loading, the page returns `null` (blank screen). UI-SPEC requires centered copy **"Couldn't save your data. Try refreshing the page."** when storage is unavailable. There is no error boundary, Dexie `on('ready')` failure handler, or `useLiveQuery` error callback—users with quota/private-browsing failures see an indefinite blank page with no recovery guidance.
**Fix:**
```typescript
// Example pattern — detect Dexie open failure or useLiveQuery error state:
const todayHabits = useTodayHabits(todayKey);
const [storageError, setStorageError] = useState<string | null>(null);

useEffect(() => {
  db.open().catch(() =>
    setStorageError("Couldn't save your data. Try refreshing the page."),
  );
}, []);

if (storageError) {
  return (
    <AppShell title="Today">
      <p className="text-center text-sm text-muted-foreground">{storageError}</p>
    </AppShell>
  );
}
```

## Warnings

### WR-01: HabitForm IndexedDB failures use inline error, not documented toast

**File:** `src/components/habits/HabitForm.tsx:61-66`
**Issue:** UI-SPEC copy contract specifies toast **"Couldn't save your data. Try refreshing the page."** for IndexedDB write failures. The catch block renders `submitError.message` inline below the name field instead, which users may not associate with a storage failure and does not match the spec.
**Fix:** In the `catch` block, call `toast.error("Couldn't save your data. Try refreshing the page.")` for non-validation errors; keep inline error only for empty-name validation.

### WR-02: Today check-in toggle has no failure feedback

**File:** `src/pages/TodayPage.tsx:56-58`
**Issue:** `HistoryDotGrid` wraps `toggle` in try/catch and shows a sonner error toast on failure. `TodayPage` calls `void toggle(habit.id, todayKey)` with no error handling—IndexedDB write failures are silent, leaving the UI stale with no user feedback.
**Fix:**
```typescript
onToggle={async () => {
  try {
    await toggle(habit.id, todayKey);
  } catch {
    toast.error("Couldn't update. Try again.");
  }
}}
```

### WR-03: History 7-day window does not refresh across midnight

**File:** `src/hooks/useCompletions.ts:6-19`
**Issue:** `getLast7Days()` is computed on each render but nothing triggers a re-render when the calendar day changes. `TodayPage` refreshes `todayKey` on `visibilitychange`; `useCompletions` / `HabitHistoryPage` do not. A history screen left open past midnight shows a stale date window until navigation or remount.
**Fix:** Mirror the `TodayPage` pattern—accept an optional `todayKey` prop or add a `visibilitychange` listener inside `useCompletions` to recompute `getLast7Days()`.

### WR-04: Repository accepts invalid weekly frequency at persistence layer

**File:** `src/infrastructure/habitRepository.ts:18-27`
**Issue:** `create` and `update` persist `frequency` without validating that `weekly.days` is non-empty and contains only integers 0–6. Invalid data can enter IndexedDB via direct repository calls or form gaps, producing habits that never appear on Today.
**Fix:** Add `validateFrequency()` in the repository and reject empty or out-of-range day arrays before `db.habits.add` / `update`.

### WR-05: Habit lists have no stable sort order

**File:** `src/hooks/useTodayHabits.ts:10-12`, `src/hooks/useHabits.ts:5-7`
**Issue:** Queries use `.filter().toArray()` without `.sortBy('createdAt')`. Dexie returns rows in primary-key (UUID) order, so habits appear in arbitrary order rather than creation sequence—confusing when users create multiple habits.
**Fix:**
```typescript
await db.habits
  .filter((habit) => !habit.archived && isDueOnDate(habit.frequency, today))
  .sortBy('createdAt');
```

## Info

### IN-01: `completionRepository.getByHabitInRange` is unused in application code

**File:** `src/hooks/useCompletions.ts:8-18`, `src/infrastructure/completionRepository.ts:18-29`
**Issue:** The repository exposes `getByHabitInRange` (tested), but `useCompletions` duplicates the Dexie range query inline. Divergent query logic risks drift if the repository layer changes.
**Fix:** Delegate to `completionRepository.getByHabitInRange(habitId, dates[0], dates[dates.length - 1])` inside the `useLiveQuery` callback.

### IN-02: Form `maxLength` (80) disagrees with repository limit (100)

**File:** `src/components/habits/HabitForm.tsx:81`, `src/infrastructure/habitRepository.ts:4`
**Issue:** UI caps names at 80 characters; repository allows 100. Not user-visible today, but the layers disagree on the canonical limit.
**Fix:** Align both to the same constant (prefer 80 per UI-SPEC).

### IN-03: ConfirmDialog lacks Escape key and focus trap

**File:** `src/components/habits/ConfirmDialog.tsx:29-64`
**Issue:** Delete confirmation is keyboard-accessible for buttons but cannot be dismissed with Escape, has no focus trap, and backdrop click always cancels—risk of accidental dismissal during destructive confirmation.
**Fix:** Add `onKeyDown` Escape handler, `useEffect` focus trap, and consider requiring explicit Cancel for destructive dialogs.

---

_Reviewed: 2026-07-19T18:16:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
