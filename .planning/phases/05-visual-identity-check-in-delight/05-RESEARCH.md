# Phase 5: Visual Identity & Check-in Delight - Research

**Researched:** 2026-07-23
**Domain:** Per-habit color persistence, surface accenting, CSS micro-animation check-in reward
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Color Data Model & Persistence
- **D-01:** Add required `color: string` on `Habit` — hex format `#RRGGBB` (lowercase)
- **D-02:** Default color for new habits and Dexie backfill is current primary `#3fb950` (GitHub green) so existing UI remains familiar
- **D-03:** Dexie schema bump to `version(2)` with upgrade that sets `color: '#3fb950'` on every habit missing `color`
- **D-04:** Keep backup `version: 1` for compatibility — Zod `habitSchema` accepts optional `color` and normalizes missing/invalid to `#3fb950` on parse so old exports still import
- **D-05:** Preset palette only (no free-form hex input in v1.1) — 8 swatches with dark-UI contrast:

  | Id | Hex | Role |
  |----|-----|------|
  | green | `#3fb950` | Default / primary |
  | teal | `#39d2c0` | Cool accent |
  | blue | `#58a6ff` | Cool accent |
  | purple | `#bc8cff` | Cool accent (one purple only) |
  | pink | `#f778ba` | Warm accent |
  | orange | `#db6d28` | Warm accent |
  | yellow | `#d29922` | Warm accent |
  | red | `#f85149` | Distinct from destructive buttons (habit identity only) |

#### Color Picker UI (Create/Edit)
- **D-06:** Color picker lives in shared `HabitForm` as a row of circular swatches (`role="radiogroup"`) — selected state uses ring matching the swatch color
- **D-07:** Copy remains English on forms (match existing HabitForm): label **"Color"**; Spanish chrome elsewhere unchanged
- **D-08:** Wire color through `HabitFormValues` → `useCreateHabit` / `habitRepository.create` and edit → `habitRepository.update` (`Partial<Pick<Habit, 'name' | 'frequency' | 'archived' | 'color'>>`)

#### Surface Coloring (ENH-01)
- **D-09:** `HabitRow` (Today): left accent bar (3–4px) in habit color; week dots and swipe-reveal strip use habit color instead of global `--primary` when the habit has a color
- **D-10:** `DashboardCard` (Panel): left accent bar + `Flame` icon tinted with habit color
- **D-11:** `ContributionHeatmap`: build a 5-stop dark theme scale from the habit's hex (empty → full) and pass as `theme.dark`; today/missed stroke accents use habit color / `--destructive` respectively
- **D-12:** `ManageHabitsPage` list: small color swatch beside habit name (read-only identity cue)

#### Check-in Delight (ENH-02)
- **D-13:** On toggle to **complete** (not uncomplete): HabitRow plays a one-shot CSS micro-animation ≤200ms (scale pulse + color wash fill using habit color at ~15–25% opacity background)
- **D-14:** Completed resting state keeps muted/strikethrough text treatment from Phase 1, but row background wash uses habit color at low opacity instead of plain `--muted` alone
- **D-15:** Existing `Flame` streak badge stays; animation does not replace it
- **D-16:** Respect `prefers-reduced-motion: reduce` — skip keyframe animation; still apply completed color wash instantly
- **D-17:** No new animation library (no framer-motion) — CSS `@keyframes` + Tailwind/utility classes only

#### Contrast & Accessibility
- **D-18:** Palette colors must meet readable contrast as accents on `#0d1117` / `#161b22` surfaces; empty heatmap cell stays `#21262d`; filled cells use generated darker→brighter stops of the habit hue
- **D-19:** Touch targets for swatches ≥44×44px hit area (visual circle may be smaller)

### Claude's Discretion
- Exact 5-stop heatmap hex derivation algorithm (HSL lighten/darken vs fixed opacity overlays)
- Exact keyframe names and easing for check-in animation
- Whether ManageHabitsPage swatch is 8px or 12px diameter
- Whether DashboardCard also tints card border or only left bar + flame
- Shared helper location (`src/domain/habitColors.ts` vs `src/lib/colors.ts`) — prefer domain pure helper for palette + theme scale

