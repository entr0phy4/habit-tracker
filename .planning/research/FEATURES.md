# Feature Research

**Domain:** Habit tracking web application (local-first, streak-motivated)
**Researched:** 2026-07-19
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or users churn to competitors.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-tap habit check-in | Present in 100% of 114 surveyed apps; friction is the #1 churn driver | LOW | Binary done/undone per day is sufficient for v1; must complete in under 3 seconds |
| Custom habit creation (name + frequency) | 98% of apps support flexible schedules (daily, specific weekdays); daily-only feels broken | LOW | v1: daily + specific days of week; defer "X times per week" and interval schedules |
| Streak counter (current + longest) | Present in ~89% of surveyed apps; core motivation loop for streak-oriented users | MEDIUM | Streak logic must respect per-habit frequency (e.g., Mon/Wed/Fri habit shouldn't break on Tuesday) |
| Visual progress history | Charts/analytics in 97% of apps; users expect to *see* consistency over time | MEDIUM | Calendar dots, bar charts, or heatmap all qualify; this project chooses heatmap |
| Basic completion statistics | Completion rate and weekly summary expected alongside streaks (Habitify, HabitNow, Loop all ship this) | LOW | Dashboard: current streaks, completion %, weekly overview — matches user vision |
| Undo / toggle completion | Users make mistakes; inability to correct erodes trust | LOW | Same tap toggles complete ↔ incomplete for a day |
| Habit list / today view | Every app surfaces "what do I do today?" as the primary screen | LOW | Group or sort habits; optional ordering is nice but not required for v1 |
| Data persistence | Obvious baseline; losing data on refresh is unacceptable | LOW | Local-first via IndexedDB or localStorage; no account required |
| Responsive mobile + desktop web | 87% of apps offer multi-platform; web-only is viable if mobile browser UX is solid | MEDIUM | Touch targets ≥44px; grid must scroll horizontally on small screens |
| Dark mode | Standard in developer-aesthetic trackers (GitHub, Linear, Streaks); expected by target audience | LOW | Minimal dark mode is a design constraint, not optional polish |
| Edit / archive / delete habits | Users change goals; permanent habits with no lifecycle management feels rigid | LOW | Soft-delete (archive) preferred over hard delete to preserve history |
| Reminders / notifications | Present in ~89% of surveyed apps; widely cited as essential in buyer guides | MEDIUM | **Market table stakes, but explicitly deferred to v2** in this project to avoid permission UX and scheduling complexity |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required to be "a habit tracker," but aligned with this project's core value: effortless logging + impossible-to-ignore progress.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| GitHub-style contribution grid per habit | Only ~15–20% of mainstream apps use this exact pattern; it shows *trends* not just today's number, fails gracefully on missed days, and resonates with developer/designer audience | HIGH | Year-at-a-glance grid with color intensity; per-habit view is the signature visual |
| Streak visual rewards (flame, color fill, micro-animation) | Satisfying feedback on check-in without full gamification; Streaks (Apple Design Award) proves minimal delight works | LOW | Trigger on complete + streak milestone (7, 30 days); keep subtle, not casino-like |
| Local-first + export/import | Privacy segment is underserved; Loop, Kadō, OpenHabitTracker compete here; no account = zero onboarding friction | MEDIUM | JSON export/import minimum; CSV nice-to-have for v1.x; anti-lock-in is a selling point |
| Intentional simplicity (no bloat) | Category is cluttered; 40% have gamification, 29% have social — most add noise | LOW | Product philosophy, not a feature toggle; caps scope creep |
| Minimal dark aesthetic (GitHub/Linear) | Differentiates from colorful wellness apps (HabitMinder, Finch) and RPG apps (Habitica) | LOW | Visual identity; reinforces "serious tool for consistent people" positioning |
| Dashboard weekly overview | Common but often buried behind paywalls or stats tabs; surfacing it prominently supports the "one glance" core value | LOW | Aggregate + per-habit breakdown on one screen |
| No artificial habit limits | Streaks caps at 12 habits (intentional constraint); unlimited free habits is a differentiator for power users | LOW | Don't copy Streaks' limit unless research shows focus benefit for your audience |
| Web-first, no install required | Avoids app store friction; instant access via URL; contrasts with iOS-only Streaks | LOW | PWA/offline deferred per PROJECT.md; responsive web is sufficient for v1 |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems — or are explicitly out of scope for v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social sharing / friends / leaderboards | 29% of apps offer it; users think accountability helps | Adds backend, moderation, privacy concerns; distracts from private streak loop; only 13% of daily-streak apps include social | Keep tracking private; export grid as image if user wants to share manually (v2+) |
| Full gamification (RPG, badges, points, levels) | Habitica has loyal fans; engagement spikes early | 60% of apps skip it; retention often drops after novelty; scope explosion; conflicts with minimal aesthetic | Streak flames and color-fill rewards only — sufficient psychology for v1 |
| Complex analytics (trends, correlations, ML insights) | Power users want "insights"; 97% of apps have some analytics | Diminishing returns for casual users; engineering cost high; Habitify's depth is their entire product | Completion rate + weekly overview + heatmap — enough reflection without analysis paralysis |
| Cloud sync + user accounts | 87% of apps offer sync; multi-device is a common request | Backend, auth, GDPR, conflict resolution, ongoing ops cost; contradicts local-first v1 decision | Export/import backup; revisit sync as v2+ premium path if validated |
| Push notifications / reminders | Cited in nearly every "essential features" list; #1 requested v2 feature | Permission prompts, scheduling engine, timezone edge cases, notification fatigue | Defer to v2; v1 assumes self-motivated users who open the app daily |
| Native mobile apps | Users want widgets and home-screen access | App store overhead, dual codebases, review cycles; widgets are a major draw but expensive | Responsive web with touch-optimized check-in; PWA/widgets in v2 |
| Routine builders / habit stacking | 50% of apps offer routines; popular in Productive, Routinery | Different product philosophy (sequenced workflows vs. streak tracking); only 33% of streak apps include routines | Flat habit list; user mentally stacks by habit order |
| Numerical / quantitative tracking | Needed for water, pages read, workout minutes | Doubles UI complexity (input vs. tap); intensity levels on heatmap require numeric model | Binary done/undone for v1; numeric goals are a natural v1.x extension |
| Skip days / streak freezes | Habitify's "skip" is highly praised; prevents vacation demoralization | Streak logic complexity; risk of over-forgiving streaks that lose motivational power | v1: honest streak breaks; consider "skip without breaking" in v1.x based on user feedback |
| Commitment contracts / financial stakes | Beeminder/stickK niche is passionate | 1.8% penetration; liability, payment integration, narrow audience | Not applicable to this product vision |
| AI coaching / habit suggestions | Trending in 2025–2026 app marketing | Scope creep, API costs, trust issues, not core to logging loop | User defines all habits manually |
| Health app integrations (Apple Health, Google Fit) | Expected in fitness-oriented trackers (93% have wellness framing) | Platform APIs, permissions, sync complexity | Out of scope; pure behavior tracking, not biometrics |

## Feature Dependencies

```
[Habit CRUD (name, frequency, color)]
    └──requires──> [Local persistence layer]
                       └──requires──> [Data schema design]

[One-tap daily logging]
    └──requires──> [Habit CRUD]
    └──requires──> [Date-aware completion storage]
    └──enables──> [Streak calculation]
    └──enables──> [Contribution grid cells]

[Streak calculation (current + longest)]
    └──requires──> [Daily logging]
    └──requires──> [Frequency rules engine]
    └──enables──> [Dashboard stats]
    └──enables──> [Streak visual rewards]

[GitHub-style contribution grid]
    └──requires──> [Daily logging history]
    └──requires──> [Per-habit date range rendering]
    └──enhances──> [Dashboard weekly overview]

[Dashboard (streaks, completion %, weekly overview)]
    └──requires──> [Streak calculation]
    └──requires──> [Completion aggregation queries]
    └──enhances──> [Contribution grid] (cross-links to detail view)

[Export / import]
    └──requires──> [Stable data schema]
    └──requires──> [Local persistence layer]
    └──conflicts──> [Schema migrations without version field]

[Streak visual rewards]
    └──requires──> [Streak calculation]
    └──enhances──> [One-tap logging] (feedback loop)

[Reminders v2]
    └──requires──> [Habit CRUD with schedule]
    └──conflicts──> [Pure local-first v1] (service worker / push adds complexity)
```

### Dependency Notes

- **Habit CRUD requires local persistence:** No backend means the browser storage layer must be designed first with a versioned schema to support future export/import and migrations.
- **Streak calculation requires frequency rules engine:** A Mon/Wed/Fri habit must not count Tuesday as a miss. Weekly habits (e.g., "3x per week") add significant complexity — defer to v1.x.
- **Contribution grid requires logging history:** The grid is a read-only visualization over completion records; build logging + storage before the grid.
- **Export/import conflicts with schema changes:** Ship schema version in export format from day one to avoid breaking restores after updates.
- **Reminders conflict with v1 local-only scope:** Push notifications need service workers or native APIs; keep out of v1 to protect ship date.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Create custom habits** (name, daily or specific weekdays) — without this, nothing else matters
- [ ] **One-tap check-in for today** — core loop; must feel instant
- [ ] **Toggle completion for past days** — users need to backfill and correct mistakes
- [ ] **Per-habit GitHub-style contribution grid** — signature differentiator; validates visual motivation hypothesis
- [ ] **Dashboard with current streaks, completion rate, weekly overview** — "one glance" progress promised in core value
- [ ] **Streak visual feedback** (flame, color fill, or similar) — emotional reward on check-in without full gamification
- [ ] **Local persistence** (survives browser refresh) — table stakes for any tracker
- [ ] **Export and import data** — safety net for local-first; builds user trust
- [ ] **Responsive web layout** (desktop + mobile browser) — platform constraint
- [ ] **Minimal dark mode UI** — design constraint and audience expectation

### Add After Validation (v1.x)

Features to add once core loop is proven with real usage.

- [ ] **"X times per week" frequency** — common schedule type (98% of apps support); adds streak logic complexity
- [ ] **Skip / rest day without breaking streak** — high user demand per Habitify/Loop feedback; needs careful streak semantics
- [ ] **Habit color/icon customization** — low effort, improves grid readability when tracking 5+ habits
- [ ] **Habit reordering and archiving** — quality-of-life once habit count grows
- [ ] **CSV export** — interoperability with spreadsheets and other apps
- [ ] **Partial completion / numeric goals** — enables heatmap intensity levels (lighter cells for partial days)
- [ ] **Keyboard shortcuts** — power-user affordance for desktop; low cost
- [ ] **Undo last action** — safety net beyond toggle; nice polish

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Reminders / push notifications** — table stakes in market but high implementation cost; #1 expected v2 feature
- [ ] **PWA with offline support** — extends local-first without native app cost
- [ ] **Home screen widgets** — major retention driver on mobile; requires PWA or native
- [ ] **Cloud sync with optional account** — monetization path used by 87% of competitors; only after local-first is solid
- [ ] **Multi-device real-time sync** — conflict resolution is a project unto itself
- [ ] **Routine builder / habit stacking** — different product direction; only if user research demands it
- [ ] **Social accountability** — only if pivoting away from private streak focus
- [ ] **Advanced analytics** — trend lines, best-day-of-week, habit correlations
- [ ] **Theming / light mode** — dark-first is the brand; light mode is polish

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| One-tap daily logging | HIGH | LOW | P1 |
| Habit CRUD (name + frequency) | HIGH | LOW | P1 |
| Local persistence | HIGH | LOW | P1 |
| Contribution grid per habit | HIGH | HIGH | P1 |
| Dashboard (streaks, completion %, weekly) | HIGH | MEDIUM | P1 |
| Streak visual rewards | MEDIUM | LOW | P1 |
| Export/import (JSON) | MEDIUM | MEDIUM | P1 |
| Responsive dark UI | HIGH | MEDIUM | P1 |
| Toggle past days | HIGH | LOW | P1 |
| Edit/archive/delete habits | MEDIUM | LOW | P2 |
| Habit color customization | LOW | LOW | P2 |
| "X times per week" frequency | MEDIUM | MEDIUM | P2 |
| Skip/rest day semantics | MEDIUM | MEDIUM | P2 |
| CSV export | LOW | LOW | P2 |
| Numeric/partial completion | MEDIUM | HIGH | P3 |
| Reminders | HIGH | HIGH | P3 (v2) |
| PWA offline | MEDIUM | MEDIUM | P3 (v2) |
| Cloud sync | MEDIUM | HIGH | P3 (v2) |
| Social features | LOW | HIGH | P3 (never v1) |
| Full gamification | LOW | HIGH | P3 (never v1) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Streaks (iOS) | Loop (Android) | Habitify | Way of Life | Our Approach |
|---------|---------------|----------------|----------|-------------|--------------|
| Check-in UX | One-tap circle fill | Tap score from widget | One-tap + skip option | Color dot per day | One-tap toggle; optimistic UI |
| Schedule flexibility | Daily, specific days, X/week | Daily, weekly, custom | Full flexibility | Daily, specific days | v1: daily + specific weekdays |
| Streak display | Ring + counter | Score graph + streaks | Counter + skip-aware | Chain targets | Counter + flame/color reward |
| Progress visualization | Minimal stats | Bar charts + calendar | Heatmaps + charts | Color-coded long-term grid | **GitHub contribution grid per habit** |
| Dashboard | Habit grid IS the dashboard | Separate stats screen | Rich analytics dashboard | Journal + trends | Streaks + completion % + weekly overview |
| Data model | iCloud sync | Local SQLite only | Cloud account + sync | Cloud sync | **Local-first, export/import** |
| Gamification | None | None | None | None | Streak visuals only (no RPG) |
| Social | None | None | Unclear | None | None (by design) |
| Reminders | Per-habit | Per-habit | Per-habit + smart | Per-habit | Deferred to v2 |
| Pricing | $5.99 one-time | Free, open source | Freemium subscription | Freemium subscription | Free web app (no monetization in v1) |
| Habit limit | 12 max (intentional) | Unlimited | 3 free / unlimited paid | 3 free | Unlimited |
| Platform | iOS/macOS/Watch only | Android only | iOS/Android/Mac/Web | iOS/Android | **Web responsive** |

## Sources

- [Steal What Works: 114 Habit Tracking Apps Feature Comparison](https://stealwhatworks.com/blogs/news/habit-tracking-app-features) — PRIMARY: quantitative feature penetration across 114 apps (HIGH confidence for prevalence data)
- [Zapier: Best Habit Tracker Apps](https://zapier.com/blog/best-habit-tracker-app/) — qualitative expert review of top apps (MEDIUM confidence)
- [HabitBox: Daily Habit Tracker App Guide](https://habitbox.app/blog/daily-habit-tracker-app) — 2026 buyer guide emphasizing one-tap, heatmap, export (MEDIUM confidence)
- [Media Hacker: 7 Best Habit Tracking Apps 2026](https://www.mediahacker.org/15565/best-habit-tracking-apps-routine-2026/) — streak vs skip semantics, analytics depth (MEDIUM confidence)
- [Plan With AI: 5 Apps Side-by-Side Comparison](https://planwith.ai/blog/5-habit-tracking-apps-side-by-side) — feature matrix for Streaks, Habitica, Productive, Way of Life, HabitNow (MEDIUM confidence)
- [init.Habits: GitHub-Style Habit Tracker](https://inithabits.com/blog/github-style-habit-tracker) — heatmap psychology, partial completion, trend vs counter (MEDIUM confidence)
- [Goals and Progress: Best Habit Tracking Apps](https://goalsandprogress.com/best-habit-tracking-apps-comparison/) — motivation mechanism mapping (MEDIUM confidence)
- [Loop Habit Tracker (GitHub)](https://github.com/iSoron/uhabits) — open-source reference for local-first Android patterns (MEDIUM confidence)
- [Kadō](https://getkado.app/) — privacy-first, export/import, anti-lock-in positioning (MEDIUM confidence)
- PROJECT.md — user v1 vision, explicit out-of-scope decisions (HIGH confidence for project intent)

---
*Feature research for: Habit Tracker web application*
*Researched: 2026-07-19*
