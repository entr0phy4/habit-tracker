# Phase 1: Habit Management & Daily Logging - Pattern Map

**Mapped:** 2026-07-19
**Files analyzed:** 35
**Analogs found:** 0 / 35 (greenfield — no application source exists)

## Greenfield Status

This repository contains planning artifacts only. No `src/` directory, no Vite scaffold, and no shadcn/ui components exist yet. **Every file in Phase 1 is net-new.** Pattern assignments below prescribe reference implementations from:

- `.planning/phases/01-habit-management-daily-logging/01-RESEARCH.md` — phase-specific patterns, project structure, code examples
- `.planning/research/ARCHITECTURE.md` — layered SPA architecture, repository pattern, data flow
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — visual tokens, component sizing, interaction contracts

**Planner instruction:** Treat RESEARCH.md and ARCHITECTURE.md excerpts as the canonical "analogs." Copy structure and conventions directly; do not invent alternate patterns.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `vite.config.ts` | config | — | RESEARCH.md Wave 0 | prescribed |
| `src/main.tsx` | config | — | shadcn Vite scaffold | prescribed |
| `src/App.tsx` | route | request-response | RESEARCH.md Pattern 6 | prescribed |
| `src/index.css` | config | — | 01-UI-SPEC.md tokens | prescribed |
| `src/lib/utils.ts` | utility | transform | shadcn scaffold (`cn()`) | prescribed |
| `src/test/setup.ts` | test | — | RESEARCH.md Vitest setup | prescribed |
| `src/domain/types.ts` | model | transform | RESEARCH.md Domain Types | prescribed |
| `src/domain/dates.ts` | utility | transform | RESEARCH.md Pattern 4 | prescribed |
| `src/domain/schedule.ts` | utility | transform | RESEARCH.md Schedule Helper | prescribed |
| `src/domain/dates.test.ts` | test | — | RESEARCH.md Validation | prescribed |
| `src/domain/schedule.test.ts` | test | — | RESEARCH.md Validation | prescribed |
| `src/infrastructure/db.ts` | model | CRUD | RESEARCH.md Pattern 1 | prescribed |
| `src/infrastructure/habitRepository.ts` | service | CRUD | ARCHITECTURE.md Pattern 1 | prescribed |
| `src/infrastructure/completionRepository.ts` | service | CRUD | RESEARCH.md Pattern 3 | prescribed |
| `src/infrastructure/habitRepository.test.ts` | test | CRUD | RESEARCH.md Validation | prescribed |
| `src/infrastructure/completionRepository.test.ts` | test | CRUD | RESEARCH.md Validation | prescribed |
| `src/infrastructure/db.test.ts` | test | CRUD | RESEARCH.md Validation | prescribed |
| `src/hooks/useHabits.ts` | hook | CRUD | ARCHITECTURE.md Pattern 3 | prescribed |
| `src/hooks/useTodayHabits.ts` | hook | CRUD | RESEARCH.md Pattern 2 | prescribed |
| `src/hooks/useCompletions.ts` | hook | CRUD | ARCHITECTURE.md Pattern 3 | prescribed |
| `src/hooks/useToggleCompletion.ts` | hook | CRUD | ARCHITECTURE.md Data Flow | prescribed |
| `src/components/layout/AppShell.tsx` | component | request-response | 01-UI-SPEC.md layout | prescribed |
| `src/components/habits/HabitRow.tsx` | component | event-driven | RESEARCH.md Pattern 5 | prescribed |
| `src/components/habits/WeekDayDots.tsx` | component | transform | 01-UI-SPEC.md dots | prescribed |
| `src/components/habits/HabitForm.tsx` | component | CRUD | RESEARCH.md + UI-SPEC | prescribed |
| `src/components/habits/HistoryDotGrid.tsx` | component | CRUD | RESEARCH.md + UI-SPEC | prescribed |
| `src/components/habits/FloatingAddButton.tsx` | component | request-response | 01-UI-SPEC.md FAB | prescribed |
| `src/components/habits/HabitRow.test.tsx` | test | event-driven | RESEARCH.md Validation | prescribed |
| `src/components/ui/*` | component | — | shadcn CLI generated | prescribed |
| `src/pages/TodayPage.tsx` | route | CRUD | RESEARCH.md structure | prescribed |
| `src/pages/HabitNewPage.tsx` | route | CRUD | RESEARCH.md + D-05/D-08 | prescribed |
| `src/pages/HabitEditPage.tsx` | route | CRUD | RESEARCH.md structure | prescribed |
| `src/pages/HabitHistoryPage.tsx` | route | CRUD | RESEARCH.md + D-14–D-17 | prescribed |
| `src/pages/ManageHabitsPage.tsx` | route | CRUD | RESEARCH.md Open Q2 | prescribed |

