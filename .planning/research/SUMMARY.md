# Project Research Summary

**Project:** Habit Tracker
**Domain:** Local-first habit tracker web application (React SPA)
**Researched:** 2026-07-19
**Confidence:** HIGH

## Executive Summary

This project is a local-first habit tracker web app built as a React SPA with no backend in v1. Experts in this space — Loop, Kadō, smart-habit-tracker — converge on a two-entity data model (habits + completions), IndexedDB persistence, and **compute-on-read** streak derivation rather than stored counters. The signature differentiator is a GitHub-style contribution grid per habit, paired with one-tap check-in and a minimal dark aesthetic that targets developer/designer audiences who want a serious tool, not a gamified wellness app.

The recommended approach is a **Vite 8 + React 19 + Dexie 4** stack with a layered architecture: pure domain logic (streaks, stats, heatmap grid builder) isolated from Dexie repositories and React hooks using `useLiveQuery`. UI uses Tailwind v4 + shadcn/ui for the GitHub/Linear dark aesthetic, and `react-activity-calendar` for the contribution heatmap. Zustand handles ephemeral UI state only; Dexie is the single source of truth. Export/import JSON with Zod validation is a v1 requirement, not a nice-to-have — it is the real backup strategy against browser storage eviction.

The highest risks are **streak correctness** (timezone/DST bugs, weekly-frequency rest days) and **data durability** (IndexedDB is best-effort; unsafe import can wipe data). Both are preventable if designed upfront: store completions as local `YYYY-MM-DD` strings, walk scheduled days only for streaks, never persist streak counters, and implement validate → snapshot → transactional import from day one. Secondary risk is contribution grid performance — memoize grid cells, show full heatmaps on detail view only, and keep dashboard to summary stats. Scope creep (reminders, accounts, analytics) is the existential risk; PROJECT.md's Active requirements are the contract.

## Key Findings

### Recommended Stack

A Vite SPA is the right foundation — no SSR, no API routes, static `dist/` deployment. Dexie over localStorage is non-negotiable for relational habit/completion data with years of history. shadcn/ui + Tailwind v4 delivers the minimal dark aesthetic without fighting Material UI defaults. `react-activity-calendar` ships dark mode, tooltips, and responsive SVG for the signature heatmap with minimal custom work.

**Core technologies:**
- **Vite 8.1.5** — build tool — sub-200ms cold start, zero Node runtime in production; no Next.js overhead for a static local-first app
- **React 19.2.7** — UI framework — mature ecosystem, required for contribution-graph components; stable in 2026
- **TypeScript 7.0.2** — type safety — catches schema drift between habits, completions, and export/import formats
- **Dexie 4.4.4** — persistence — IndexedDB wrapper with schema versioning, transactions, and `useLiveQuery` reactivity; no 5 MB localStorage cap
- **Tailwind CSS 4.3.3 + shadcn/ui** — styling — CSS-first config, dark-first theming, GitHub/Linear minimal aesthetic
- **react-activity-calendar 3.2.1** — heatmap — native dark mode, customizable theme, tooltips via `renderBlock`
- **date-fns 4.4.0** — date math — streak calculation, ISO date keys, locale-aware display
- **zod 4.4.3** — validation — runtime schema validation for import before IndexedDB writes
- **vitest 4.1.10** — testing — streak logic, export/import round-trips, repository layer

**Avoid in v1:** Next.js, localStorage as primary store, Redux/TanStack Query, Dexie Cloud, PWA/service workers, Firebase/Supabase, Material UI/Chakra.

### Expected Features

Feature research across 114 habit tracking apps confirms one-tap check-in, custom schedules, streak counters, and visual progress history are universal table stakes. This project's competitive position is **effortless logging + impossible-to-ignore progress** via the contribution grid, not feature breadth.

**Must have (table stakes):**
- One-tap habit check-in — present in 100% of surveyed apps; friction is #1 churn driver
- Custom habit creation (name + daily or specific weekdays) — 98% of apps support flexible schedules
- Streak counter (current + longest) — ~89% of apps; core motivation loop
- Visual progress history — 97% of apps; this project chooses GitHub-style heatmap
- Basic completion statistics — dashboard with streaks, completion %, weekly overview
- Undo / toggle completion — same tap toggles complete ↔ incomplete
- Data persistence — IndexedDB; survives browser refresh
- Responsive mobile + desktop web — touch targets ≥44px
- Dark mode — design constraint for target audience
- Export/import JSON — safety net for local-first; builds user trust

