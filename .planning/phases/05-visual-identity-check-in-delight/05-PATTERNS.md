# Phase 5: Visual Identity & Check-in Delight - Pattern Map

**Mapped:** 2026-07-23
**Files analyzed:** 24
**Analogs found:** 24 / 24

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/habitColors.ts` | utility | transform | `src/domain/heatmap.ts` + `streak.ts` | role-match |
| `src/domain/habitColors.test.ts` | test | — | `src/domain/streak.test.ts` | exact |
| `src/domain/types.ts` | types | — | self (`Habit` add `color`) | exact |
| `src/domain/backupSchema.ts` | utility | transform | self (extend `habitSchema`) | exact |
| `src/domain/backupSchema.test.ts` | test | transform | self (extend) | exact |
| `src/infrastructure/db.ts` | migration | CRUD | self (`version(1)` → add `version(2)`) | exact |
| `src/infrastructure/db.test.ts` | test | CRUD | self (extend reopen pattern) | exact |
| `src/infrastructure/habitRepository.ts` | service | CRUD | self (`create`/`update`) | exact |
| `src/infrastructure/habitRepository.test.ts` | test | CRUD | self (extend) | exact |
| `src/hooks/useCreateHabit.ts` | hook | request-response | self (pass `color` through) | exact |
| `src/components/habits/HabitForm.tsx` | component | event-driven | self (add field like Repeat on) | exact |
| `src/components/habits/HabitForm.test.tsx` | test | event-driven | `src/components/habits/HabitRow.test.tsx` | role-match |
| `src/components/habits/HabitRow.tsx` | component | event-driven | self (accents + celebrate state) | exact |
| `src/components/habits/HabitRow.test.tsx` | test | event-driven | self (extend) | exact |
| `src/components/habits/WeekDayDots.tsx` | component | — | self (optional `accentColor`) | exact |
| `src/components/habits/WeekDayDots.test.tsx` | test | — | self (assert accent vs `bg-primary`) | exact |
| `src/components/dashboard/DashboardCard.tsx` | component | event-driven | self + `HabitRow` accent bar | role-match |
| `src/components/dashboard/DashboardCard.test.tsx` | test | event-driven | self (extend) | exact |
| `src/components/heatmap/ContributionHeatmap.tsx` | component | event-driven | self (`heatmapTheme` → prop) | exact |
| `src/components/heatmap/ContributionHeatmap.test.tsx` | test | event-driven | self (extend) | exact |
| `src/pages/ManageHabitsPage.tsx` | route | event-driven | self (swatch beside name) | exact |
| `src/pages/HabitEditPage.tsx` | route | event-driven | self (`initialValues` + update) | exact |
| `src/pages/HabitHistoryPage.tsx` | route | request-response | self (pass `color` to heatmap) | exact |
| `src/index.css` | config | — | self (`@theme` + new `@keyframes`) | exact |

*Also touch fixtures in any `*.test.ts(x)` that construct `Habit` without `color` once the type requires it — same pattern as Phase 4 fixture churn.*

---

## Pattern Assignments

### `src/domain/habitColors.ts` (utility, transform) — CREATE

**Analog:** `src/domain/heatmap.ts` + `src/domain/streak.ts`

**Rules (copy from domain pure modules):**
- Zero imports from `infrastructure/` or React
- Named exports of constants + pure functions
- Colocated `habitColors.test.ts`

**Shape to mirror** (`heatmap.ts` exports + helpers):

```typescript
// src/domain/heatmap.ts — pure module style
export const HEATMAP_WEEKS = 52;

export function buildHeatmapActivities(
  frequency: Frequency,
  completedDates: Set<string>,
  start: string,
  end: string,
  today: string,
): { activities: Activity[]; cellStates: Map<string, WeekDayState> } {
  // …
}
```

**Recommended API (from RESEARCH):**

```typescript
export const DEFAULT_HABIT_COLOR = '#3fb950';

export const HABIT_COLOR_PRESETS: ReadonlyArray<{ id: string; hex: string }> = [
  { id: 'green', hex: '#3fb950' },
  { id: 'teal', hex: '#39d2c0' },
  { id: 'blue', hex: '#58a6ff' },
  { id: 'purple', hex: '#bc8cff' },
  { id: 'pink', hex: '#f778ba' },
  { id: 'orange', hex: '#db6d28' },
  { id: 'yellow', hex: '#d29922' },
  { id: 'red', hex: '#f85149' },
];

export function normalizeHabitColor(value: unknown): string {
  // Accept /^#[0-9a-f]{6}$/ only; else DEFAULT_HABIT_COLOR
}

