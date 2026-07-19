# Architecture Research

**Domain:** Local-first habit tracker web application
**Researched:** 2026-07-19
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

Local-first habit trackers follow a **layered SPA architecture** where the browser is the sole source of truth. There is no backend, no sync engine, and no auth layer in v1. The app decomposes into four horizontal layers with clear downward dependencies:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (UI)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Dashboard   │  │  Habit List  │  │   Heatmap    │  │ Settings │ │
│  │  (streaks,   │  │  (CRUD,      │  │  (contrib.   │  │ (export/ │ │
│  │   overview)  │  │   toggle)    │  │   grid)      │  │  import) │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                 │                  │       │
├─────────┴─────────────────┴─────────────────┴──────────────────┴───────┤
│                   Application Layer (Hooks / Use Cases)              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ useHabits    │  │ useToggle    │  │ useStreak    │  │ useBackup│ │
│  │              │  │ Completion   │  │              │  │          │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                 │                  │       │
├─────────┴─────────────────┴─────────────────┴──────────────────┴───────┤
│                     Domain Layer (Pure Logic)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Streak       │  │ Stats        │  │ Heatmap      │  │ Date     │ │
│  │ Calculator   │  │ Aggregator   │  │ Grid Builder │  │ Utils    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                 │                  │       │
├─────────┴─────────────────┴─────────────────┴──────────────────┴───────┤
│                  Infrastructure Layer (Persistence)                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              IndexedDB (via Dexie.js wrapper)                 │   │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐ │   │
│  │  │ habits      │  │ completions      │  │ app_metadata   │ │   │
│  │  │ table       │  │ table            │  │ (schema ver)   │ │   │
│  │  └─────────────┘  └──────────────────┘  └────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Key architectural invariant:** Domain logic never imports from UI or infrastructure. Streaks, completion rates, and heatmap cell states are **computed on read** from raw completion records — never stored as authoritative state.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Habit Repository** | CRUD for habit definitions (name, frequency, color, archive state) | Dexie table with `id` primary key; `useLiveQuery` for reactive reads |
| **Completion Repository** | Toggle and query check-ins by habit and date range | Dexie table with compound unique index `[habitId+date]`; upsert/delete on toggle |
| **Date Utils** | Local calendar date handling (`YYYY-MM-DD`), week boundaries, "today" | Pure functions using `Intl` or date-fns; no UTC midnight bugs |
| **Streak Calculator** | Current streak, longest streak per habit from completion set | Pure function: walk backward from today through expected schedule days |
| **Stats Aggregator** | Completion rate, weekly overview, dashboard summaries | Pure function over completions + habit frequency in a date window |
| **Heatmap Grid Builder** | Map completion dates to 53-week grid cells | Pure function: iterate days backward, check `Set<date>` membership |
| **Backup Service** | Export full DB to JSON; import with schema validation | Serialize `{ version, habits, completions }`; validate on import, merge or replace |
| **Dashboard** | Display streaks, rates, today's habits at a glance | React component consuming hooks that compose domain + repo |
| **Habit List** | Create/edit habits, one-tap today toggle | React component; writes through completion repository |
| **Heatmap** | GitHub-style contribution grid per habit | CSS Grid or SVG; click cell to toggle that date's completion |
| **Settings / Backup UI** | Export download, import file picker, confirm overwrite | Thin wrapper over Backup Service |

### Core Data Model

The canonical entity-relationship for habit trackers (local or server-backed) reduces to two tables:

```
Habit (1) ──< Completion (N)

Habit:     { id, name, frequency, color?, createdAt, archived? }
Completion: { habitId, date }   ← unique per (habitId, date)
```

**Frequency representation:**
- Daily: `frequency: { type: 'daily' }`
- Specific days: `frequency: { type: 'weekly', days: [1,3,5] }` (Mon/Wed/Fri)

**Date storage:** Always `YYYY-MM-DD` strings in the user's local timezone. Never store `Date` objects or UTC timestamps for day-level tracking — this avoids DST and timezone boundary bugs.

## Recommended Project Structure

