---
phase: 7
slug: flexible-weekly-frequency
status: approved
shadcn_initialized: true
preset: new-york, baseColor zinc, dark mode
created: 2026-07-24
---

# Phase 7 — UI Design Contract

> Visual and interaction contract for Flexible Weekly Frequency (ENH-04). Extends Phase 1–6 design system. Generated under yolo plan-phase (UI gate auto-filled).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (initialized — `components.json` present) |
| Preset | `new-york`, `baseColor: zinc`, dark mode — inherited |
| Component library | Radix via shadcn — reuse `ToggleGroup`, `Button`, `Label`, `Input`; **no new shadcn installs required** |
| Icon library | lucide-react (existing) |
| Font | Inter (inherited from `src/index.css`) |

**Phase 7 adds no new npm packages.** Schedule mode + times control use existing ToggleGroup / buttons. Quota chip is plain text + optional border.

**Root dark class:** `<html class="dark">` — unchanged.

**Tokens (unchanged):**

| Token | Hex | Phase 7 usage |
|-------|-----|---------------|
| `--background` | `#0d1117` | Form / Today surfaces |
| `--card` | `#161b22` | Optional light chrome around mode control |
| `--border` | `#30363d` | Mode toggle / times segment borders |
| `--muted-foreground` | `#8b949e` | Mode helper labels, inactive times |
| `--foreground` | `#e6edf3` | Active labels, quota chip text |
| `--primary` | `#3fb950` | Selected mode / selected times segment (global) |
| Habit color | preset hex | Quota chip accent border/text on Today row |

---

## Spacing Scale

Inherited. Phase 7 additions:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gap inside quota chip |
| sm | 8px | Gap between mode toggle and day/times control |
| md | 16px | Form section gaps (existing HabitForm `gap-6` rhythm OK) |
| touch-min | 44px | Mode options, day toggles, times `1`–`7` targets |

Exceptions: none beyond existing touch-min.

---

## Typography

| Role | Size | Weight | Color | Usage |
|------|------|--------|-------|-------|
| Form section label | 14px semibold | 600 | `--foreground` | Schedule mode / Repeat |
| Mode option | 14px | 400–500 | `--foreground` | "Specific days" / "Times per week" |
| Times digit | 14–16px | 600 | `--foreground` on selected | `1`…`7` segments |
| Quota chip | 12px (`text-xs`) | 600 | habit color or `--foreground` | `2/3` on HabitRow |
| Day letters | existing | — | — | Unchanged WeekDayDots / day toggles |

---

## Copywriting Contract

| Element | Copy | Notes |
|---------|------|-------|
| Schedule mode label | **Schedule** | English — matches HabitForm "Habit name" / "Repeat on" language |
| Mode: weekdays | **Specific days** | Shows existing day ToggleGroup |
| Mode: X/week | **Times per week** | Shows 1–7 control |
| Times group aria | **Times per week** | `aria-label` on times ToggleGroup |
| Day group label | **Repeat on** | Unchanged when Specific days selected |
| Quota chip text | `{done}/{times}` | e.g. `2/3` — no unit word on chip |
| Quota chip aria | **`{done} of {times} this week`** | Screen reader |
| Validation (times) | **Choose how many times per week (1–7).** | If submit with invalid/missing times |

Do **not** use Spanish on HabitForm in this phase (form remains English). Spanish stays on Hoy/Panel chrome elsewhere.

---

## Layout — HabitForm schedule section

```text
┌─────────────────────────────────────┐
│ Habit name                          │
│ [________________________]          │
│                                     │
│ Schedule                            │
│ ┌──────────────┐ ┌────────────────┐ │
│ │ Specific days│ │ Times per week │ │  ← exclusive mode (segmented)
│ └──────────────┘ └────────────────┘ │
│                                     │
│  [when Specific days]               │
│  Repeat on                          │
│  [S][M][T][W][T][F][S]              │
│                                     │
│  [when Times per week]              │
│  Times per week                     │
│  [1][2][3][4][5][6][7]              │  ← single-select, ≥44px
│                                     │
│ Color …                             │
└─────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Mode default (create) | **Specific days** with all 7 days → `daily` (Phase 1 D-07) |
| Mode from edit | Infer: `times_per_week` → Times per week; else Specific days |
| Switching to Specific days | Restore last day selection or all-7; clear times |
| Switching to Times per week | Default `times = 3` if none; clear day selection from payload |
| Mutual exclusion | Only one mode visible/active at a time (D-03) |
| Submit mapping | Specific days → `toFrequency(days)`; Times → `{ type: 'times_per_week', times }` |

---

## Layout — Today HabitRow schedule chrome

| Frequency | Chrome |
|-----------|--------|
| `daily` / `weekly` | Existing `WeekDayDots` |
| `times_per_week` | **WeekQuotaChip** — text `{done}/{times}`, `min-h` not required (display), padding `px-2 py-0.5`, `rounded-md`, `border` using habit color @ ~40% opacity or solid habit-colored text |

Chip placement: same slot as WeekDayDots (trailing schedule indicator before history button). Not a card; no shadow.

When `done >= times`, habit is **hidden from Today** (not shown with chip at 3/3) — D-06.

---

## Heatmap / History (no new chrome)

- X/week empty past days: **dim / not-scheduled** styling (existing), never red missed (D-16)
- Completions still light up with habit heatmap theme
- No new History labels required this phase

---

## Motion

None required for schedule mode switch (instant swap). Keep existing check-in reward on HabitRow.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | ToggleGroup, Button, Label, Input (existing) | not required |
| third-party | none | — |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — concrete English strings locked
- [x] Dimension 2 Visuals: PASS — mode segments + times 1–7 + quota chip; no card hero
- [x] Dimension 3 Color: PASS — primary for selection; habit color for quota chip only
- [x] Dimension 4 Typography: PASS — matches HabitForm / text-xs chip
- [x] Dimension 5 Spacing: PASS — 4px grid + 44px targets
- [x] Dimension 6 Registry Safety: PASS — no new registries

**Approval:** approved 2026-07-24 (yolo plan-phase)
