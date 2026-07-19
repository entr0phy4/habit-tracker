---
status: testing
phase: 02-streaks-statistics
source: [02-VERIFICATION.md]
started: 2026-07-19T20:15:00Z
updated: 2026-07-19T20:15:00Z
---

## Current Test

number: 1
name: Reactive stats on toggle
expected: |
  Flame count on Today row and Current/Longest/Rate cards plus dot grid states change immediately after toggle without page reload.
awaiting: user response

## Tests

### 1. Reactive stats on toggle
expected: Flame count on Today row and Current/Longest/Rate cards plus dot grid states change immediately after toggle without page reload.
result: [pending]

### 2. useStreak Dexie failure fallback
expected: Streak badge shows 0 (or hides after load) with no raw exception text surfaced to the user when IndexedDB read fails on Today view.
result: [pending]

### 3. useHabitStats Dexie failure fallback
expected: Stat cards show 0 values or remain hidden while loading; no raw exception text when IndexedDB read fails on History view.
result: [pending]

### 4. Large stat integers (>999)
expected: Values display as full integers '1234' and '5678' without K/M abbreviation on History stat cards.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
