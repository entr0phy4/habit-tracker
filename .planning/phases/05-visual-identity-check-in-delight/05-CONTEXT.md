# Phase 5: Visual Identity & Check-in Delight - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can tell habits apart by color and feel a satisfying reward when they check in. This phase adds a custom color per habit (create/edit + accents on Today, Panel, and heatmap) and a check-in delight (habit-color fill + micro-animation beyond the existing static Flame badge). Overall dashboard rate, X/week frequency, streak freeze, and reminders remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Color Palette & Picker
- **D-01:** Color choice uses a fixed preset swatch row (6–8 colors), not a free hex/color-wheel picker — keeps the minimal dark aesthetic and guarantees contrast
- **D-02:** Preset palette is dark-UI safe (readable on `#0d1117` / `#161b22`); include the current GitHub green `#3fb950` plus distinct hues (e.g. blue, purple, amber, coral, teal, pink) — exact hexes at Claude's discretion / UI-SPEC
- **D-03:** Default color for new habits is the existing primary green (`#3fb950`) so habits without an explicit pick still match today's look
- **D-04:** Color is set on create (`/habits/new`) and editable on edit (`/habits/:id/edit`) via the same swatch control in `HabitForm`
- **D-05:** Persist `color` as a hex string field on `Habit` (required after migration; default applied for existing rows)

### Where Color Appears
- **D-06:** Today `HabitRow`: left accent bar (or equivalent thin accent) + Flame + scheduled `WeekDayDots` use the habit color; completed state keeps strikethrough + muted row background (do not flood the whole row with habit color when done)
- **D-07:** Panel `DashboardCard`: Flame (and a subtle accent, e.g. left bar or name underline/dot) uses habit color — card remains `bg-card`, not a colored fill
- **D-08:** Contribution heatmap: empty/missed cells keep existing dark empty + destructive miss treatment; completed cells use a habit-tinted intensity scale derived from that habit's color (replace hard-coded GitHub-green-only completed levels)
- **D-09:** Global chrome stays app primary green — FAB, bottom tab active state, primary buttons, focus rings do **not** become per-habit colors

### Check-in Delight (ENH-02)
- **D-10:** On transition to completed (toggle off→on for today), play a short delight: brief habit-color fill flash on the row **and** a Flame scale/pop micro-animation
- **D-11:** Delight runs on every successful complete for today — not limited to streak milestones (7/30 celebrations deferred)
- **D-12:** Unchecking (complete→incomplete) is quiet — no reverse celebration; keep existing mute/strikethrough settle
- **D-13:** Respect `prefers-reduced-motion: reduce` — skip or replace motion with an instant color/state change only
- **D-14:** Existing Flame + numeric streak badge remains visible after complete (carry-forward Phase 2 D-04); delight enhances it, does not replace it

### Schema, Migration & Backup
- **D-15:** Add `color: string` to `Habit`; existing IndexedDB habits get default `#3fb950` (lazy default on read and/or one-shot migration — planner choice)
- **D-16:** Backup: bump payload to `version: 2` with `color` on habits; **import must still accept `version: 1`** backups by injecting default color — do not break v1.0 exports
- **D-17:** Reject unknown future versions with the existing Spanish incompatible-version message pattern

### Claude's Discretion
- Exact 6–8 hex values and swatch order (must pass dark-background contrast)
- Accent bar width/placement (2–4px left rail vs small color dot before name)
- Animation duration/easing (~200–350ms range); CSS vs Framer Motion — prefer CSS/`tailwindcss-animate` if already available, avoid heavy deps
- How heatmap theme array is derived from a single habit hex (2–4 intensity steps)
- Whether History page header/stat accents also pick up habit color (nice-to-have within phase; Today + Panel + heatmap are required)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Current milestone v1.1 goals; minimal dark aesthetic; no reminders in this milestone
- `.planning/REQUIREMENTS.md` — ENH-01 (custom color), ENH-02 (streak visual rewards on check-in)
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, UI hint
- `.planning/MILESTONES.md` — v1.0 shipped baseline; numbering continues at phase 5

