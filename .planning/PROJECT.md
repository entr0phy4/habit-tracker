# Habit Tracker

## What This Is

A web application that helps people build and maintain daily, weekly, or custom habits through visual progress tracking and streak motivation. It's a clean, fast, visually pleasing tool for anyone who wants better routines — students, professionals, fitness enthusiasts, and people working on self-improvement — especially those who respond well to visual feedback and the psychological boost of "don't break the chain" streaks.

**v1.0 shipped (2026-07-23):** local-first SPA with today check-in, schedule-aware streaks, dashboard + contribution heatmap, and JSON export/import backup.

## Core Value

Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## Current Milestone: v1.1 Motivation Polish & Flexibility

**Goal:** Deepen the streak motivation loop with visual personalization, check-in delight, flexible weekly schedules, and streak-freeze resilience — without reminders, accounts, or sync.

**Target features:**
- Custom habit colors for scanability on dense lists and heatmaps
- Check-in streak rewards (color fill + micro-animation beyond the existing flame badge)
- Overall completion rate across all habits on the dashboard
- "X times per week" frequency (in addition to daily / specific weekdays)
- Skip / streak freeze so a planned rest day does not break the chain
- Close Phase 2 human UAT residual (reactive stats + Dexie failure backstops)

## Requirements

### Validated

- [x] User can create custom habits with a name and frequency (daily, or specific days of the week) — Phase 1 (HABT-01)
- [x] User can mark habits complete/incomplete for each day with a single tap or click — Phase 1 (LOG-01, LOG-02)
- [x] User can view a visual calendar grid (GitHub contribution-graph style) showing streak history per habit — Phase 3 (VIZ-01)
- [x] User can see a dashboard with current streaks (and per-habit rate/weekly overview on history) — Phases 2–3 (STRK-*, DASH-01)
- [x] User gets satisfying visual feedback when maintaining a streak (flame icon, color fill) — Phase 2 (STRK-01 UI)
- [x] User data persists locally in the browser with export/import backup capability — Phases 1 + 4 (DATA-01..03)
- [x] App works as a responsive web experience on desktop and mobile browsers — Phase 1 (UI-01, UI-02)
- [x] User can assign a custom color to each habit — Phase 5 (ENH-01)
- [x] User gets streak visual rewards (color fill, micro-animation) on check-in — Phase 5 (ENH-02)
- [x] User can see overall completion rate across all habits on the dashboard — Phase 6 (ENH-03)
- [x] Phase 2 UAT residual closed: reactive stats on toggle + Dexie failure fallbacks — Phase 6 (QA-01)

### Active

- [ ] User can set "X times per week" frequency for habits (ENH-04)
- [ ] User can skip a day without breaking a streak (streak freeze) (ENH-05)

### Out of Scope

- Social features (sharing, friends, leaderboards) — intentional simplicity; not core to the streak motivation loop
- Complex analytics (trends, correlations, reports) — focus remains streaks and completion rate, not deep insights
- Gamification beyond streaks (points, badges, levels) — streak psychology is sufficient
- Push notifications and reminders — deferred to v2.0; reduces permission friction and scheduling complexity
- User accounts and cloud sync — local-first with export/import remains the data model
- Native mobile apps — responsive web covers mobile browsers without app store overhead
- PWA / offline / installable app — still deferred; revisit after v1.1 polish

## Context

v1.0 is live as a local-first habit tracker: create habits, check in on Hoy, glance at Panel streaks, explore Historial heatmaps, and protect data via Ajustes export/import. Milestone v1.1 builds on that loop with personalization and schedule flexibility that research marked as post-validation (v1.x), while keeping reminders/PWA for a later v2.0.

Known residual from v1.0 close: Phase 2 human UAT (4 backstop/reactivity checks) is in scope for v1.1 QA. Reminders (REM-01/02) stay explicitly out of this milestone.

## Constraints

- **Platform**: Responsive web app (desktop + mobile browser) — no native apps
- **Data**: Local-first storage with export/import backup — no backend or auth
- **Scope**: Ship motivation polish and schedule flexibility; resist reminders/sync creep
- **Design**: Minimal dark mode aesthetic — visual clarity over decoration; colors must remain accessible on dark surfaces
- **Reminders**: Deferred to v2.0 — v1.1 is polish and flexibility only
- **Streak integrity**: Freeze/skip must be explicit and countable so motivation is not silently diluted

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first with export/import | No backend complexity; user owns their data; backup via export | ✓ Shipped Phase 4 — Zod-validated JSON + transactional replace |
| Defer reminders to v2 | Avoids push permission UX and scheduling complexity in v1 | ✓ Held through v1.0; remains out of v1.1 |
| Responsive web (not PWA) | Covers mobile browsers without offline/install scope creep | ✓ Held — no service worker in v1.0 |
| Minimal dark mode aesthetic | Matches GitHub streak visual language; clean daily-use experience | ✓ Shipped Phase 1 UI-SPEC tokens |
| No social or gamification beyond streaks | Keeps focus on the core motivation loop | ✓ Held — flame + heatmap only in v1.0 |
| Dexie + compute-on-read streaks | IndexedDB capacity; no denormalized streak columns | ✓ Shipped Phases 1–3 |
| react-activity-calendar for heatmap | Dark theme + renderBlock toggles without custom SVG grid | ✓ Shipped Phase 3 |
| v1.1 = ENH polish, not REM | Research places colors / X-week / freeze in v1.x; reminders in v2+ | Active — this milestone |

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
*Last updated: 2026-07-23 after `/gsd-new-milestone` → v1.1*