---

## Pattern Assignments

### Wave 0: Scaffold & Config

#### `vite.config.ts` (config)

**Analog:** RESEARCH.md Validation Architecture — Wave 0 gaps

**Vitest config pattern** (add to existing Vite config after `shadcn init -t vite`):

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

#### `src/test/setup.ts` (test)

**Analog:** RESEARCH.md — Vitest + fake-indexeddb Setup

```typescript
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange.js';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;
```

---

#### `src/lib/utils.ts` (utility, transform)

**Analog:** shadcn scaffold — generated by `npx shadcn@latest init -t vite`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

#### `src/index.css` (config)

**Analog:** 01-UI-SPEC.md — Design System tokens

```css
@import "tailwindcss";

@theme {
  --color-background: #0d1117;
  --color-card: #161b22;
  --color-border: #30363d;
  --color-muted: #21262d;
  --color-muted-foreground: #8b949e;
  --color-foreground: #e6edf3;
  --color-primary: #3fb950;
  --color-primary-foreground: #0d1117;
  --color-destructive: #f85149;
  --color-ring: #3fb950;
}
```

**Root dark class:** `<html class="dark">` in `index.html` (UI-01).

---

### Domain Layer (pure — no React, no Dexie)

#### `src/domain/types.ts` (model, transform)

**Analog:** RESEARCH.md — Domain Types

```typescript
// Frequency: days use JS convention 0=Sun … 6=Sat (matches Date.getDay())
export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] };

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  archived: boolean;
  createdAt: string; // ISO timestamp OK for metadata; NOT for completion days
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD local calendar day
}
```

**Validation rules (V5 Input Validation):** Trim habit names; reject empty; max length ~100 chars. No `dangerouslySetInnerHTML`.

---

#### `src/domain/dates.ts` (utility, transform)

**Analog:** RESEARCH.md Pattern 4 — Local Calendar Dates

```typescript
import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';
import { isAfter, startOfDay } from 'date-fns';

export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd'); // NOT 'YYYY-MM-DD', NOT toISOString().slice(0,10)
}

export function getLast7Days(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    getLocalDateString(subDays(today, 6 - i))
  );
}

export function isFutureDate(dateStr: string, today: Date = new Date()): boolean {
  return isAfter(startOfDay(new Date(dateStr + 'T00:00:00')), startOfDay(today));
}
```

**Import convention:** Per-function date-fns imports (`date-fns/format`, not barrel).

---

#### `src/domain/schedule.ts` (utility, transform)

**Analog:** RESEARCH.md — Schedule Helper

```typescript
import type { Frequency } from './types';

export function isDueOnDate(frequency: Frequency, dateStr: string): boolean {
  if (frequency.type === 'daily') return true;
  const day = new Date(dateStr + 'T12:00:00').getDay(); // noon avoids DST edge
  return frequency.days.includes(day);
}

export function isDaily(frequency: Frequency): boolean {
  return frequency.type === 'daily' ||
    (frequency.type === 'weekly' && frequency.days.length === 7);
}
```

---

### Infrastructure Layer (Dexie only)

#### `src/infrastructure/db.ts` (model, CRUD)

**Analog:** RESEARCH.md Pattern 1 — Dexie Schema with Compound Completion Key

```typescript
import Dexie, { type EntityTable } from 'dexie';
import type { Habit, Completion } from '@/domain/types';

export class HabitTrackerDB extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  completions!: EntityTable<Completion, '[habitId+date]'>;

  constructor() {
    super('habit-tracker');
    this.version(1).stores({
      habits: 'id, archived, createdAt',
      completions: '[habitId+date], habitId, date',
    });
  }
}

export const db = new HabitTrackerDB();
```

