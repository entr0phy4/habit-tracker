---
phase: 1
slug: habit-management-daily-logging
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` (test block) — Wave 0 installs |
| **Quick run command** | `npx vitest run src/domain` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/domain`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | DATA-01 | — | N/A | integration | `npx vitest run src/infrastructure/db.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 0 | HABT-01 | — | N/A | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 0 | LOG-01 | — | N/A | integration | `npx vitest run src/infrastructure/completionRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | LOG-03 | — | N/A | unit | `npx vitest run src/domain/schedule.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | HABT-01 | T-01-01 | Trim/max-length habit names | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | HABT-02 | — | N/A | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | HABT-03 | — | N/A | integration | `npx vitest run src/infrastructure/habitRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | LOG-01 | — | N/A | integration | `npx vitest run src/infrastructure/completionRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 4 | LOG-02 | — | N/A | integration | `npx vitest run src/infrastructure/completionRepository.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | UI-02 | — | Row min-height 44px | component | `npx vitest run src/components/habits/HabitRow.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 3 | UI-01 | — | Dark theme on root | manual | Visual UAT | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vite.config.ts` — add `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`
- [ ] `src/test/setup.ts` — fake-indexeddb + Dexie.dependencies
- [ ] `src/domain/dates.test.ts` — `yyyy-MM-dd` format, no UTC bug
- [ ] `src/domain/schedule.test.ts` — daily + Mon/Wed/Fri due logic
- [ ] `src/infrastructure/habitRepository.test.ts` — CRUD + archive
- [ ] `src/infrastructure/completionRepository.test.ts` — toggle + future-date reject
- [ ] Framework install: `npm install -D vitest @testing-library/react fake-indexeddb jsdom`
- [ ] Project scaffold: `npx shadcn@latest init -t vite` (entire app shell)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode aesthetic | UI-01 | Visual design judgment | Open app; confirm dark background, muted text, green accent on completion |
| Mobile swipe-to-complete | LOG-01 | Touch gesture | On mobile viewport, swipe right on habit row; confirm completion toggle |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
