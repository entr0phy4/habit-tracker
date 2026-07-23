# Phase 5 — Plan Check

**Checked:** 2026-07-23  
**Phase:** 05-visual-identity-check-in-delight  
**Plans verified:** 05-01, 05-02, 05-03  
**Stance:** Adversarial — flawed until proven  

---

## Phase goal (ROADMAP)

Users can tell habits apart by color and feel a satisfying reward when they check in.

**Requirements:** ENH-01, ENH-02  

**Success criteria:**
1. Pick color on create/edit  
2. Today / Panel / heatmap accents reflect habit color  
3. Check-in color-fill and/or micro-animation beyond Flame  
4. Readable contrast on dark UI  

---

## Coverage Summary

| Requirement | Plans frontmatter | Covering tasks | Status |
|-------------|-------------------|----------------|--------|
| ENH-01 | 05-01, 05-02 | 01 T1–T3 (data), 02 T1–T2 (form + surfaces) | Covered |
| ENH-02 | 05-03 | 03 T1–T2 (CSS + HabitRow delight) | Covered |

| Success criterion | Addressed by | Status |
|-------------------|--------------|--------|
| SC1 Pick color create/edit | 05-02 T1 | Covered |
| SC2 Today / Panel / heatmap accents | 05-02 T2 (+ Manage swatch D-12) | Covered |
| SC3 Color-fill + micro-animation + Flame | 05-03 T1–T2 | Covered |
| SC4 Contrast on dark UI | 05-01 palette/theme + 05-02 presets; manual UAT in VALIDATION | Covered |

| CONTEXT decision | Plan coverage | Status |
|------------------|---------------|--------|
| D-01 … D-05, D-03, D-04, D-08 (persist), D-18 theme helper | 05-01 | Covered |
| D-06 … D-12, D-19, D-08 (form wire) | 05-02 | Covered |
| D-13 … D-17 | 05-03 | Covered |
| Deferred (free-form hex, Lottie/confetti, FAB tint, ENH-03/04/05) | Explicit prohibitions / out of scope | Excluded ✓ |

---

## Plan Summary

| Plan | Tasks | Files (declared) | Wave | depends_on | Threat model | Status |
|------|-------|------------------|------|------------|--------------|--------|
| 05-01 | 3 | 9 | 1 | [] | Present (T-05-01…04) | Valid structure; contract conflict below |
| 05-02 | 2 | 14 | 2 | 05-01 | Present (T-05-01, 04, 05) | Valid structure; scope + wiring clarity |
| 05-03 | 2 | 3 | 3 | 05-02 | Present (T-05-01, 06, 07) | Valid |

**Dependency graph:** 01 → 02 → 03 — acyclic, wave numbers consistent with prior-phase `depends_on: ["NN-0M"]` convention.

**Color wiring (intended):**  
`habitColors` → types/Dexie/Zod/repo (01) → HabitForm/create/edit (02) → HabitRow / DashboardCard / Heatmap / Manage (02) → check-in CSS wash/pulse (03).  
Pipeline is planned; heatmap theme **shape** is not locked consistently (blocker).

---

## Dimension results

### 1. Requirement coverage — PASS
ENH-01 and ENH-02 appear in plan frontmatter and have concrete tasks.

### 2. Success criteria — PASS
All four ROADMAP truths map to tasks/must_haves (SC4 via presets + `buildHeatmapTheme` empty/peak + manual contrast UAT).

### 3. Context compliance (D-01…D-19) — PASS (with contract warning)
Locked decisions are referenced in actions/acceptance. Deferred Phase 6–8 / free-form / animation-lib items are prohibited, not implemented.

### 4. Task quality — PASS (structure)
All auto/tdd tasks include `files`, `read_first`, `acceptance_criteria`, `action`, `<verify><automated>`, `done`. must_haves present on all plans.

### 5. Dependency waves — PASS
Linear 1→2→3; no cycles; no forward refs.

### 6. Wiring — FAIL (blocker)
Domain → repo → form → surfaces → animation is described, but **`buildHeatmapTheme` return contract conflicts** across authoritative artifacts the executor will read:

