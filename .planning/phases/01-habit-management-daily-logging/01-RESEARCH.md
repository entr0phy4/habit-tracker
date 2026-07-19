# Phase 1: Habit Management & Daily Logging - Research

**Researched:** 2026-07-19
**Domain:** Greenfield local-first React SPA — habit CRUD, today view, one-tap logging, IndexedDB persistence
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield walking skeleton: scaffold the full Vite + React 19 + Dexie 4 stack, establish the layered architecture (Presentation → Hooks → Domain → Infrastructure), and ship the complete daily habit loop in one vertical slice. No application source code exists yet — the planner must budget Wave 0 for project scaffolding, test infrastructure, and shadcn/ui dark theme setup before feature tasks.

The locked UX decisions from CONTEXT.md drive implementation: flat Today list (habits not due today hidden), FAB for creation, dedicated pages for create/edit/history (not modals), swipe-right-to-complete on mobile with row-tap on desktop, and a 7-day dot grid for past-day editing. Data persists in Dexie with `YYYY-MM-DD` local date strings and compound completion keys `[habitId, date]` — streaks, heatmaps, and export/import are explicitly deferred to later phases but the data model must not block them.

**Primary recommendation:** Scaffold with `npx shadcn@latest init -t vite` (dark theme), implement Dexie schema + repositories first, then wire `useLiveQuery` hooks to Today/History routes. Use Pointer Events + `touch-action: pan-y` for mobile swipe (no gesture library). Resolve "today" at interaction time and on `visibilitychange`, never at mount-only.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Today Screen Layout
- **D-01:** Primary structure is a flat scrollable list of habits due today
- **D-02:** Habits not due today are hidden entirely — only actionable habits appear
- **D-03:** "Add habit" is a floating action button (bottom-right)
- **D-04:** Each habit row shows name plus week day dots indicator (which days the habit is scheduled)

#### Habit Creation Flow
- **D-05:** Habit creation uses a dedicated page (`/habits/new`), not a modal or drawer
- **D-06:** Frequency is set via day toggle buttons (M T W T F S S)
- **D-07:** Default frequency for new habits is Daily (all days pre-selected)
- **D-08:** After creating a habit: show toast confirmation and remain on Today view (form closes, user sees updated list)

#### Check-in Interaction
- **D-09:** Mobile: swipe right on a habit row to mark complete
- **D-10:** Desktop: tap entire row to toggle complete (equivalent affordance to mobile swipe)
- **D-11:** Completed state: strikethrough on habit name plus muted row color
- **D-12:** Undo is instant — same swipe/tap toggles completion back off
- **D-13:** Full row is the touch target (≥44px height) with press animation feedback on tap

#### Past Day Editing
- **D-14:** Past day toggling happens on a dedicated history screen per habit (navigate from habit row)
- **D-15:** Editable range in Phase 1 is last 7 days only
- **D-16:** History screen uses a week dot grid — tap individual dots to toggle that day
- **D-17:** Future dates cannot be marked complete — today and past only

