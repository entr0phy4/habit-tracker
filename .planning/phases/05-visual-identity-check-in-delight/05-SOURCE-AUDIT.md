# Phase 5 — Source Audit

**Audited:** 2026-07-23  
**Plans:** 05-01, 05-02, 05-03  
**Result:** All GOAL / REQ / RESEARCH / CONTEXT items COVERED (deferred exclusions noted)

---

## GOAL (ROADMAP Phase 5)

| Item | Status | Plan |
|------|--------|------|
| Users can tell habits apart by color | COVERED | 05-01 + 05-02 |
| Feel a satisfying reward when they check in | COVERED | 05-03 |
| SC1: Pick color on create/edit | COVERED | 05-02 |
| SC2: Today / Panel / heatmap accents | COVERED | 05-02 |
| SC3: Color-fill and/or micro-animation + Flame | COVERED | 05-03 |
| SC4: Readable contrast on dark UI | COVERED | 05-01 (palette + theme) + 05-02 (presets on surfaces) |

---

## REQ (REQUIREMENTS.md)

| ID | Status | Plan |
|----|--------|------|
| ENH-01 | COVERED | 05-01 (data), 05-02 (UI + surfaces) |
| ENH-02 | COVERED | 05-03 |
| ENH-03 / ENH-04 / ENH-05 / QA-01 | EXCLUDED | Other phases (deferred) |

---

## RESEARCH (constraints & features in-scope)

| Item | Status | Plan |
|------|--------|------|
| habitColors.ts palette + normalize + heatmap theme | COVERED | 05-01 |
| Habit.color + Dexie v2 backfill | COVERED | 05-01 |
| Backup v1 optional color normalize | COVERED | 05-01 |
| Repository create/update color | COVERED | 05-01 |
| HabitForm radiogroup + create/edit wire | COVERED | 05-02 |
| Surface accents (Row/Card/Heatmap/Manage) | COVERED | 05-02 |
| CSS check-in pulse + resting wash + reduced-motion | COVERED | 05-03 |
| No new npm packages / no framer-motion | COVERED | All plans (prohibitions) |
| Wave 0 habitColors.test.ts | COVERED | 05-01 Task 1 |
| Wave 0 HabitForm.test.tsx | COVERED | 05-02 Task 1 |
| T-05-01 normalize hex before style | COVERED | 05-01 / 05-02 / 05-03 threat models |

---

## CONTEXT (D-01 … D-19)

| ID | Decision (short) | Status | Plan / Task |
|----|------------------|--------|-------------|
| D-01 | Required `color` `#RRGGBB` lowercase | COVERED | 05-01 T2 |
| D-02 | Default `#3fb950` | COVERED | 05-01 T2–T3 |
| D-03 | Dexie `version(2)` backfill | COVERED | 05-01 T3 |
| D-04 | Backup `version: 1` optional color normalize | COVERED | 05-01 T3 |
| D-05 | 8 preset swatches | COVERED | 05-01 T1–T2; UI in 05-02 T1 |
| D-06 | HabitForm Color radiogroup | COVERED | 05-02 T1 |
| D-07 | English label **"Color"** | COVERED | 05-02 T1 |
| D-08 | Wire create/update color | COVERED | 05-01 T3 (repo); 05-02 T1 (form/hooks/edit) |
| D-09 | HabitRow accent / dots / swipe | COVERED | 05-02 T2 |
| D-10 | DashboardCard bar + Flame tint | COVERED | 05-02 T2 |
| D-11 | Heatmap per-habit theme + strokes | COVERED | 05-02 T2 |
| D-12 | ManageHabitsPage swatch | COVERED | 05-02 T2 |
| D-13 | Complete-only ≤200ms pulse + wash | COVERED | 05-03 T1–T2 |
| D-14 | Resting completed habit wash | COVERED | 05-03 T2 |
| D-15 | Flame retained | COVERED | 05-03 T2 |
| D-16 | `prefers-reduced-motion` | COVERED | 05-03 T1–T2 |
| D-17 | CSS only — no framer-motion | COVERED | 05-03 T1–T2 |
| D-18 | Contrast; empty `#21262d` | COVERED | 05-01 T2 (`buildHeatmapTheme`); 05-02 T2 |
| D-19 | Swatch hit area ≥44×44 | COVERED | 05-02 T1 |

### Deferred (CONTEXT) — correctly NOT planned

| Item | Status |
|------|--------|
| Free-form hex / color wheel | EXCLUDED |
| Animated flame / Lottie / confetti / haptics | EXCLUDED |
| Light-mode palette variants | EXCLUDED |
| Per-habit color on FAB / tab bar | EXCLUDED |
| ENH-03 / ENH-04 / ENH-05 | EXCLUDED (Phases 6–8) |

---

## Coverage verdict

**All in-scope GOAL, REQ, RESEARCH, and CONTEXT (D-01–D-19) items: COVERED.**