export function buildHeatmapTheme(hex: string): { dark: string[] } {
  // dark[0] = '#21262d'; dark[4] = normalized hex;
  // dark[1..3] = mix toward #0d1117 (~75% / 55% / 30% black)
}
```

---

### `src/domain/habitColors.test.ts` — CREATE

**Analog:** `src/domain/streak.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HABIT_COLOR,
  HABIT_COLOR_PRESETS,
  buildHeatmapTheme,
  normalizeHabitColor,
} from './habitColors';

describe('normalizeHabitColor', () => {
  it('accepts valid lowercase #RRGGBB', () => {
    expect(normalizeHabitColor('#58a6ff')).toBe('#58a6ff');
  });

  it('falls back for missing/invalid', () => {
    expect(normalizeHabitColor(undefined)).toBe(DEFAULT_HABIT_COLOR);
    expect(normalizeHabitColor('#FF0000')).toBe(DEFAULT_HABIT_COLOR);
  });
});

describe('buildHeatmapTheme', () => {
  it('returns 5 stops with fixed empty and habit peak', () => {
    const { dark } = buildHeatmapTheme('#58a6ff');
    expect(dark).toHaveLength(5);
    expect(dark[0]).toBe('#21262d');
    expect(dark[4]).toBe('#58a6ff');
  });
});
```

Also assert `HABIT_COLOR_PRESETS.length === 8`.

---

### `src/domain/types.ts` — MODIFY

**Analog:** self

Add required field on `Habit`:

```typescript
export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  archived: boolean;
  createdAt: string;
  color: string; // #RRGGBB lowercase
}
```

`BackupPayload.habits` stays `Habit[]` — import path normalizes so runtime objects always have `color` before `bulkAdd`.

---

### `src/domain/backupSchema.ts` (utility, transform) — MODIFY

**Analog:** self (`habitSchema` + `parseBackupJson`)

**Current habit object** (extend — do **not** bump `version: z.literal(1)`):

```typescript
const habitSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  frequency: frequencySchema,
  archived: z.boolean(),
  createdAt: z.string().min(1),
  // Phase 5: color optional for old exports
  color: z.string().optional(),
});
```

**Normalize after successful parse** (keep version short-circuit unchanged):

```typescript
// Existing version gate — keep as-is
if (
  parsed !== null &&
  typeof parsed === 'object' &&
  'version' in parsed &&
  (parsed as { version: unknown }).version !== 1
) {
  return { ok: false, error: 'unsupported_version' };
}

const result = backupPayloadSchema.safeParse(parsed);
if (!result.success) {
  return { ok: false, error: 'invalid' };
}

const data: BackupPayload = {
  ...result.data,
  habits: result.data.habits.map((h) => ({
    ...h,
    color: normalizeHabitColor(h.color),
  })),
};
return { ok: true, data };
```

Import `normalizeHabitColor` from `./habitColors`. Invalid hex → default, never hard-fail (D-04).

---

### `src/infrastructure/db.ts` (migration, CRUD) — MODIFY

**Analog:** self `version(1)` block — keep both versions when upgrade is present

**Current:**

```typescript
this.version(1).stores({
  habits: 'id, archived, createdAt',
  completions: '[habitId+date], habitId, date',
});
```

**Add (indexes unchanged):**

```typescript
this.version(1).stores({
  habits: 'id, archived, createdAt',
  completions: '[habitId+date], habitId, date',
});

this.version(2)
  .stores({
    habits: 'id, archived, createdAt',
    completions: '[habitId+date], habitId, date',
  })
  .upgrade((tx) =>
    tx
      .table('habits')
      .toCollection()
      .modify((habit) => {
        if (typeof (habit as { color?: unknown }).color !== 'string') {
          (habit as { color: string }).color = '#3fb950';
        }
      }),
  );
```

Prefer `DEFAULT_HABIT_COLOR` from `@/domain/habitColors` instead of a duplicated literal.

---

### `src/infrastructure/db.test.ts` — MODIFY

**Analog:** self reopen pattern

```typescript
it('persists data across closing and reopening the database', async () => {
  await database.habits.add({
    id: 'habit-1',
    name: 'Read',
    frequency: { type: 'daily' },
    archived: false,
    createdAt: new Date().toISOString(),
    // Phase 5: include color on all Habit fixtures
    color: '#3fb950',
  });
  // …
});
```

**Add upgrade coverage:** seed v1-shaped rows (or open DB that runs upgrade), assert missing `color` becomes `#3fb950` after open through `HabitTrackerDB`.

---

### `src/infrastructure/habitRepository.ts` (service, CRUD) — MODIFY

**Analog:** self `create` / `update`