**Should have (competitive):**
- GitHub-style contribution grid per habit — signature differentiator; only ~15–20% of mainstream apps use this pattern
- Streak visual rewards (flame, color fill, micro-animation) — satisfying feedback without full gamification
- Local-first + no account — zero onboarding friction; privacy segment underserved
- Intentional simplicity — no bloat; caps scope creep
- Dashboard weekly overview — "one glance" core value

**Defer (v2+):**
- Reminders / push notifications — table stakes in market but high implementation cost; explicitly out of v1 scope
- Cloud sync + user accounts — contradicts local-first v1; export/import is the bridge
- PWA / offline / widgets — deferred per PROJECT.md
- Social features, full gamification, complex analytics — anti-features for this product vision
- Skip/rest days, "X times per week" frequency — v1.x based on user feedback

### Architecture Approach

Follow a **layered SPA architecture** with four horizontal layers and strict downward dependencies: Presentation (React components) → Application (hooks/use cases) → Domain (pure logic) → Infrastructure (Dexie/IndexedDB). Domain logic never imports from UI or infrastructure. Streaks, completion rates, and heatmap cell states are computed on read from raw completion records — never stored as authoritative state.

**Major components:**
1. **Domain layer** (`domain/`) — pure streak calculator, stats aggregator, heatmap grid builder, date utils; fully unit-testable
2. **Infrastructure layer** (`infrastructure/`) — Dexie schema, habit/completion repositories behind interfaces; sole layer that knows about IndexedDB
3. **Hooks layer** (`hooks/`) — thin glue via `useLiveQuery`; components never call Dexie directly
4. **Backup service** (`services/backupService.ts`) — versioned JSON export/import with Zod validation and transactional writes
5. **Presentation** — Dashboard, Habit List, Heatmap (detail view), Settings grouped by feature

**Data model:** Two tables only — `Habit { id, name, frequency, color?, createdAt, archived? }` and `Completion { habitId, date }` with compound unique index `[habitId+date]`. Dates stored as `YYYY-MM-DD` local calendar strings, never UTC timestamps.

### Critical Pitfalls

1. **UTC or 24-hour streak logic** — Store `YYYY-MM-DD` in local timezone via `Intl`; walk calendar dates backward, never `toISOString().split('T')[0]` or millisecond diffs; test Sydney 11:55 PM and US DST transitions
2. **Weekly habits treated as daily streaks** — Walk backward skipping non-scheduled days; only break on missed *scheduled* days; streak = consecutive scheduled periods completed, not consecutive calendar days
3. **Browser storage without backup** — IndexedDB is best-effort (Safari evicts after ~7 days idle); export/import in v1 is mandatory; import must validate → snapshot → transactional write with rollback
4. **Mutable streak counters** — Never persist `currentStreak` on habit records; derive from completions on read; toggle = upsert/delete completion only
5. **Contribution grid DOM explosion** — Memoize grid cells outside render; `React.memo` on cells; full heatmap on detail view, summary stats on dashboard; isolate hover/tooltip state inside grid
6. **"Today" frozen at page load** — Resolve today at interaction time, not mount; refresh on `visibilitychange` when tab becomes visible
7. **Over-scoping v1** — Ship one-tap check-in + grid + export before any v2 item; PROJECT.md Active list is the contract

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Scaffold & Design System
**Rationale:** Establishes the stack foundation and visual identity before any domain logic; shadcn/ui and Tailwind v4 dark theme are harder to retrofit than to set up first.
**Delivers:** Vite + React 19 + TypeScript project, Tailwind v4 + shadcn/ui dark theme, React Router shell with placeholder pages, `cn()` helper, responsive layout skeleton.
**Addresses:** Responsive dark UI (P1), minimal dark aesthetic differentiator.
**Uses:** Vite 8, React 19, Tailwind 4, shadcn/ui, react-router 8, lucide-react.
**Avoids:** Over-scoping v1 — scaffold only, no feature logic yet.

### Phase 2: Data Layer & Domain Foundation
**Rationale:** All features depend on persistence and date handling; schema versioning must exist before export/import; completion events are the single source of truth.
**Delivers:** `domain/types.ts`, `domain/dates.ts`, Dexie schema with `habits` + `completions` + `app_metadata` tables, habit/completion repositories, unit tests for date utils.
**Addresses:** Local persistence (P1), data schema for export/import.
**Avoids:** Mutable streak counters (Pitfall 6), localStorage trap (Pitfall 3), import without schema version.
**Implements:** Repository pattern, two-table data model, `YYYY-MM-DD` date storage.