### Claude's Discretion
- Habits not due today: hidden (user requested recommendation; accepted)
- Desktop tap-row as swipe equivalent on non-touch devices
- Edit habit flow: mirror creation pattern on dedicated page (`/habits/:id/edit`) unless research suggests inline edit is simpler
- Archive behavior: archived habits hidden from Today view, recoverable from a manage/archive section (exact UI left to planner)
- Empty state on Today view: prompt to add first habit via FAB when no habits exist

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HABT-01 | Create habit with name and frequency (daily or specific weekdays) | Dexie `habits` table + `/habits/new` page with day toggles (D-05–D-07); `Frequency` domain type |
| HABT-02 | Edit habit name and frequency | `/habits/:id/edit` page mirroring create form; `habitRepository.update()` |
| HABT-03 | Archive or delete habits | `archived` boolean on habit; soft-archive preferred; manage section for recovery |
| LOG-01 | Mark habit complete for today with one tap | `completionRepository.toggle()` + swipe (mobile) / row tap (desktop) on Today view |
| LOG-02 | Toggle completion for past days | `/habits/:id/history` with 7-day dot grid (D-14–D-17) |
| LOG-03 | Today view showing which habits are due | Filter active habits by `isDueOnDate(frequency, today)` (D-01, D-02) |
| DATA-01 | Data persists across browser sessions | Dexie IndexedDB — not localStorage; `useLiveQuery` reactive reads |
| UI-01 | Minimal dark mode aesthetic | shadcn/ui init with dark theme + Tailwind v4 `@import "tailwindcss"` |
| UI-02 | Mobile + desktop, touch-friendly targets | ≥44px row height (D-13); `touch-action: pan-y` on swipe rows; responsive layout |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Habit CRUD (name, frequency, archive) | Browser / Client | — | No backend; Dexie is sole store |
| Today view filtering (due habits) | Browser / Client (Domain) | — | Pure `isDueOnDate()` over habit frequency + local date |
| One-tap / swipe completion toggle | Browser / Client (UI + Hooks) | — | Gesture + click handlers dispatch to repository |
| Past 7-day completion editing | Browser / Client (UI + Hooks) | — | History route queries completion range from Dexie |
| Local persistence (IndexedDB) | Browser / Storage | — | Dexie wraps IndexedDB; survives refresh |
| Date handling (`YYYY-MM-DD`) | Browser / Client (Domain) | — | Pure functions; no server timezone |
| Routing (Today, create, edit, history) | Browser / Client | — | React Router declarative SPA routes |
| Dark mode UI | Browser / Client | — | shadcn/ui + Tailwind CSS variables |
| Streak calculation | — (deferred) | Browser / Client (Domain) | Phase 2 — do not persist streak counters in Phase 1 |
| Export/import backup | — (deferred) | Browser / Client | Phase 4 — schema must be forward-compatible |

## Standard Stack

### Core (Phase 1 install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 8.1.5 | Build tool & dev server | Project stack choice; Node 20.19+ required [CITED: vite.dev/guide] |
| React | 19.2.7 | UI framework | Locked in STACK.md; shadcn/ui React 19 support [VERIFIED: npm registry] |
| TypeScript | 7.0.2 | Type safety | Habit/completion schema compile-time checks |
| Dexie | 4.4.4 | IndexedDB persistence | `useLiveQuery`, compound keys, schema versioning [CITED: dexie.org] |
| dexie-react-hooks | 4.4.0 | Reactive DB queries | Auto UI refresh on toggle without Redux [CITED: dexie.org] |
| react-router | 8.2.0 | Client-side routing | Multi-page flows: Today, create, edit, history [CITED: reactrouter.com] |
| Tailwind CSS | 4.3.3 | Utility styling | v4 CSS-first config; dark tokens via `@theme` [CITED: ui.shadcn.com] |
| @tailwindcss/vite | 4.3.3 | Tailwind Vite plugin | Replaces PostCSS boilerplate [CITED: ui.shadcn.com] |
| shadcn/ui | latest CLI | Accessible UI primitives | Button, Input, Toggle, Toast — copy-paste, dark-first [CITED: ui.shadcn.com] |
| date-fns | 4.4.0 | Local date math | `format(d, 'yyyy-MM-dd')` for calendar-day keys [CITED: github.com/date-fns/date-fns] |
| sonner | 2.0.7 | Toast notifications | Habit-create confirmation (D-08); pairs with shadcn Sonner component [VERIFIED: npm registry] |
| lucide-react | 1.25.0 | Icons | FAB plus icon, navigation chevrons [VERIFIED: npm registry] |

### Supporting (Phase 1 install)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vitejs/plugin-react` | 6.0.3 | React Fast Refresh | Required Vite plugin |
| clsx + tailwind-merge | 2.1.1 / 3.6.0 | Class merging | shadcn `cn()` helper |
| vitest | 4.1.10 | Unit tests | Domain logic + repository tests |
| @testing-library/react | 16.3.2 | Component tests | Today toggle, create form flows |
| fake-indexeddb | 6.2.5 | IndexedDB in Node | Dexie repository tests in Vitest [CITED: npmjs.com/package/fake-indexeddb] |
| jsdom | latest | DOM environment | Vitest `environment: 'jsdom'` |

### Deferred to Later Phases (do NOT install in Phase 1)