**Singleton rule:** One `db` export; never instantiate Dexie elsewhere.

---

#### `src/infrastructure/habitRepository.ts` (service, CRUD)

**Analog:** ARCHITECTURE.md Pattern 1 — Repository over IndexedDB

```typescript
import { db } from './db';
import type { Habit, Frequency } from '@/domain/types';

export const habitRepository = {
  async create(data: { name: string; frequency: Frequency }): Promise<Habit> {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      frequency: data.frequency,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    await db.habits.add(habit);
    return habit;
  },

  async update(id: string, data: Partial<Pick<Habit, 'name' | 'frequency'>>): Promise<void> {
    await db.habits.update(id, data);
  },

  async archive(id: string): Promise<void> {
    await db.habits.update(id, { archived: true });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.habits, db.completions, async () => {
      await db.completions.where('habitId').equals(id).delete();
      await db.habits.delete(id);
    });
  },
};
```

**Archive default (Pitfall 6):** Prefer `archive()` over `delete()`; hard delete only from manage screen with confirm.

---

#### `src/infrastructure/completionRepository.ts` (service, CRUD)

**Analog:** RESEARCH.md Pattern 3 — Completion Toggle (Upsert/Delete)

```typescript
import { db } from './db';
import { isFutureDate } from '@/domain/dates';

export const completionRepository = {
  async toggle(habitId: string, date: string): Promise<void> {
    if (isFutureDate(date)) return; // D-17 guard

    const key = [habitId, date] as [string, string];
    const existing = await db.completions.get(key);
    if (existing) {
      await db.completions.delete(key);
    } else {
      await db.completions.put({ habitId, date });
    }
  },

  async getByHabitInRange(habitId: string, start: string, end: string): Promise<string[]> {
    return db.completions
      .where({ habitId })
      .between([habitId, start], [habitId, end])
      .primaryKeys()
      .then((keys) => keys.map((k) => k[1] as string));
  },
};
```

---

### Hooks Layer (React ↔ Repositories)

#### `src/hooks/useHabits.ts` (hook, CRUD)

**Analog:** ARCHITECTURE.md Pattern 3 — Reactive Queries

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/db';

export function useHabits() {
  const habits = useLiveQuery(() =>
    db.habits.filter((h) => !h.archived).toArray()
  );
  return { habits: habits ?? [], isLoading: habits === undefined };
}
```

---

#### `src/hooks/useTodayHabits.ts` (hook, CRUD)

**Analog:** RESEARCH.md Pattern 2 — Reactive Today List via useLiveQuery

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/db';
import { getLocalDateString } from '@/domain/dates';
import { isDueOnDate } from '@/domain/schedule';

export function useTodayHabits() {
  const today = getLocalDateString(new Date());

  return useLiveQuery(async () => {
    const habits = await db.habits
      .filter((h) => !h.archived && isDueOnDate(h.frequency, today))
      .toArray();

    const completions = await db.completions
      .where('date')
      .equals(today)
      .toArray();

    const completedIds = new Set(completions.map((c) => c.habitId));

    return habits.map((habit) => ({
      habit,
      isCompleted: completedIds.has(habit.id),
    }));
  }, [today]);
}
```

**Pitfall 2 guard:** Do NOT freeze `today` in `useState` with empty deps. Resolve `getLocalDateString()` at interaction time inside toggle handlers; refresh on `document.visibilitychange`.

---

#### `src/hooks/useToggleCompletion.ts` (hook, CRUD)

