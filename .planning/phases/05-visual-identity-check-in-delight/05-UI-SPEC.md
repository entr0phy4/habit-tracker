---
phase: 5
slug: visual-identity-check-in-delight
status: draft
created: 2026-07-23
---

# Phase 5 — UI Design Contract

> Visual contract for habit colors and check-in delight. Honors Phase 1 dark tokens.

## Design System

Unchanged base tokens from Phase 1 UI-SPEC. Habit colors are **instance accents**, not global theme replacements.

### Habit Color Presets (D-03)

| Name | Hex | Role |
|------|-----|------|
| Green | `#3fb950` | Default / primary-aligned |
| Blue | `#58a6ff` | Cool accent |
| Pink | `#f778ba` | Warm accent |
| Amber | `#d29922` | Warm accent |
| Purple | `#a371f7` | Cool accent |
| Cyan | `#39c5cf` | Cool accent |
| Red | `#f85149` | High-energy (same as destructive token — OK as habit identity) |
| Gray | `#8b949e` | Neutral / muted |

### Surface Application

| Surface | Treatment |
|---------|-----------|
| HabitForm swatches | 44×44 circle/square buttons; selected = 2px ring `ring` color = white/foreground |
| HabitRow | 4–8px left accent bar = habit color; swipe reveal strip = habit color @ 20% |
| DashboardCard | 4px left border = habit color |
| Flame icon | `style={{ color: habit.color }}` |
| Heatmap | theme.dark[0]=`#21262d`; [1..4] derived from habit color |
| Check-in pulse | Row background flashes habit color @ ~25% opacity for ~250ms + scale 1.015 |

### Motion

| Motion | Duration | Easing | Reduced motion |
|--------|----------|--------|----------------|
| Check-in pulse | 250–300ms | ease-out | Disabled |
| Row press | existing `active:scale-[0.98]` | — | Keep (instant feedback) |

### Copy

- Form label: `Color`
- No toast required for color change alone (save habit still toasts update/create)

### Touch

- Swatch buttons: `min-h-11 min-w-11`
- Existing row/card targets unchanged (≥44px)
