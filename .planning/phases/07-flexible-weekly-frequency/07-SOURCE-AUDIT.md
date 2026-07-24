# Phase 7 — Source Audit

**Audited:** 2026-07-24  
**Sources:** `07-CONTEXT.md`, `07-RESEARCH.md`, `07-UI-SPEC.md`, `ROADMAP.md` Phase 7, `REQUIREMENTS.md` ENH-04

## Decision coverage

| ID | Decision | Plan coverage |
|----|----------|---------------|
| D-01 | `times_per_week` Frequency variant | 07-01 |
| D-02 | daily/weekly unchanged; times:7 ≠ daily | 07-01 |
| D-03 | Mutually exclusive form modes | 07-03 |
| D-04 | Mon–Sun week | 07-01 (dates) |
| D-05 | Due while week completions &lt; times | 07-01 + 07-03 |
| D-06 | Hide from Today when met | 07-03 |
| D-07 | Over-complete allowed; rate caps | 07-02 |
| D-08 | Completions-aware due helper | 07-01 |
| D-09–D-13 | Week-hit streaks + grace | 07-02 |
| D-14–D-15 | Week-cap rate + pooled overall | 07-02 |
| D-16 | Heatmap never missed for X/week | 07-02 |
| D-17 | HabitForm mode + default daily | 07-03 |
| D-18 | Quota chip vs WeekDayDots | 07-03 |
| D-19 | Edit convert + recompute on read | 07-03 (form) + existing hooks |
| D-20–D-21 | Backup v1 + Zod 1..7 | 07-01 |

## ROADMAP success criteria

| SC | Criterion | Plan |
|----|-----------|------|
| 1 | Create/edit X×/week | 07-03 |
| 2 | Today due by remaining weekly quota | 07-01 + 07-03 |
| 3 | Streak + rate respect weekly quota | 07-02 |
| 4 | Export/import round-trip | 07-01 |

## Requirement

| ID | Plans |
|----|-------|
| ENH-04 | 07-01, 07-02, 07-03 |

## Gaps

None — all CONTEXT decisions and ROADMAP SCs mapped.

## Deferred (explicit)

- ENH-05 streak freeze → Phase 8  
- Interval schedules / reminders → out of v1.1 / v2.0
