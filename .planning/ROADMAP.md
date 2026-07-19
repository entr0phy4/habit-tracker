# Roadmap: Habit Tracker

## Overview

Deliver a local-first habit tracker in four vertical MVP slices: first the complete habit-and-logging loop with persistence, then streak motivation, then the dashboard and contribution-grid visualization that make progress impossible to ignore, and finally export/import so users own and protect their data. Each phase ships an end-to-end user capability before the next layer of value is added.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Habit Management & Daily Logging** - Create habits, see what's due today, and check in with one tap
- [ ] **Phase 2: Streaks & Statistics** - See current and longest streaks, completion rate, and weekly overview per habit
- [ ] **Phase 3: Dashboard & Progress Visualization** - Glance at all streaks and explore GitHub-style history per habit
- [ ] **Phase 4: Data Backup & Restore** - Export and import JSON backups to protect local data

## Phase Details

### Phase 1: Habit Management & Daily Logging

**Goal**: Users can create and manage habits, see what's due today, and log completions with one tap — with data that survives browser restarts
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: HABT-01, HABT-02, HABT-03, LOG-01, LOG-02, LOG-03, DATA-01, UI-01, UI-02
**Success Criteria** (what must be TRUE):

  1. User can create a habit with a name and frequency (daily or specific days of the week)
  2. User can edit, archive, or delete existing habits
  3. User sees a today view listing which habits are due and can mark any due habit complete or incomplete with one tap
  4. User can toggle completion status for past days from the habit list or detail view
  5. Habit and completion data persist across browser sessions after refresh or reopen
  6. App renders in minimal dark mode and works on mobile and desktop with touch-friendly tap targets

**Plans**: 2/4 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking skeleton: scaffold, Dexie, create habit + today toggle + persistence

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — HabitForm day toggles, WeekDayDots, weekly due-today filtering

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Swipe/tap check-in, edit/archive/manage, Today polish

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-04-PLAN.md — 7-day history grid and past-day completion toggling

**UI hint**: yes

### Phase 2: Streaks & Statistics

**Goal**: Users can see streak motivation and completion stats that respect each habit's schedule
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: STRK-01, STRK-02, STRK-03, STRK-04
**Success Criteria** (what must be TRUE):

  1. User can see the current streak for each habit, counting only scheduled days (daily or specific weekdays)
  2. User can see the longest streak achieved for each habit
  3. User can see a completion rate percentage for each habit over its tracked history
  4. User can see a weekly overview showing which scheduled days were completed or missed per habit
  5. Streak and stats update immediately when the user toggles a completion for today or a past day

**Plans**: TBD
**UI hint**: yes

### Phase 3: Dashboard & Progress Visualization

**Goal**: Users can see all streaks at a glance and explore each habit's full history on a GitHub-style contribution grid
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DASH-01, VIZ-01
**Success Criteria** (what must be TRUE):

  1. User can open a dashboard that displays every active habit's current streak at a glance
  2. User can view a GitHub-style contribution grid for each habit showing completion history over time
  3. User can tap or click cells on the contribution grid to toggle completion for past dates
  4. Contribution grid and dashboard remain responsive and usable on mobile and desktop screens

**Plans**: TBD
**UI hint**: yes

### Phase 4: Data Backup & Restore

**Goal**: Users can export their data for safekeeping and restore from a backup without losing trust in the app
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DATA-02, DATA-03
**Success Criteria** (what must be TRUE):

  1. User can export all habits and completions to a downloadable JSON file
  2. User can import a previously exported JSON backup and see their habits and completions restored
  3. Import validates the file before writing and warns the user before replacing existing data
  4. After a successful import, streaks, stats, dashboard, and contribution grids reflect the restored data

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Habit Management & Daily Logging | 2/4 | In Progress|  |
| 2. Streaks & Statistics | 0/TBD | Not started | - |
| 3. Dashboard & Progress Visualization | 0/TBD | Not started | - |
| 4. Data Backup & Restore | 0/TBD | Not started | - |