```
src/
├── domain/                  # Pure business logic — zero framework imports
│   ├── types.ts             # Habit, Completion, Frequency, BackupPayload
│   ├── dates.ts             # toLocalDateString, parseDate, weekStart, isToday
│   ├── streak.ts            # calculateCurrentStreak, calculateLongestStreak
│   ├── stats.ts             # completionRate, weeklyOverview
│   └── heatmap.ts           # buildGridCells(habitId, completions, range)
├── infrastructure/          # Persistence adapters
│   ├── db.ts                # Dexie database singleton + schema versions
│   ├── habitRepository.ts   # HabitRepository implementation
│   └── completionRepository.ts  # CompletionRepository implementation
├── services/                # Cross-cutting orchestration
│   └── backupService.ts     # exportJSON, importJSON, validateSchema
├── hooks/                   # React integration layer
│   ├── useHabits.ts         # Live query + CRUD actions
│   ├── useCompletions.ts    # Toggle, range queries
│   ├── useStreak.ts         # Derived streak for a habit
│   └── useBackup.ts         # Export/import actions
├── components/              # Presentational UI
│   ├── dashboard/
│   ├── habits/
│   ├── heatmap/
│   └── settings/
├── pages/                   # Route-level composition (if using router)
│   ├── DashboardPage.tsx
│   └── HabitDetailPage.tsx
└── App.tsx                  # Root layout, providers, routing
```

### Structure Rationale

- **domain/:** Isolates all testable business logic. Streak and heatmap algorithms are the highest-risk code — keeping them pure enables unit tests without IndexedDB or React.
- **infrastructure/:** Single place for Dexie schema, migrations, and repository implementations. Swapping storage (e.g., adding sync later) only touches this folder.
- **hooks/:** Thin glue between React and repositories/domain. Components never call Dexie directly.
- **services/:** Backup/import spans multiple repositories and needs transactional semantics — belongs outside individual repos.
- **components/:** Grouped by feature (dashboard, heatmap) not by atomic design level — appropriate for a small v1 app.

## Architectural Patterns

### Pattern 1: Repository over IndexedDB

**What:** Abstract all persistence behind repository interfaces. UI and domain depend on interfaces; Dexie implementation lives in infrastructure.

**When to use:** Always, for any app with more than a handful of localStorage keys.

**Trade-offs:**
- (+) Domain logic testable with in-memory fake repos
- (+) Schema migrations isolated to one module
- (+) Export/import can snapshot via repository methods
- (−) Slight boilerplate vs. direct Dexie calls in components

**Example:**
```typescript
// domain/types.ts
export interface CompletionRepository {
  toggle(habitId: string, date: string): Promise<void>;
  getByHabit(habitId: string, start: string, end: string): Promise<string[]>;
  getAllForHabit(habitId: string): Promise<string[]>;
}

// infrastructure/completionRepository.ts
export const completionRepo: CompletionRepository = {
  async toggle(habitId, date) {
    const existing = await db.completions.get([habitId, date]);
    if (existing) await db.completions.delete([habitId, date]);
    else await db.completions.put({ habitId, date });
  },
  async getByHabit(habitId, start, end) {
    return db.completions
      .where({ habitId })
      .between([habitId, start], [habitId, end])
      .primaryKeys()
      .then(keys => keys.map(k => k[1] as string));
  },
  // ...
};
```

### Pattern 2: Derived State (Compute-on-Read)

**What:** Streaks, completion rates, and heatmap intensities are computed from raw completions at read time, not persisted.

**When to use:** Always for streaks in v1. Storing streak counters creates sync/consistency bugs on edit, delete, or import.

**Trade-offs:**
- (+) Single source of truth (completions table)
- (+) Import/export cannot desync streaks from logs
- (+) Editing past dates automatically corrects streak display
- (−) Recomputation on every render — mitigate with memoization and bounded date windows

**Example:**
```typescript
// domain/streak.ts
export function calculateCurrentStreak(
  completions: Set<string>,
  frequency: Frequency,
  today: string
): number {
  let streak = 0;
  let cursor = today;

  while (isScheduledDay(cursor, frequency)) {
    if (completions.has(cursor)) {
      streak++;
      cursor = previousScheduledDay(cursor, frequency);
    } else if (cursor === today) {
      // Today not yet done — streak may still be alive from yesterday
      cursor = previousScheduledDay(cursor, frequency);
    } else {
      break;
    }
  }
  return streak;
}
```

### Pattern 3: Reactive Queries (Live Data Binding)

**What:** UI subscribes to IndexedDB changes via `useLiveQuery` (Dexie) or equivalent, eliminating manual cache invalidation.

**When to use:** All list and detail views that display habit or completion data.

**Trade-offs:**
- (+) Toggle → UI updates automatically
- (+) No global state manager needed for server-like data
- (−) Tied to Dexie React hooks; abstract behind custom hooks to limit coupling

**Example:**
```typescript
// hooks/useHabits.ts
export function useHabits() {
  const habits = useLiveQuery(() => db.habits.filter(h => !h.archived).toArray());
  return { habits: habits ?? [], isLoading: habits === undefined };
}
```