| Library | Phase | Reason |
|---------|-------|--------|
| react-activity-calendar | 3 | GitHub heatmap — not in Phase 1 scope |
| zod | 4 | Export/import validation — Phase 4 |
| zustand | — | Optional; `useState` sufficient for form/FAB state in Phase 1 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pointer Events swipe (no lib) | `react-swipeable` | Library adds dependency; native Pointer Events + `touch-action: pan-y` sufficient for single-direction swipe [ASSUMED] |
| `createBrowserRouter` | Declarative `<BrowserRouter>` | Both valid in RR v8; declarative `<Routes>` simpler for walking skeleton [CITED: reactrouter.com] |
| shadcn `init -t vite` | Manual Vite scaffold + shadcn add | `init -t vite` bundles Tailwind v4 + alias setup — faster greenfield [CITED: ui.shadcn.com] |

**Installation (Phase 1 walking skeleton):**

```bash
# Option A (recommended): shadcn scaffolds Vite + Tailwind v4 + dark theme
npx shadcn@latest init -t vite

# Then add Phase 1 data + routing deps
npm install dexie@4.4.4 dexie-react-hooks@4.4.0 react-router@8.2.0 date-fns@4.4.0 sonner@2.0.7

# shadcn components for Phase 1 UX
npx shadcn@latest add button input label toggle toggle-group sonner

# Dev/test
npm install -D vitest@4.1.10 @testing-library/react@16.3.2 fake-indexeddb@6.2.5 jsdom
```

**Version verification:** All versions confirmed via `npm view` on 2026-07-19.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| vite | npm | 3 days | 144M/wk | github.com/vitejs/vite | SUS | Flagged (too-new) — official Vite; proceed with checkpoint |
| react | npm | ~7 wks | 146M/wk | github.com/facebook/react | OK | Approved |
| react-dom | npm | ~7 wks | 138M/wk | github.com/facebook/react | OK | Approved |
| dexie | npm | ~5 wks | 1.8M/wk | github.com/dexie/Dexie.js | OK | Approved |
| dexie-react-hooks | npm | ~4 mo | 410K/wk | github.com/dexie/Dexie.js | OK | Approved |
| react-router | npm | ~11 days | 46M/wk | github.com/remix-run/react-router | SUS | Flagged (too-new) — official RR; proceed with checkpoint |
| date-fns | npm | ~7 wks | 86M/wk | github.com/date-fns/date-fns | OK | Approved |
| tailwindcss | npm | 3 days | 109M/wk | github.com/tailwindlabs/tailwindcss | SUS | Flagged (too-new) — official Tailwind; proceed |
| @tailwindcss/vite | npm | 3 days | 38M/wk | github.com/tailwindlabs/tailwindcss | SUS | Flagged (too-new) — official; proceed |
| @vitejs/plugin-react | npm | ~4 wks | 68M/wk | github.com/vitejs/vite-plugin-react | SUS | Flagged (too-new) — official; proceed |
| vitest | npm | ~13 days | 73M/wk | github.com/vitest-dev/vitest | SUS | Flagged (too-new) — official; proceed |
| @testing-library/react | npm | ~6 mo | 44M/wk | github.com/testing-library/react-testing-library | OK | Approved |
| fake-indexeddb | npm | ~8 mo | 3.9M/wk | github.com/dumbmatter/fakeIndexedDB | OK | Approved |
| sonner | npm | ~6 mo | 44M/wk | github.com/emilkowalski/sonner | OK | Approved |
| lucide-react | npm | 2 days | 86M/wk | github.com/lucide-icons/lucide | SUS | Flagged (too-new) — official; proceed |
| clsx | npm | ~2 yr | 103M/wk | github.com/lukeed/clsx | OK | Approved |
| tailwind-merge | npm | ~2 mo | 69M/wk | github.com/dcastil/tailwind-merge | OK | Approved |