```typescript
async create(data: {
  name: string;
  frequency: Frequency;
  color?: string;
}): Promise<Habit> {
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: validateName(data.name),
    frequency: data.frequency,
    archived: false,
    createdAt: new Date().toISOString(),
    color: normalizeHabitColor(data.color ?? DEFAULT_HABIT_COLOR),
  };
  await db.habits.add(habit);
  return habit;
},

async update(
  id: string,
  data: Partial<Pick<Habit, 'name' | 'frequency' | 'archived' | 'color'>>,
): Promise<void> {
  const updates = { ...data };
  if (data.name !== undefined) {
    updates.name = validateName(data.name);
  }
  if (data.color !== undefined) {
    updates.color = normalizeHabitColor(data.color);
  }
  await db.habits.update(id, updates);
},
```

---

### `src/hooks/useCreateHabit.ts` — MODIFY

**Analog:** self

```typescript
async (data: {
  name: string;
  frequency: Frequency;
  color: string;
}): Promise<Habit> => {
  return habitRepository.create(data);
},
```

`HabitNewPage` already passes whole `HabitFormValues` — once form includes `color`, create path wires through with no page logic change beyond types.

---

### `src/components/habits/HabitForm.tsx` (component, event-driven) — MODIFY

**Analog:** self — mirror the **Repeat on** field block (Label + grouped controls + `min-h-11`)

**Extend values:**

```typescript
export interface HabitFormValues {
  name: string;
  frequency: Frequency;
  color: string;
}
```

**State seed:**

```typescript
const [color, setColor] = useState(
  initialValues?.color ?? DEFAULT_HABIT_COLOR,
);
```

**Submit payload** — add `color` beside name/frequency.

**UI pattern to copy** (English labels, touch targets):

```tsx
<div className="flex flex-col gap-2">
  <Label className="font-semibold">Repeat on</Label>
  <ToggleGroup
    type="multiple"
    /* …
    aria-label="Repeat on days"
  >
    {/* items use className="min-h-11 min-w-11" */}
  </ToggleGroup>
</div>
```

**Color block (new):**
- Label **"Color"** (D-07)
- Container `role="radiogroup"` `aria-label="Color"`
- Each swatch: `role="radio"`, `aria-checked`, visual circle + hit area `min-h-11 min-w-11`
- Selected: ring matching swatch (`style={{ boxShadow / outlineColor }}` or ring with inline color — see Shared Patterns)
- Iterate `HABIT_COLOR_PRESETS` — no free-form input

---

### `src/components/habits/HabitForm.test.tsx` — CREATE

**Analog:** `src/components/habits/HabitRow.test.tsx` (RTL + vitest)

Cover:
- Radiogroup labeled "Color"
- Selecting a non-default swatch → `onSubmit` receives that hex
- Default color when no `initialValues`

---

### `src/components/habits/HabitRow.tsx` (component, event-driven) — MODIFY

**Analog:** self — reuse `cn`, swipe `style={{ transform }}`, completed text treatment, Flame badge

**Existing anchors to preserve:**

```tsx
<div className="absolute inset-y-0 left-0 w-12 bg-primary/20" aria-hidden />
{/* completed: */}
isCompleted ? 'bg-muted' : 'bg-card hover:bg-[#1c2128]'
{/* text: */}
isCompleted && 'text-muted-foreground line-through'
<Flame className="h-4 w-4 text-primary" aria-hidden />
<WeekDayDots frequency={habit.frequency} className="shrink-0" />
```

**Phase 5 changes:**
1. Left **accent bar** 3–4px using `habit.color` (prefer thin bar, not only the swipe strip)
2. Swipe-reveal strip + week dots: habit color instead of `bg-primary` / `bg-primary/20`
3. Resting completed: low-opacity habit wash (`style` backgroundColor with alpha) instead of bare `bg-muted` alone; keep strikethrough
4. On incomplete→complete only: local `isCelebrating` for ≤200ms; class `habit-checkin-pulse` (keyframes in `index.css`)
5. Flame stays; optionally tint with `style={{ color: habit.color }}` for consistency with DashboardCard — do not remove badge

**Celebrate edge (local state only — no Zustand):**

```tsx
const [isCelebrating, setIsCelebrating] = useState(false);
const wasCompleted = useRef(isCompleted);

useEffect(() => {
  if (isCompleted && !wasCompleted.current) {
    setIsCelebrating(true);
    const id = window.setTimeout(() => setIsCelebrating(false), 180);
    return () => window.clearTimeout(id);
  }
  wasCompleted.current = isCompleted;
}, [isCompleted]);
```

