# Phase 8: Streak Freeze - Pattern Map

**Mapped:** 2026-07-24
**Files analyzed:** 22
**Analogs found:** 22 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/types.ts` | types | — | self (`Completion`) | exact |
| `src/domain/backupSchema.ts` | utility | validate | self (optional `color`) | exact |
| `src/domain/backupSchema.test.ts` | test | — | self | exact |
| `src/domain/streak.ts` | utility | transform | self (day-walk / week-hit) | exact |
| `src/domain/streak.test.ts` | test | — | self | exact |
| `src/domain/stats.ts` | utility | transform | self (`countScheduledCompletions`) | exact |
| `src/domain/stats.test.ts` | test | — | self | exact |
| `src/domain/heatmap.ts` | utility | transform | self (`STATUS_LABELS`) | exact |
| `src/domain/heatmap.test.ts` | test | — | self | exact |
| `src/infrastructure/db.ts` | infra | persist | self (version 1 stores) | exact |
| `src/infrastructure/db.test.ts` | test | — | self | exact |
| `src/infrastructure/freezeRepository.ts` | infra | persist | `completionRepository.ts` | role-match |
| `src/infrastructure/freezeRepository.test.ts` | test | — | `completionRepository.test.ts` | role-match |
| `src/infrastructure/completionRepository.ts` | infra | persist | self (toggle) | exact |
| `src/infrastructure/backupService.ts` | infra | persist | self (export/import txn) | exact |
| `src/hooks/useTodayHabits.ts` | hook | request-response | self (due filter) | exact |
| `src/hooks/useStreak.ts` | hook | request-response | self (completion range) | exact |
| `src/hooks/useHabitStats.ts` | hook | request-response | self | exact |
| `src/hooks/useHeatmapData.ts` | hook | request-response | self (toggle) | exact |
| `src/hooks/useToggleFreeze.ts` | hook | command | `useToggleCompletion.ts` | role-match |
| `src/components/habits/HabitRow.tsx` | list-item | — | self (History button) | exact |
| `src/components/heatmap/ContributionHeatmap.tsx` | presentational | — | self (cell click) | exact |

---

## Pattern Assignments

### `src/domain/types.ts` — EXTEND

**Rules:**
- Add `Freeze` mirroring `Completion` shape
- Add optional `freezes?: Freeze[]` on `BackupPayload`
- Do not add status to `Completion`

---

### `src/infrastructure/db.ts` — EXTEND

**Analog:** `this.version(1).stores(...)`

**Rules:**
- Keep version 1 definition for upgrade path
- Add `version(2)` with `freezes: '[habitId+date], habitId, date'`
- Declare `freezes!: Table<Freeze, [string, string]>`

---

### `src/infrastructure/freezeRepository.ts` — CREATE

**Analog:** `completionRepository.ts`

**Shape:**

```typescript
export const freezeRepository = {
  set(habitId: string, date: string): Promise<void>,
  clear(habitId: string, date: string): Promise<void>,
  toggle(habitId: string, date: string): Promise<void>,
  getByHabitInRange(habitId: string, start: string, end: string): Promise<string[]>,
};
```

**Rules:**
- Reject future dates (`isFutureDate`)
- `set`/`toggle→on` run in `db.transaction('rw', db.completions, db.freezes, ...)` and delete opposing completion
- Compound key `[habitId+date]` same as completions

---

### `src/infrastructure/completionRepository.ts` — EXTEND

**Rules:**
- When putting a completion (toggle on), delete freeze for same key in same transaction
- Toggle off (delete completion) does not invent a freeze

---

### `src/domain/streak.ts` / `stats.ts` / `heatmap.ts` — EXTEND

**Rules:**
- Thread `frozenDates: Set<string>` through public calculators
- Bridge: frozen due day → continue without increment
- Rates: exclude frozen due days; X/week `effectiveTimes`
- `WeekDayState` union gains `'frozen'`; heatmap label `Omitido`

---

### `src/hooks/useTodayHabits.ts` — EXTEND

**Rules:**
- Load today's freezes (or week freezes)
- Filter: `isHabitDueOnDate && !frozenToday`
- Keep QUERY_ERROR pattern

---

### `src/hooks/useStreak.ts` / `useHabitStats.ts` / `useHeatmapData.ts` — EXTEND

**Rules:**
- Parallel `getByHabitInRange` for freezes
- Pass `frozenDates` into domain
- `useHeatmapData` exposes `cycle(date)` implementing UI-SPEC order

---

### `src/components/habits/HabitRow.tsx` — EXTEND

**Analog:** History `Button` with `stopPropagation`

**Rules:**
- Optional `onSkip?: () => void`
- Snowflake icon button, aria `Omitir`, before History
- Do not replace primary complete

---

### `src/components/heatmap/ContributionHeatmap.tsx` — EXTEND

**Rules:**
- Interactive predicate includes `'frozen'` and X/week `'not-scheduled'` past/today
- Call `cycle` instead of binary toggle
- Frozen cell style per UI-SPEC (`#58a6ff` dashed)

---

### `src/infrastructure/backupService.ts` — EXTEND

**Rules:**
- Export always includes `freezes` array (possibly empty)
- Import transactional clear+bulkAdd freezes with habits/completions
- Zod default missing freezes to `[]`

---

## Anti-Patterns to Avoid

| Anti-pattern | Instead |
|--------------|---------|
| `Completion.status = 'frozen'` | Separate `Freeze` records |
| Counting freeze in rate numerator | Exclude from num and denom |
| `streak++` on frozen day | Bridge continue only |
| Long-press freeze | Tap cycle |
| Replacing row tap with Skip | Secondary Omitir button |
| Backup version 2 | Additive `freezes` on v1 |
| Silent weekend auto-freeze | Explicit user action only |
| Panel card freeze editing | History + Today only |
