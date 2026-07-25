# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Motivation Polish & Flexibility

**Shipped:** 2026-07-25  
**Phases:** 4 | **Plans:** 12 | **Sessions:** multi-day (2026-07-23 → 2026-07-25)

### What Was Built
- Habit color domain + picker accents on Hoy / Panel / heatmap; CSS check-in pulse
- Pooled overall completion rate (“Tasa general”) with QUERY_ERROR-safe hooks
- `times_per_week` schedules, week quota due, week-hit streaks, WeekQuotaChip
- Freeze entity (Dexie v2), streak bridge, Omitir + frozen heatmap cells, backup `freezes[]`

### What Worked
- Wave-per-layer plans (domain → hooks → UI) kept each phase shippable in ~3 plans
- Additive backup v1 + Dexie schema bumps (v2 for freezes) avoided breaking restore
- UI-SPEC + discuss-phase context kept Spanish copy and dark aesthetic consistent
- Conventional commits in Spanish aligned with repo norms

### What Was Inefficient
- `*-PLAN-CHECK.md` files were counted as plans by some GSD queries (4 vs 3), muddying progress/manager readiness
- STATE.md phase tables lagged behind completed plans (Phase 8 still showed 0/3 after execution)
- Human UAT for Phases 5–6 never finished before close — forced `override_closeout`
- No `v1.1-MILESTONE-AUDIT.md` before complete — audit step skipped under time pressure

### Patterns Established
- Separate domain entities for schedule edge cases (Freeze) rather than overloading completions
- Pooled rates over mean-of-rates for multi-habit aggregates
- Heatmap as multi-state cycle (done / undone / frozen) with mutual exclusion in repos
- Milestone phase dirs archived under `milestones/vX.Y-phases/` while v1.0 dirs stay for numbering

### Key Lessons
1. Finish or explicitly defer human UAT before `/gsd-complete-milestone` to keep `verified_closeout`
2. Keep plan filenames strictly `NN-MM-PLAN.md` so tooling counts stay accurate
3. Freeze/skip must stay explicit and excluded from “done” rates or streak psychology erodes
4. Additive Zod backup unions + schema version bumps scale better than silent field reuse

### Cost Observations
- Model mix: adaptive profile (mixed)
- Timeline: ~3 calendar days for 4 phases / 12 plans after v1.0
- Notable: Phase 8 execution was fast once CONTEXT/UI-SPEC locked; planning/discuss still dominated calendar time

---

## Milestone: v1.0 — Habit Tracker MVP

**Shipped:** 2026-07-23  
**Phases:** 4 | **Plans:** 16

### What Was Built
- Local-first habit CRUD, today check-in, schedule-aware streaks, Panel + heatmap, JSON backup

### What Worked
- Dexie + compute-on-read streaks; shadcn + Tailwind dark tokens; Zod-validated export/import

### Key Lessons
1. Accept residual human UAT only with explicit carry-forward (Phase 2 → v1.1 QA-01)
2. Core value (“one tap / one glance”) is a useful scope filter against reminders/sync creep

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multi-day | 4 | Established local-first SPA + GSD phase flow |
| v1.1 | ~3 days | 4 | Archive phases on close; override_closeout for leftover UAT |

### Cumulative Quality

| Milestone | Tests | Coverage | Notes |
|-----------|-------|----------|-------|
| v1.0 | 121 | — | Green at close |
| v1.1 | 210 | — | Green at close; +freeze / X-week / color coverage |

### Top Lessons (Verified Across Milestones)

1. Explicit deferrals beat silent incomplete UAT — document in STATE / MILESTONES
2. Additive schema + backup versioning protects local-first users across milestones
3. Keep reminders/PWA out until a dedicated milestone or product pull is clear