### Deferred Ideas (OUT OF SCOPE)
- Free-form custom hex / color wheel
- Animated flame / Lottie / confetti / haptic APIs
- Light mode theme variants of palette
- Per-habit color on FAB or tab bar (global chrome stays `--primary`)
- ENH-03 overall completion rate (Phase 6)
- ENH-04 X/week frequency (Phase 7)
- ENH-05 streak freeze (Phase 8)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENH-01 | User can assign a custom color to each habit | Preset palette + `Habit.color`; Dexie v2 backfill; HabitForm swatch radiogroup; wire create/update; accent surfaces on HabitRow, DashboardCard, ContributionHeatmap, ManageHabitsPage |
| ENH-02 | User gets streak visual rewards (color fill, micro-animation) on check-in beyond the existing flame badge | HabitRow one-shot CSS pulse + color wash on complete only; resting tinted completed state; Flame badge retained; `prefers-reduced-motion` skips keyframes |
</phase_requirements>

## Summary

Phase 5 personalizes habit identity with a required `#RRGGBB` color and rewards Today check-ins with a short CSS color-fill animation. No new npm dependencies: reuse Tailwind/CSS keyframes, existing Dexie/Zod/React surfaces, and `react-activity-calendar`'s `theme.dark` prop. The hard constraint is **data compatibility** — Dexie bumps to `version(2)` with a backfill, but backup JSON stays `version: 1` with optional `color` normalized to `#3fb950` so Phase 4 exports keep importing.

Color flows as a pure domain concern (`habitColors.ts` palette + heatmap scale + normalize) → repository create/update → form values → presentational style props on Today/Panel/Historial/Manage. Check-in delight is local UI state in `HabitRow` on the incomplete→complete edge; the Flame badge from Phase 2 is untouched.

**Primary recommendation:** Add `src/domain/habitColors.ts` (palette + `normalizeHabitColor` + `buildHeatmapTheme`), bump Dexie to v2 with green backfill, extend Zod/Habit/repo/form without bumping backup version, then paint accents and CSS-only check-in animation on HabitRow — no framer-motion.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Palette constants + hex normalize + 5-stop theme | Domain | — | Pure functions; unit-testable; no Dexie/React |
| `Habit.color` persistence + Dexie v2 upgrade | Database / Storage (Infrastructure) | Domain (default hex) | Schema migration + create/update writes |
| Backup parse accepts optional color | Domain | Infrastructure (import write) | Keep `version: 1`; normalize on Zod parse before bulkAdd |
| Color picker (swatches) | Browser / Client | Domain (palette list) | HabitForm only; English label |
| Surface accents (row/card/heatmap/manage) | Browser / Client | Domain (theme helper) | Style from `habit.color`; global chrome stays `--primary` |
| Check-in micro-animation | Browser / Client | — | Local HabitRow state + CSS; no store |

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS `@keyframes` + Tailwind utilities | via `tailwindcss@4.3.3` / `src/index.css` | Check-in pulse + wash | Locked D-17; matches existing `active:scale-[0.98]` motion [VERIFIED: codebase] |
| `dexie` | 4.4.4 | `version(2).upgrade` backfill | Existing IndexedDB layer [VERIFIED: package.json] |
| `zod` | 4.4.3 | Optional `color` on habitSchema + normalize | Existing backup validation [VERIFIED: package.json] |
| `react-activity-calendar` | 3.2.1 | Per-habit `theme={{ dark: [...] }}` | Already used; theme prop accepts 5-stop dark scale [VERIFIED: codebase + CITED: Phase 3 UI-SPEC] |
| `lucide-react` | 1.25.0 | `Flame` tint via inline `style` / class | Existing streak badge [VERIFIED: package.json] |
| `@testing-library/react` + `vitest` | 16.3.2 / 4.1.10 | Form + row + heatmap tests | Established harness [VERIFIED: package.json] |
| `fake-indexeddb` | 6.2.5 | Dexie upgrade + repo tests | Existing pattern [VERIFIED: package.json] |