### Phase 3: Habit CRUD & Daily Logging
**Rationale:** Core loop must work before streaks or visualization have meaning; today resolution must be correct from the start.
**Delivers:** Create/edit/archive habits (name + daily or specific weekdays), one-tap toggle for today, toggle past days, habit list/today view, optimistic UI, `visibilitychange` today refresh.
**Addresses:** Habit CRUD (P1), one-tap daily logging (P1), toggle past days (P1), edit/archive/delete habits (P2).
**Avoids:** Frozen "today" (Pitfall 7).
**Uses:** `useLiveQuery`, completion repository, Zustand for modal/form state only.

### Phase 4: Streak Engine
**Rationale:** Streak logic is the highest-risk code; must be designed with frequency awareness and timezone correctness before dashboard or grid display it.
**Delivers:** `domain/streak.ts` with `calculateCurrentStreak` and `calculateLongestStreak`, frequency-aware walk (daily + specific weekdays), `useStreak` hook, comprehensive unit tests with timezone/DST/weekly fixtures.
**Addresses:** Streak counter (P1), frequency rules engine dependency.
**Avoids:** UTC/24h streak logic (Pitfall 1), weekly frequency bugs (Pitfall 2), mutable counters (Pitfall 6).
**Implements:** Compute-on-read pattern, scheduled-day walk algorithm.

### Phase 5: Dashboard & Visual Feedback
**Rationale:** Delivers the "one glance" core value once streak engine is verified; depends on streak + stats but not heatmap.
**Delivers:** Dashboard with current streaks per habit, completion rate, weekly overview, streak visual rewards (flame/color fill on check-in), summary cards (not full grids).
**Addresses:** Dashboard stats (P1), streak visual rewards (P1), dashboard weekly overview differentiator.
**Uses:** `domain/stats.ts`, `useStreak` hook, shadcn Card/Badge components.
**Avoids:** Grid DOM explosion on dashboard (Pitfall 5) — summary stats only, not N full heatmaps.

### Phase 6: Contribution Grid
**Rationale:** Signature differentiator; requires logging history and streak engine to be stable; highest UI complexity and performance risk.
**Delivers:** Per-habit GitHub-style 52-week heatmap on detail view, click-to-toggle past dates, memoized grid builder, tooltips, horizontal scroll on mobile.
**Addresses:** Contribution grid per habit (P1) — the product's visual identity.
**Avoids:** Grid DOM explosion (Pitfall 5), boolean arrays for heatmap data.
**Uses:** `react-activity-calendar`, `domain/heatmap.ts`, `React.memo` on cells.
**Implements:** Date-set membership grid builder, isolated hover state.

### Phase 7: Export/Import & Data Safety
**Rationale:** Local-first without backup is a trust failure; import safety pattern must ship with v1 per PROJECT.md.
**Delivers:** JSON export with `version` + `exportedAt`, Zod-validated import, snapshot-before-replace, confirmation dialog, backup prompt UX, `navigator.storage.persist()` call after engagement.
**Addresses:** Export/import JSON (P1).
**Avoids:** Browser storage data loss (Pitfall 3), unsafe import (clear-before-validate), missing schema version.
**Uses:** Zod schemas, Dexie transactions, browser Blob download / file input.

### Phase Ordering Rationale

- **Bottom-up dependencies:** types → db → repositories → toggle → streaks → dashboard → heatmap → backup. Architecture research critical path confirms this chain.
- **Streak engine before visualization:** Both dashboard and heatmap display streak data; incorrect streak logic poisons the entire product. Pitfalls research flags Phase 3/4 as non-negotiable ordering.
- **Heatmap after core loop:** Grid is read-only visualization over completion records; logging + storage must exist first (FEATURES.md dependency graph).
- **Export/import near end but specced early:** Import safety pattern and schema versioning belong in Phase 2 design; UX ships in Phase 7 once data model is stable.
- **Dashboard before heatmap:** Delivers core value faster with lower performance risk; heatmap is the polish differentiator, not the minimum loop.
- **6–7 phases keeps scope honest:** Pitfalls research warns against >6 phases before first usable release; Phase 1 scaffold is tooling, Phases 2–7 are feature delivery.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Streak Engine):** Timezone/DST edge cases and weekly-frequency walk algorithm need implementation-specific test fixtures; run `/gsd-plan-phase --research-phase 4` for date-fns-tz patterns and test matrix design.
- **Phase 6 (Contribution Grid):** `react-activity-calendar` customization for click-to-toggle and mobile scroll may need spike; run research if library API doesn't support past-date toggle natively.
- **Phase 7 (Export/Import):** Safari/iOS storage eviction behavior and `navigator.storage.persist()` denial handling need platform-specific UX decisions.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Scaffold):** Vite + shadcn/ui setup is well-documented with official guides; follow STACK.md installation verbatim.
- **Phase 2 (Data Layer):** Dexie repository pattern validated by multiple reference codebases (smart-habit-tracker, jcortesdev/habit-tracker).
- **Phase 3 (Habit Logging):** Standard CRUD + toggle; no novel patterns.
- **Phase 5 (Dashboard):** Composition of existing streak/stats hooks; standard React component patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry 2026-07-19; official docs for Vite, Dexie, shadcn, react-activity-calendar |
| Features | MEDIUM | Strong quantitative data from 114-app survey; project-specific prioritization validated against PROJECT.md (HIGH for intent) |
| Architecture | MEDIUM | Patterns confirmed by 2+ reference codebases; no production codebase for this project yet |
| Pitfalls | MEDIUM | Cross-checked industry guidance (Trophy, web.dev, MDN); streak/timezone pitfalls well-documented but need implementation validation |

