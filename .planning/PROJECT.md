# Habit Tracker

## What This Is

A local-first web app for building daily, weekly, and flexible (X×/week) habits with visual streak motivation: one-tap check-in, custom habit colors, check-in micro-rewards, overall completion rate, explicit streak freeze/skip, a Panel glance, and a GitHub-style contribution heatmap — plus JSON export/import backup. Built for students, professionals, and anyone who responds to “don’t break the chain” feedback.

**v1.0 shipped (2026-07-23):** core loop — habits, today check-in, schedule-aware streaks, Panel + heatmap, backup.  
**v1.1 shipped (2026-07-25):** colors, check-in delight, overall rate, X×/week frequency, streak freeze.

## Core Value

Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## Current State

Shipped through **v1.1** (tag `v1.1.0`). ~6.8k LOC TypeScript/TSX in `src/`; Vitest suite **210** tests green at close. Stack: Vite 8 · React 19 · TypeScript · Dexie 4 · Tailwind 4 · shadcn/ui · react-activity-calendar · Zod 4 · date-fns · Zustand.

**v2.0 in planning** — reminders, Web Push, and PWA/offline durability (phase numbering continues from 9).

## Current Milestone: v2.0 Reminders & PWA

**Goal:** Help users remember to check in even when the app is closed, and make the app installable, offline-capable, and storage-durable — without accounts or cloud sync.

**Target features:**
- Per-habit optional daily reminder at a set time (REM-01)
- Browser push notifications via Web Push + service worker (minimal push relay, no accounts) (REM-02)
- Installable PWA (manifest, icons, add-to-home-screen)
- Offline app shell + full offline use (check-in, streaks, backup without network)
- `navigator.storage.persist()` + eviction-risk UX
- Update prompt when a new app version is available

## Requirements

### Validated

- ✓ User can create custom habits with a name and frequency (daily or specific weekdays) — v1.0 (HABT-01)
- ✓ User can mark habits complete/incomplete for each day with a single tap — v1.0 (LOG-01, LOG-02)
- ✓ User can view a GitHub-style contribution grid per habit — v1.0 (VIZ-01)
- ✓ User can see a dashboard with current streaks — v1.0 (STRK-*, DASH-01)
- ✓ User gets satisfying visual feedback when maintaining a streak (flame) — v1.0
- ✓ User data persists locally with export/import backup — v1.0 (DATA-01..03)
- ✓ App works as a responsive dark web experience on desktop and mobile — v1.0 (UI-01, UI-02)
- ✓ User can assign a custom color to each habit — v1.1 (ENH-01)
- ✓ User gets streak visual rewards (color fill, micro-animation) on check-in — v1.1 (ENH-02)
- ✓ User can see overall completion rate across all habits on the dashboard — v1.1 (ENH-03)
- ✓ Phase 2 UAT residual closed in product code: reactive stats + Dexie failure fallbacks — v1.1 (QA-01)
- ✓ User can set “X times per week” frequency for habits — v1.1 (ENH-04)
- ✓ User can skip a day without breaking a streak (streak freeze) — v1.1 (ENH-05)

### Active

(Define v2.0 requirements in `.planning/REQUIREMENTS.md` during milestone planning — REM-01/02, PWA-01..05)

### Out of Scope

- Social features (sharing, friends, leaderboards) — intentional simplicity; not core to the streak loop
- Complex analytics (trends, correlations, reports) — focus remains streaks and completion rate
- Gamification beyond streaks (points, badges, levels) — streak psychology is sufficient
- User accounts and cloud sync — local-first with export/import remains the data model
- Native mobile apps — responsive web covers mobile browsers
- Light mode theme — deferred past v2.0
- CSV export — deferred past v2.0
- Closing deferred human UAT / verification residuals (Phases 1–2, 5–6) — out of v2.0 scope
- Home screen widgets — requires native or advanced PWA APIs; deferred past v2.0
- Soft freeze monthly caps / auto-freeze rules — out of v1.1 success criteria
- Interval schedules (every N days) — out of v1.1

## Context

v1.1 deepened the motivation loop without reminders or sync: curated habit colors, CSS check-in pulse, pooled “Tasa general” on Panel, `times_per_week` schedules with week-hit streaks, and explicit Freeze records (Omitir / heatmap ice cells) that bridge streaks without counting as done.

**Closeout type:** `override_closeout` — human UAT for Phases 5–6 and Phase 1–2 `human_needed` verification acknowledged as deferred at close (see STATE.md Deferred Items).

<details>
<summary>v1.1 planning snapshot (archived)</summary>

**Goal:** Deepen the streak motivation loop with visual personalization, check-in delight, flexible weekly schedules, and streak-freeze resilience — without reminders, accounts, or sync.

**Target features (all shipped):**
- Custom habit colors
- Check-in streak rewards (color fill + micro-animation)
- Overall completion rate on Panel
- “X times per week” frequency
- Skip / streak freeze
- Close Phase 2 human UAT residual in product (QA-01)

Archives: `.planning/milestones/v1.1-ROADMAP.md`, `v1.1-REQUIREMENTS.md`, `v1.1-phases/`

</details>

## Constraints

- **Platform**: Responsive web app (desktop + mobile browser) — no native apps
- **Data**: Local-first storage with export/import backup — no backend or auth
- **Scope**: v2.0 = reminders + PWA only; resist sync/account creep and unrelated polish
- **Design**: Minimal dark mode aesthetic — visual clarity over decoration; colors must remain accessible on dark surfaces
- **Streak integrity**: Freeze/skip must be explicit and countable so motivation is not silently diluted

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first with export/import | No backend; user owns data | ✓ Good — v1.0 Phase 4; v1.1 additive freezes[] |
| Defer reminders to v2 | Avoid push/scheduling complexity | ✓ Good — held through v1.1 |
| Responsive web (not PWA) | Cover mobile without install scope | ✓ Good — held |
| Minimal dark mode | GitHub streak visual language | ✓ Good — colors + ice freeze on dark |
| No social / gamification beyond streaks | Keep focus on core loop | ✓ Good |
| Dexie + compute-on-read streaks | IndexedDB; no denormalized streak columns | ✓ Good — freeze-aware domain in v1.1 |
| react-activity-calendar for heatmap | Dark theme + renderBlock | ✓ Good — frozen cell styling in Phase 8 |
| Curated 8-color palette | Scanability + contrast on dark | ✓ Good — Phase 5 |
| Pooled lifetime overall rate | One honest Panel percent | ✓ Good — Phase 6 |
| `times_per_week` + Mon–Sun quota | Flexible schedules without daily lists | ✓ Good — Phase 7 |
| Separate Freeze entity (Dexie v2) | Explicit skip ≠ completion; mutual exclusion | ✓ Good — Phase 8 |
| v1.1 = ENH polish, not REM | Research places colors / X-week / freeze in v1.x | ✓ Shipped |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-25 after v2.0 milestone started*