### Supporting

| Library / Asset | Version | Purpose | When to Use |
|-----------------|---------|---------|-------------|
| Existing `cn()` (`clsx` + `tailwind-merge`) | installed | Conditional animation / completed classes | HabitRow resting + pulse classes |
| `matchMedia('(prefers-reduced-motion: reduce)')` | browser | Skip keyframes (D-16) | HabitRow animation gate or CSS media query |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| `framer-motion` / Lottie / confetti | Explicitly forbidden (D-17 / deferred) |
| Free-form `<input type="color">` | Deferred; presets keep contrast safe (D-05) |
| Bump backup `version` to 2 | Breaks Phase 4 exports; D-04 keeps v1 + optional color |
| Index `color` in Dexie stores | Never queried by color; indexes unchanged [ASSUMED: no product need to filter-by-color] |
| Put helpers in `src/lib/colors.ts` | CONTEXT prefers domain pure helper beside `heatmap.ts` / `streak.ts` |

**Installation:**

```bash
# None — Phase 5 uses existing dependencies only
```

**Package legitimacy:** N/A — no new packages. Disposition: no install audit required.

## Project Constraints (non-negotiable)

- Local-first only — color lives on `Habit` in IndexedDB; no sync/auth
- Backup `version` stays `1` (D-04); never reject old exports for missing `color`
- Preset palette only; validate imported colors as `#RRGGBB` lowercase or fall back to default
- Global FAB / tab bar / form submit stay `--primary` `#3fb950` — personalization is per-habit surfaces only
- Touch targets ≥44×44px for swatches (D-19) and existing row/card targets
- Motion ≤200ms; honor `prefers-reduced-motion: reduce` (D-13, D-16)
- Spanish chrome elsewhere unchanged; HabitForm label **"Color"** in English (D-07)

## Architecture Patterns

### System Architecture Diagram

```text
[Create/Edit HabitForm swatches]
        │ HabitFormValues.color (#RRGGBB)
        ▼
[useCreateHabit / habitRepository.create|update]
        │ writes Habit.color
        ▼
[Dexie habits table] ◄── version(2) upgrade backfill '#3fb950'
        │
        ├── useLiveQuery / Today / Panel / History / Manage
        │         │
        │         ├── HabitRow ──────── style accents + check-in CSS
        │         ├── DashboardCard ─── left bar + Flame tint
        │         ├── ContributionHeatmap ← buildHeatmapTheme(color)
        │         └── ManageHabitsPage ─ read-only swatch
        │
        └── exportBackup / parseBackupJson
                  │ optional color → normalizeHabitColor
                  └── importBackup bulkAdd (still version: 1)
```

### Recommended Project Structure (delta)

```
src/
├── domain/
│   ├── habitColors.ts          # NEW — palette, normalize, heatmap theme
│   ├── habitColors.test.ts     # NEW
│   ├── types.ts                # Habit.color required
│   └── backupSchema.ts         # optional color + normalize
├── infrastructure/
│   ├── db.ts                   # version(2).upgrade backfill
│   └── habitRepository.ts      # create/update include color
├── components/habits/
│   ├── HabitForm.tsx           # Color radiogroup
│   ├── HabitRow.tsx            # accents + animation
│   └── WeekDayDots.tsx         # accept accent color prop
├── components/dashboard/DashboardCard.tsx
├── components/heatmap/ContributionHeatmap.tsx  # color prop → theme
├── pages/ManageHabitsPage.tsx  # swatch
└── index.css                   # @keyframes + reduced-motion
```

### Pattern 1: Domain color helpers

**What:** Pure module owns the 8-swatch palette, `#RRGGBB` validation/normalization, and 5-stop heatmap dark theme.
**When to use:** Any code that needs default color, palette iteration, or heatmap theme — never hardcode hex scales in components.
**Example (conceptual):**