### Pattern 4: Versioned Backup Payload

**What:** Export produces a JSON document with schema version, habits array, and completions array. Import validates version, migrates if needed, and replaces or merges data.

**When to use:** Required for v1 per project constraints (local-first with backup).

**Trade-offs:**
- (+) User owns data; portable across browsers/devices manually
- (+) Schema version enables forward-compatible migrations
- (−) Import must handle conflicts (recommend full replace with confirmation in v1)

**Example:**
```typescript
// services/backupService.ts
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}

export async function exportBackup(): Promise<BackupPayload> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits: await db.habits.toArray(),
    completions: await db.completions.toArray(),
  };
}
```

## Data Flow

### Request Flow (User Toggles Today's Habit)

```
User tap on habit checkbox
    ↓
HabitListItem (component)
    ↓
useToggleCompletion (hook)
    ↓
completionRepo.toggle(habitId, todayLocalDate)
    ↓
Dexie IndexedDB write (upsert or delete)
    ↓
useLiveQuery re-fires (reactive)
    ↓
useStreak recalculates from updated completions
    ↓
Dashboard + HabitListItem re-render with new streak
```

### State Management

```
IndexedDB (source of truth)
    ↓ useLiveQuery (subscribe)
Hooks (useHabits, useCompletions)
    ↓ compose
Domain functions (calculateStreak, buildGridCells)
    ↓ return derived values
Components (read-only render + dispatch actions)
    ↓ user action
Hooks → Repository → IndexedDB
```

No global client state store (Redux/Zustand) is needed for v1. UI-local state (modals, form inputs, hover tooltips) uses `useState`. Persistent state lives in IndexedDB and flows up via live queries.

### Key Data Flows

1. **Daily check-in:** User taps → `toggle(habitId, today)` → IndexedDB → live query → streak recalc → UI update. Single write, reactive read chain.

2. **Heatmap render:** Component mounts → `getByHabit(habitId, startDate, endDate)` → build `Set<date>` → `buildGridCells()` returns array of `{ date, completed, row, col }` → CSS Grid renders cells. Re-runs when completions change.

3. **Dashboard load:** `useHabits()` + `useCompletions()` for today → for each habit, `calculateCurrentStreak()` and `completionRate(last7Days)` → render cards. All derived; no dashboard-specific storage.

4. **Export:** User clicks Export → `exportBackup()` reads all tables → `JSON.stringify` → browser download as file.

5. **Import:** User selects file → parse JSON → validate `version` → confirm overwrite → `db.transaction('rw', [habits, completions], () => { clear + bulkAdd })` → live queries refresh all views.

## Suggested Build Order

Components have clear dependency chains. Build bottom-up:

```
Phase 1: Foundation
  domain/types.ts → domain/dates.ts → infrastructure/db.ts
  (no UI yet; unit test dates)

Phase 2: Persistence
  habitRepository → completionRepository
  (test with fake-indexeddb)

Phase 3: Core Loop
  domain/streak.ts → hooks/useHabits + useToggleCompletion
  → HabitList + today toggle UI
  (MVP: create habit, check in today, see it persist)

Phase 4: Dashboard
  domain/stats.ts → useStreak hook → Dashboard component
  (streak display, weekly overview)

Phase 5: Heatmap
  domain/heatmap.ts → Heatmap component
  (53-week grid, click-to-toggle past dates)

Phase 6: Backup
  backupService → Settings UI
  (export/import JSON)

Phase 7: Polish
  Habit CRUD (edit name, frequency, archive)
  Responsive layout, dark mode, streak animations
```

**Dependency graph:**
```
types ──→ dates ──→ db schema
                  ──→ repositories ──→ hooks ──→ UI components
         ──→ streak/stats/heatmap (pure) ──→ hooks
                              backupService ──→ settings UI
```

**Critical path:** types → db → repositories → toggle → streak display. Everything else hangs off this chain.

## Scaling Considerations

This is a single-user, local-only app. "Scaling" means data volume within one browser, not multi-tenant load.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1–20 habits, 1 year data | Default architecture — no changes needed |
| 20–100 habits, 5+ years | Memoize streak/stats calculations; limit heatmap query to 53-week window; consider Web Worker for bulk import |
| 100+ habits | Virtualize habit list; lazy-render heatmaps (only visible habit); paginate dashboard |

### Scaling Priorities

1. **First bottleneck: Heatmap re-render.** Each habit × 371 cells on every completion change. Fix: memoize `buildGridCells` output per habit; only recompute changed habit's grid.