Apply animation on **inner** content / background classes — keep `translateX` transform ownership on the swipe layer so pulse does not fight swipe (pitfall from RESEARCH).

Pass `accentColor={habit.color}` into `WeekDayDots`.

---

### `src/components/habits/WeekDayDots.tsx` — MODIFY

**Analog:** self

```tsx
interface WeekDayDotsProps {
  frequency: Frequency;
  className?: string;
  accentColor?: string; // when set, scheduled dots use this instead of bg-primary
}
```

Scheduled dots: if `accentColor`, use `style={{ backgroundColor: accentColor }}` and drop `bg-primary`; unscheduled stay `bg-border`.

Update `WeekDayDots.test.tsx` accordingly (today asserts `.bg-primary`).

---

### `src/components/dashboard/DashboardCard.tsx` — MODIFY

**Analog:** self + HabitRow left accent / Flame

**Discretion lock:** left bar + Flame tint only — **no** border tint.

```tsx
<button
  type="button"
  className="relative flex min-h-11 w-full … border border-border bg-card …"
>
  <span
    className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
    style={{ backgroundColor: habit.color }}
    aria-hidden
  />
  <span className="min-w-0 flex-1 truncate pl-2">{habit.name}</span>
  <span className="flex shrink-0 items-center gap-1" aria-label={`${currentStreak} day streak`}>
    <Flame className="h-4 w-4" style={{ color: habit.color }} aria-hidden />
    <span className="text-xs font-semibold text-foreground">{currentStreak}</span>
  </span>
</button>
```

---

### `src/components/heatmap/ContributionHeatmap.tsx` — MODIFY

**Analog:** self — replace module-level `heatmapTheme`

**Current (anti-pattern to remove):**

```typescript
const heatmapTheme = {
  dark: ['#21262d', '#0e4429', '#006d32', '#26a641', '#3fb950'],
};
```

**Replace with:**

```typescript
interface ContributionHeatmapProps {
  habitId: string;
  frequency: Frequency;
  color: string;
}

export function ContributionHeatmap({ habitId, frequency, color }: ContributionHeatmapProps) {
  const theme = buildHeatmapTheme(normalizeHabitColor(color));
  // …
  theme={theme}
```

**Today stroke** (D-11) — change from `var(--primary)` to habit color:

```typescript
stroke: isMissed
  ? 'var(--destructive)'
  : isToday
    ? normalizeHabitColor(color)
    : block.props.style?.stroke,
```

Missed stays `--destructive`.

---

### `src/pages/HabitHistoryPage.tsx` — MODIFY

**Analog:** self

```tsx
<ContributionHeatmap
  habitId={habit.id}
  frequency={habit.frequency}
  color={habit.color}
/>
```

Update `HabitHistoryPage.test.tsx` mock props if it asserts heatmap props.

---

### `src/pages/ManageHabitsPage.tsx` — MODIFY

**Analog:** self list button row

**Current name span:**

```tsx
<span className="truncate">{habit.name}</span>
```

**Add 8px read-only swatch** (discretion):

```tsx
<span className="flex min-w-0 items-center gap-2">
  <span
    className="h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: habit.color }}
    aria-hidden
  />
  <span className="truncate">{habit.name}</span>
</span>
```

Optional: same cue on archived rows. Swatch is identity only — not interactive (row button remains the hit target).

---

### `src/pages/HabitEditPage.tsx` — MODIFY

**Analog:** self

```tsx
initialValues={{
  name: habit.name,
  frequency: habit.frequency,
  color: habit.color,
}}

await habitRepository.update(id!, {
  name: values.name,
  frequency: values.frequency,
  color: values.color,
});
```

---

### `src/index.css` (config) — MODIFY

**Analog:** self `@theme` block — keep global `--color-primary: #3fb950` for FAB/tabs

**Add after `@theme` / in a utilities layer:**

```css
@keyframes habit-checkin-pulse {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.habit-checkin-pulse {
  animation: habit-checkin-pulse 180ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .habit-checkin-pulse {
    animation: none;
  }
}
```

Resting / celebration washes stay as inline `backgroundColor` with alpha on the row — CSS class only owns the keyframe scale.

---

## Shared Patterns

### Dexie upgrade (v2 backfill)

**Source:** RESEARCH Pattern 2 + `src/infrastructure/db.ts` v1 stores  
**Apply to:** `db.ts`, `db.test.ts`

- Keep **identical** store index strings; do not index `color`
- Keep **both** `version(1)` and `version(2)` blocks because an upgrader is present
- Backfill only when `color` is missing / non-string → `DEFAULT_HABIT_COLOR`
- Tests must open through `HabitTrackerDB` so upgrade runs