| Source | Contract |
|--------|----------|
| 05-01 PLAN behavior / AC / must_haves | `{ dark: string[] }` |
| 05-PATTERNS.md + 05-RESEARCH.md | `{ dark: string[] }`; `theme={buildHeatmapTheme(...)}` |
| 05-UI-SPEC.md domain helper table | `string[]` |
| 05-UI-SPEC.md ContributionHeatmap | `theme={{ dark: buildHeatmapTheme(color), light: buildHeatmapTheme(color) }}` |

Plan 02 T2 `read_first` lists **UI-SPEC** but **not PATTERNS**, so the executor can wire nested/`string[]` incorrectly against Plan 01’s object return → broken heatmap or type errors. Plan 01 T2 also says implement “per UI-SPEC domain helper table,” contradicting T1’s `{ dark: string[] }` RED contract.

### 7. Nyquist / VALIDATION — PASS
VALIDATION.md exists; `nyquist_validation: true`. Every task has `<automated>` (no MISSING stubs). No watch-mode. Sampling: Wave 1 3/3, Wave 2 2/2, Wave 3 2/2 automated. Wave 0 files created as RED tasks inside 01-T1 and 02-T1 (aligned with VALIDATION W0 list).

| Task | Plan | Wave | Automated Command | Status |
|------|------|------|-------------------|--------|
| T1 RED habitColors | 01 | 1 | `npm test -- …habitColors.test.ts` (expect FAIL) | ✅ |
| T2 GREEN habitColors | 01 | 1 | `npx vitest run …habitColors.test.ts -x` | ✅ |
| T3 persist/Dexie/Zod | 01 | 1 | vitest domain + infra suite | ✅ |
| T1 HabitForm | 02 | 2 | `npx vitest run …HabitForm.test.tsx -x` | ✅ |
| T2 surfaces | 02 | 2 | HabitRow/WeekDayDots/DashboardCard/Heatmap tests | ✅ |
| T1 CSS keyframes | 03 | 3 | `rg` keyframes + reduced-motion | ✅ |
| T2 HabitRow delight | 03 | 3 | HabitRow tests + `npm test` | ✅ |

### 8. Threat models — PASS
All three plans include STRIDE registers; T-05-01 (hex normalize before style) flows 01→02→03.

### 9. Scope creep Phase 6–8 — PASS
No overall completion rate, X/week frequency, or streak freeze work. Deferred items excluded.

### 10. Cross-plan data contracts — FAIL (blocker)
Same as Dimension 6: Plan 01 output shape of `buildHeatmapTheme` vs Plan 02/UI-SPEC consumption incompatible without an explicit lock.

### 11. Architectural tier — PASS
Domain helpers / Dexie / Zod / client UI / local HabitRow animation match RESEARCH responsibility map.

### 12. Research resolution — WARNING
`## Open Questions` lacks `(RESOLVED)` suffix; items are answered in prose but not marked `RESOLVED` per Dimension 11 convention.

### 13. CLAUDE.md compliance — SKIPPED
No `./CLAUDE.md` in workspace.

### 14. Scope sanity — WARNING
Plan 02 declares **14** files (warning threshold ≥10, blocker ≥15). Plan 01 T3 implies broader Habit fixture churn than `files_modified` lists.

---

## Issues

### Blockers (must fix before execution)

```yaml
issues:
  - plan: "05-01 / 05-02"
    dimension: cross_plan_data_contracts
    severity: blocker
    description: >
      buildHeatmapTheme return type is inconsistent. Plan 01 + PATTERNS + RESEARCH
      specify `{ dark: string[] }` and `theme={theme}`. UI-SPEC specifies `string[]`
      and `theme={{ dark: buildHeatmapTheme(color), light: buildHeatmapTheme(color) }}`.
      Plan 01 Task 2 action points at the UI-SPEC helper table; Plan 02 Task 2
      read_first prioritizes UI-SPEC over PATTERNS. Executor can ship a nested or
      wrong-shaped theme and break ContributionHeatmap (D-11 / SC2).
    fix_hint: >
      Lock one contract everywhere: prefer `{ dark: string[] }` (matches existing
      heatmapTheme object and PATTERNS). Update 05-UI-SPEC domain helper + heatmap
      theme lines to match. In 05-02 Task 2 acceptance_criteria, require exact wiring
      e.g. `const theme = buildHeatmapTheme(normalizeHabitColor(color)); theme={theme}`
      (add light only if ActivityCalendar requires it). Add 05-PATTERNS.md to Plan 02
      Task 2 read_first. Remove Plan 01 Task 2 “UI-SPEC domain helper table” wording
      that implies string[].
```