**Packages removed due to [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** vite, react-router, tailwindcss, @tailwindcss/vite, @vitejs/plugin-react, vitest, lucide-react — all are official packages from STACK.md with high download counts; "too-new" reflects recent publish dates, not slopsquatting. Planner may skip human-verify checkpoint for these known-official packages.

**Postinstall scripts:** None detected on SUS-flagged packages (verified via `npm view <pkg> scripts.postinstall`).

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Only)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Routes: / (Today) | /habits/new | /habits/:id/edit | /habits/:id/history│
│       └─► Pages compose feature components (HabitList, HabitForm, etc.) │
├─────────────────────────────────────────────────────────────────────────┤
│  Hooks: useHabits | useTodayHabits | useToggleCompletion | useCompletions│
│       └─► useLiveQuery (dexie-react-hooks) subscribes to IndexedDB      │
├─────────────────────────────────────────────────────────────────────────┤
│  Domain (pure): types | dates | schedule (isDueOnDate) | frequency     │
│       └─► No React, no Dexie imports                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Infrastructure: db.ts | habitRepository | completionRepository          │
│       └─► Dexie 4 — habits table + completions compound PK               │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     User actions: tap row / swipe / tap dot
│   IndexedDB     │ ◄── Writes: habit CRUD, completion toggle (upsert/delete)
│  (via Dexie)    │ ──► Reads: reactive via useLiveQuery → UI re-render
└─────────────────┘
```

### Recommended Project Structure

```
src/
├── domain/
│   ├── types.ts              # Habit, Completion, Frequency
│   ├── dates.ts              # getLocalDateString, addDays, getLastNDays
│   └── schedule.ts           # isDueOnDate, isDaily
├── infrastructure/
│   ├── db.ts                 # Dexie singleton + schema v1
│   ├── habitRepository.ts
│   └── completionRepository.ts
├── hooks/
│   ├── useHabits.ts
│   ├── useTodayHabits.ts     # filters due + non-archived
│   ├── useCompletions.ts
│   └── useToggleCompletion.ts
├── components/
│   ├── habits/
│   │   ├── HabitRow.tsx          # swipe + tap, day dots, strikethrough
│   │   ├── WeekDayDots.tsx       # schedule indicator on row
│   │   ├── HabitForm.tsx         # name + day toggles (shared create/edit)
│   │   ├── HistoryDotGrid.tsx    # 7-day toggle grid
│   │   └── FloatingAddButton.tsx
│   ├── layout/
│   │   └── AppShell.tsx
│   └── ui/                       # shadcn generated
├── pages/
│   ├── TodayPage.tsx             # route: /
│   ├── HabitNewPage.tsx          # route: /habits/new
│   ├── HabitEditPage.tsx         # route: /habits/:id/edit
│   ├── HabitHistoryPage.tsx      # route: /habits/:id/history
│   └── ManageHabitsPage.tsx      # route: /habits/manage (archive recovery)
├── lib/
│   └── utils.ts                  # cn() helper
├── test/
│   └── setup.ts                  # fake-indexeddb + Dexie.dependencies
├── App.tsx                       # BrowserRouter + routes + Toaster
└── main.tsx
```

### Pattern 1: Dexie Schema with Compound Completion Key

**What:** Two tables — `habits` with string UUID primary key; `completions` with compound PK `[habitId+date]`.

**When to use:** Always for completion storage — enforces one record per habit per calendar day.

**Example:**

```typescript
// Source: dexie.org — compound primary key syntax
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

### Pattern 2: Reactive Today List via useLiveQuery

**What:** Hook composes live habit query + today's completions; filters to due habits only (D-02).

**When to use:** Today page and any view that must auto-update after toggle.

**Example:**

```typescript
// Source: dexie.org/docs/Tutorial/React
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

### Pattern 3: Completion Toggle (Upsert/Delete)

**What:** Binary toggle — if completion exists for `[habitId, date]`, delete; else put.

**When to use:** Today row interaction, history dot grid, Phase 3 heatmap cells.

**Example:**

```typescript
// Source: .planning/research/ARCHITECTURE.md pattern
export const completionRepository = {
  async toggle(habitId: string, date: string): Promise<void> {
    const key = [habitId, date] as [string, string];
    const existing = await db.completions.get(key);
    if (existing) {
      await db.completions.delete(key);
    } else {
      await db.completions.put({ habitId, date });
    }
  },
};
```

### Pattern 4: Local Calendar Dates (Never UTC Midnight)

**What:** All date keys are `yyyy-MM-dd` strings from local `Date`, resolved at interaction time.

**When to use:** Every completion write, today filter, history range, future-date guard (D-17).

**Example:**

```typescript
// Source: github.com/date-fns/date-fns/docs/unicodeTokens.md
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

### Pattern 5: Mobile Swipe via Pointer Events

**What:** Detect horizontal swipe-right on habit row; desktop uses `onClick` on same row (D-09, D-10).

**When to use:** `HabitRow` component only — do not add a gesture library for v1.

**Example:**

