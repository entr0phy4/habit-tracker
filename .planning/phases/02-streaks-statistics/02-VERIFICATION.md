---
phase: 02-streaks-statistics
verified: 2026-07-19T20:14:00Z
status: human_needed
score: 23/24 must-haves verified
behavior_unverified: 1
overrides_applied: 0
behavior_unverified_items:
  - truth: "Streak and stats update immediately when the user toggles a completion for today or a past day"
    test: "On Today view, toggle a habit completion and confirm the Flame streak count updates without refresh; on History, tap a past-week dot and confirm stat cards and dot states update"
    expected: "Current streak, longest, rate, and weekly dot colors reflect the toggle within one render cycle (useLiveQuery reactivity)"
    why_human: "Hooks use useLiveQuery but component tests mock useStreak/useCompletions — no integration test exercises live Dexie→UI propagation"
human_verification:
  - test: "Toggle a completion on Today and History pages; confirm streak/stat values update without page reload"
    expected: "Flame count on Today row and Current/Longest/Rate cards plus dot grid states change immediately after toggle"
    why_human: "Reactive update path is wired via useLiveQuery but not covered by behavioral tests"
  - test: "Simulate or force a Dexie read failure during useStreak (e.g., corrupt IndexedDB entry) and open Today view"
    expected: "Streak badge shows 0 (or hides after load) with no raw exception text surfaced to the user"
    why_human: "Backstop truth (verification: backstop) — hook defaults result ?? 0 but error-path UX is not test-enforced"
  - test: "Simulate or force a Dexie read failure during useHabitStats and open History view"
    expected: "Stat cards show 0 values or remain hidden while loading; no raw exception text"
    why_human: "Backstop truth (verification: backstop) — silent fallback behavior requires runtime failure injection"
  - test: "Create a habit with current streak 1234 and longest 5678; open History stat cards"
    expected: "Values display as full integers '1234' and '5678' without K/M abbreviation"
    why_human: "Backstop truth (verification: backstop) — StatCards uses String(n) but no test asserts >999 display"
---

# Phase 2: Streaks & Statistics Verification Report

**Phase Goal:** Users can see streak motivation and completion stats that respect each habit's schedule  
**Verified:** 2026-07-19T20:14:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

## User Flow Coverage

