# Roadmap: Habit Tracker

## Milestone

**v1.1 — Motivation Polish & Flexibility** (in progress)  
Previous: **v1.0 — Complete** (2026-07-23) · Tag `v1.0.0` · See `.planning/milestones/v1.0-MILESTONE.md`

## Overview

After shipping the local-first core loop, deepen motivation without expanding into notifications or sync: personalize habits with color, delight check-ins with micro-rewards, surface an overall completion rate, add "X times per week" schedules, and allow explicit streak freezes. Close the Phase 2 UAT residual as part of dashboard polish. Phase numbering continues from v1.0 (phases 5–8).

## Phases

**Phase Numbering:**

- Integer phases continue from the previous milestone (v1.0 ended at 4 → v1.1 starts at 5)
- Decimal phases (5.1, 5.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 5: Visual Identity & Check-in Delight** - Color habits and reward check-ins with fill + micro-animation
- [x] **Phase 6: Dashboard Aggregate & UAT Residual** - Overall completion rate plus Phase 2 reactivity/fallback UAT closeout
- [ ] **Phase 7: Flexible Weekly Frequency** - "X times per week" schedules with due-today and streak rules
- [ ] **Phase 8: Streak Freeze** - Explicit skip/freeze days that preserve streaks without silent forgiveness

## Phase Details

### Phase 5: Visual Identity & Check-in Delight

**Goal**: Users can tell habits apart by color and feel a satisfying reward when they check in
**Mode:** ship
**Depends on**: v1.0 (Phases 1–4 complete)
**Requirements**: ENH-01, ENH-02
**Success Criteria** (what must be TRUE):

  1. User can pick a color when creating or editing a habit
  2. Today list, Panel cards, and heatmap accents reflect each habit's color
  3. Completing a habit today triggers a visible color-fill and/or micro-animation reward (in addition to the existing flame badge)
  4. Colors remain readable on the dark UI (sufficient contrast on surfaces and heatmap cells)

**Plans**: 3/3 plans

Plans:
- [x] 05-01-PLAN.md — Color domain, Habit.color, repo + backup (wave 1)
- [x] 05-02-PLAN.md — Color picker + Today/Panel/heatmap accents (wave 2)
- [x] 05-03-PLAN.md — Check-in color-fill micro-animation (wave 3)

**UI hint**: yes

### Phase 6: Dashboard Aggregate & UAT Residual

**Goal**: Users see one overall completion rate on Panel, and Phase 2 UAT residual is closed
**Mode:** ship
**Depends on**: Phase 5 (visual tokens available); Phase 2 domain already shipped
**Requirements**: ENH-03, QA-01
**Success Criteria** (what must be TRUE):

  1. User sees an overall completion rate across active habits on the dashboard (Panel)
  2. Overall rate updates when the user toggles completions
  3. Flame/streak badges and History stat cards update immediately after toggle without reload
  4. When IndexedDB reads fail, streak/stats UI shows zero/hidden safe states with no raw exception text

**Plans**: 3/3 complete (06-01 domain, 06-02 hooks, 06-03 Panel UI + UAT)

Plans:
- [x] 06-01-PLAN.md — countScheduledCompletions + calculateOverallCompletionRate (wave 1)
- [x] 06-02-PLAN.md — hooks overallRate + QUERY_ERROR (wave 2)
- [x] 06-03-PLAN.md — Panel UI + StatCards integer + 02-UAT closeout (wave 3)

**UI hint**: yes

### Phase 7: Flexible Weekly Frequency

**Goal**: Users can define habits as "X times per week" and see correct due/streak behavior
**Mode:** ship
**Depends on**: Phase 6 (dashboard/stats stable); Phase 1–2 schedule engine
**Requirements**: ENH-04
**Success Criteria** (what must be TRUE):

  1. User can create/edit a habit with an "X times per week" frequency (e.g. 3×/week)
  2. Today view shows the habit as due according to remaining weekly quota rules
  3. Current/longest streak and completion rate respect the weekly quota (not daily weekday lists)
  4. Export/import round-trips the new frequency shape without data loss

**Plans**: 1/3 complete

Plans:
- [x] 07-01-PLAN.md — Frequency + week due helpers + backup Zod (wave 1)
- [ ] 07-02-PLAN.md — Week-hit streaks + week-cap rates/heatmap (wave 2)
- [ ] 07-03-PLAN.md — Today hook + HabitForm modes + WeekQuotaChip (wave 3)

**UI hint**: yes

### Phase 8: Streak Freeze

**Goal**: Users can mark an explicit skip/freeze so a day does not break the streak
**Mode:** ship
**Depends on**: Phase 7 (frequency model extended)
**Requirements**: ENH-05
**Success Criteria** (what must be TRUE):

  1. User can mark a scheduled day as skipped / frozen (today or past) from the habit UI
  2. A frozen day does not break current streak and does not count as a completion for rate in a misleading way (frozen ≠ done)
  3. Heatmap/history distinguishes freeze from complete and incomplete
  4. Export/import preserves freeze records; streaks recompute correctly after restore

**Plans**: TBD

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 5. Visual Identity & Check-in Delight | 3/3 | Complete | 2026-07-23 |
| 6. Dashboard Aggregate & UAT Residual | 3/3 | Complete | 2026-07-23 |
| 7. Flexible Weekly Frequency | 1/3 | In progress | — |
| 8. Streak Freeze | 0/? | Not started | — |

v1.0 phases 1–4 remain archived in `.planning/phases/01-*`…`04-*` and `.planning/milestones/v1.0-MILESTONE.md`.