```typescript
// Source: developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action
// touch-action: pan-y lets browser handle vertical scroll; JS handles horizontal swipe
const SWIPE_THRESHOLD = 50;

function HabitRow({ onToggle }: { onToggle: () => void }) {
  const startX = useRef(0);
  const isTouch = useRef(false);

  return (
    <div
      className="min-h-11 touch-pan-y active:scale-[0.98] transition-transform"
      onPointerDown={(e) => { startX.current = e.clientX; isTouch.current = e.pointerType === 'touch'; }}
      onPointerUp={(e) => {
        const delta = e.clientX - startX.current;
        if (isTouch.current && delta > SWIPE_THRESHOLD) onToggle();
      }}
      onClick={() => {
        if (!isTouch.current) onToggle(); // desktop
      }}
    >
      {/* habit name + WeekDayDots */}
    </div>
  );
}
```

### Pattern 6: SPA Routing (React Router 8 Declarative)

**What:** `BrowserRouter` with nested routes; Today is index route.

**When to use:** All Phase 1 navigation.

**Example:**

```tsx
// Source: reactrouter.com/start/declarative/routing
import { BrowserRouter, Routes, Route } from 'react-router';
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
    </BrowserRouter>
  );
}
```

### Anti-Patterns to Avoid

- **Modal/drawer for habit creation:** Violates D-05 — use dedicated `/habits/new` page
- **Showing non-due habits greyed out:** Violates D-02 — hide entirely
- **`toISOString().slice(0, 10)` for today:** UTC bug near midnight — use `format(date, 'yyyy-MM-dd')`
- **Storing `currentStreak` on habit row:** Phase 2 derives streaks; don't add streak fields now
- **localStorage JSON blob:** 5 MB cap, blocks main thread — Dexie only
- **Mount-only `today` state:** Tab open past midnight attaches to wrong day — resolve at interaction + `visibilitychange`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB wrapper | Custom IDB promises | Dexie 4 | Schema versioning, compound keys, live queries |
| Accessible form controls | Raw `<button>` toggles | shadcn Toggle Group | Keyboard nav, ARIA, dark theme |
| Toast notifications | Custom div overlay | sonner + shadcn | D-08 confirmation; battle-tested |
| Date formatting/parsing | Manual string split | date-fns `format` | `YYYY` vs `yyyy` footguns documented |
| Class name merging | String concat | `cn()` (clsx + tailwind-merge) | shadcn standard |
| UUID generation | Math.random hex | `crypto.randomUUID()` | Browser native, collision-safe |
| IndexedDB in tests | Mock entire IDB API | fake-indexeddb | Dexie official testing pattern |

**Key insight:** Phase 1 complexity is in schedule filtering and gesture UX, not storage. Dexie + date-fns eliminate the highest-risk custom code paths.

## Common Pitfalls

### Pitfall 1: UTC Date Strings for Completions

**What goes wrong:** User checks in at 11 PM local; `toISOString()` records tomorrow's UTC date; streaks break in Phase 2.

**Why it happens:** `toISOString().slice(0, 10)` is a common shortcut.

**How to avoid:** `format(new Date(), 'yyyy-MM-dd')` only; ban `YYYY` token; add unit test for local midnight boundary.

**Warning signs:** `toISOString` in `src/domain/` or repository layer.

### Pitfall 2: "Today" Frozen at Page Load

**What goes wrong:** Tab open overnight; check-in after midnight writes to yesterday.

**Why it happens:** `useMemo(() => getLocalDateString(), [])` runs once.

**How to avoid:** Call `getLocalDateString()` inside toggle handler; refresh on `document.visibilitychange` when `document.visibilityState === 'visible'`.

**Warning signs:** `today` in `useState` with empty-deps `useEffect`.

### Pitfall 3: Weekly Frequency Off-by-One (Day Index)

**What goes wrong:** Mon/Wed/Fri habit shows due on wrong days.

**Why it happens:** Mixing `0=Sunday` (JS `getDay()`) with `1=Monday` arrays inconsistently.

**How to avoid:** Pick one convention in `types.ts` (recommend `0–6` matching `Date.getDay()`); document in `Frequency` type; test all 7 days.

**Warning signs:** Hardcoded `[1,3,5]` without comment mapping to day names.

### Pitfall 4: Swipe Conflicts with Scroll

**What goes wrong:** Vertical list scroll triggers completion toggles.

