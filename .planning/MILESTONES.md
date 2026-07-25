# Milestones

## v1.1 — Motivation Polish & Flexibility (Complete)

**Shipped:** 2026-07-25  
**Tag:** `v1.1.0`  
**Phases:** 5–8 (12 plans)  
**Closeout type:** `override_closeout`

Habit colors, check-in micro-rewards, Panel overall completion rate (“Tasa general”), X×/week frequency with week-aware streaks, and explicit streak freeze/skip (Omitir + heatmap ice cells). Local-first backup remains version 1 with additive `freezes[]`.

**Requirements shipped:** ENH-01..05 · QA-01 (6/6)

**Key accomplishments:**

- Curated habit colors + check-in color-fill / pulse rewards across Hoy, Panel, and heatmap (Phases 5)
- Pooled lifetime overall completion rate on Panel with QUERY_ERROR-safe streak/stats hooks (Phase 6)
- `times_per_week` frequency, Mon–Sun quota due, week-hit streaks, WeekQuotaChip UI (Phase 7)
- Separate Freeze entity (Dexie v2), bridge-without-increment streaks, Today Omitir + three-state heatmap cycle (Phase 8)

**Archive:** `.planning/milestones/v1.1-ROADMAP.md` · `v1.1-REQUIREMENTS.md` · `v1.1-phases/`

**Known verification overrides** (4 — see STATE.md Deferred Items):

| Item | Status |
|------|--------|
| 05-UAT.md | pending (manual visual checks) |
| 06-UAT.md | testing (3 pending Panel rate scenarios) |
| 01-VERIFICATION.md | human_needed (v1.0 carry-forward) |
| 02-VERIFICATION.md | human_needed (v1.0 carry-forward) |

**Git:** 23 commits since `v1.0.0` · ~9.7k insertions · suite 210 tests green at close

---

## v1.0 — Habit Tracker MVP (Complete)

**Shipped:** 2026-07-23  
**Tag:** `v1.0.0`  
**Phases:** 1–4 (16 plans)

Local-first habit tracker: create habits, one-tap today check-in, schedule-aware streaks, Panel dashboard + contribution heatmap, JSON export/import.

**Requirements shipped:** HABT-01..03 · LOG-01..03 · STRK-01..04 · VIZ-01 · DASH-01 · DATA-01..03 · UI-01..02 (17/17)

**Archive:** `.planning/milestones/v1.0-MILESTONE.md`  
**Phase dirs:** `.planning/phases/01-*` … `04-*` (retained; numbering continues)

**Carry-forward at close:**

- Phase 2 human UAT residual (4 tests) → addressed in product via v1.1 QA-01 (manual UAT still deferred)
- REM-01/02 → v2.0+
- ENH-01..05 → shipped in v1.1
