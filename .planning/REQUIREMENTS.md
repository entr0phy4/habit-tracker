# Requirements: Habit Tracker

**Defined:** 2026-07-19
**Core Value:** Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## v1 Requirements

### Habit Management

- [x] **HABT-01**: User can create a habit with a name and frequency (daily or specific days of the week)
- [x] **HABT-02**: User can edit a habit's name and frequency
- [x] **HABT-03**: User can archive or delete habits

### Daily Logging

- [x] **LOG-01**: User can mark a habit complete for today with one tap
- [x] **LOG-02**: User can toggle a habit's completion status for past days
- [x] **LOG-03**: User can see a today view showing which habits are due

### Streaks & Stats

- [x] **STRK-01**: User can see the current streak for each habit
- [x] **STRK-02**: User can see the longest streak for each habit
- [x] **STRK-03**: User can see completion rate percentage per habit
- [x] **STRK-04**: User can see a weekly overview of habit completions

### Visualization

- [x] **VIZ-01**: User can view a GitHub-style contribution grid showing history for each habit

### Dashboard

- [x] **DASH-01**: User can see a dashboard displaying all current streaks at a glance

### Data & Backup

- [x] **DATA-01**: User data persists locally across browser sessions
- [x] **DATA-02**: User can export their data to a JSON file
- [x] **DATA-03**: User can import data from a JSON backup file

### UI/UX

- [x] **UI-01**: App uses a minimal dark mode aesthetic
- [x] **UI-02**: App works on both mobile and desktop browsers with touch-friendly targets

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **REM-01**: User can set optional reminders for habits
- **REM-02**: User receives browser push notifications for due habits

### Enhancements

- **ENH-01**: User can assign a custom color to each habit
- **ENH-02**: User gets streak visual rewards (flame icon, color fill, micro-animation) on check-in
- **ENH-03**: User can see overall completion rate across all habits on the dashboard
- **ENH-04**: User can set "X times per week" frequency for habits
- **ENH-05**: User can skip a day without breaking a streak (streak freeze)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social features (sharing, friends, leaderboards) | Intentional simplicity; distracts from private streak loop |
| Full gamification (RPG, badges, points, levels) | Scope explosion; conflicts with minimal aesthetic |
| Complex analytics (trends, correlations, ML insights) | v1 focuses on streaks and completion rate, not deep analysis |
| Cloud sync + user accounts | Local-first v1; export/import is the backup strategy |
| Native mobile apps | Responsive web covers mobile browsers without app store overhead |
| PWA / offline / installable app | Deferred per PROJECT.md; responsive web sufficient for v1 |
| Routine builders / habit stacking | Different product philosophy; flat habit list for v1 |
| Numeric/quantitative tracking | Binary done/undone keeps UI simple for v1 |
| Health app integrations | Pure behavior tracking, not biometrics |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HABT-01 | Phase 1 | Complete |
| HABT-02 | Phase 1 | Complete |
| HABT-03 | Phase 1 | Complete |
| LOG-01 | Phase 1 | Complete |
| LOG-02 | Phase 1 | Complete |
| LOG-03 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| STRK-01 | Phase 2 | Complete |
| STRK-02 | Phase 2 | Complete |
| STRK-03 | Phase 2 | Complete |
| STRK-04 | Phase 2 | Complete |
| DASH-01 | Phase 3 | Complete |
| VIZ-01 | Phase 3 | Complete |
| DATA-02 | Phase 4 | Complete |
| DATA-03 | Phase 4 | Complete |

**Coverage:**

- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-19*
*Last updated: 2026-07-19 after roadmap creation*
