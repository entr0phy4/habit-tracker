---
phase: 8
slug: streak-freeze
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-24
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 + jsdom |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npx vitest run src/domain/streak.test.ts src/infrastructure/freezeRepository.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted `npx vitest run <changed-test-file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | ENH-05 | T-08-01 | Zod freezes + Dexie v2 | unit | `npx vitest run src/domain/backupSchema.test.ts src/infrastructure/db.test.ts` | ✅/❌ | ⬜ |
| 08-01-02 | 01 | 1 | ENH-05 | T-08-01 | Mutual exclusion + backup round-trip | unit | `npx vitest run src/infrastructure/freezeRepository.test.ts src/infrastructure/completionRepository.test.ts src/infrastructure/backupService.test.ts` | ❌/✅ | ⬜ |
| 08-02-01 | 02 | 2 | ENH-05 | T-08-03 | Bridge streak + effectiveTimes | unit | `npx vitest run src/domain/streak.test.ts` | ✅ | ⬜ |
| 08-02-02 | 02 | 2 | ENH-05 | T-08-03 | Rate exclude + WeekDayState frozen | unit | `npx vitest run src/domain/stats.test.ts src/domain/heatmap.test.ts` | ✅ | ⬜ |
| 08-03-01 | 03 | 3 | ENH-05 | — | Today hide + Omitir + heatmap cycle | hook/component | `npx vitest run src/hooks/useTodayHabits.test.ts src/components/habits/HabitRow.test.tsx src/components/heatmap/ContributionHeatmap.test.tsx` | ✅ | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Create `src/infrastructure/freezeRepository.ts` + `freezeRepository.test.ts`
- [ ] Extend existing domain/hook/component tests — files already present
- [ ] Hook call sites must compile with new `frozenDates` domain signatures

*Framework already installed — no Vitest install gap.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Omitir glanceability on mobile | ENH-05 | Touch layout | Open Hoy; confirm Snowflake ≥44px beside History; tap Omitir; row disappears |
| Frozen cell distinct from miss/complete | ENH-05 | Visual | Freeze a past day on Historial; confirm ice/dashed ≠ green ≠ red; tooltip Omitido |
| Cycle discoverability | ENH-05 | Interaction | Tap same cell 3×: complete → frozen → empty |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers missing freezeRepository test file
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
