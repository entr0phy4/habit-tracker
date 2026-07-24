# Phase 7: Flexible Weekly Frequency - Pattern Map

**Mapped:** 2026-07-24
**Files analyzed:** 18
**Analogs found:** 18 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/types.ts` | types | — | self (`Frequency` union) | exact |
| `src/domain/dates.ts` | utility | transform | self (`getCalendarWeekDates`) | exact |
| `src/domain/dates.test.ts` | test | — | self | exact |
| `src/domain/schedule.ts` | utility | transform | self (`isDueOnDate`) | exact |
| `src/domain/schedule.test.ts` | test | — | self | exact |
| `src/domain/streak.ts` | utility | transform | self (day-walk) | role-match |
| `src/domain/streak.test.ts` | test | — | self (MWF fixtures) | role-match |
| `src/domain/stats.ts` | utility | transform | self (`countScheduledCompletions`) | exact |
| `src/domain/stats.test.ts` | test | — | self + Phase 6 pooled tests | exact |
| `src/domain/backupSchema.ts` | utility | validate | self (color optional / union) | exact |
| `src/domain/backupSchema.test.ts` | test | — | self | exact |
| `src/hooks/useTodayHabits.ts` | hook | request-response | self + schedule filter | exact |
| `src/hooks/useTodayHabits.test.ts` | test | — | self | exact |
| `src/components/habits/HabitForm.tsx` | form | request-response | self (day toggles + color) | exact |
| `src/components/habits/HabitForm.test.tsx` | test | — | self (color) | role-match |
| `src/components/habits/WeekQuotaChip.tsx` | presentational | — | `WeekDayDots.tsx` slot | role-match |
| `src/components/habits/HabitRow.tsx` | list-item | — | self (`WeekDayDots` branch) | exact |
| `src/integration/walkingSkeleton.test.ts` | test | — | self due filter | role-match |

---

## Pattern Assignments

### `src/domain/types.ts` — EXTEND

**Rules:**
- Add `| { type: 'times_per_week'; times: number }` only
- Do not change `daily` / `weekly` shapes
- Document `times ∈ 1..7` in comment (runtime enforce in Zod + form)

---

### `src/domain/dates.ts` — EXTEND

**Analog:** `getCalendarWeekDates` + `WEEK_OPTS.weekStartsOn: 1`

**Shape:**

```typescript
export function countCompletionsInCalendarWeek(
  completedDates: Set<string>,
  dateInWeek: string,
): number;

export function iterateCalendarWeeksInRange(
  startDate: string,
  endDate: string,
): Generator<{ weekStart: string; weekEnd: string }>;
```

**Rules:**
- Use noon-local parse pattern (`T12:00:00`) consistent with existing helpers
- Week membership = dates returned by `getCalendarWeekDates` for any day in that week

---

### `src/domain/schedule.ts` — EXTEND

**Rules:**
- `isDueOnDate`: `times_per_week` → **always `false`**
- Add `isHabitDueOnDate(frequency, dateStr, completedDates)` as universal entry
- `isDaily`: `times_per_week` → `false` even if `times === 7`

---

### `src/domain/streak.ts` — EXTEND

**Rules:**
- Preserve day-walk for `daily` / `weekly`
- Branch on `frequency.type === 'times_per_week'` for week-hit walk
- Optional export `isWeekHit` if it clarifies tests
- No freeze / skip semantics (Phase 8)

---

### `src/domain/stats.ts` — EXTEND

**Rules:**
- `countScheduledCompletions`: week-cap branch for X/week; keep day loop for others
- `getWeekDayState`: X/week never returns `'missed'`
- `calculateCompletionRate` / `calculateOverallCompletionRate` unchanged signatures

---

### `src/domain/backupSchema.ts` — EXTEND

**Analog:** Phase 5 optional `color` additive change

**Rules:**
- `version: 1` literal unchanged
- Add times_per_week object with `times: z.number().int().min(1).max(7)`
- Reject 0 / 8 / non-int

---

### `src/hooks/useTodayHabits.ts` — EXTEND

**Rules:**
- Load completions for current Mon–Sun week (not only today)
- Filter with `isHabitDueOnDate`
- Prefer exposing `weekCompletions` on entries for times_per_week chip
- Keep QUERY_ERROR pattern

---

### `src/components/habits/HabitForm.tsx` — EXTEND

**Analog:** Color radiogroup section pattern

**Rules:**
- Exclusive mode: Specific days | Times per week (UI-SPEC copy)
- Default create: Specific days + all 7 → daily
- Times: ToggleGroup single 1–7, default 3 when switching mode
- Exhaustive mapping to `Frequency` on submit

---

### `src/components/habits/WeekQuotaChip.tsx` — CREATE

**Analog:** `WeekDayDots` as non-interactive schedule chrome

**Rules:**
- Props: `done: number`, `times: number`, `accentColor: string`, `className?`
- Text `{done}/{times}`; aria `{done} of {times} this week`
- Habit color accent; no card chrome

---

### `src/components/habits/HabitRow.tsx` — EXTEND

**Rules:**
- Branch: times_per_week → WeekQuotaChip; else WeekDayDots
- Flame aria: "N week streak" when times_per_week (research discretion)
- Receive weekCompletions from parent or compute via props — prefer parent pass from `useTodayHabits`

---

## Anti-Patterns to Avoid

| Anti-pattern | Instead |
|--------------|---------|
| Fake weekday dots for X/week | Quota chip |
| Day-streak walk for X/week | Week-hit streak |
| `isDueOnDate` alone on Today | `isHabitDueOnDate` + week completions |
| Backup v2 bump | Additive Zod member |
| Red missed cells for empty X/week days | `not-scheduled` |

---

## PATTERN MAPPING COMPLETE
