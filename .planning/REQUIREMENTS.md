# Requirements: Habit Tracker

**Defined:** 2026-07-19  
**Milestone v1.1 started:** 2026-07-23  
**Core Value:** Make it effortless to log habits daily and impossible to ignore your progress — one tap to check in, one glance to see your streak.

## v1.0 Requirements (Shipped)

Shipped in milestone v1.0 (tag `v1.0.0`). Retained for traceability.

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

## v1.1 Requirements

Active milestone scope. Polish and flexibility after v1.0 validation.

### Visual Personalization & Delight

- [x] **ENH-01**: User can assign a custom color to each habit
- [x] **ENH-02**: User gets streak visual rewards (color fill, micro-animation) on check-in beyond the existing flame badge

### Dashboard Aggregation

- [x] **ENH-03**: User can see overall completion rate across all habits on the dashboard

### Schedule Flexibility

- [ ] **ENH-04**: User can set "X times per week" frequency for habits
- [ ] **ENH-05**: User can skip a day without breaking a streak (streak freeze)

### Quality Residual

- [x] **QA-01**: Phase 2 human UAT residual closed — reactive stats on toggle and Dexie failure fallbacks show safe empty/zero UI with no raw exceptions

## Future Requirements (v2.0+)

Deferred past v1.1. Tracked but not in current roadmap.

### Notifications

- **REM-01**: User can set optional reminders for habits
- **REM-02**: User receives browser push notifications for due habits

### Later candidates

- PWA / offline / installable app
- `navigator.storage.persist()` for stronger IndexedDB durability
- CSV export
- Habit reordering
- Light mode theme

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social features (sharing, friends, leaderboards) | Intentional simplicity; distracts from private streak loop |
| Full gamification (RPG, badges, points, levels) | Scope explosion; conflicts with minimal aesthetic |
| Complex analytics (trends, correlations, ML insights) | Focus remains streaks and completion rate, not deep analysis |
| Cloud sync + user accounts | Local-first; export/import is the backup strategy |
| Native mobile apps | Responsive web covers mobile browsers without app store overhead |
| Reminders / push (this milestone) | High permission + scheduling cost; reserved for v2.0 |
| Numeric/quantitative tracking | Binary done/undone (+ explicit skip) keeps UI simple |
| Health app integrations | Pure behavior tracking, not biometrics |

## Traceability

Which phases cover which v1.1 requirements. Filled by roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENH-01 | Phase 5 | Complete |
| ENH-02 | Phase 5 | Complete |
| ENH-03 | Phase 6 | Complete |
| QA-01 | Phase 6 | Complete |
| ENH-04 | Phase 7 | Pending |
| ENH-05 | Phase 8 | Pending |

**Coverage:**

- v1.1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-19*  
*v1.0 closed: 2026-07-23*  
*v1.1 scoped: 2026-07-23 via `/gsd-new-milestone`*