**Why it happens:** Missing `touch-action: pan-y` or threshold too low.

**How to avoid:** `touch-action: pan-y` on row; require `deltaX > 50 && deltaX > deltaY`; only fire swipe on `pointerType === 'touch'`.

**Warning signs:** Completions toggle while scrolling Today list.

### Pitfall 5: Future Date Completion

**What goes wrong:** User marks tomorrow complete from history grid.

**Why it happens:** No date guard on toggle.

**How to avoid:** `if (isFutureDate(date)) return` in repository or hook before write (D-17).

**Warning signs:** History grid renders 8th dot for tomorrow.

### Pitfall 6: Archive vs Delete Semantics

**What goes wrong:** Hard delete loses completion history needed for Phase 2 streaks.

**Why it happens:** `db.habits.delete()` without cascade policy.

**How to avoid:** Default to `archived: true`; hard delete only from manage screen with confirm; keep completions (orphan cleanup deferred).

**Warning signs:** Delete removes habit row and all completions in one action without user understanding.

## Code Examples

### Domain Types

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

### Schedule Helper

```typescript
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

### Vitest + fake-indexeddb Setup

```typescript
// Source: npmjs.com/package/fake-indexeddb + dexie GitHub discussion #1411
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange.js';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;
```

### Habit Create with Toast (D-08)

```tsx
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