### Prior Phase Context (carry-forward)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — HabitForm dedicated pages, Today row patterns, FAB
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — Design tokens (`#3fb950` primary), touch targets, dark surfaces
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — Flame badge pattern; animated flame explicitly deferred to ENH-02 (D-02)
- `.planning/phases/03-dashboard-progress-visualization/03-CONTEXT.md` — DashboardCard minimal glance; heatmap on history; Spanish labels
- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — Backup versioning, Zod validate-before-write, Spanish error toasts; versioning must evolve carefully (D-15)

### Research
- `.planning/research/FEATURES.md` — Habit color/icon as v1.x differentiator; streak visual rewards as low-complexity delight
- `.planning/research/STACK.md` — Tailwind v4, lucide-react, react-activity-calendar theme API
- `.planning/research/ARCHITECTURE.md` — Habit document shape; Dexie schema evolution expectations
- `.planning/research/PITFALLS.md` — Schema migrations vs export version drift

### Code Integration Points
- `src/domain/types.ts` — `Habit` (add `color`)
- `src/domain/backupSchema.ts` — Zod habit + payload version
- `src/infrastructure/db.ts` / `habitRepository.ts` — persist color
- `src/components/habits/HabitForm.tsx` — swatch UI
- `src/components/habits/HabitRow.tsx` — accent + delight trigger
- `src/components/habits/WeekDayDots.tsx` — scheduled-day fill color
- `src/components/dashboard/DashboardCard.tsx` — Flame accent
- `src/components/heatmap/ContributionHeatmap.tsx` — per-habit theme
- `src/index.css` — optional CSS variables / `@keyframes` for delight

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitForm` / `HabitFormValues` — extend with `color`; create/edit pages already share the form
- `HabitRow` — swipe/tap toggle + Flame; natural place for accent bar and complete-transition delight
- `DashboardCard` — Flame + streak; add habit-color accent without changing sort/nav behavior
- `ContributionHeatmap` — `theme` prop is a module constant today; make it habit-driven
- `backupSchema` + `backupService` — established version gate and transactional replace

### Established Patterns
- Spanish UI copy for user-facing strings
- GitHub/Linear dark tokens; global `--primary` = `#3fb950`
- Compute-on-read streaks; Flame always `text-primary` today → becomes habit-colored
- Backup `version: 1` strict today — Phase 5 must dual-read v1/v2
- Minimal motion already: `active:scale-[0.98]`, swipe translate — extend, don't invent a second motion system

### Integration Points
- Create/edit form → repository → Dexie habit documents
- Today list and Panel read habits via live queries — color flows automatically once on the document
- Heatmap receives habit id/history page context — pass `habit.color` into theme builder
- Export/import round-trip must include `color` for v2 and default it for v1

</code_context>

<specifics>
## Specific Ideas

- Preset swatches over free color input — intentional simplicity (PROJECT.md)
- Left accent rail on rows/cards echoes Linear/GitHub issue label affordances without turning rows into colored cards
- Check-in delight should feel like Streaks-app subtlety: short, habit-colored, no confetti/casino
- Reduced-motion users still get instant color state change (accessibility)

</specifics>

<deferred>
## Deferred Ideas

- Freeform hex / custom color picker — future polish if presets feel limiting
- Per-habit icons / emoji — separate from color; not in ENH-01
- Streak milestone celebrations (7 / 30 / 100 day fireworks) — ENH-02 this phase is every-check-in micro-delight only
- Overall completion rate on Panel — Phase 6 (ENH-03)
- X/week frequency — Phase 7 (ENH-04)
- Streak freeze — Phase 8 (ENH-05)
- Reminders / push — v2.0 (REM-01/02)
- Light mode / theming — out of scope

</deferred>

---

*Phase: 5-Visual Identity & Check-in Delight*
*Context gathered: 2026-07-23*
