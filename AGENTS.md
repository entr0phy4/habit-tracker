<!-- gsd-project-start source:PROJECT.md -->

## Project

**Habit Tracker**

A web application that helps people build and maintain daily, weekly, or custom habits through visual progress tracking and streak motivation. It's a clean, fast, visually pleasing tool for anyone who wants better routines — students, professionals, fitness enthusiasts, and people working on self-improvement — especially those who respond well to visual feedback and the psychological boost of "don't break the chain" streaks.

**Core Value:** Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

**Current milestone:** v1.1 Motivation Polish & Flexibility (colors, check-in rewards, overall rate, X/week frequency, streak freeze). v1.0 shipped.

### Constraints

- **Platform**: Responsive web app (desktop + mobile browser) — no native apps
- **Data**: Local-first storage with export/import backup — no backend or auth
- **Scope**: v1.1 = motivation polish & schedule flexibility; resist reminders/sync creep
- **Design**: Minimal dark mode aesthetic — visual clarity over decoration
- **Reminders**: Deferred to v2.0 — out of v1.1

<!-- gsd-project-end -->

<!-- gsd-stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Vite | 8.1.5 | Build tool & dev server | Default 2026 choice for React SPAs. Sub-200ms cold start, native ESM HMR, static `dist/` output with zero Node runtime in production. No SSR/API overhead this project does not need. | HIGH |
| React | 19.2.7 | UI framework | Mature ecosystem, required by project constraints for contribution-graph UI. React 19 is stable; `use()` and improved hydration are available but not required for v1. | HIGH |
| TypeScript | 7.0.2 | Type safety | Catches schema drift between habits, completions, and export/import formats at compile time. Standard for greenfield React in 2026. | HIGH |
| Dexie | 4.4.4 | Local-first persistence (IndexedDB) | Best-in-class IndexedDB wrapper for React: promise API, schema versioning, transactions, query indexes, and `useLiveQuery` reactivity. Handles years of daily check-ins without localStorage's 5 MB cap or synchronous blocking. | HIGH |
| Tailwind CSS | 4.3.3 | Utility-first styling | v4 uses CSS-first config (`@import "tailwindcss"`), Vite plugin integration, and `@theme` tokens — ideal for GitHub/Linear minimal dark aesthetic without fighting a component library's design system. | HIGH |
| shadcn/ui | latest CLI (`shadcn@latest`) | Accessible UI primitives | Copy-paste Radix-based components styled with Tailwind. Dark-first theming out of the box. No npm dependency lock-in; you own the source. Matches the GitHub/Linear visual language better than Material UI or Chakra. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `@vitejs/plugin-react` | 6.0.3 | React Fast Refresh in Vite | Always — required Vite plugin for React | HIGH |
| `@tailwindcss/vite` | 4.3.3 | Tailwind v4 Vite integration | Always — replaces PostCSS config boilerplate | HIGH |
| `dexie-react-hooks` | 4.4.0 | Reactive IndexedDB queries | Any component reading habits/completions from Dexie (`useLiveQuery`) | HIGH |
| `react-activity-calendar` | 3.2.1 | GitHub-style contribution heatmap | Habit detail view and dashboard streak grids. Native dark/light `colorScheme`, customizable `theme`, tooltips via `renderBlock`. | HIGH |
| `react-router` | 8.2.0 | Client-side routing | Multi-view navigation: dashboard, habit detail, settings/backup. Lightweight for SPA; no server router needed. | HIGH |
| `date-fns` | 4.4.0 | Date math & formatting | Streak calculation, week boundaries, ISO date keys (`yyyy-MM-dd`), locale-aware display | HIGH |
| `zustand` | 5.0.14 | Ephemeral UI state | Modal open/close, active filters, transient form state. Keep Dexie as source of truth for persisted data. | HIGH |
| `zod` | 4.4.3 | Runtime schema validation | Validate export/import JSON before writing to IndexedDB; version-stamp backup files | HIGH |
| `lucide-react` | 1.25.0 | Icons | Streak flame, check/uncheck, settings, export/import icons. Pairs with shadcn/ui. | HIGH |
| `clsx` + `tailwind-merge` | 2.1.1 / 3.6.0 | Conditional class merging | shadcn/ui dependency; use `cn()` helper for component variants | HIGH |
| `vitest` | 4.1.10 | Unit & integration tests | Streak logic, export/import round-trips, Dexie repository layer | HIGH |
| `@testing-library/react` | 16.3.2 | Component testing | User-centric tests for check-in tap, habit creation flows | HIGH |
| `jsdom` | latest | DOM environment for Vitest | Required Vitest environment for React component tests | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js 22 LTS | Runtime | Vite 8 requires Node 20.19+ or 22.12+; use 22 LTS for longest support window |
| ESLint 9 + `typescript-eslint` | Linting | Vite React-TS template scaffolds this; extend with React Hooks rules |
| `@types/react` / `@types/react-dom` | 19.2.17 | Match React 19 types |
| `@types/node` | latest | Required for `path` alias in `vite.config.ts` |

## Installation

# Scaffold

# Core runtime

# Local-first data

# UI & styling

# Domain-specific

