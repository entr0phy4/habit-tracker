# Phase 8 — Source Audit

**Audited:** 2026-07-24  
**Sources:** `08-CONTEXT.md`, `08-RESEARCH.md`, `08-UI-SPEC.md`, `ROADMAP.md` Phase 8, `REQUIREMENTS.md` ENH-05

## Decision coverage

| ID | Decision | Plan coverage |
|----|----------|---------------|
| D-01 | Separate Freeze entity | 08-01 |
| D-02 | Domain name Freeze / freezes | 08-01 |
| D-03 | Mutual exclusion vs completion | 08-01 |
| D-04 | Today/past only; future rejected | 08-01 |
| D-05 | Due-day freeze for daily/weekly; any day for X/week | 08-02 (state) + 08-03 (interactivity) |
| D-06 | Today secondary Omitir | 08-03 |
| D-07 | History three-state cycle | 08-03 |
| D-08 | Hide frozen today from Hoy | 08-03 |
| D-09 | Panel cards navigation-only | 08-03 (prohibition) |
| D-10–D-13 | Bridge streak + grace | 08-02 |
| D-14 | X/week effectiveTimes streaks | 08-02 |
| D-15–D-17 | Rate exclude / effectiveTimes / pooled overall | 08-02 |
| D-18–D-21 | WeekDayState frozen + visuals/tooltip | 08-02 + 08-03 |
| D-22 | Dexie v2 freezes store | 08-01 |
| D-23–D-24 | Backup v1 freezes[] + transactional import | 08-01 |
| D-25–D-26 | Explicit unlimited; no soft caps | 08-01–08-03 prohibitions |

## ROADMAP success criteria

| SC | Criterion | Plan |
|----|-----------|------|
| 1 | Mark scheduled day skipped/frozen (today or past) | 08-03 (+ 08-01 write path) |
| 2 | Frozen does not break streak; frozen ≠ done for rate | 08-02 (+ 08-03 hooks) |
| 3 | Heatmap/history distinguishes freeze | 08-02 state + 08-03 UI |
| 4 | Export/import preserves freezes; streaks recompute | 08-01 (+ compute-on-read 08-02) |

## Requirement

| ID | Plans |
|----|-------|
| ENH-05 | 08-01, 08-02, 08-03 |

## Gaps

None — all CONTEXT decisions and ROADMAP SCs mapped.

## Deferred (explicit)

- Soft freeze monthly caps / nag → out of Phase 8  
- Auto-freeze rules → out of scope  
- Reminders → v2.0 REM-01/02