**Analog:** ARCHITECTURE.md — Request Flow (User Toggles Today's Habit)

```typescript
import { useCallback } from 'react';
import { completionRepository } from '@/infrastructure/completionRepository';
import { getLocalDateString } from '@/domain/dates';

export function useToggleCompletion() {
  const toggle = useCallback(async (habitId: string, date?: string) => {
    const targetDate = date ?? getLocalDateString(new Date()); // resolve at interaction time
    await completionRepository.toggle(habitId, targetDate);
  }, []);

  return { toggle };
}
```

---

#### `src/hooks/useCompletions.ts` (hook, CRUD)

**Analog:** ARCHITECTURE.md Pattern 1 — `getByHabit` range query

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/db';
import { getLast7Days } from '@/domain/dates';

export function useCompletions(habitId: string) {
  const dates = getLast7Days();

  const completions = useLiveQuery(
    () =>
      db.completions
        .where({ habitId })
        .between([habitId, dates[0]], [habitId, dates[dates.length - 1]])
        .toArray(),
    [habitId]
  );

  const completedDates = new Set((completions ?? []).map((c) => c.date));

  return {
    dates,
    completedDates,
    isLoading: completions === undefined,
  };
}
```

---

### Presentation Layer — Components

#### `src/components/habits/HabitRow.tsx` (component, event-driven)

**Analog:** RESEARCH.md Pattern 5 — Mobile Swipe via Pointer Events

```typescript
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { WeekDayDots } from './WeekDayDots';
import type { Habit } from '@/domain/types';

const SWIPE_THRESHOLD = 50;

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onHistoryClick: () => void;
}

