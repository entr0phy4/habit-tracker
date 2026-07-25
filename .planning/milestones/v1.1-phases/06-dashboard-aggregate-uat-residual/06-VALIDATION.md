---
phase: 6
slug: dashboard-aggregate-uat-residual
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-23
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 + jsdom |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npx vitest run src/domain/stats.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10–20 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted `npx vitest run <changed-test-file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | ENH-03 | — | Pooled counts only; no untrusted input | unit | `npx vitest run src/domain/stats.test.ts` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | ENH-03 | — | Overall rate uses Σ/Σ not mean | unit | `npx vitest run src/domain/stats.test.ts` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | QA-01 | T-06-01 | useStreak throw → 0, no exception leak | unit | `npx vitest run src/hooks/useStreak.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | QA-01 | T-06-01 | useHabitStats throw → 0s | unit | `npx vitest run src/hooks/useHabitStats.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | ENH-03 / QA-01 | T-06-01 | overallRate + dashboard QUERY_ERROR | unit | `npx vitest run src/hooks/useDashboardHabits.test.ts` | ✅ | ⬜ pending |
| 06-02-04 | 02 | 2 | QA-01 / D-11 | — | toggle → live overallRate/streak update | unit | `npx vitest run src/hooks/useDashboardHabits.test.ts` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 3 | ENH-03 | — | Panel shows Tasa general; hide on empty | component | `npx vitest run src/pages/DashboardPage.test.tsx` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 3 | QA-01 | T-06-01 | Dashboard error soft copy | component | `npx vitest run src/pages/DashboardPage.test.tsx` | ✅ | ⬜ pending |
| 06-03-03 | 03 | 3 | QA-01 | — | StatCards full integers >999 | component | `npx vitest run src/components/habits/StatCards.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useStreak.test.ts` — create with RED/GREEN failure-injection + basic streak read (QA-01 #2)
- [ ] `src/hooks/useHabitStats.test.ts` — create with RED/GREEN failure-injection + stats read (QA-01 #3)
- [ ] Extend `src/domain/stats.test.ts` with overall/pooled cases before or as Task 1 of Plan 01 (file exists — extend, not Wave 0 create)

*Framework already installed — no Vitest install gap.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Flame + StatCards + heatmap feel instant on device | QA-01 #1 | Subjective timing / multi-route UX | Toggle on Hoy; open Historial; confirm numbers and cells update without refresh |
| Panel rate glanceability | ENH-03 | Visual hierarchy | Open Panel with 2+ habits; confirm "Tasa general" above cards is readable |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers MISSING hook test files
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