async function handleCreate(data: { name: string; frequency: Frequency }) {
  await habitRepository.create(data);
  toast.success('Habit created');
  navigate('/'); // remain on Today view
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite 8 | 2024+ | Use `shadcn init -t vite` for greenfield |
| localStorage habit blob | Dexie IndexedDB | Industry standard | Required for DATA-01 at scale |
| Redux for local data | useLiveQuery | Dexie 3+ | No global store needed Phase 1 |
| Modal create forms | Dedicated routes | CONTEXT D-05 | Full-page `/habits/new` |
| Moment.js dates | date-fns v4 ESM | 2024+ | Tree-shake per-function imports |
| Storing streak counters | Compute-on-read | ARCHITECTURE.md | Defer to Phase 2; don't add fields now |

**Deprecated/outdated:**
- `dexie-observable` / `dexie-syncable`: unmaintained — not applicable to v1
- `YYYY-MM-DD` in date-fns: use `yyyy-MM-dd` (calendar year, not week-year)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pointer Events swipe (no library) is sufficient for D-09 | Pattern 5 | May need `react-swipeable` if iOS edge cases appear |
| A2 | `0–6` day index matching `Date.getDay()` for frequency | Domain Types | Off-by-one schedule bugs if planner uses ISO weekday |
| A3 | `npx shadcn@latest init -t vite` scaffolds into current directory | Installation | May need `npm create vite` first if repo already has files |
| A4 | Archive (soft delete) is default; hard delete optional in manage UI | Pitfall 6 | User expectation mismatch if delete is too aggressive |
| A5 | History route navigates from habit row tap on chevron/link, not row toggle | Architecture | Accidental toggle if entire row navigates |

## Open Questions

1. **Habit row navigation to history vs toggle**
   - What we know: D-14 requires history screen per habit; D-09/D-10 use full row for toggle
   - What's unclear: How user reaches history without conflicting with row tap
   - Recommendation: Row body toggles completion; separate trailing icon/button (e.g., chevron or calendar) navigates to `/habits/:id/history` — planner should specify in UI tasks

2. **Manage/archive screen placement**
   - What we know: Archived habits hidden from Today; recoverable from manage section (Claude's discretion)
   - What's unclear: Top-level nav vs settings stub vs overflow menu
   - Recommendation: Link from Today header ("Manage habits") to `/habits/manage` — minimal nav for Phase 1

3. **Hard delete behavior for completions**
   - What we know: HABT-03 allows delete; Phase 2 needs completion history
   - What's unclear: Cascade delete completions on hard delete?
   - Recommendation: Archive default; hard delete removes habit + its completions with confirm dialog

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (≥20.19) | Vite 8 | ✓ | v24.16.0 | — |
| npm | Package install | ✓ | 11.13.0 | pnpm/yarn |
| npx | shadcn CLI | ✓ | — | — |
| Modern browser (IndexedDB) | Dexie persistence | ✓ (assumed dev) | — | None — core requirement |
| Git | GSD commit_docs | ✓ (assumed) | — | Manual commit |

**Missing dependencies with no fallback:**
- None — all Phase 1 tooling available on target machine

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (test block) — Wave 0 |
| Quick run command | `npx vitest run src/domain` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HABT-01 | Create habit persists name + frequency | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ Wave 0 |
| HABT-02 | Update habit name/frequency | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ Wave 0 |
| HABT-03 | Archive hides from active query | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ Wave 0 |
| LOG-01 | Toggle today completion upsert/delete | integration | `npx vitest run src/infrastructure/completionRepository.test.ts -x` | ❌ Wave 0 |
| LOG-02 | Toggle past day in 7-day window | integration | `npx vitest run src/infrastructure/completionRepository.test.ts -x` | ❌ Wave 0 |
| LOG-03 | isDueOnDate filters weekly habits | unit | `npx vitest run src/domain/schedule.test.ts -x` | ❌ Wave 0 |
| DATA-01 | Data survives simulated reopen | integration | `npx vitest run src/infrastructure/db.test.ts -x` | ❌ Wave 0 |
| UI-01 | Dark theme class on root | component | Manual / visual UAT | ❌ |
| UI-02 | Row min-height 44px | component | `npx vitest run src/components/habits/HabitRow.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/domain`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vite.config.ts` — add `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`
- [ ] `src/test/setup.ts` — fake-indexeddb + Dexie.dependencies
- [ ] `src/domain/dates.test.ts` — `yyyy-MM-dd` format, no UTC bug
- [ ] `src/domain/schedule.test.ts` — daily + Mon/Wed/Fri due logic
- [ ] `src/infrastructure/habitRepository.test.ts` — CRUD + archive
- [ ] `src/infrastructure/completionRepository.test.ts` — toggle + future-date reject
- [ ] Framework install: `npm install -D vitest @testing-library/react fake-indexeddb jsdom`
- [ ] Project scaffold: `npx shadcn@latest init -t vite` (entire app shell)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth in v1 |
| V3 Session Management | no | Local-only, no sessions |
| V4 Access Control | no | Single-user local app |
| V5 Input Validation | yes | Trim/max-length habit names; reject empty; no `dangerouslySetInnerHTML` |
| V6 Cryptography | no | No secrets; local data unencrypted (acceptable v1) |

### Known Threat Patterns for Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via habit name | Tampering/Info Disclosure | React text interpolation (auto-escape); never `dangerouslySetInnerHTML` on user input |
| Prototype pollution via import | Tampering | No import in Phase 1; Phase 4 will use Zod schema validation |
| IndexedDB data readable on shared device | Info Disclosure | Document local-only limitation; export is user responsibility (Phase 4) |

## Sources

### Primary (HIGH confidence)
- [dexie.org](https://dexie.org/) — compound keys `[prop+prop]`, useLiveQuery, schema versioning
- [vite.dev/guide](https://vite.dev/guide/) — Node 20.19+, scaffold commands
- [ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + Vite + shadcn init
- [reactrouter.com/start/declarative/routing](https://reactrouter.com/start/declarative/routing) — BrowserRouter, Routes, nested routes
- [github.com/date-fns/date-fns/docs/unicodeTokens.md](https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md) — `yyyy` vs `YYYY`
- [npmjs.com/package/fake-indexeddb](https://www.npmjs.com/package/fake-indexeddb) — Dexie test setup
- `.planning/research/ARCHITECTURE.md` — layered SPA, data model, repository pattern
- `.planning/research/PITFALLS.md` — date storage, frozen today, localStorage warnings

### Secondary (MEDIUM confidence)
- [developer.mozilla.org — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) — pan-y for swipe vs scroll
- [github.com/GoogleChrome/modern-web-guidance — swipe patterns](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/user-experience/swipe-to-remove.md) — pointer/scroll-snap patterns

### Tertiary (LOW confidence)
- WebSearch swipe gesture summaries — validate on real iOS/Android during UAT

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm; patterns from official Dexie/Vite/shadcn docs
- Architecture: HIGH — aligns with project ARCHITECTURE.md and locked CONTEXT decisions
- Pitfalls: HIGH — PITFALLS.md cross-checked; date/today issues are well-documented

**Research date:** 2026-07-19
**Valid until:** 2026-08-19 (stable stack; re-verify if major Dexie/RR release)
