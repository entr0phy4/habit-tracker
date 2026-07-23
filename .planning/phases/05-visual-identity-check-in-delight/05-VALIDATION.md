---
phase: 5
slug: visual-identity-check-in-delight
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-23
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 + jsdom |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- src/domain/habitColors.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted `npx vitest run <changed-test-file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ENH-01 | T-05-01 | Color normalized to `/^#[0-9a-f]{6}$/` only | unit | `npx vitest run src/domain/habitColors.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ENH-01 | T-05-01 | Missing/invalid import color → default, not XSS | unit | `npx vitest run src/domain/backupSchema.test.ts` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | ENH-01 | — | create/update persist color; Dexie v2 backfill | unit | `npx vitest run src/infrastructure/habitRepository.test.ts src/infrastructure/db.test.ts` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | ENH-01 | — | HabitForm Color radiogroup submits preset hex | component | `npx vitest run src/components/habits/HabitForm.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | ENH-01 | — | Today/Panel/heatmap/Manage show habit color | component | `npx vitest run src/components/habits/HabitRow.test.tsx src/components/dashboard/DashboardCard.test.tsx src/components/heatmap/ContributionHeatmap.test.tsx src/pages/ManageHabitsPage.test.tsx` | ✅ / ❌ W0 Manage | ⬜ pending |
| 05-03-01 | 03 | 3 | ENH-02 | — | Complete-only pulse class + resting wash; Flame retained | component | `npx vitest run src/components/habits/HabitRow.test.tsx` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 3 | ENH-02 | — | prefers-reduced-motion documented/CSS-gated | component/manual | `npx vitest run src/components/habits/HabitRow.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/domain/habitColors.test.ts` — stubs/RED for palette, normalize, heatmap theme (ENH-01)
- [ ] `src/components/habits/HabitForm.test.tsx` — stubs/RED for Color radiogroup (ENH-01)
- [ ] Extend Habit fixtures with `color` once type requires it

*Framework already installed — no Vitest install gap.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Heatmap 5-stop contrast across all 8 presets | ENH-01 | Visual luminance | Create habits in each palette color; open Historial; confirm filled cells readable on dark bg |
| Check-in pulse feels ≤200ms and pleasant | ENH-02 | Subjective motion | Toggle complete on Today; confirm brief pulse then tinted completed state |
| Reduced motion OS setting | ENH-02 | OS preference | Enable prefers-reduced-motion; toggle complete — wash applies, no pulse |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
