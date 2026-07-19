# Pitfalls Research

**Domain:** Local-first habit tracker web application (streaks, contribution grid, browser persistence)
**Researched:** 2026-07-19
**Confidence:** MEDIUM (cross-checked industry streak/storage guidance; no production codebase yet to validate against)

## Critical Pitfalls

### Pitfall 1: UTC or 24-Hour Streak Logic Instead of Local Calendar Days

**What goes wrong:**
Streaks break or extend incorrectly for users outside UTC. A user in Sydney who checks in at 11:55 PM local time may be recorded as "tomorrow" on the server. DST transitions (spring forward / fall back) cause 23- or 25-hour "days" that break any `lastActivity + 24h` logic. Users lose streaks they legitimately earned.

**Why it happens:**
Developers default to `Date.getUTCDate()`, `toISOString().split('T')[0]`, or millisecond diffs divided by 86,400,000. These feel correct in dev (often UTC or a single timezone) but encode the wrong definition of "a day" for habit tracking.

**How to avoid:**
- Store completion events with a **local calendar date string** (`YYYY-MM-DD`) derived from the user's IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), not a UTC offset.
- Derive streaks by walking consecutive local dates backward from today — never maintain a fragile `streakCount` column as source of truth.
- Compare **calendar date strings**, not hour deltas. Use `date-fns-tz` or `Intl` for conversion; avoid `moment-timezone` for new code.
- Evaluate streak state **lazily on user interaction** (open app, toggle habit) rather than assuming a midnight cron — especially important for local-first with no backend scheduler.
- Add explicit test fixtures for: UTC+10 user at 11:55 PM, US fall-back repeated hour, spring-forward missing hour.

**Warning signs:**
- Streak resets reported by users in non-UTC timezones only.
- `new Date().toISOString().slice(0, 10)` used anywhere in streak or "today" logic.
- Tests pass locally but fail when CI runs in UTC and dev machine is UTC-5.
- Streak breaks exactly on DST changeover weekends in US/EU.

**Phase to address:**
Phase 3 (Streak Engine) — must be designed here; retrofitting after Phase 4 visualization ships is a common rewrite trigger.

---

### Pitfall 2: Weekly / Custom-Frequency Habits Treated as Daily Streaks

**What goes wrong:**
A "Mon/Wed/Fri gym" habit shows streak 0 on Tuesday even though Tuesday is not a required day. Or the streak breaks because Saturday was "missed" when it was never scheduled. Users see nonsensical streak numbers and lose trust in the core motivation loop.

**Why it happens:**
Streak logic is written for daily habits first; weekly/custom schedules are bolted on by filtering the grid without changing the streak walk algorithm. Developers reuse `differenceInCalendarDays === 1` without checking whether the gap day was a scheduled rest day.

**How to avoid:**
- Model habit frequency explicitly: `daily` | `weekly` (specific `daysOfWeek[]`).
- Define streak unit per habit: **consecutive scheduled periods completed**, not consecutive calendar days.
- Walk backward from today skipping non-scheduled days when checking continuity; only break when a **scheduled** day lacks a completion.
- For weekly habits, use ISO week strings (`YYYY-Www`) in local timezone — same calendar-comparison pattern as daily.
- Show two metrics where helpful: "current streak of scheduled completions" vs "completion rate this week" — don't conflate them.

**Warning signs:**
- Single `calculateStreak(habit, completions)` function with no frequency branch.
- Streak drops on rest days that appear greyed-out in the UI.
- Unit tests only cover daily habits.

**Phase to address:**
Phase 3 (Streak Engine) — frequency-aware streak walk must be part of the initial streak design, not a follow-up patch.

---

### Pitfall 3: Treating Browser Storage as Durable Without a Backup Story

**What goes wrong:**
Users lose weeks or months of habit history. Safari evicts script-writable storage after ~7 days without site interaction. Chromium evicts "best-effort" IndexedDB under disk pressure. Private browsing offers near-zero quota. A failed import after `clear()` leaves an empty app.

**Why it happens:**
"Local-first" is interpreted as "write to localStorage and forget." Teams skip export/import until late, assume `IndexedDB` is a real database, or implement import as clear-then-load without rollback.