2. **Second bottleneck: Streak walk on large histories.** Walking 5 years of daily completions is wasteful. Fix: query only recent completions needed for streak (typically last 60–90 scheduled days suffices to determine current streak).

3. **Third bottleneck: Import of large backup files.** Fix: use Dexie bulk operations inside a single transaction; show progress indicator.

## Anti-Patterns

### Anti-Pattern 1: Storing Streaks as Source of Truth

**What people do:** Persist `currentStreak` and `longestStreak` on the Habit record, incrementing on toggle.

**Why it's wrong:** Editing or deleting a past completion desyncs the counter. Import merges create inconsistent state. Timezone changes break stored values.

**Do this instead:** Store only completions. Derive streaks via `calculateCurrentStreak()` on every read. Optionally cache with invalidation on any completion write.

### Anti-Pattern 2: UTC Timestamps for Day Boundaries

**What people do:** Store `completedAt: Date` (UTC ISO string), compare with `Date.now() - 86400000`.

**Why it's wrong:** DST transitions create 23- and 25-hour days. Users near midnight get wrong-day attribution. Streak breaks incorrectly.

**Do this instead:** Store `date: "2026-07-19"` as local calendar string. Compare with `differenceInCalendarDays`, never hour arithmetic.

### Anti-Pattern 3: Boolean Arrays for Heatmap Data

**What people do:** `completed: [0,1,0,1,...]` indexed by day offset from habit creation.

**Why it's wrong:** Cannot update a specific date without index math. Breaks when habit creation date changes. No way to handle gaps or sparse data.

**Do this instead:** Store completion dates explicitly. Build grid by iterating calendar days and checking `Set` membership.

### Anti-Pattern 4: localStorage for Completion Logs

**What people do:** `localStorage.setItem('habits', JSON.stringify(allData))` on every toggle.

**Why it's wrong:** 5MB limit hit within months of daily tracking. Synchronous writes block UI thread. No indexing for date-range queries. Entire blob re-serialized on every change.

**Do this instead:** IndexedDB via Dexie with indexed `completions` table and compound key `[habitId+date]`.

### Anti-Pattern 5: Business Logic in Components

**What people do:** Streak calculation inline in `HabitCard.tsx` useEffect.

**Why it's wrong:** Untestable, duplicated across dashboard and detail views, tightly coupled to React lifecycle.

**Do this instead:** Pure functions in `domain/`, called from hooks. Components receive `{ currentStreak, isCompletedToday }` as props.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None (v1) | N/A | Fully offline; no network calls |
| File System (export/import) | Browser `Blob` + `<a download>` / `<input type="file">` | No server upload; user manages files manually |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Hooks | Function calls + reactive query results | Components never import from `infrastructure/` |
| Hooks ↔ Domain | Pure function calls with typed inputs | Domain has no async, no side effects |
| Hooks ↔ Repositories | Async method calls | Repositories return domain types, not Dexie records |
| Repositories ↔ IndexedDB | Dexie API | Only layer that knows about Dexie |
| BackupService ↔ Repositories | Bulk read/write via `db.transaction` | Bypasses individual repo methods for atomic replace |
| Heatmap ↔ CompletionRepo | Date-range query → domain grid builder | Heatmap component does not compute streaks |

## Sources

- [smart-habit-tracker](https://github.com/nhatduong-agilityio/smart-habit-tracker) — Offline-first React + Dexie architecture with pure domain logic and unit-tested streaks (HIGH confidence — direct codebase reference)
- [jcortesdev/habit-tracker](https://github.com/jcortesdev/habit-tracker) — IndexedDB-only, D3 heatmap, no global state, repository-via-Dexie pattern (HIGH confidence)
- [parthpandyappp/htracker](https://github.com/parthpandyappp/htracker) — Habit/HabitLog data model with compound unique constraint (MEDIUM confidence — server-backed but model applies)
- [Building a Github-like contributions graph](https://medium.com/@the_ozmic/building-a-github-like-contribution-graph-for-a-habit-tracker-app-7655d82ece6d) — Date-array over boolean-array for heatmap data (MEDIUM confidence)
- [Streak Timezone & DST Handling](https://trophy.so/blog/streak-timezone-dst-handling) — Calendar-day string comparison pattern (MEDIUM confidence)
- [Local-First Architecture for PWAs](https://blog.openreplay.com/local-first-pwa-architecture/) — Layered local DB as source of truth (MEDIUM confidence)
- [Dexie.js documentation](https://dexie.org/) — IndexedDB wrapper, schema versioning, useLiveQuery (HIGH confidence — official docs)

---
*Architecture research for: Habit Tracker (local-first web app)*
*Researched: 2026-07-19*