User story: *As a habit tracker user, I want to see streak motivation and completion stats that respect each habit's schedule, so that I stay motivated without breaking my chain on rest days or before today's check-in.*

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open Today view | Each habit row shows Flame icon + current streak count | `HabitRow.tsx` renders `useStreak` badge with `Flame` + count; `HabitRow.test.tsx` asserts label and value | ✓ |
| Check in without breaking chain | Today incomplete does not zero displayed streak | `calculateCurrentStreak` skips today when due-but-incomplete (`streak.ts:14-16`); `streak.test.ts` D-15 case passes | ✓ |
| Weekly habit on rest day | Rest days do not break or increment streak | `isDueOnDate` gates every step (`streak.ts:18-22`); MWF tests in `streak.test.ts` | ✓ |
| Open habit History | Three stat cards (Current, Longest, Rate) below habit name | `HabitHistoryPage.tsx` composes `StatCards`; `StatCards.test.tsx` asserts labels and `85%` format | ✓ |
| Review weekly progress | Mon–Sun calendar week with completed/missed/not-scheduled states | `useCompletions` uses `getCalendarWeekDates`; `HistoryDotGrid` calls `getWeekDayState`; subtitle "This week" | ✓ |
| Toggle past/today dot | Dot grid tappable; completed=green fill, missed=destructive ring | `HistoryDotGrid.test.tsx` toggle + ring-destructive assertions; `h-11 w-11` touch targets | ✓ |
| Toggle completion anywhere | Stats refresh immediately without reload | `useStreak`/`useHabitStats`/`useCompletions` all use `useLiveQuery` | ⚠️ present, behavior unverified |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can see current streak per habit counting only scheduled days (STRK-01, roadmap SC1) | ✓ VERIFIED | `streak.ts` + `streak.test.ts`; `HabitRow` Flame badge; `useStreak` hook wired |
| 2 | User can see longest streak per habit (STRK-02, roadmap SC2) | ✓ VERIFIED | `calculateLongestStreak` D-16 test; `useHabitStats` + `StatCards` Longest label |
| 3 | User can see completion rate % over tracked history (STRK-03, roadmap SC3) | ✓ VERIFIED | `calculateCompletionRate` tests (0%, 100%, 67%, future exclusion); `StatCards` renders `${rate}%` |
| 4 | User can see weekly overview of completed/missed scheduled days (STRK-04, roadmap SC4) | ✓ VERIFIED | `getWeekDayState` four states tested; `HistoryDotGrid` renders calendar week |
| 5 | Streak and stats update immediately on toggle (roadmap SC5) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `useLiveQuery` in hooks; no integration test for toggle→re-render |
| 6 | Weekly rest days do not break streak (STRK-01, D-14) | ✓ VERIFIED | MWF streak tests; `isDueOnDate` skip in backward walk |
| 7 | Today incomplete does not zero current streak (D-15) | ✓ VERIFIED | `streak.test.ts` 5-day run + incomplete today → 5 |
| 8 | First completion starts streak at 1; zero before any (D-13) | ✓ VERIFIED | D-13 zero test; MWF Mon-only → streak 1 |
| 9 | Longest streak is all-time max consecutive scheduled run (D-16) | ✓ VERIFIED | 10-day past run vs 3-day current test |
| 10 | Habit start date uses local date from createdAt (not UTC slice) | ✓ VERIFIED | `getHabitStartDate` → `getLocalDateString(new Date(createdAt))`; `dates.test.ts` anti-slice assertion |
| 11 | Completion rate uses lifetime scheduled days, whole percent (D-07, D-08) | ✓ VERIFIED | `Math.round((completed/scheduled)*100)` in `stats.ts` |
| 12 | Completion rate denominator excludes future scheduled days | ✓ VERIFIED | `stats.test.ts` future-exclusion case |
| 13 | Calendar week is Mon–Sun containing today (D-09) | ✓ VERIFIED | `getCalendarWeekDates` with `weekStartsOn: 1`; `dates.test.ts` Jul 13–19 |
| 14 | `getWeekDayState` returns completed \| missed \| not-scheduled \| future (D-10) | ✓ VERIFIED | All four states tested in `stats.test.ts` |
| 15 | Missed scheduled → missed; non-scheduled → not-scheduled (D-10, D-11) | ✓ VERIFIED | Tuesday not-scheduled + past missed tests |
| 16 | Future scheduled days in week → future state (dimmed disabled dot) | ✓ VERIFIED | `stats.test.ts` future case; `HistoryDotGrid` `disabled={isFuture}` + `opacity-40` |
| 17 | Today inline Flame streak badge prominent (D-01–D-03) | ✓ VERIFIED | `HabitRow` layout name → badge → dots; `HabitRow.test.tsx` |
| 18 | Streak badge visible when row completed — not muted (D-04) | ✓ VERIFIED | Badge uses `text-foreground`; completed-row test passes |
| 19 | Streak shows Flame + 0 before first scheduled completion (D-13) | ✓ VERIFIED | `useStreak` returns `result ?? 0`; badge renders `{currentStreak}` when loaded |
| 20 | Streak badge aria-label "{n} day streak" | ✓ VERIFIED | `HabitRow.tsx:110` `aria-label={\`${currentStreak} day streak\`}` |
| 21 | History page three stat cards below habit name (D-05, D-06) | ✓ VERIFIED | `HabitHistoryContent` order: name → `StatCards` → "This week" |
| 22 | Rate formatted as whole-number percent (D-08) | ✓ VERIFIED | `StatCards` value `${rate}%`; test asserts `85%` |
| 23 | Weekly subtitle "This week" (D-09, D-12) | ✓ VERIFIED | `HabitHistoryPage.tsx:24` |
| 24 | Completed=green fill; missed=destructive ring only (D-10, D-11) | ✓ VERIFIED | `bg-primary` fill; `ring-destructive` on missed; no X mark |
| 25 | Non-scheduled days: spacer only, day label remains | ✓ VERIFIED | `HistoryDotGrid` `not-scheduled` branch renders label + `h-11 w-11` spacer |
| 26 | Dot grid tappable to toggle past/today completions (D-12) | ✓ VERIFIED | `handleDotClick` → `toggle`; test fires click |
| 27 | History dots 44×44px (`h-11 w-11`) touch targets (UI-02) | ✓ VERIFIED | `HistoryDotGrid` button/spacer classes |
| 28 | Dexie read failure during useStreak → 0 without error UI | ? HUMAN (backstop) | `result ?? 0` default; no error-path test |
| 29 | Dexie read failure during stat hooks → 0/blank without exception text | ? HUMAN (backstop) | `result?.current ?? 0`; `StatCards` null while loading |
| 30 | Stat values >999 display full integer | ? HUMAN (backstop) | `String(current)` / `String(longest)` — no >999 test |
| 31 | Invalid/missing completions → streak 0 and rate 0% silently | ✓ VERIFIED | Empty `Set` → domain functions return 0; hooks default 0 |