```typescript
// src/domain/habitColors.ts — recommended API
export const DEFAULT_HABIT_COLOR = '#3fb950';
export const HABIT_COLOR_PRESETS: ReadonlyArray<{ id: string; hex: string }> = [/* D-05 */];

export function normalizeHabitColor(value: unknown): string {
  // Accept #RRGGBB lowercase; else DEFAULT_HABIT_COLOR
}

export function buildHeatmapTheme(hex: string): { dark: string[] } {
  // dark[0] = '#21262d'; dark[4] = normalized habit hex; dark[1..3] darker→brighter
}
```

**Discretion recommendation (heatmap):** Mix habit hex toward near-black (`#0d1117`) at ~75% / 55% / 30% black for stops 1–3; stop 0 fixed `#21262d`; stop 4 = habit hex. Prefer mix-toward-background over raw HSL lightness alone so yellow/pink stay readable on dark UI. [ASSUMED: mix ratios — tune in UI-SPEC / implementation]

### Pattern 2: Dexie v2 upgrade without index change

**What:** Keep store index strings identical; add `.upgrade` that `modify`s habits missing `color`.
**When to use:** First open after deploy when IndexedDB is still at v1.
**Example:**

```typescript
// Source pattern: Dexie Version.upgrade docs [CITED: dexie.org/docs/Version/Version.upgrade()]
this.version(1).stores({
  habits: 'id, archived, createdAt',
  completions: '[habitId+date], habitId, date',
});
this.version(2)
  .stores({
    habits: 'id, archived, createdAt',
    completions: '[habitId+date], habitId, date',
  })
  .upgrade((tx) =>
    tx
      .table('habits')
      .toCollection()
      .modify((habit) => {
        if (typeof (habit as { color?: unknown }).color !== 'string') {
          (habit as { color: string }).color = '#3fb950';
        }
      }),
  );
```

Keep both version blocks because an upgrader is involved (Dexie guidance). [CITED: dexie.org LLM guide — multiple version blocks when upgrade() present]

### Pattern 3: Backup color without version bump

**What:** `habitSchema` makes `color` optional; after successful parse (or via Zod transform), map habits through `normalizeHabitColor` so TypeScript `Habit.color` is always present for `bulkAdd`.
**When to use:** Import of Phase 4 (no color) and Phase 5+ (with color) files.
**Do not:** Change `version: literal(1)` or reject missing color.

### Pattern 4: Color through form → repo

**What:** Extend `HabitFormValues` with `color: string`; default new habits to `DEFAULT_HABIT_COLOR`; edit seeds from `habit.color`.
**Wire:**
1. `HabitForm` radiogroup → values.color
2. `HabitNewPage` / `useCreateHabit` → `habitRepository.create({ name, frequency, color })`
3. `HabitEditPage` → `habitRepository.update(id, { name, frequency, color })`

### Pattern 5: Check-in delight (complete edge only)

**What:** In `HabitRow`, detect transition to completed (prop change or toggle wrapper): set `isCelebrating` true for ≤200ms; apply CSS class with `@keyframes` scale + background wash using habit color at ~15–25% opacity. On uncomplete, no celebration. Resting completed state uses low-opacity habit wash (D-14) instead of bare `bg-muted`.
**Reduced motion:** CSS `@media (prefers-reduced-motion: reduce) { .habit-checkin-pulse { animation: none; } }` still leaves resting wash. [CITED: MDN prefers-reduced-motion — skip non-essential motion]

**Discretion recommendation:** Keyframe name `habit-checkin-pulse`; duration `180ms`; easing `ease-out`; one scale peak (~1.02 → 1) + background opacity flash. Manage swatch **8px**; DashboardCard **left bar + Flame only** (no border tint) to mirror HabitRow and avoid busy chrome.

### Anti-Patterns to Avoid

- **Hardcoding green theme in ContributionHeatmap** — replace module-level `heatmapTheme` with per-habit `buildHeatmapTheme(color)` [VERIFIED: codebase]
- **Animating on uncomplete** — D-13 is complete-only
- **Replacing Flame with animation** — D-15
- **Using habit red `#f85149` for destructive buttons** — identity only; buttons stay `--destructive` token
- **Putting color logic in Zustand** — ephemeral celebrate flag is local component state only

