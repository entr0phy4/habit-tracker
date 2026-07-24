---
phase: 7
slug: flexible-weekly-frequency
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-24
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 + jsdom |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npx vitest run src/domain/schedule.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15–25 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted `npx vitest run <changed-test-file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | ENH-04 | T-07-01 | Zod rejects times∉1..7 | unit | `npx vitest run src/domain/backupSchema.test.ts` | ✅ | ✅ green |
| 07-01-02 | 01 | 1 | ENH-04 | — | Week count + isHabitDueOnDate quota | unit | `npx vitest run src/domain/dates.test.ts src/domain/schedule.test.ts` | ✅ | ✅ green |
| 07-02-01 | 02 | 2 | ENH-04 | — | Week-hit streak + in-progress grace | unit | `npx vitest run src/domain/streak.test.ts` | ✅ | ✅ green |
| 07-02-02 | 02 | 2 | ENH-04 | — | Week-cap counts; no missed state | unit | `npx vitest run src/domain/stats.test.ts` | ✅ | ✅ green |
| 07-03-01 | 03 | 3 | ENH-04 | — | Today hide/show by quota | unit | `npx vitest run src/hooks/useTodayHabits.test.ts` | ✅ | ⬜ pending |
| 07-03-02 | 03 | 3 | ENH-04 | — | Form emits times_per_week | component | `npx vitest run src/components/habits/HabitForm.test.tsx` | ✅ | ⬜ pending |
| 07-03-03 | 03 | 3 | ENH-04 | — | Quota chip vs WeekDayDots | component | `npx vitest run src/components/habits/HabitRow.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/habits/HabitRow.test.tsx` — create if missing (quota chip branch + weekday dots still render)
- [ ] Extend existing domain/hook/form tests — files already present (not Wave 0 create)
- [ ] Optional: `src/components/habits/WeekQuotaChip.test.tsx` if chip is a separate file

*Framework already installed — no Vitest install gap.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mode toggle feels clear on mobile | ENH-04 | Touch layout | Open create habit; switch Specific days ↔ Times per week; confirm 44px targets |
| Quota chip glanceability | ENH-04 | Visual | Create 3×/week habit; complete twice; confirm `2/3` on Hoy then hide after third |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers missing HabitRow test file
- [x] No watch-mode flags
- [x] Feedback latency < 25s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
