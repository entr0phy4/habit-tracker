# Requirements: Habit Tracker

**Defined:** 2026-07-19  
**Milestone v2.0 started:** 2026-07-25  
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
- [x] **DATA-03**: User can import a JSON backup and restore habits and completions

### UI & Platform

- [x] **UI-01**: App works as a responsive dark web experience on desktop and mobile browsers
- [x] **UI-02**: Touch targets support one-tap check-in on mobile browsers

## v1.1 Requirements (Shipped)

Shipped in milestone v1.1 (tag `v1.1.0`). Retained for traceability.

### Enhancement

- [x] **ENH-01**: User can assign a custom color to each habit
- [x] **ENH-02**: User gets streak visual rewards (color fill, micro-animation) on check-in
- [x] **ENH-03**: User can see overall completion rate across all habits on the dashboard
- [x] **ENH-04**: User can set "X times per week" frequency for habits
- [x] **ENH-05**: User can skip a day without breaking a streak (streak freeze)

### Quality Residual

- [x] **QA-01**: Phase 2 human UAT residual closed — reactive stats on toggle and Dexie failure fallbacks show safe empty/zero UI with no raw exceptions

## v2.0 Requirements

Requirements for milestone v2.0 Reminders & PWA. Each maps to roadmap phases (9+).

### Reminders

- [ ] **REM-01**: User can enable an optional daily reminder time per habit (off by default)
- [ ] **REM-02**: User receives a browser push notification when a due habit's reminder time arrives while the app is closed
- [ ] **REM-03**: User is prompted for notification permission only after choosing to enable a reminder (not on first visit)
- [ ] **REM-04**: Reminders respect each habit's schedule — no notification on days the habit is not due
- [ ] **REM-05**: Reminders are suppressed when the habit is already completed or frozen for today
- [ ] **REM-06**: User can tap a notification to open the app to today's view or the relevant habit

### PWA & Durability

- [ ] **PWA-01**: User can install the app to their home screen (manifest, icons, standalone display)
- [ ] **PWA-02**: App shell loads offline after the first visit (service worker precache)
- [ ] **PWA-03**: User can check in, view streaks, and export/import backup with no network connection
- [ ] **PWA-04**: User can request durable IndexedDB storage with clear status messaging and an export CTA if persistence is denied
- [ ] **PWA-05**: User is prompted before reloading when a new app version is available (no mid-session auto-reload)

## Future Requirements (v2.x+)

Deferred past v2.0. Tracked but not in current roadmap.

### Notifications

- **REM-07**: User can check in or dismiss a habit directly from a notification action (platform-gated)
- **REM-08**: User can set global quiet hours when no reminders fire

### PWA & UX

- **PWA-06**: User can add multiple reminder times per habit
- **PWA-07**: Home screen widgets for quick check-in
- **UX-01**: Light mode theme
- **UX-02**: Habit reordering on dashboard
- **DATA-04**: CSV export

## Out of Scope

Explicitly excluded for v2.0. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts and cloud sync | Local-first; export/import remains backup strategy |
| Native mobile apps | Responsive installable PWA covers mobile browsers |
| Firebase / OneSignal / FCM push SaaS | Vendor lock-in; minimal self-hosted relay only |
| Client-only reminder scheduling (no relay) | Cannot reliably fire when PWA is closed |
| Closing deferred human UAT / verification residuals (Phases 1–2, 5–6) | Explicitly out of v2.0 per milestone scope |
| Light mode theme | Deferred past v2.0 |
| CSV export | Deferred past v2.0 |
| Home screen widgets | Deferred to v2.x+; requires native or advanced PWA APIs |
| Guilt/spam notifications on frozen or completed habits | Undermines motivation loop; suppressed by REM-05 |
| Cloud-synced reminder state | Contradicts local-first model |

## Traceability

Which phases cover which requirements. Filled by roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| — | — | Pending |

**Coverage:**

- v2.0 requirements: 11 total
- Mapped to phases: 0
- Unmapped: 11 ⚠️

---
*Requirements defined: 2026-07-25 after v2.0 milestone research*