## Codebase Reuse Map

| Asset | Where | Phase 5 use |
|-------|-------|-------------|
| `Habit` / `Frequency` types | `src/domain/types.ts` | Add required `color` |
| `habitSchema` / `parseBackupJson` | `src/domain/backupSchema.ts` | Optional color + normalize |
| Domain pure + colocated tests | `streak.ts`, `heatmap.ts` | Mirror with `habitColors.ts` |
| `HabitTrackerDB` v1 | `src/infrastructure/db.ts` | Add v2 + upgrade |
| `habitRepository.create/update` | `habitRepository.ts` | Accept/persist `color` |
| `HabitForm` / `HabitFormValues` | `HabitForm.tsx` | Color radiogroup |
| `useCreateHabit` | `hooks/useCreateHabit.ts` | Pass color through |
| `HabitEditPage` initialValues | `HabitEditPage.tsx` | Seed + save color |
| `HabitRow` + swipe strip + Flame | `HabitRow.tsx` | Accents + ENH-02 |
| `WeekDayDots` `bg-primary` | `WeekDayDots.tsx` | Optional `accentColor` prop |
| `DashboardCard` Flame `text-primary` | `DashboardCard.tsx` | Tint from habit.color |
| `ContributionHeatmap` hardcoded theme | `ContributionHeatmap.tsx` | Accept `color`; dynamic theme; today stroke = habit color |
| `HabitHistoryPage` | passes id + frequency | Also pass `habit.color` |
| `ManageHabitsPage` list buttons | `ManageHabitsPage.tsx` | 8px swatch beside name |
| `@theme` tokens | `src/index.css` | Keep global primary; add keyframes |
| Test fixtures omitting color | many `*.test.ts(x)` | Add `color: '#3fb950'` after type change |
| fake-indexeddb setup | `db.test.ts`, repo tests | Add upgrade backfill coverage |

## Don't Hand-Roll / Don't-Do List

| Problem | Don't | Do Instead |
|---------|-------|------------|
| Animation library | Install framer-motion | CSS `@keyframes` in `index.css` (D-17) |
| Backup version break | Bump to `version: 2` for color | Keep v1; optional+normalize (D-04) |
| Free-form hex in UI | Color wheel / text input | 8 preset swatches (D-05) |
| Ad-hoc hex in every component | Copy `#3fb950` / invent scales | `habitColors.ts` helpers |
| Index color in Dexie | Add `color` to store string without need | Same indexes; upgrade only |
| Contrast guesswork for empty cells | Recolor empty to habit tint | Empty stays `#21262d` (D-18) |
| Celebrate uncomplete | Pulse when toggling off | Complete edge only (D-13) |
| Ignore a11y motion | Always animate | `prefers-reduced-motion` (D-16) |
| Tiny swatch hit targets | 16px clickable circle only | ≥44×44 hit area (D-19) |

## Common Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| TypeScript break across fixtures | Grep `Habit = {` and repo `add` calls; add `color` everywhere after type change [VERIFIED: codebase has many fixtures] |
| Upgrade not run in tests | Open DB through `HabitTrackerDB` after writing v1-shaped rows without color; assert backfill — or unit-test upgrade modify logic via reopen |
| Zod rejects old backups | Must allow missing `color`; invalid hex → default, not `invalid` error |
| Export omits color after create | Ensure repository always writes `color` so new exports include it |
| Heatmap today stroke still `var(--primary)` | D-11: today stroke = habit color; missed stays `--destructive` [VERIFIED: ContributionHeatmap uses var(--primary) today] |
| WeekDayDots stay global green | Pass habit color into dots (D-09) |
| Animation fights swipe `translateX` | Apply scale/background on inner content; keep transform ownership clear; ≤200ms |
| Red habit confused with Delete | Same hex as destructive OK for identity accents; do not restyle destructive buttons with habit color |
| Double-wash opacity | Resting completed wash ~10–15%; celebration peak ~15–25%; avoid stacking to opaque neon |

