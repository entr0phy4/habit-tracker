---
status: testing
phase: 03-dashboard-progress-visualization
source: [03-VERIFICATION.md]
started: 2026-07-19T21:18:00Z
updated: 2026-07-19T21:18:00Z
---

## Current Test

number: 1
name: Mobile heatmap scroll position
expected: |
  Most recent weeks visible without scrolling; older weeks reachable via horizontal scroll.
awaiting: user response

## Tests

### 1. Mobile heatmap scroll position
expected: Open a habit history page on a 375px-wide viewport. Most recent weeks visible without scrolling; older weeks reachable via horizontal scroll.
result: [pending]

### 2. Large streak layout (backstop)
expected: Display a habit with streak count ≥1000 on Panel. Card layout intact, no overflow breakage.
result: [pending]

### 3. Dashboard IndexedDB failure (backstop)
expected: Block IndexedDB reads and open Panel tab. Graceful empty/error UI without raw exception text.
result: [pending]

### 4. Invalid completion dates (backstop)
expected: Insert malformed completion date in IndexedDB, open history heatmap. Heatmap renders; invalid dates skipped silently.
result: [pending]

### 5. Cross-viewport responsive usability (Roadmap SC4)
expected: Exercise Panel tab, history heatmap, and Hoy FAB at 375px and 1024px widths. Touch targets adequate; tab bar and FAB do not obscure content.
result: [pending]

### 6. Toggle failure toast (behavior-unverified)
expected: Cause completion toggle to fail and tap a missed heatmap cell. Toast "Couldn't update. Try again." appears.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
