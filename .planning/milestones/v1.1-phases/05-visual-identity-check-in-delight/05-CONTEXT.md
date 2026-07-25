# Phase 5: Visual Identity & Check-in Delight - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning
**Source:** `/gsd-execute-phase 5` unblocked via yolo auto-discuss (no prior CONTEXT/plans)

<domain>
## Phase Boundary

Users can assign a custom color to each habit and see that color across Today, Panel, and heatmap accents. Checking in today triggers a visible color-fill and/or micro-animation reward in addition to the existing flame badge. Overall completion rate, X/week frequency, streak freeze, and Phase 2 UAT residual remain out of scope (Phases 6–8).

</domain>

<decisions>
## Implementation Decisions

### Color Model & Palette
- **D-01:** Persist `color: string` on `Habit` as a hex value (e.g. `#3fb950`)
- **D-02:** Curated preset palette only (no free-form hex/RGB picker) — 8 swatches tuned for dark UI contrast
- **D-03:** Preset palette (locked): `#3fb950` (green), `#58a6ff` (blue), `#f778ba` (pink), `#d29922` (amber), `#a371f7` (purple), `#39c5cf` (cyan), `#f85149` (red), `#8b949e` (gray)
- **D-04:** Default color for new habits and habits missing `color` = `#3fb950` (existing `--primary`)
- **D-05:** Existing IndexedDB habits without `color` get the default at read/write boundary (normalize in repository/hooks) — no Dexie version bump required (no new indexes)

### Color Picker UX
- **D-06:** Color picker lives in `HabitForm` (create + edit) as a horizontal row of swatch buttons
- **D-07:** Each swatch is ≥44×44px touch target; selected swatch shows a ring/check affordance
- **D-08:** Spanish/English label consistency: use English label `"Color"` to match current HabitForm language (name/frequency are English today)

### Where Color Appears
- **D-09:** Today `HabitRow`: left accent strip uses habit color (replaces fixed primary swipe reveal tint)
- **D-10:** Panel `DashboardCard`: left color accent bar (4px) or leading color dot — prefer 4px left border/bar for scanability
- **D-11:** Heatmap (`ContributionHeatmap`): `theme.dark` scale derived from habit color (empty cell stays `#21262d`; levels 1–4 are progressive tints/shades of habit color)
- **D-12:** Flame icon may stay `text-primary` OR adopt habit color — **use habit color** for flame on that habit's row/card so identity is consistent
- **D-13:** `WeekDayDots` completed/scheduled accent may use habit color when rendered in a habit-colored context (Today row) — pass optional `accentColor`

### Check-in Delight (ENH-02)
- **D-14:** Reward triggers only when toggling **to completed** for today (not when un-completing; not required for past-day heatmap toggles)
- **D-15:** Reward = brief color-fill pulse on the row background (habit color at ~20–30% opacity) + subtle scale micro-animation (`active:scale` / short CSS transition ~200–300ms) — no confetti, no haptics API, no sound
- **D-16:** Existing flame badge remains; reward is additive
- **D-17:** Prefer CSS/`@keyframes` or Tailwind animate utilities — no new animation library dependency

### Backup & Schema Compatibility
- **D-18:** Keep backup `version: 1`; add optional `color` on habit schema — missing color on import → apply default `#3fb950`
- **D-19:** Export always includes `color` for every habit after this phase

### Claude's Discretion
- Exact heatmap tint algorithm (how to build 4 levels from one hex)
- Whether swipe-reveal strip during drag matches habit color (should)
- Exact animation class names / prefers-reduced-motion handling (honor `prefers-reduced-motion: reduce` by skipping scale/pulse)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — v1.1 goals; minimal dark aesthetic; colors must stay accessible
- `.planning/REQUIREMENTS.md` — ENH-01 (custom color), ENH-02 (check-in visual rewards)
- `.planning/ROADMAP.md` — Phase 5 success criteria 1–4
- `.planning/research/FEATURES.md` — habit color + streak visual rewards as polish
- `.planning/research/ARCHITECTURE.md` — Habit `{ color? }` in data model sketch

### Prior Phase Contracts
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — dark tokens, touch-min 44px, primary `#3fb950`
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — HabitForm / HabitRow patterns
- `.planning/phases/03-dashboard-progress-visualization/03-CONTEXT.md` — DashboardCard + heatmap patterns
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — backup version 1 + Zod validation rules

### Code Integration Points
- `src/domain/types.ts` — Habit interface
- `src/domain/backupSchema.ts` — Zod habit schema
- `src/infrastructure/habitRepository.ts` — create/update
- `src/infrastructure/db.ts` — Dexie schema (no color index)
- `src/components/habits/HabitForm.tsx` — create/edit form
- `src/components/habits/HabitRow.tsx` — today check-in + flame
- `src/components/dashboard/DashboardCard.tsx` — panel cards
- `src/components/heatmap/ContributionHeatmap.tsx` — theme prop
- `src/components/habits/WeekDayDots.tsx` — schedule dots

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitForm` — already shared by create/edit; natural place for color swatches
- `HabitRow` — swipe/tap toggle + flame; add color strip + completion pulse here
- `ContributionHeatmap` — accepts static `heatmapTheme`; make theme dynamic from habit color
- `DashboardCard` — simple button row; add left accent
- Zod `habitSchema` — extend with optional color without bumping backup version

### Established Patterns
- Local-first Dexie; compute-on-read; no denormalized stats
- Spanish UI on Settings/Panel labels in places; HabitForm still English — keep form language consistent within HabitForm
- TDD plans common in prior phases (`type: tdd`)
- Touch targets ≥44px; dark GitHub/Linear aesthetic

### Integration Points
- `habitRepository.create` / `update` must accept `color`
- `useCreateHabit` / HabitEditPage submit paths must pass color
- Tests that construct `Habit` fixtures need a `color` field (or helper default)

</code_context>

<specifics>
## Specific Ideas

- Palette inspired by GitHub primer accents so colors feel native on existing dark surfaces
- Check-in pulse should feel like Streaks-app subtlety, not Habitica celebration
- `[auto] Color model — Q: "Picker type?" → Selected: "Curated 8-swatch palette" (recommended default)`
- `[auto] Surfaces — Q: "Where does color show?" → Selected: "Row strip + Panel bar + heatmap theme + habit-colored flame"`
- `[auto] Reward — Q: "Check-in delight?" → Selected: "Color-fill pulse + short scale, CSS only, today-complete only"`
- `[auto] Backup — Q: "Schema version?" → Selected: "Keep v1; optional color with default on import"`

</specifics>

<deferred>
## Deferred Ideas

- Custom hex / image / icon per habit — out of phase scope
- Per-habit light-mode themes — app is dark-only
- Overall completion rate color coding — Phase 6
- Confetti / sound / haptics — conflicts with minimal aesthetic

</deferred>

---

*Phase: 5-Visual Identity & Check-in Delight*
*Context gathered: 2026-07-23*