## Validation Architecture

> Nyquist gate enabled (`workflow.nyquist_validation: true` in `.planning/config.json`). [VERIFIED: codebase]

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 + @testing-library/react 16.3.2 + jsdom |
| Config file | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| Quick run command | `npm test -- src/domain/habitColors.test.ts` |
| Full suite command | `npm test` |

### What to unit / component test

| Area | Behaviors |
|------|-----------|
| Domain `habitColors` | Preset list length 8; `normalizeHabitColor` accepts valid lowercase hex; rejects/falls back invalid/missing/uppercase variants as specified; `buildHeatmapTheme` length 5, `[0]==='#21262d'`, `[4]===normalized hex` |
| `backupSchema` | Old habit without `color` parses ok and yields default color; valid custom color preserved; invalid color normalized (not hard-fail); `version !== 1` still unsupported |
| `habitRepository` | `create` persists default or provided color; `update` can change color |
| Dexie v2 | Habits missing color after upgrade path receive `#3fb950` |
| `HabitForm` | Radiogroup label "Color"; selecting swatch submits that hex; hit area / role |
| `HabitRow` | Accent styles use habit color; completing triggers celebration class (or animation class); uncomplete does not; completed resting wash present; Flame still rendered when completed |
| `DashboardCard` | Left accent / Flame uses habit color |
| `ContributionHeatmap` | Receives color; theme derived (mock calendar can assert prop or wrapper) |
| Reduced motion | Prefer CSS media-query coverage documented in UI-SPEC; optional component test with mocked `matchMedia` if JS-gated |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENH-01 | normalize + palette + heatmap theme | unit | `npm test -- src/domain/habitColors.test.ts` | ❌ Wave 0 |
| ENH-01 | backup optional color normalize | unit | `npm test -- src/domain/backupSchema.test.ts` | ✅ extend |
| ENH-01 | create/update persist color | unit | `npm test -- src/infrastructure/habitRepository.test.ts` | ✅ extend |
| ENH-01 | Dexie backfill | unit | `npm test -- src/infrastructure/db.test.ts` | ✅ extend |
| ENH-01 | HabitForm swatches | component | `npm test -- src/components/habits/HabitForm.test.tsx` | ❌ Wave 0 |
| ENH-01 | Row/card/heatmap/manage accents | component | existing + extend row/card/heatmap tests | ✅ partial |
| ENH-02 | complete-only pulse + resting wash | component | `npm test -- src/components/habits/HabitRow.test.tsx` | ✅ extend |
| ENH-02 | Flame retained when completed | component | same | ✅ already asserts badge when completed |

### Suggested test files

| File | Status |
|------|--------|
| `src/domain/habitColors.test.ts` | **Create** (Wave 0) |
| `src/components/habits/HabitForm.test.tsx` | **Create** (Wave 0) — no HabitForm tests today |
| `src/domain/backupSchema.test.ts` | Extend |
| `src/infrastructure/habitRepository.test.ts` | Extend |
| `src/infrastructure/db.test.ts` | Extend |
| `src/components/habits/HabitRow.test.tsx` | Extend |
| `src/components/dashboard/DashboardCard.test.tsx` | Extend |
| `src/components/heatmap/ContributionHeatmap.test.tsx` | Extend |
| `src/components/habits/WeekDayDots.test.tsx` | Extend if accent prop added |

### Sampling Rate

- **Per task commit:** targeted file(s) above
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/domain/habitColors.test.ts` — covers ENH-01 domain helpers
- [ ] `src/components/habits/HabitForm.test.tsx` — covers Color radiogroup submit
- [ ] Extend fixtures across Habit-typed tests once `color` is required on `Habit`

*(Framework already installed — no Vitest install gap.)*

## Security (ASVS L1)

| Threat | Severity | Mitigation |
|--------|----------|------------|
| CSS injection via imported `color` | Medium | Zod/normalize to `/^#[0-9a-f]{6}$/` only before style use; never interpolate raw strings into stylesheets as selectors |
| Malicious backup wiping via invalid color | Low | Invalid color → default, not import failure; still transactional replace from Phase 4 |
| Confusion of habit red with destructive actions | Low | Destructive buttons keep token classes; habit red is accent-only |
| XSS via habit name | Low | Unchanged — React text escaping; color not rendered as HTML |

