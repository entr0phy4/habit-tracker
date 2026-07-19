---
phase: 3
slug: dashboard-progress-visualization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** `npx vitest run <changed-test-file> -x`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-02 | 01 | 1 | VIZ-01 | unit | `npx vitest run src/domain/heatmap.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | DASH-01 | unit | `npx vitest run src/hooks/useDashboardHabits.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | DASH-01 | component | `npx vitest run src/components/layout/BottomTabBar.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | DASH-01 | component | `npx vitest run src/pages/DashboardPage.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | VIZ-01 | unit | `npx vitest run src/hooks/useHeatmapData.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 3 | VIZ-01 | component | `npx vitest run src/components/heatmap/ContributionHeatmap.test.tsx -x` | ❌ W0 | ⬜ pending |

---

## Validation Sign-Off

- [ ] All tasks have automated verify
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
