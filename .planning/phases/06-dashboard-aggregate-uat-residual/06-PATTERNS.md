# Phase 6: Dashboard Aggregate & UAT Residual - Pattern Map

**Mapped:** 2026-07-23
**Files analyzed:** 16
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/stats.ts` | utility | transform | self (`calculateCompletionRate`) | exact |
| `src/domain/stats.test.ts` | test | — | self | exact |
| `src/hooks/useDashboardHabits.ts` | hook | request-response | `useTodayHabits.ts` (error) + self (batch) | role-match |
| `src/hooks/useDashboardHabits.test.ts` | test | — | self + `useTodayHabits.test.ts` error case | role-match |
| `src/hooks/useStreak.ts` | hook | request-response | `useTodayHabits.ts` try/catch | role-match |
| `src/hooks/useStreak.test.ts` | test | — | `useTodayHabits.test.ts` | role-match |
| `src/hooks/useHabitStats.ts` | hook | request-response | `useTodayHabits.ts` try/catch | role-match |
| `src/hooks/useHabitStats.test.ts` | test | — | `useTodayHabits.test.ts` | role-match |
| `src/pages/DashboardPage.tsx` | route | request-response | self + `TodayPage.tsx` error branch | role-match |
| `src/pages/DashboardPage.test.tsx` | test | — | self | exact |
| `src/components/habits/StatCards.test.tsx` | test | — | self | exact |
| `.planning/phases/02-streaks-statistics/02-UAT.md` | docs | — | self (result fields) | exact |
| Optional: reactivity integration test | test | — | `useDashboardHabits.test.ts` + toggle | role-match |

*No new domain types file. No Dexie schema. No backupSchema. Habit.color (Phase 5) optional — fixtures may or may not include color depending on whether Phase 5 merged first; do not require color for Phase 6.*

---

## Pattern Assignments

### `src/domain/stats.ts` — EXTEND

**Analog:** existing `calculateCompletionRate` loop

**Rules:**
- Pure module — no React / Dexie imports
- Prefer extracting shared loop into `countScheduledCompletions`
- `calculateCompletionRate` may delegate to counts for DRY; keep signature stable
- `calculateOverallCompletionRate` pools counts across habit inputs (D-06)

**Shape:**

```typescript
export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): { completed: number; scheduled: number } { /* same gates as rate */ }

export function calculateOverallCompletionRate(
  habits: Array<{
    frequency: Frequency;
    completedDates: Set<string>;
    startDate: string;
  }>,
  endDate: string,
  today: Date = new Date(),
): number {
  // Σ completed / Σ scheduled → Math.round; 0 if scheduled === 0
}
```

**Tests to add (`stats.test.ts`):**
- Single habit overall equals `calculateCompletionRate`
- Two habits pooled ≠ mean of rates (1/1 + 0/99 → ~1%, not 50%)
- Empty habits array → 0
- scheduled sum 0 → 0
- Excludes future days (inherit from count helper)

---

### `src/hooks/useTodayHabits.ts` — REFERENCE ONLY (do not modify unless needed)

**Canonical QUERY_ERROR pattern:**

```typescript
const QUERY_ERROR = Symbol('QUERY_ERROR');

const result = useLiveQuery(async () => {
  try {
    // …reads…
    return data;
  } catch {
    return QUERY_ERROR;
  }
}, [deps]);

if (result === undefined) return { status: 'loading' };
if (result === QUERY_ERROR) return { status: 'error' };
return { status: 'ready', … };
```

Copy this structure into dashboard / streak / stats hooks.

---

### `src/hooks/useDashboardHabits.ts` — EXTEND

**Analog:** self + `useTodayHabits` error containment

**Rules:**
- Wrap live-query body in try/catch → `QUERY_ERROR`
- Still filter `!habit.archived`
- Compute `overallRate` in the same query after loading completions per habit
- Return `{ status, items, overallRate, isLoading }` where `isLoading === (status === 'loading')` for backward compatibility
- On error: `items: []`, `overallRate: 0`, `status: 'error'`

**Do not** open a second `useLiveQuery` solely for overall rate.

---

### `src/hooks/useStreak.ts` / `useHabitStats.ts` — EXTEND

**Analog:** `useTodayHabits` try/catch

**Rules:**
- Keep existing public field names (`currentStreak`, `current`/`longest`/`rate`, `isLoading`)
- On `QUERY_ERROR`: return zeros + `isLoading: false` (D-13)
- Optional: expose `status: 'error'` only if useful — not required by consumers today

**Tests (CREATE):**
- Happy path with seeded completions (mirror dashboard hook style)
- Spy repository / Dexie to throw → zeros / no throw to React

---

### `src/pages/DashboardPage.tsx` — EXTEND

**Analog:** self + `TodayPage` error branch

**Rules:**
- loading → `null`
- error → soft Spanish message, no rate, no cards
- ready + empty → existing empty state, **no** rate (D-04)
- ready + items → "Tasa general" summary then `<ul>` of `DashboardCard`
- Pass `overallRate` into summary; format `${overallRate}%`

**Do not** add rate onto `DashboardCard`.

---

### `src/components/habits/StatCards.test.tsx` — EXTEND

**Analog:** self

Add case:

```typescript
it('renders large integers without abbreviation', () => {
  render(<StatCards current={1234} longest={5678} rate={100} />);
  expect(screen.getByText('1234')).toBeTruthy();
  expect(screen.getByText('5678')).toBeTruthy();
});
```

No component redesign unless test fails (it should already pass — D-10).

---

### Reactivity check (D-11)

**Preferred location:** extend `useDashboardHabits.test.ts` or add hook-level toggle test:

1. Seed habit + completions
2. Render hook / page with live query
3. `completionRepository.toggle(...)`
4. `waitFor` overallRate / streak change

Optional component-level: History content with mocked hook is weaker — prefer real Dexie + `fake-indexeddb`.

---

### `02-UAT.md` — UPDATE at end of Plan 03

When automated evidence exists, set:

| Test | result |
|------|--------|
| 1 Reactive stats | `[passed]` + note automated + heatmap reinterpretation |
| 2 useStreak fallback | `[passed]` + cite `useStreak.test.ts` |
| 3 useHabitStats fallback | `[passed]` + cite `useHabitStats.test.ts` |
| 4 Large integers | `[passed]` + cite `StatCards.test.tsx` |

Update Summary counts accordingly.

---

## Anti-Patterns (do not copy)

| Anti-pattern | Why |
|--------------|-----|
| `alert(error.message)` / toast with Dexie text | Violates D-14 |
| Averaging `calculateCompletionRate` results | Violates D-06 |
| Adding rate to `DashboardCard` | Violates D-01 |
| Persisting `overallRate` in Dexie | Violates compute-on-read |
| New npm chart library for one percent | Out of scope |
| Blocking Phase 6 on `habit.color` | Explicitly non-blocking |

---

## Wave Dependency Sketch

```text
Wave 1: stats domain (06-01)
    ↓
Wave 2: hooks + QUERY_ERROR + overallRate (06-02)
    ↓
Wave 3: DashboardPage UI + StatCards integer test + 02-UAT closeout (06-03)
```
