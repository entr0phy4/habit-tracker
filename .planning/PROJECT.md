# Habit Tracker

## What This Is

A web application that helps people build and maintain daily, weekly, or custom habits through visual progress tracking and streak motivation. It's a clean, fast, visually pleasing tool for anyone who wants better routines — students, professionals, fitness enthusiasts, and people working on self-improvement — especially those who respond well to visual feedback and the psychological boost of "don't break the chain" streaks.

**v1.0 shipped (2026-07-23):** local-first SPA with today check-in, schedule-aware streaks, dashboard + contribution heatmap, and JSON export/import backup.

## Core Value

Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## Requirements

### Validated

- [x] User can create custom habits with a name and frequency (daily, or specific days of the week) — Phase 1 (HABT-01)
- [x] User can mark habits complete/incomplete for each day with a single tap or click — Phase 1 (LOG-01, LOG-02)
- [x] User can view a visual calendar grid (GitHub contribution-graph style) showing streak history per habit — Phase 3 (VIZ-01)
- [x] User can see a dashboard with current streaks (and per-habit rate/weekly overview on history) — Phases 2–3 (STRK-*, DASH-01)
- [x] User gets satisfying visual feedback when maintaining a streak (flame icon, color fill) — Phase 2 (STRK-01 UI)
- [x] User data persists locally in the browser with export/import backup capability — Phases 1 + 4 (DATA-01..03)
- [x] App works as a responsive web experience on desktop and mobile browsers — Phase 1 (UI-01, UI-02)

### Active

*(none — v1.0 complete; see REQUIREMENTS.md v2 for next milestone candidates)*

### Out of Scope

- Social features (sharing, friends, leaderboards) — intentional simplicity; not core to the streak motivation loop
- Complex analytics (trends, correlations, reports) — v1 focuses on streaks and completion rate, not deep insights
- Gamification beyond streaks (points, badges, levels) — streak psychology is sufficient for v1
- Push notifications and reminders — deferred to v2; reduces v1 complexity and permission friction
- User accounts and cloud sync — local-first with export/import is the v1 data model
- Native mobile apps — responsive web covers mobile browsers without app store overhead

## Context

v1.0 is live as a local-first habit tracker: create habits, check in on Hoy, glance at Panel streaks, explore Historial heatmaps, and protect data via Ajustes export/import. The product still targets people who lose motivation without visible chains — the GitHub contribution pattern and flame badge remain the primary nudges.

Known residual: Phase 2 human UAT (4 backstop/reactivity checks) was left open at milestone close; behavior is implemented and unit-tested. v2 candidates (reminders, colors, streak freeze, overall dashboard rate) stay deferred.

## Constraints

- **Platform**: Responsive web app (desktop + mobile browser) — no native apps in v1
- **Data**: Local-first storage with export/import backup — no backend or auth in v1
- **Scope**: Intentionally simple — resist feature creep; ship the core loop first
- **Design**: Minimal dark mode aesthetic — visual clarity over decoration
- **Reminders**: Deferred to v2 — v1 is logging and visualization only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first with export/import | No backend complexity; user owns their data; backup via export | ✓ Shipped Phase 4 — Zod-validated JSON + transactional replace |
| Defer reminders to v2 | Avoids push permission UX and scheduling complexity in v1 | ✓ Held — REM-* still v2 |
| Responsive web (not PWA) | Covers mobile browsers without offline/install scope creep | ✓ Held — no service worker in v1 |
| Minimal dark mode aesthetic | Matches GitHub streak visual language; clean daily-use experience | ✓ Shipped Phase 1 UI-SPEC tokens |
| No social or gamification beyond streaks | Keeps v1 focused on the core motivation loop | ✓ Held — flame + heatmap only |
| Dexie + compute-on-read streaks | IndexedDB capacity; no denormalized streak columns | ✓ Shipped Phases 1–3 |
| react-activity-calendar for heatmap | Dark theme + renderBlock toggles without custom SVG grid | ✓ Shipped Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-23 after v1.0 milestone close*