### Zod optional + default (backup stays version 1)

**Source:** `src/domain/backupSchema.ts` + `normalizeHabitColor`  
**Apply to:** `backupSchema.ts`, `backupSchema.test.ts`, import path

- `color: z.string().optional()` on `habitSchema`
- Never change `version: z.literal(1)` or reject missing color
- After `safeParse`, map habits through `normalizeHabitColor` so `BackupPayload` / `Habit.color` is always present for `bulkAdd`
- Invalid hex → default; do not return `invalid` solely for bad color
- Tests: old habit without `color` parses ok; custom valid preserved; invalid normalized

### CSS animation in `index.css`

**Source:** D-13/D-16/D-17 + existing `active:scale-[0.98]` motion  
**Apply to:** `index.css`, `HabitRow.tsx`

- No framer-motion / Lottie
- Keyframe name `habit-checkin-pulse`, ~180ms, `ease-out`
- Gate with `@media (prefers-reduced-motion: reduce) { animation: none }`
- Still apply resting color wash when motion is reduced
- Celebrate on complete edge only; Flame badge unchanged

### `style={{ color }}` / `backgroundColor` vs Tailwind arbitrary values

**Source:** `HabitRow.tsx` already uses `style={{ transform }}`; heatmap uses inline `style` on blocks  
**Apply to:** HabitRow, WeekDayDots, DashboardCard, ManageHabitsPage swatch, HabitForm selected ring, heatmap today stroke

| Use | Prefer |
|-----|--------|
| Dynamic per-habit hex from data | Inline `style={{ color }}` / `backgroundColor` / `stroke` |
| Global chrome (FAB, tabs, submit) | Tailwind tokens `bg-primary` / `text-primary` |
| Fixed empty heatmap cell | Constant `#21262d` from `buildHeatmapTheme` |
| Destructive missed stroke | `var(--destructive)` / token classes — never habit red on Delete buttons |

**Why:** Tailwind arbitrary values like `bg-[#58a6ff]` require a known class string at build time; habit colors are runtime data. Do **not** interpolate raw user strings into CSS selectors — only set after `normalizeHabitColor` (`/^#[0-9a-f]{6}$/`).

Opacity washes: prefer `color-mix(in srgb, ${hex} 15%, transparent)` or equivalent rgba from a small helper in `habitColors.ts` rather than stacking multiple translucent layers to neon.

### Form → repo color wire

**Source:** `HabitForm` → `HabitNewPage` / `useCreateHabit` / `HabitEditPage` → `habitRepository`  
**Apply to:** form values, create hook, edit update, repository Pick types

English **"Color"** label on form; Spanish chrome elsewhere unchanged.

### Fixture / type churn

**Source:** Phase 4 habit fixtures; RESEARCH Common Pitfalls  
**Apply to:** every `Habit` object literal and `habits.add` in tests

After `color` is required, grep and add `color: '#3fb950'` (or intentional custom) everywhere — same as db.test / HabitRow.test fixtures today.

---

## Anti-Patterns to Avoid

| Anti-pattern | Instead |
|--------------|---------|
| Hardcoded green `heatmapTheme` constant | `buildHeatmapTheme(habit.color)` |
| Bump backup `version` to 2 | Keep v1; optional + normalize |
| Free-form color input | 8 preset swatches |
| Animate on uncomplete | Complete edge only |
| Replace Flame with animation | Keep Flame; animation additive |
| Habit red on destructive buttons | Identity accents only; buttons use `--destructive` |
| Zustand for celebrate flag | Local HabitRow state |
| Tailwind `bg-[${habit.color}]` | Normalized inline `style` |
| Index `color` in Dexie stores | Same indexes; upgrade only |
| Put helpers in `src/lib/colors.ts` | `src/domain/habitColors.ts` |

---

## No Analog Found

None — every create/modify file maps to an existing domain, infrastructure, component, page, or test analog.

---

## Pattern Completeness

- [x] All planned new/modified files have an analog
- [x] Domain pure helper pattern cited from heatmap/streak
- [x] Dexie upgrade + Zod optional/default documented
- [x] CSS keyframes + reduced-motion documented
- [x] Runtime color via `style={{ }}` vs token classes documented
- [x] Surface accents mapped for HabitRow, DashboardCard, heatmap, Manage

## Metadata

**Analog search scope:** `src/domain`, `src/infrastructure`, `src/components/habits`, `src/components/dashboard`, `src/components/heatmap`, `src/pages`, `src/hooks`, `src/index.css`  
**Files scanned:** ~20 primary + test fixtures  
**Pattern extraction date:** 2026-07-23

---

## PATTERN MAPPING COMPLETE