export function HabitRow({ habit, isCompleted, onToggle, onHistoryClick }: HabitRowProps) {
  const startX = useRef(0);
  const isTouch = useRef(false);

  return (
    <div
      className={cn(
        'min-h-11 touch-pan-y active:scale-[0.98] transition-transform',
        'flex items-center justify-between px-4 rounded-lg bg-card',
        isCompleted && 'bg-muted'
      )}
      onPointerDown={(e) => {
        startX.current = e.clientX;
        isTouch.current = e.pointerType === 'touch';
      }}
      onPointerUp={(e) => {
        const delta = e.clientX - startX.current;
        if (isTouch.current && delta > SWIPE_THRESHOLD) onToggle();
      }}
      onClick={() => {
        if (!isTouch.current) onToggle(); // desktop (D-10)
      }}
    >
      <span className={cn(isCompleted && 'line-through text-muted-foreground')}>
        {habit.name}
      </span>
      <WeekDayDots frequency={habit.frequency} />
      {/* Trailing history button — separate from row toggle (Open Q1) */}
      <button type="button" onClick={(e) => { e.stopPropagation(); onHistoryClick(); }}>
        →
      </button>
    </div>
  );
}
```

**UI-SPEC constraints:** `min-h-11` (44px), `touch-pan-y`, strikethrough + muted when completed (D-11). History navigation via trailing icon, not row body (RESEARCH Open Q1).

---

#### `src/components/habits/WeekDayDots.tsx` (component, transform)

**Analog:** 01-UI-SPEC.md — Week schedule indicator

**Pattern:** Render 7 dots (S M T W T F S); filled dot when day is in `frequency.days` or `type === 'daily'`. Use `text-primary` for scheduled, `bg-muted` for unscheduled. No data writes.

---

#### `src/components/habits/HabitForm.tsx` (component, CRUD)

**Analog:** RESEARCH.md + 01-UI-SPEC.md — shared create/edit form

**Pattern:**
- shadcn `Input` for name, `ToggleGroup` for M–S day buttons (D-06)
- Default all days selected for new habits (D-07)
- Submit calls `habitRepository.create()` or `.update()` via page handler
- Frequency type: `{ type: 'daily' }` when all 7 days selected; else `{ type: 'weekly', days: number[] }`

```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// days 0–6 matching Date.getDay()
```

---

#### `src/components/habits/HistoryDotGrid.tsx` (component, CRUD)

**Analog:** RESEARCH.md D-14–D-17 + 01-UI-SPEC.md history dots

**Pattern:** Render 7 dots from `useCompletions(habitId).dates`. Tap dot → `completionRepository.toggle(habitId, date)` unless `isFutureDate(date)`. Completed dots use `bg-primary`.

---

#### `src/components/habits/FloatingAddButton.tsx` (component, request-response)

**Analog:** 01-UI-SPEC.md — FAB (56px, bottom-right, `fixed bottom-4 right-4`)

```tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export function FloatingAddButton() {
  const navigate = useNavigate();
  return (
    <Button
      size="icon"
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full"
      onClick={() => navigate('/habits/new')}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
```

---

#### `src/components/layout/AppShell.tsx` (component, request-response)

**Analog:** 01-UI-SPEC.md — page layout

**Pattern:** `min-h-screen bg-background text-foreground`; header with page title + optional "Manage habits" link; `main` with `px-4` horizontal padding. Children slot for page content.

---

### Pages (route-level composition)

#### `src/pages/TodayPage.tsx` (route, CRUD)

**Analog:** RESEARCH.md structure + CONTEXT D-01–D-04

**Pattern:**
- `useTodayHabits()` for list data
- `useToggleCompletion()` for row interactions
- `FloatingAddButton` always visible
- Empty state when no habits: prompt to add first habit via FAB
- Navigate to `/habits/:id/history` from row trailing icon

---

#### `src/pages/HabitNewPage.tsx` (route, CRUD)

**Analog:** RESEARCH.md — Habit Create with Toast (D-08)

```tsx
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { habitRepository } from '@/infrastructure/habitRepository';

async function handleCreate(data: { name: string; frequency: Frequency }) {
  await habitRepository.create(data);
  toast.success('Habit created');
  navigate('/'); // remain on Today view (D-08)
}
```

---

#### `src/pages/HabitEditPage.tsx` (route, CRUD)

**Analog:** RESEARCH.md structure — mirrors create page

**Pattern:** Load habit by `:id` via `useLiveQuery`; pre-fill `HabitForm`; submit calls `habitRepository.update()`; toast + navigate back.

---

#### `src/pages/HabitHistoryPage.tsx` (route, CRUD)

**Analog:** RESEARCH.md D-14–D-17

**Pattern:** Habit name as heading; `HistoryDotGrid` for last 7 days; back navigation to Today.

---

#### `src/pages/ManageHabitsPage.tsx` (route, CRUD)

**Analog:** RESEARCH.md Open Q2 — `/habits/manage`

**Pattern:** List archived habits; restore via `habitRepository.update(id, { archived: false })`; hard delete with confirm dialog. Link from Today header.

---

#### `src/App.tsx` (route, request-response)

**Analog:** RESEARCH.md Pattern 6 — SPA Routing

```tsx
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import TodayPage from '@/pages/TodayPage';
import HabitNewPage from '@/pages/HabitNewPage';
import HabitEditPage from '@/pages/HabitEditPage';
import HabitHistoryPage from '@/pages/HabitHistoryPage';
import ManageHabitsPage from '@/pages/ManageHabitsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/habits/new" element={<HabitNewPage />} />
        <Route path="/habits/manage" element={<ManageHabitsPage />} />
        <Route path="/habits/:id/edit" element={<HabitEditPage />} />
        <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
```

---

### Test Files

#### `src/domain/dates.test.ts`, `src/domain/schedule.test.ts` (test)

**Analog:** RESEARCH.md Validation Architecture — unit tests for domain

**Pattern:** Vitest `describe`/`it`; test `getLocalDateString` never uses UTC; test `isDueOnDate` for daily + Mon/Wed/Fri; test `isFutureDate` rejects tomorrow.

---

#### `src/infrastructure/*.test.ts` (test)

**Analog:** RESEARCH.md — fake-indexeddb setup + repository integration

**Pattern:** `beforeEach` clears `db.habits` and `db.completions`; test create/update/archive/toggle; test future-date rejection in completion toggle.

---

#### `src/components/habits/HabitRow.test.tsx` (test)

**Analog:** RESEARCH.md Validation — UI-02 row min-height

**Pattern:** `@testing-library/react` render; assert `min-h-11` class present; fire click toggles `onToggle`.

---

## Shared Patterns

### Layered Architecture (mandatory dependency direction)

**Source:** ARCHITECTURE.md — System Overview

```
Presentation (pages, components)
    ↓ calls
Hooks (useLiveQuery, useToggleCompletion)
    ↓ calls
Domain (types, dates, schedule) — pure, no imports from above
    ↑ used by
Infrastructure (db, repositories) — only layer that imports Dexie
```

**Apply to:** All files. Components never import from `infrastructure/` directly — always go through hooks.

---

### Path Alias `@/`

**Source:** RESEARCH.md + shadcn Vite scaffold

```typescript
import { db } from '@/infrastructure/db';
import { getLocalDateString } from '@/domain/dates';
import { Button } from '@/components/ui/button';
```

**Apply to:** All `src/` files.

---

### Reactive Data Binding

**Source:** ARCHITECTURE.md Pattern 3

**Apply to:** All hooks reading habits/completions

```typescript
const data = useLiveQuery(() => db.table.toArray());
return { data: data ?? [], isLoading: data === undefined };
```

No Redux, no Zustand for persisted data in Phase 1.

---

### Date Handling (never UTC for day keys)

**Source:** RESEARCH.md Pattern 4 + ARCHITECTURE.md Anti-Pattern 2

**Apply to:** All completion writes, today filters, history range

```typescript
// ✅ Correct
format(date, 'yyyy-MM-dd')

// ❌ Banned in src/
date.toISOString().slice(0, 10)
format(date, 'YYYY-MM-DD')
```

---

### Compute-on-Read (no streak fields)

**Source:** ARCHITECTURE.md Pattern 2

**Apply to:** Phase 1 data model — do NOT add `currentStreak` or `longestStreak` to `Habit`. Streaks are Phase 2.

---

### Input Validation

**Source:** RESEARCH.md Security Domain V5

**Apply to:** `habitRepository.create/update`, `HabitForm`

```typescript
const name = data.name.trim();
if (!name) throw new Error('Habit name is required');
if (name.length > 100) throw new Error('Habit name too long');
```

React text interpolation auto-escapes — never `dangerouslySetInnerHTML`.

---

### Toast Notifications

**Source:** RESEARCH.md — sonner + shadcn

**Apply to:** Habit create/edit success (D-08)

```tsx
import { toast } from 'sonner';
toast.success('Habit created');
```

---

### Visibility Change Handler (today refresh)

**Source:** RESEARCH.md Pitfall 2

**Apply to:** `TodayPage` or `useTodayHabits` consumer

```typescript
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      // force re-read of today — e.g. setTodayKey(getLocalDateString())
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

---

## No Analog Found

All 35 files are greenfield. No existing application source code to copy from.

| Category | Count | Reference Instead |
|----------|-------|-------------------|
| Domain | 3 + 2 tests | RESEARCH.md Domain Types, Pattern 4, Schedule Helper |
| Infrastructure | 3 + 3 tests | RESEARCH.md Patterns 1 & 3, ARCHITECTURE.md Pattern 1 |
| Hooks | 4 | RESEARCH.md Patterns 2 & 3, ARCHITECTURE.md Pattern 3 |
| Components | 6 + 1 test | RESEARCH.md Pattern 5, 01-UI-SPEC.md |
| Pages | 5 | RESEARCH.md Pattern 6, CONTEXT decisions |
| Config/scaffold | 6 | shadcn init, RESEARCH.md Wave 0 |
| shadcn ui/* | ~7 | `npx shadcn@latest add button input label toggle toggle-group sonner` |

---

## Build Order (from ARCHITECTURE.md, adapted for Phase 1)

```
Wave 0: shadcn init + vite test config + src/test/setup.ts
Wave 1: domain/types → domain/dates → domain/schedule (+ unit tests)
Wave 2: infrastructure/db → habitRepository → completionRepository (+ tests)
Wave 3: hooks (useHabits, useTodayHabits, useToggleCompletion, useCompletions)
Wave 4: components (WeekDayDots → HabitRow → HabitForm → HistoryDotGrid → FAB → AppShell)
Wave 5: pages + App.tsx routing
Wave 6: ManageHabitsPage + polish (empty states, visibility handler)
```

---

## Metadata

**Analog search scope:** `/home/entr0phy4/Projects/habit-tracker` (entire repo)
**Files scanned:** 51 (planning + git only; no `src/`)
**Pattern extraction date:** 2026-07-19
**Primary references:** `01-RESEARCH.md`, `.planning/research/ARCHITECTURE.md`, `01-UI-SPEC.md`
