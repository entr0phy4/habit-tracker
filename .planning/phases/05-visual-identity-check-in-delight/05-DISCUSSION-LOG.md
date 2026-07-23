# Phase 5: Visual Identity & Check-in Delight - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-23
**Phase:** 5-Visual Identity & Check-in Delight
**Mode:** Background agent defaults (recommended options; equivalent to `--auto` selection)
**Areas discussed:** Color palette & picker, Where color appears, Check-in delight, Schema & backup

---

## Color Palette & Picker

| Option | Description | Selected |
|--------|-------------|----------|
| Preset swatches (6–8) | Fixed dark-safe palette; default green | ✓ |
| Free hex / native color input | Full custom colors | |
| Presets + custom | Swatches plus "custom…" | |

| Option | Description | Selected |
|--------|-------------|----------|
| Default = current primary green | `#3fb950` for new + migrated habits | ✓ |
| Default = rotate next unused | Auto-assign distinct colors | |
| No default — require pick | Block save until color chosen | |

**User's choice:** [auto] Preset swatches; default primary green  
**Notes:** Aligns with minimal aesthetic; avoids inaccessible arbitrary hexes on dark UI.

---

## Where Color Appears

| Option | Description | Selected |
|--------|-------------|----------|
| Accents only (rail + Flame + dots + heatmap completed) | Global chrome stays app green | ✓ |
| Full row/card recolor | Habit color as row background | |
| Heatmap only | Color on history grid only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Heatmap completed levels from habit color | Empty/miss keep current treatment | ✓ |
| Keep GitHub green heatmap forever | Color only on list/cards | |

**User's choice:** [auto] Accents on Today + Panel + habit-tinted heatmap; FAB/tabs/buttons stay global primary  
**Notes:** Roadmap success criteria require Today, Panel, and heatmap accents; full-row color fights completed muted state.

---

## Check-in Delight

| Option | Description | Selected |
|--------|-------------|----------|
| Row color-fill flash + Flame pop on every complete | Short, habit-colored; reduced-motion safe | ✓ |
| Milestone-only (7/30) celebration | Bigger animation on thresholds | |
| Confetti / particle burst | High-energy feedback | |
| Flame color change only (no motion) | Static ENH-01 only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Quiet uncomplete | No reverse celebration | ✓ |
| Symmetric undo animation | Mirror delight on uncheck | |

**User's choice:** [auto] Every successful today-complete gets micro-delight; uncheck is quiet; honor `prefers-reduced-motion`  
**Notes:** Phase 2 deferred animated flame to ENH-02; keep Streaks-like subtlety, not gamification.

---

## Schema & Backup

| Option | Description | Selected |
|--------|-------------|----------|
| Habit.color hex + backup v2; still import v1 with default color | Non-breaking for v1.0 exports | ✓ |
| Optional color forever; stay backup v1 | Soft field only | |
| Backup v2 only; reject v1 | Forces re-export | |

**User's choice:** [auto] Required color with default; payload version 2; dual-read v1 imports  
**Notes:** Phase 4 locked strict v1 — must evolve carefully without stranding existing backups.

---

## Claude's Discretion

- Exact palette hexes and swatch order (contrast-checked)
- Accent rail vs color-dot affordance details
- Animation timing/tech (prefer CSS over new motion library)
- Optional History header accent with habit color

## Deferred Ideas

- Freeform custom colors
- Habit icons/emoji
- Milestone fireworks
- ENH-03/04/05 and REM-* (later phases / v2.0)
