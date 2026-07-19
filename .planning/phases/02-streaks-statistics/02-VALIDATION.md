---
phase: 2
slug: streaks-statistics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| **Quick run command** | `npm test -- src/domain/streak.test.ts src/domain/stats.test.ts -x` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/domain/streak.test.ts src/domain/stats.test.ts -x`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | STRK-01 | — | N/A | unit | `npm test -- src/domain/streak.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | STRK-02 | — | N/A | unit | `npm test -- src/domain/streak.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | STRK-03 | — | N/A | unit | `npm test -- src/domain/stats.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | STRK-04 | — | N/A | unit | `npm test -- src/domain/dates.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | STRK-01 | T-2-01 | React text escaping | component | `npm test -- src/components/habits/HabitRow.test.tsx -x` | ✅ extend | ⬜ pending |
| 02-03-02 | 03 | 3 | STRK-02, STRK-03 | — | N/A | component | `npm test -- src/components/habits/StatCards.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 4 | STRK-04 | — | N/A | component | `npm test -- src/components/habits/HistoryDotGrid.test.tsx -x` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/domain/streak.ts` + `src/domain/streak.test.ts` — covers STRK-01, STRK-02
- [ ] `src/domain/stats.ts` + `src/domain/stats.test.ts` — covers STRK-03, STRK-04 states
- [ ] `src/domain/dates.ts` extensions + `dates.test.ts` calendar week cases — covers STRK-04
- [ ] `src/hooks/useStreak.ts` + `src/hooks/useHabitStats.ts` — reactive wiring
- [ ] `src/components/habits/StatCards.tsx` (+ optional test) — covers STRK-02, STRK-03 display

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stats update immediately on toggle | STRK-01–04 | Reactive UX timing | Toggle completion on Today or history; verify streak/rate/grid update without refresh |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