Applicable ASVS: **V5 Input Validation** (Zod on import color). Auth/session/access N/A (local-first, no backend).

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | IndexedDB `habit-tracker` habits without `color` (all v1.0 installs) | Dexie `version(2)` upgrade backfill `#3fb950` |
| Live service config | None — no cloud | — |
| OS-registered state | None | — |
| Secrets/env vars | None | — |
| Build artifacts | `dist/` stale after ship | Rebuild on deploy; no special rename |

## Environment Availability

Step 2.6: SKIPPED for new external tools — code/CSS/Dexie/Zod only. Node/npm already used by the project. `node_modules` may be absent in fresh agents; `npm install` before `npm test`.

## Open Questions

None blocking. Discretion items resolved for planning:

1. **Heatmap stop algorithm** — Use mix-toward-`#0d1117` for stops 1–3; lock stop 0 `#21262d` and stop 4 = habit hex; document exact mix ratios in UI-SPEC.
2. **Animation naming** — `habit-checkin-pulse`, 180ms, `ease-out`.
3. **Manage swatch size** — 8px diameter visual.
4. **DashboardCard border** — Do not tint border; left bar + Flame only (D-10).
5. **Helper path** — `src/domain/habitColors.ts`.

No further user confirmation required unless UI-SPEC review overrides mix ratios.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mix-toward-background ratios (~75/55/30% black) produce acceptable contrast for all 8 presets | Architecture Patterns | Re-tune stops in UI-SPEC; add snapshot/manual check |
| A2 | No Dexie index on `color` needed | Standard Stack | If later filter-by-color ships, add index in a future version bump |
| A3 | CSS-only `prefers-reduced-motion` media query is sufficient without JS matchMedia | Pattern 5 | Add JS gate if tests require deterministic skip |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/05-visual-identity-check-in-delight/05-CONTEXT.md` — locked D-01..D-19 [VERIFIED: codebase]
- `.planning/ROADMAP.md` Phase 5 success criteria [VERIFIED: codebase]
- `.planning/REQUIREMENTS.md` ENH-01, ENH-02 [VERIFIED: codebase]
- Key sources: `types.ts`, `backupSchema.ts`, `db.ts`, `habitRepository.ts`, HabitForm/Row, DashboardCard, ContributionHeatmap, `index.css`, `package.json` [VERIFIED: codebase]
- Prior phases UI-SPEC color tokens / heatmap theme [VERIFIED: `.planning/phases/01..03-*-UI-SPEC.md`]
- [Dexie Version.upgrade](https://dexie.org/docs/Version/Version.upgrade()) — upgrade + modify pattern [CITED: dexie.org]

### Secondary (MEDIUM confidence)
- Phase 3 RESEARCH on `react-activity-calendar` theme.dark 5-stop usage [CITED: 03-RESEARCH.md / 03-UI-SPEC.md]
- MDN `prefers-reduced-motion` — skip non-essential animation [CITED: developer.mozilla.org]

### Tertiary (LOW confidence)
- Exact luminance of mixed heatmap stops for yellow/pink — validate visually in UI-SPEC / human verify [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; versions from package.json
- Architecture: HIGH — integration points mapped in codebase + CONTEXT
- Pitfalls: HIGH — backup version + fixture churn + a11y called out explicitly
- Heatmap mix ratios: MEDIUM — discretion pending visual tune

**Research date:** 2026-07-23
**Valid until:** 2026-08-23 (30 days — stable CSS/Dexie/Zod surface)

---

*Phase: 05-visual-identity-check-in-delight*
*Research completed: 2026-07-23*
*Ready for planning: yes*

## RESEARCH COMPLETE
