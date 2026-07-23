# Phase 5: Visual Identity & Check-in Delight - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning
**Source:** Assumptions auto-path (yolo) — locked from ROADMAP/REQUIREMENTS + codebase evidence; no discuss-phase interview

<domain>
## Phase Boundary

Users can assign a custom color to each habit and see that color on Today rows, Panel cards, and heatmap accents. Completing a habit today triggers a color-fill and/or short CSS micro-animation reward in addition to the existing flame badge. Remains local-first; no new frequency types, streak freezes, overall completion rate, or reminders (those belong to Phases 6–8 / v2).

</domain>

<decisions>
## Implementation Decisions

### Color Data Model & Persistence
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

### Color Picker UI (Create/Edit)
- **D-06:** Color picker lives in shared `HabitForm` as a row of circular swatches (`role="radiogroup"`) — selected state uses ring matching the swatch color
- **D-07:** Copy remains English on forms (match existing HabitForm): label **"Color"**; Spanish chrome elsewhere unchanged
- **D-08:** Wire color through `HabitFormValues` → `useCreateHabit` / `habitRepository.create` and edit → `habitRepository.update` (`Partial<Pick<Habit, 'name' | 'frequency' | 'archived' | 'color'>>`)

### Surface Coloring (ENH-01)
- **D-09:** `HabitRow` (Today): left accent bar (3–4px) in habit color; week dots and swipe-reveal strip use habit color instead of global `--primary` when the habit has a color
- **D-10:** `DashboardCard` (Panel): left accent bar + `Flame` icon tinted with habit color
- **D-11:** `ContributionHeatmap`: build a 5-stop dark theme scale from the habit's hex (empty → full) and pass as `theme.dark`; today/missed stroke accents use habit color / `--destructive` respectively
- **D-12:** `ManageHabitsPage` list: small color swatch beside habit name (read-only identity cue)

### Check-in Delight (ENH-02)
- **D-13:** On toggle to **complete** (not uncomplete): HabitRow plays a one-shot CSS micro-animation ≤200ms (scale pulse + color wash fill using habit color at ~15–25% opacity background)
- **D-14:** Completed resting state keeps muted/strikethrough text treatment from Phase 1, but row background wash uses habit color at low opacity instead of plain `--muted` alone
- **D-15:** Existing `Flame` streak badge stays; animation does not replace it
- **D-16:** Respect `prefers-reduced-motion: reduce` — skip keyframe animation; still apply completed color wash instantly
- **D-17:** No new animation library (no framer-motion) — CSS `@keyframes` + Tailwind/utility classes only

### Contrast & Accessibility
- **D-18:** Palette colors must meet readable contrast as accents on `#0d1117` / `#161b22` surfaces; empty heatmap cell stays `#21262d`; filled cells use generated darker→brighter stops of the habit hue
- **D-19:** Touch targets for swatches ≥44×44px hit area (visual circle may be smaller)

### Claude's Discretion
- Exact 5-stop heatmap hex derivation algorithm (HSL lighten/darken vs fixed opacity overlays)
- Exact keyframe names and easing for check-in animation
- Whether ManageHabitsPage swatch is 8px or 12px diameter
- Whether DashboardCard also tints card border or only left bar + flame
- Shared helper location (`src/domain/habitColors.ts` vs `src/lib/colors.ts`) — prefer domain pure helper for palette + theme scale

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, UI hint
- `.planning/REQUIREMENTS.md` — ENH-01, ENH-02
- `.planning/PROJECT.md` — minimal dark aesthetic; resist feature creep

### Prior UI contracts
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — tokens, completed row treatment, accent reservation, touch-min 44px
- `.planning/phases/02-streaks-statistics/02-UI-SPEC.md` — flame badge must stay visible when row complete; ENH-02 was deferred here
- `.planning/phases/03-dashboard-progress-visualization/03-UI-SPEC.md` — heatmap theme hex scale, Panel cards, Spanish chrome
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — backup `version: 1` shape; Zod before write

### Code integration points
- `src/domain/types.ts` — `Habit` shape
- `src/domain/backupSchema.ts` — Zod habit schema
- `src/infrastructure/db.ts` — Dexie v1 schema
- `src/infrastructure/habitRepository.ts` — create/update
- `src/components/habits/HabitForm.tsx` — form fields
- `src/components/habits/HabitRow.tsx` — Today check-in surface
- `src/components/dashboard/DashboardCard.tsx` — Panel cards
- `src/components/heatmap/ContributionHeatmap.tsx` — hardcoded green theme
- `src/index.css` — `@theme` tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitForm` — single place to add color swatches for create + edit
- `HabitRow` — toggle, flame, swipe strip; primary ENH-02 surface
- `DashboardCard` — Panel identity surface
- `ContributionHeatmap` — `heatmapTheme` constant to replace with per-habit theme
- `backupSchema` / `backupService` — extend habit validation without bumping export version if optional+default
- Vitest + Testing Library + fake-indexeddb — established test harness

### Established Patterns
- Domain pure modules (`streak.ts`, `heatmap.ts`) with colocated `*.test.ts`
- Repository owns Dexie writes; hooks thin wrappers
- Spanish for Panel/Settings/Historial chrome; English for HabitForm labels
- CSS-only motion (`transition-transform`, `active:scale-[0.98]`) — no framer-motion
- Global `--primary` `#3fb950` — Phase 5 personalizes accents per habit while global FAB/tabs can stay primary green

### Integration Points
- Dexie upgrade path in `db.ts`
- Pass `habit.color` into HabitRow / DashboardCard / ContributionHeatmap / ManageHabitsPage
- `useToggleCompletion` success path → trigger animation state in HabitRow (local UI state)

</code_context>

<specifics>
## Specific Ideas

- Color fill on check-in should feel like the row "lights up" in the habit's color — brief pulse, then settle into soft tinted completed state
- Heatmap should still read as a contribution grid; only the green scale becomes habit-colored, not a rainbow of unrelated levels
- Avoid inventing a second free-form color system; presets keep contrast safe on dark UI

</specifics>

<deferred>
## Deferred Ideas

- Free-form custom hex / color wheel
- Animated flame / Lottie / confetti / haptic APIs
- Light mode theme variants of palette
- Per-habit color on FAB or tab bar (global chrome stays `--primary`)
- ENH-03 overall completion rate (Phase 6)
- ENH-04 X/week frequency (Phase 7)
- ENH-05 streak freeze (Phase 8)

</deferred>

---

*Phase: 05-visual-identity-check-in-delight*
*Context gathered: 2026-07-23 via assumptions auto-path (yolo)*