### Warnings (should fix; execution can proceed after blocker)

```yaml
  - plan: "05-02"
    dimension: scope_sanity
    severity: warning
    description: "Plan 02 lists 14 files_modified (warning band ≥10)."
    metrics:
      tasks: 2
      files: 14
    fix_hint: "Optional split form wire (T1) vs surfaces (already T2) is fine; consider noting fixture-only files separately or accept as dense UI wave."

  - plan: "05-01"
    dimension: scope_sanity
    severity: warning
    description: >
      Task 3 requires grepping/fixing Habit fixtures across the suite, but
      files_modified omits many consumers (hooks/*, backupService.test, walkingSkeleton, etc.).
    fix_hint: "Expand files_modified to expected fixture touch list, or add explicit 'any Habit fixture test file' note in frontmatter."

  - plan: "05-02"
    dimension: verification_derivation
    severity: warning
    description: >
      D-12 ManageHabitsPage swatch has no automated test file; VALIDATION row 05-02-02
      claims Manage coverage but automated command only runs Row/Card/Heatmap tests.
    fix_hint: "Add ManageHabitsPage.test.tsx assertions or drop Manage from that VALIDATION automated claim and keep manual smoke only."

  - plan: null
    dimension: research_resolution
    severity: warning
    description: "05-RESEARCH.md ## Open Questions is resolved in prose but heading lacks (RESOLVED) and inline RESOLVED markers."
    fix_hint: "Rename to ## Open Questions (RESOLVED) for Nyquist/research gate hygiene."

  - plan: null
    dimension: pattern_compliance
    severity: warning
    description: >
      UI-SPEC normalizeHabitColor says 'Valid preset hex or default'; Plan 01/PATTERNS
      accept any /^#[0-9a-f]{6}$/. CONTEXT D-04 aligns with Plan 01 (invalid hex → default).
    fix_hint: "Align UI-SPEC helper table with Plan 01 (any lowercase #RRGGBB) or intentionally restrict to preset set in normalizeHabitColor + tests."

  - plan: "05-02"
    dimension: key_links_planned
    severity: warning
    description: "must_haves.key_links omit ManageHabitsPage ← habit.color though D-12 is in truths/tasks."
    fix_hint: "Add key_link for Manage swatch for verifier symmetry."
```

---

## What passes cleanly

- ENH-01/ENH-02 requirement IDs in frontmatter + tasks  
- D-01…D-19 mapped; deferred excluded  
- Threat models on all plans  
- Nyquist automated verifies + VALIDATION alignment  
- No Phase 6–8 scope creep  
- Form→repo→surfaces→animation sequencing is otherwise sound  
- HabitNewPage needs no edit if `useCreateHabit` forwards `HabitFormValues.color` (create page already passes full values)

---

## Required revisions (for REVISE)

1. **Reconcile `buildHeatmapTheme` contract** across 05-UI-SPEC, 05-01, 05-02 acceptance, and PATTERNS — single return type + exact `ContributionHeatmap` `theme={…}` wiring.  
2. **Plan 02 Task 2:** add PATTERNS (or locked snippet) to `read_first`; state theme assignment in `acceptance_criteria`.  
3. **Plan 01 Task 2:** stop citing UI-SPEC helper table as `string[]` until UI-SPEC is fixed (or change Plan 01 to match a revised UI-SPEC — pick one).  

Optional (warnings): expand fixture file list; Manage automated coverage; mark RESEARCH Open Questions (RESOLVED); align normalize preset vs any-hex wording.

---

## VERDICT: REVISE

**Blockers:** 1 (`buildHeatmapTheme` / heatmap theme wiring contract)  
**Warnings:** 6  

Do not execute Phase 5 until the heatmap theme contract is locked in plans + UI-SPEC. After revision, re-run plan-check.
