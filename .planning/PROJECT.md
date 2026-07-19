# Habit Tracker

## What This Is

A web application that helps people build and maintain daily, weekly, or custom habits through visual progress tracking and streak motivation. It's a clean, fast, visually pleasing tool for anyone who wants better routines — students, professionals, fitness enthusiasts, and people working on self-improvement — especially those who respond well to visual feedback and the psychological boost of "don't break the chain" streaks.

## Core Value

Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can create custom habits with a name and frequency (daily, or specific days of the week)
- [ ] User can mark habits complete/incomplete for each day with a single tap or click
- [ ] User can view a visual calendar grid (GitHub contribution-graph style) showing streak history per habit
- [ ] User can see a dashboard with current streaks, completion rate, and weekly overview
- [ ] User gets satisfying visual feedback when maintaining a streak (flame icon, color fill, or similar)
- [ ] User data persists locally in the browser with export/import backup capability
- [ ] App works as a responsive web experience on desktop and mobile browsers

### Out of Scope

- Social features (sharing, friends, leaderboards) — intentional simplicity; not core to the streak motivation loop
- Complex analytics (trends, correlations, reports) — v1 focuses on streaks and completion rate, not deep insights
- Gamification beyond streaks (points, badges, levels) — streak psychology is sufficient for v1
- Push notifications and reminders — deferred to v2; reduces v1 complexity and permission friction
- User accounts and cloud sync — local-first with export/import is the v1 data model
- Native mobile apps — responsive web covers mobile browsers without app store overhead

## Context

Most people struggle with consistency when building new habits (exercising, reading, meditating, drinking water, etc.). They start motivated but lose track, forget, or feel discouraged when they can't see progress. Existing solutions are often too complex, cluttered with features, or don't provide the right "nudge" to keep going.

This project targets the gap: a deliberately simple habit tracker that makes logging frictionless and progress visible. The GitHub contribution graph is a proven visual pattern for streak motivation. The aesthetic direction is minimal dark mode (GitHub/Linear style) — clean, focused, and easy on the eyes for daily use.

## Constraints

- **Platform**: Responsive web app (desktop + mobile browser) — no native apps in v1
- **Data**: Local-first storage with export/import backup — no backend or auth in v1
- **Scope**: Intentionally simple — resist feature creep; ship the core loop first
- **Design**: Minimal dark mode aesthetic — visual clarity over decoration
- **Reminders**: Deferred to v2 — v1 is logging and visualization only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first with export/import | No backend complexity; user owns their data; backup via export | — Pending |
| Defer reminders to v2 | Avoids push permission UX and scheduling complexity in v1 | — Pending |
| Responsive web (not PWA) | Covers mobile browsers without offline/install scope creep | — Pending |
| Minimal dark mode aesthetic | Matches GitHub streak visual language; clean daily-use experience | — Pending |
| No social or gamification beyond streaks | Keeps v1 focused on the core motivation loop | — Pending |

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
*Last updated: 2026-07-19 after initialization*