**How to avoid:**
- Use **IndexedDB** (via `idb` or Dexie) for structured habit + completion data — not `localStorage` (5 MB cap, synchronous, strings only).
- Wrap every write in try/catch; handle `QuotaExceededError` with user-visible guidance.
- Call `navigator.storage.persist()` after meaningful engagement (not on first page load); treat denial as expected on Safari/iOS.
- Implement **export/import JSON** in v1 per PROJECT.md — not v2.
- Import pattern: validate → snapshot current DB → write new data in transaction → on failure, restore snapshot explicitly (don't rely on transaction rollback alone).
- Surface backup prompts: first launch after 7 days, before destructive import, optionally after N completions.
- Version the export schema (`schemaVersion` field) from day one.

**Warning signs:**
- No export button exists when "data persistence" is marked done.
- Import handler calls `clear()` before validating parsed JSON.
- `localStorage.setItem` used for completion arrays that grow unbounded.
- No `storage` event or quota monitoring.

**Phase to address:**
Phase 1 (Data Layer) for storage choice and schema versioning; Phase 6 (Export/Import) for backup UX — but the **import safety pattern** must be specced in Phase 1.

---

### Pitfall 4: Over-Scoping v1 With Accounts, Reminders, or Analytics

**What goes wrong:**
The core loop — create habit → check in → see streak → feel progress — never ships. Weeks are spent on auth, push notification permission flows, trend charts, or habit categories. The app competes with mature products on features instead of winning on simplicity and speed.

**Why it happens:**
Habit trackers feel "too simple" so developers add adjacent features (mood tracking, journaling, AI coaching, social). Each feature seems small but multiplies edge cases — especially anything touching time (reminders) or identity (accounts).

**How to avoid:**
- Treat PROJECT.md Active requirements as a **contract**. Anything in Out of Scope needs explicit milestone promotion.
- Apply "Can a user log a habit and see their streak without this?" — if yes, defer.
- Use a written parking lot (v2 list) for every rejected idea.
- Ship one-tap check-in + contribution grid + export before any v2 item.
- Resist "just one more" features: custom icons, tags, notes, multi-habit templates, onboarding wizards.

**Warning signs:**
- Roadmap has more than ~6 phases before first usable release.
- Discussion of Supabase/Firebase auth before export/import works.
- Reminder scheduling code appears before streak edge-case tests exist.
- Dashboard has more chart types than habits can be created.

**Phase to address:**
Phase 0 / Roadmap planning — scope gate; revisited at every phase transition via `/gsd-transition`.

---

### Pitfall 5: Contribution Grid DOM Explosion and Re-Render Cascades

**What goes wrong:**
The GitHub-style grid stutters on hover, typing in other UI freezes, mobile scroll janks. With 10 habits × 365 days × SVG cells, mount time grows and every parent state change (dashboard timer, theme toggle) repaints all cells.

**Why it happens:**
Each day is a React component with inline handlers; grid data is recomputed inside render; tooltip hover lifts state to a parent that also owns the habit list; multiple heatmaps mount simultaneously on the dashboard.

**How to avoid:**
- Precompute grid cell data **outside render** (memoized selector or store); cells receive only `{ date, level, habitId }`.
- Wrap cell components in `React.memo`; use stable `useCallback` only where profiling shows benefit.
- Isolate hover/tooltip state inside the grid — don't lift to dashboard parent.
- Cap default visible range (e.g., 52 weeks); lazy-load older history if needed later.
- For 5+ habits on one screen, profile with React DevTools; consider canvas/SVG batch render only if profiling proves DOM is the bottleneck (unlikely below ~20K cells).
- Prefer one heatmap per habit detail view; dashboard shows summary stats + sparkline, not 10 full grids.

**Warning signs:**
- 365+ DOM nodes per habit re-created on every keystroke elsewhere.
- `new Date()` or streak recomputation inside `map()` over cells.
- FPS drops when moving mouse over grid.
- Lighthouse TBT spikes when opening dashboard.

**Phase to address:**
Phase 4 (Contribution Grid) — performance budget and memo boundaries belong in the first grid implementation, not a later "optimization phase."

---

### Pitfall 6: Mutable Streak Counters Instead of Event-Sourced Completions

**What goes wrong:**
Unchecking yesterday corrupts `currentStreak`. Timezone change retroactively breaks stored counts. Import merges duplicate or miss days. There's no audit trail when users dispute "I definitely logged that."

**Why it happens:**
Streak is stored as `habit.currentStreak++` on toggle for speed. Denormalized counters are easy to demo but hard to reconcile when completions are edited, deleted, or imported.

**How to avoid:**
- Source of truth: **`Completion { habitId, localDate }`** records only.
- Compute `currentStreak` and `longestStreak` on read (cache in memory; invalidate on write).
- Toggling complete = upsert/delete completion for that `localDate`; recompute streak from last N days (60–90 days window is sufficient for display; full history for longest streak).
- Never edit streak integers directly.

**Warning signs:**
- `habit.streak` field updated with `+= 1` / `= 0` in toggle handler.
- Import logic doesn't dedupe by `(habitId, localDate)`.
- Editing a past day doesn't trigger streak recalculation.

**Phase to address:**
Phase 1 (Data Model) for event shape; Phase 3 (Streak Engine) for derivation logic.

---

### Pitfall 7: "Today" Frozen at Page Load

**What goes wrong:**
User opens the app before midnight, leaves tab open, checks in after midnight — completion attaches to yesterday. Or checkboxes don't reset when the calendar day rolls over until hard refresh.

**Why it happens:**
`const today = useMemo(() => formatDate(new Date()), [])` runs once. No `visibilitychange` or midnight boundary listener in a tab that stays open overnight.

**How to avoid:**
- Resolve "today" from `getLocalDateString(now, timezone)` at **interaction time**, not mount time.
- On `document.visibilitychange` (visible) and optionally `focus`, re-resolve today and refresh today's completion state.
- Don't schedule `setTimeout` until midnight — unreliable in background tabs; visibility refresh is sufficient for v1.

**Warning signs:**
- `today` stored in state initialized only in `useEffect([])`.
- Bug reports: "I logged at 12:05 AM and it counted for yesterday."
- No test simulating day rollover with mocked `Date`.

**Phase to address:**
Phase 2 (Daily Logging) — today resolution is part of the check-in flow.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store `currentStreak` on habit row | Fast dashboard reads | Corrupts on edit/import/TZ change | Never — derive from completions |
| `localStorage` JSON blob | Ships in one afternoon | 5 MB cap, sync blocking, no indexes | Never for this project |
| Skip export/import for "MVP" | Faster first demo | Irrecoverable data loss destroys trust | Never — PROJECT.md requires it in v1 |
| Single global `timezone` in app settings | Simpler than per-event TZ | Wrong if user travels | v1: device TZ on each session is enough |
| `react-calendar-heatmap` with zero memo | Quick grid prototype | Jank with multiple habits | Only spike; not production dashboard |
| Hardcode Sunday week start | Matches US default | Confuses international users | v1 if documented; prefer locale or Monday default |
| Import without `schemaVersion` | Simpler export format | Breaks all backups on schema change | Never — add version field in first export |

## Integration Gotchas

This project is local-first with no backend in v1. Integration pitfalls are minimal but real:

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Browser IndexedDB | Assume durability like SQLite | Best-effort storage; export is the real backup |
| `navigator.storage.persist()` | Call on first page load; assume grant | Request after engagement; handle denial; no-op on Safari iOS |
| File import (`<input type="file">`) | `JSON.parse` without validation | Zod/schema validate → snapshot → transactional write |
| File export (download) | Filename without date | `habit-tracker-backup-YYYY-MM-DD.json` for user clarity |
| System timezone (`Intl`) | Cache timezone once per install | Refresh on app focus; optional manual override later |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recompute all streaks on every render | Input lag when typing habit name | Memoize per-habit; recompute only on completion write | ~20+ habits with 2+ years history |
| Full-history streak walk | Toggle takes >100ms | Walk last 60–90 days for current; separate pass for longest | 5+ years of daily completions |
| N full heatmaps on dashboard | Mobile scroll jank, high LCP | One summary metric per habit; full grid on detail view | 5+ habits × 52 weeks |
| Unbounded completion growth | QuotaExceededError after months | IndexedDB is fine for years of daily data; avoid duplicating denormalized blobs | ~10K+ completion rows with large metadata |
| Synchronous export of huge JSON | UI freeze on export | `JSON.stringify` in requestIdleCallback or Web Worker | Rare for personal habit data; watch if notes/photos added |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Importing backup without validation | Malicious JSON could XSS if rendered unsafely | Parse with schema validation; never `dangerouslySetInnerHTML` backup fields |
| Export includes internal debug fields | Leak implementation details if shared | Export only user-facing schema |
| No confirmation on destructive import | User accidentally wipes data | "Replace all data" confirm + show preview counts |
| Storing sensitive habit names unencrypted | Physical device access exposes data | Acceptable for v1 local-first; document limitation; optional encryption is v2+ |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Streak resets with no explanation | Rage-quit; feels punitive | Show "streak broken on [date]" with which scheduled day was missed |
| No undo for accidental uncheck | Anxiety about tapping wrong day | Toggle is undo; confirm only on habit delete |
| Empty state with no guidance | User closes tab | "Add your first habit" with inline creation, no tutorial wizard |
| Export buried in settings | Data loss before user finds it | Prompt after 7 days + link near habit list |
| Heatmap all grey for new users | Feels broken | Show "start today" messaging; celebrate first cell |
| Punitive streak psychology | Guilt → abandonment | v1: accurate streaks only (no freeze yet); avoid shame copy; PROJECT.md defers streak freeze to v2 |
| Desktop-only tap targets | Mobile mis-taps | 44px min touch targets on check-in and grid cells |

## "Looks Done But Isn't" Checklist

- [ ] **Streak display:** Often missing DST and timezone tests — verify Sydney 11:55 PM and US fall-back fixtures
- [ ] **Weekly habits:** Often missing rest-day logic — verify streak continues across unscheduled Tue for Mon/Wed/Fri habit
- [ ] **Today's check-in:** Often missing midnight rollover — verify tab open across midnight updates date
- [ ] **Persistence:** Often missing quota error handling — verify `QuotaExceededError` shows user message
- [ ] **Import:** Often missing rollback — verify malformed import leaves prior data intact
- [ ] **Export:** Often missing schema version — verify exported JSON has `schemaVersion` and round-trips
- [ ] **Contribution grid:** Often missing memo boundaries — verify hover doesn't re-render habit list
- [ ] **Responsive:** Often missing mobile grid scroll — verify 52-week grid usable on 375px viewport
- [ ] **Unchecked yesterday edit:** Often missing streak recalc — verify toggling past days updates current streak

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong streak algorithm shipped | MEDIUM | Keep completions; rewrite derivation; migrate no data if event-sourced |
| Users lost data (no export) | HIGH | Cannot recover; add export + apology UX; prevention only |
| Bad import wiped data | HIGH | Only recoverable if user has earlier export or snapshot; implement snapshot-before-import |
| Grid performance unusable | LOW | Memoize + reduce mounted grids; no data migration |
| Over-scoped v1 delayed launch | MEDIUM | Cut features to PROJECT.md Active list; ship export + core loop |
| localStorage chosen initially | MEDIUM | One-time migration script to IndexedDB on first load |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls. Phase numbers follow logical build order for this greenfield project (roadmap not yet finalized).

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| UTC / 24h streak logic | Phase 3: Streak Engine | Timezone fixture tests; manual TZ override in devtools |
| Weekly frequency streak bugs | Phase 3: Streak Engine | Tests for Mon/Wed/Fri across Tue, Sat, missed Wed |
| Browser storage data loss | Phase 1 + Phase 6 | Quota error test; export round-trip; Safari idle note in docs |
| Over-scoping v1 | Roadmap / Phase 0 | Scope review: every feature maps to PROJECT.md Active |
| Grid performance | Phase 4: Contribution Grid | React Profiler: hover doesn't repaint siblings; mobile FPS |
| Mutable streak counters | Phase 1: Data Model | No `streak` field in persistence; derive on read |
| Frozen "today" | Phase 2: Daily Logging | Test midnight rollover + visibilitychange refresh |
| Unsafe import | Phase 6: Export/Import | Import invalid JSON → prior data unchanged |
| Missing backup UX | Phase 6: Export/Import | User can export and re-import on clean browser |

### Suggested phase ordering rationale

1. **Phase 1 — Data Layer:** IndexedDB schema, completion events, schema versioning — prevents Pitfalls 3, 6.
2. **Phase 2 — Habit Logging:** CRUD, frequency, today resolution — prevents Pitfall 7.
3. **Phase 3 — Streak Engine:** Calendar-day logic, weekly walk — prevents Pitfalls 1, 2.
4. **Phase 4 — Contribution Grid:** Memoized heatmap — prevents Pitfall 5.
5. **Phase 5 — Dashboard & Feedback:** Streak display, completion rate — depends on correct Phase 3.
6. **Phase 6 — Export/Import:** Backup UX, safe import — prevents Pitfall 3 data-loss UX.

## Sources

- [Trophy: Streak Timezone & DST Handling](https://trophy.so/blog/streak-timezone-dst-handling) — calendar-day comparison, IANA timezones, lazy evaluation (HIGH relevance; vendor blog, cross-checked with MDN)
- [web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web) — IndexedDB vs localStorage, best-effort vs persistent (HIGH)
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — eviction behavior (HIGH)
- [DEV: Why Your IndexedDB Data Keeps Disappearing](https://dev.to/denyherianto/why-your-indexeddb-data-keeps-disappearing-1m0a) — clear-then-import failure, snapshot pattern (MEDIUM)
- [EngageFabric: Duolingo-Style Streak System](https://engagefabric.com/blog/building-duolingo-style-streak-system) — production streak complexity, grace periods (MEDIUM; grace deferred per PROJECT.md)
- [Medium: Stop Rebuilding Habit Apps](https://medium.com/lets-code-future/stop-rebuilding-habit-apps-use-this-production-ready-starter-daf2b88a3039) — timezone refactor cost anecdote (MEDIUM)
- [SoloDevStack: Build Habit Tracker as Solo](https://solodevstack.com/blog/how-to-build-habit-tracker-solo-developer) — MVP scope, heatmap value (MEDIUM)
- [Stack Overflow: Large grid rendering in React](https://stackoverflow.com/questions/78143608/what-is-a-way-to-increase-the-performance-for-rendering-large-grids-in-react) — memoization patterns (MEDIUM)
- PROJECT.md — v1 scope boundaries, local-first + export/import requirement (HIGH, project authority)

---
*Pitfalls research for: Habit Tracker (local-first web, streak + contribution grid)*
*Researched: 2026-07-19*