**Score:** 23/24 presence-verified truths (1 behavior-unverified; 3 backstop items routed to human verification)

### Prohibitions (negative checks)

| Prohibition | Status | Evidence |
|-------------|--------|----------|
| Must not persist streak fields on Habit records | ✓ VERIFIED | `types.ts` Habit has no streak fields |
| Must not use `toISOString().slice(0,10)` for day keys | ✓ VERIFIED | No matches in `src/`; `getHabitStartDate` uses `getLocalDateString` |
| Must not use `getLast7Days` in history week flow | ✓ VERIFIED | `useCompletions.ts` imports `getCalendarWeekDates` only |
| Must not use `dangerouslySetInnerHTML` for streak/name | ✓ VERIFIED | No matches in phase files |
| Must not mute streak badge when completed | ✓ VERIFIED | Streak uses `text-foreground`, not `text-muted-foreground` |
| Must not render X mark on missed days | ✓ VERIFIED | Ring-destructive only in `HistoryDotGrid` |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/domain/streak.ts` | Schedule-aware current + longest streak | ✓ VERIFIED | 58 lines; pure functions; wired to hooks |
| `src/domain/streak.test.ts` | D-13–D-16 edge coverage | ✓ VERIFIED | 9 tests; all pass |
| `src/domain/stats.ts` | Completion rate + week day state | ✓ VERIFIED | 37 lines; pure functions |
| `src/domain/stats.test.ts` | STRK-03/04 predicates | ✓ VERIFIED | 8 tests; all pass |
| `src/hooks/useStreak.ts` | Reactive current streak | ✓ VERIFIED | `useLiveQuery` → `completionRepository` → `calculateCurrentStreak` |
| `src/hooks/useHabitStats.ts` | Reactive current/longest/rate | ✓ VERIFIED | Single query derives all three metrics |
| `src/components/habits/HabitRow.tsx` | Today inline Flame badge | ✓ VERIFIED | Imported by `TodayPage`; tests mock hook |
| `src/components/habits/StatCards.tsx` | Three stat cards | ✓ VERIFIED | `dl` with aria-label; wired in history page |
| `src/components/habits/HistoryDotGrid.tsx` | Calendar-week dot grid | ✓ VERIFIED | `frequency` prop; `getWeekDayState` per date |
| `src/pages/HabitHistoryPage.tsx` | History stats + grid composition | ✓ VERIFIED | `StatCards` + `HistoryDotGrid` + "This week" |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `streak.ts` | `schedule.ts` | `isDueOnDate` in every streak step | ✓ WIRED | Import + usage in both functions |
| `streak.ts` | `dates.ts` | `getPreviousDay`, `iterateDaysInRange` | ✓ WIRED | Longest uses forward scan generator |
| `useStreak.ts` | `streak.ts` | `calculateCurrentStreak(Set, ...)` | ✓ WIRED | Repository fetch → Set → domain |
| `useStreak.ts` | `completionRepository` | `getByHabitInRange(start, today)` | ✓ WIRED | No direct `db` import |
| `HabitRow.tsx` | `useStreak.ts` | `useStreak(habit, todayKey)` | ✓ WIRED | Between name and `WeekDayDots` |
| `TodayPage.tsx` | `HabitRow.tsx` | `todayKey={todayKey}` prop | ✓ WIRED | Line 70 |
| `useHabitStats.ts` | `streak.ts` + `stats.ts` | Single query computes all three | ✓ WIRED | One `getByHabitInRange` call |
| `useCompletions.ts` | `dates.ts` | `getCalendarWeekDates()` | ✓ WIRED | Replaces rolling 7-day window |
| `HistoryDotGrid.tsx` | `stats.ts` | `getWeekDayState(date, frequency, ...)` | ✓ WIRED | `frequency` prop from page |
| `HabitHistoryPage.tsx` | `StatCards` + `HistoryDotGrid` | `HabitHistoryContent` composition | ✓ WIRED | Full history slice assembled |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `HabitRow` | `currentStreak` | `useStreak` → `completionRepository.getByHabitInRange` | Yes — Dexie query by habit id + date range | ✓ FLOWING |
| `StatCards` | `current`, `longest`, `rate` | `useHabitStats` → same repository pattern | Yes — computed from live completion dates | ✓ FLOWING |
| `HistoryDotGrid` | `completedDates`, `dates` | `useCompletions` → Dexie `between` on week range | Yes — calendar week from `getCalendarWeekDates` | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Full test suite (70 tests) | `npm test` | 14 files, 70 passed | ✓ PASS |
| Streak D-15 today-incomplete | `streak.test.ts` (in suite) | Passes in full run | ✓ PASS |
| Calendar week Mon–Sun | `dates.test.ts` getCalendarWeekDates | Passes in full run | ✓ PASS |
| History dot toggle | `HistoryDotGrid.test.tsx` toggle test | Passes in full run | ✓ PASS |
| useLiveQuery reactive update on toggle | — | No integration test | ? SKIP → human |

### Probe Execution

Step 7c: SKIPPED — no probe scripts declared or conventional `scripts/*/tests/probe-*.sh` for this UI phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| STRK-01 | 02-01, 02-03 | Current streak per habit | ✓ SATISFIED | Domain + `useStreak` + `HabitRow` Flame badge |
| STRK-02 | 02-01, 02-04 | Longest streak per habit | ✓ SATISFIED | `calculateLongestStreak` + `StatCards` Longest |
| STRK-03 | 02-02, 02-04 | Completion rate % per habit | ✓ SATISFIED | `calculateCompletionRate` + `StatCards` Rate |
| STRK-04 | 02-02, 02-04 | Weekly overview of completions | ✓ SATISFIED | `getCalendarWeekDates` + `HistoryDotGrid` |

No orphaned Phase 2 requirements — all four STRK IDs claimed in plans and implemented.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None | — | No TBD/FIXME/XXX, stubs, or placeholder handlers in phase files |

### Human Verification Required

#### 1. Reactive stats on toggle

**Test:** Toggle completions on Today and History without reloading.  
**Expected:** Flame count, stat cards, and dot colors update immediately.  
**Why human:** `useLiveQuery` wiring is present; component tests mock hooks and do not exercise Dexie reactivity.

#### 2. useStreak Dexie failure fallback

**Test:** Force IndexedDB read failure while loading Today view.  
**Expected:** Streak shows 0 or badge hidden; no raw error text.  
**Why human:** Backstop truth — error path not test-enforced.

#### 3. useHabitStats Dexie failure fallback

**Test:** Force IndexedDB read failure on History page.  
**Expected:** Cards show zeros or stay hidden; no exception surfaced.  
**Why human:** Backstop truth — requires runtime failure injection.

#### 4. Large stat integers (>999)

**Test:** Habit with streak/longest >999 on History page.  
**Expected:** Full integers displayed (e.g., `1234`, not `1.2K`).  
**Why human:** Backstop truth — `String(n)` implementation present but untested at scale.

### Gaps Summary

No blocking implementation gaps found. All STRK requirements are implemented with substantive domain logic, wired hooks, and passing unit/component tests (70/70). The phase cannot be marked `passed` yet because:

1. **Behavior-unverified:** Live reactive updates on toggle rely on `useLiveQuery` without an integration test.
2. **Backstop items:** Three planner-declared backstop truths (Dexie failure UX ×2, >999 display) require human confirmation.

Automated evidence strongly supports goal achievement; human UAT should confirm runtime behavior for the four items above.

---

_Verified: 2026-07-19T20:14:00Z_  
_Verifier: Claude (gsd-verifier)_