**Overall confidence:** HIGH

The stack and architecture recommendations are well-supported by official documentation and proven reference implementations. Feature priorities align with both market data and explicit PROJECT.md constraints. Pitfall awareness is strong but streak/timezone correctness must be validated with fixture tests during Phase 4 — this is the one area where research cannot substitute for implementation testing.

### Gaps to Address

- **`react-activity-calendar` click-to-toggle:** Library may need wrapper for toggling past dates on cell click — validate during Phase 6 planning with a quick spike.
- **Safari storage eviction UX:** Exact prompt timing and messaging for backup reminders needs user-testing; research confirms risk but not optimal UX copy.
- **Weekly habit streak semantics for "today not yet done":** Architecture sketch shows streak alive from yesterday if today incomplete — confirm this matches user expectation for Mon/Wed/Fri habits on a scheduled but incomplete day.
- **Heatmap on dashboard vs detail-only:** Research recommends summary on dashboard, full grid on detail — confirm with user during `/gsd-discuss-phase` for Phase 5/6.
- **"X times per week" deferral:** 98% of apps support this schedule type; v1.x priority should be validated after launch usage data.

## Sources

### Primary (HIGH confidence)
- [Vite Getting Started](https://vite.dev/guide/) — Node version requirements, scaffold process
- [npm registry](https://www.npmjs.com/) — all package versions verified 2026-07-19
- [Dexie React Tutorial](https://dexie.org/docs/Tutorial/React) — useLiveQuery, local-first patterns
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + React 19 setup
- [react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar) — v3 dark mode, theme props
- [Steal What Works: 114 Habit Tracking Apps](https://stealwhatworks.com/blogs/news/habit-tracking-app-features) — feature penetration data
- [smart-habit-tracker](https://github.com/nhatduong-agilityio/smart-habit-tracker) — Dexie + pure domain architecture reference
- [jcortesdev/habit-tracker](https://github.com/jcortesdev/habit-tracker) — IndexedDB repository pattern reference
- PROJECT.md — v1 scope, Active requirements, explicit out-of-scope decisions

### Secondary (MEDIUM confidence)
- [Trophy: Streak Timezone & DST Handling](https://trophy.so/blog/streak-timezone-dst-handling) — calendar-day comparison pattern
- [web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web) — IndexedDB durability, eviction
- [MDN: Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — browser eviction behavior
- [init.Habits: GitHub-Style Habit Tracker](https://inithabits.com/blog/github-style-habit-tracker) — heatmap psychology
- [Loop Habit Tracker (GitHub)](https://github.com/iSoron/uhabits) — local-first Android reference
- [Kadō](https://getkado.app/) — privacy-first export/import positioning
- [Zapier: Best Habit Tracker Apps](https://zapier.com/blog/best-habit-tracker-app/) — qualitative competitor review
- [Medium: GitHub-like contributions graph](https://medium.com/@the_ozmic/building-a-github-like-contribution-graph-for-a-habit-tracker-app-7655d82ece6d) — date-array over boolean-array

### Tertiary (LOW confidence)
- [EngageFabric: Duolingo-Style Streak System](https://engagefabric.com/blog/building-duolingo-style-streak-system) — grace period patterns (deferred per PROJECT.md)
- [SoloDevStack: Build Habit Tracker as Solo](https://solodevstack.com/blog/how-to-build-habit-tracker-solo-developer) — MVP scope anecdote

---
*Research completed: 2026-07-19*
*Ready for roadmap: yes*
