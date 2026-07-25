# Walking Skeleton — Habit Tracker

**Phase:** 1
**Generated:** 2026-07-19

## Capability Proven End-to-End

A user can create a daily habit, see it on the Today view when due, toggle today's completion with one tap, and find the habit and completion still present after a browser refresh.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vite 8.1.5 + React 19.2.7 (SPA) | Locked in STACK.md; fast dev server, static dist, no SSR overhead for local-first app |
| Data layer | Dexie 4.4.4 (IndexedDB) | Local-first DATA-01; compound completion keys, useLiveQuery reactivity, scales beyond localStorage |
| Auth | None (v1) | Single-user local app per PROJECT.md constraints |
| Deployment target | Local dev (`npm run dev` + `npm run build`) | Greenfield v1; no hosting in Phase 1 — documented full-stack run via Vite dev server |
| Directory layout | Layered `src/`: `domain/` → `infrastructure/` → `hooks/` → `components/` → `pages/` | Matches ARCHITECTURE.md; components never import Dexie directly |
| Routing | React Router 8 declarative (`BrowserRouter` + `Routes`) | Dedicated pages for create/edit/history per D-05 |
| Styling | Tailwind CSS v4 + shadcn/ui (dark, zinc, new-york) | UI-01 minimal dark mode; GitHub/Linear palette in `@theme` |
| Date keys | Local `yyyy-MM-dd` via date-fns | Avoid UTC midnight bugs; compute-on-read for streaks in Phase 2 |
| State | Dexie `useLiveQuery` for persisted data; `useState` for forms only | No Redux/Zustand for habits/completions in Phase 1 |

## Stack Touched in Phase 1

- [x] Project scaffold (framework, build, lint, test runner) — Plan 01-01
- [x] Routing — at least one real route (`/` Today) — Plan 01-01
- [x] Database — at least one real read AND one real write (Dexie habits + completions) — Plan 01-01
- [x] UI — at least one interactive element wired to persistence (row tap toggle) — Plan 01-01
- [x] Deployment — documented local full-stack run command (`npm run dev`) — Plan 01-01

## Out of Scope (Deferred to Later Slices)

- Streak calculation and display (Phase 2)
- Dashboard with all streaks (Phase 3)
- GitHub-style contribution heatmap (Phase 3)
- JSON export/import backup (Phase 4)
- Push notifications / reminders (v2)
- User accounts / cloud sync (v1 out of scope)
- PWA / offline install
- Weekly-frequency edge cases beyond `isDueOnDate` unit tests (Phase 2 streak fixtures)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 1 Plans 02–04:** Full frequency picker, swipe gestures, edit/archive/manage, 7-day history grid
- **Phase 2:** Streaks & statistics (compute-on-read from completions)
- **Phase 3:** Dashboard & contribution grid visualization
- **Phase 4:** Export/import JSON backup with Zod validation
