---
status: complete
phase: 02-streaks-statistics
source: [02-VERIFICATION.md]
started: 2026-07-19T20:15:00Z
updated: 2026-07-23T18:40:00Z
---

## Current Test

number: —
name: —
expected: |
  All Phase 2 UAT residuals closed in Phase 6 (QA-01).
awaiting: none

## Tests

### 1. Reactive stats on toggle
expected: Flame count on Today row and Current/Longest/Rate cards plus heatmap cell states change immediately after toggle without page reload.
result: [passed]
evidence: useDashboardHabits.test.ts toggle → waitFor overallRate/streak; useLiveQuery shared by useStreak/useHabitStats/heatmap (Phase 3 heatmap replaces obsolete "dot grid" wording — D-09).

### 2. useStreak Dexie failure fallback
expected: Streak badge shows 0 (or hides after load) with no raw exception text surfaced to the user when IndexedDB read fails on Today view.
result: [passed]
evidence: src/hooks/useStreak.test.ts — QUERY_ERROR → currentStreak 0, isLoading false.

### 3. useHabitStats Dexie failure fallback
expected: Stat cards show 0 values or remain hidden while loading; no raw exception text when IndexedDB read fails on History view.
result: [passed]
evidence: src/hooks/useHabitStats.test.ts — QUERY_ERROR → current/longest/rate 0.

### 4. Large stat integers (>999)
expected: Values display as full integers '1234' and '5678' without K/M abbreviation on History stat cards.
result: [passed]
evidence: src/components/habits/StatCards.test.tsx — renders 1234/5678 without K/M (D-10).

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