# Dev dependencies

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite SPA | Next.js 15 | If you later need SSR, SEO landing pages, or API routes for cloud sync in v2 |
| Dexie | `idb` (8.0.3) | If you want zero dependencies and hand-roll schema/migrations — acceptable but more boilerplate for `useLiveQuery`-style reactivity |
| Dexie | RxDB | If v2 requires multi-tab sync, replication, or conflict resolution out of the box — overkill for v1 local-only |
| react-activity-calendar | react-calendar-heatmap (1.10.0) | Only if you need the exact Kevin Qi API and are willing to hand-roll dark mode CSS |
| react-activity-calendar | Custom SVG grid | If bundle size is critical and you need pixel-perfect GitHub clone — adds 2–3 days of dev for marginal v1 value |
| shadcn/ui | Radix Themes | If you want a pre-styled design system and don't need GitHub/Linear minimal control |
| Zustand | Jotai / React Context | Jotai if state graph becomes deeply nested; Context alone is fine for tiny apps but scales poorly for modal + filter + form state |
| date-fns | Temporal API / Day.js | Temporal when browser support is sufficient and you need timezone-heavy logic; Day.js if bundle size is the top priority |
| Vitest | Playwright | Playwright for E2E in a later phase; Vitest covers streak math and data layer faster |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Officially deprecated; slow builds, no active maintenance | Vite |
| Next.js (v1) | Adds SSR/RSC/API surface area for a static local-first app; deployment complexity without benefit | Vite SPA |
| localStorage as primary store | 5 MB cap, synchronous main-thread blocking, no indexed queries, poor fit for habit + completion relational data | Dexie (IndexedDB) |
| Redux Toolkit | Ceremony disproportionate to a single-user local app with one data source | Dexie `useLiveQuery` + Zustand for UI |
| TanStack Query | Designed for server-state fetching/caching; no server in v1 | Dexie live queries |
| Dexie Cloud / `dexie-cloud-addon` | Introduces auth, sync, and hosted infra — explicitly out of scope for v1 | Plain Dexie + JSON export/import |
| `dexie-observable` / `dexie-syncable` | Legacy, unmaintained sync addons | Export/import JSON for v1; Dexie Cloud only if v2 needs sync |
| PWA + Service Workers (v1) | PROJECT.md defers offline/install scope; adds cache invalidation complexity | Responsive web; revisit in v2 if needed |
| Material UI / Chakra UI | Heavy opinionated themes; fighting defaults to achieve minimal GitHub/Linear dark aesthetic | shadcn/ui + Tailwind |
| Firebase / Supabase (v1) | Backend, auth, and network dependency contradict local-first v1 constraint | Dexie + file export |
| Moment.js | Deprecated, large bundle | date-fns |
| CSS-in-JS (styled-components, Emotion) | Runtime cost, Tailwind v4 + shadcn already covers styling needs | Tailwind utility classes |

## Stack Patterns by Variant

- Use `react-activity-calendar` with `colorScheme="dark"` and a two-color `theme` (GitHub green scale)
- Because it ships dark mode, tooltips, and responsive SVG out of the box
- Version every backup file (`{ version: 1, exportedAt, habits, completions }`)
- Validate with Zod before `db.transaction('rw', ...)` bulk write
- Because corrupt imports can wipe IndexedDB; transactional writes enable rollback
- Use shadcn `Button` with `size="lg"` and min 44×44px touch targets
- Because PROJECT.md requires single-tap check-in on mobile browsers
- Tree-shake `date-fns` with per-function imports (`import { format } from 'date-fns/format'`)
- Lazy-load habit detail route with `React.lazy`
- Because the heatmap and Dexie are the largest non-core deps
- Keep Dexie as local store; add sync layer (Dexie Cloud or custom API) behind a repository interface
- Because decoupling storage from UI now avoids a v2 rewrite

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `vite@8.1.5` | `@vitejs/plugin-react@6.0.3` | Official pairing; plugin handles Fast Refresh and JSX |
| `vite@8.1.5` | `@tailwindcss/vite@4.3.3` | Tailwind v4 Vite plugin replaces `postcss.config.js` |
| `react@19.2.7` | `react-activity-calendar@3.2.1` | Library tests against React 19 and `@vitejs/plugin-react@6` |
| `react@19.2.7` | `shadcn/ui` (latest) | shadcn new projects default to React 19 + Tailwind v4 |
| `dexie@4.4.4` | `dexie-react-hooks@4.4.0` | Match major versions; hooks API stable in v4 |
| `vitest@4.1.10` | `vite@8.1.5` | Vitest shares Vite config; use `test.environment: 'jsdom'` |
| `react-router@8.2.0` | `react@19.2.7` | RR v8 supports React 19; use `createBrowserRouter` pattern |
| `date-fns@4.4.0` | ESM + Vite | v4 is ESM-first; no CommonJS interop issues with Vite |

## Architecture Sketch

## Sources

- [Vite Getting Started](https://vite.dev/guide/) — Node version requirements, `npm create vite` scaffold (HIGH)
- [npm registry](https://www.npmjs.com/) — all version numbers verified via `npm view` on 2026-07-19 (HIGH)
- [Dexie React Tutorial](https://dexie.org/docs/Tutorial/React) — `useLiveQuery`, local-first patterns (HIGH)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + React 19 setup (HIGH)
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) — dark mode tokens, `@theme` directive (HIGH)
- [react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar) — v3 dark mode, `colorScheme`, `theme` props (HIGH)
- [react-activity-calendar npm](https://www.npmjs.com/package/react-activity-calendar) — 51K weekly downloads, v3.2.1 (HIGH)
- IndexedDB vs localStorage guidance — async storage, capacity, query support (MEDIUM, cross-checked with Dexie docs)

<!-- gsd-stack-end -->

<!-- gsd-conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- gsd-conventions-end -->

<!-- gsd-architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- gsd-architecture-end -->

<!-- gsd-skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.cursor/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- gsd-skills-end -->

<!-- gsd-workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- gsd-workflow-end -->

<!-- gsd-profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- gsd-profile-end -->
