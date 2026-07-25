---
phase: 8
slug: streak-freeze
status: approved
shadcn_initialized: true
preset: new-york, baseColor zinc, dark mode
created: 2026-07-24
---

# Phase 8 — UI Design Contract

> Visual and interaction contract for Streak Freeze (ENH-05). Extends Phase 1–7 design system. Generated under yolo plan-phase (UI gate auto-filled).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (initialized — `components.json` present) |
| Preset | `new-york`, `baseColor: zinc`, dark mode — inherited |
| Component library | Radix via shadcn — reuse `Button`; **no new shadcn installs** |
| Icon library | lucide-react — **`Snowflake`** for Omitir |
| Font | Inter (inherited from `src/index.css`) |

**Phase 8 adds no new npm packages.**

**Root dark class:** `<html class="dark">` — unchanged.

**Tokens (additions):**

| Token | Hex | Phase 8 usage |
|-------|-----|---------------|
| `--background` | `#0d1117` | Surfaces unchanged |
| `--card` | `#161b22` | Unchanged |
| `--border` | `#30363d` | Unchanged |
| `--muted-foreground` | `#8b949e` | Inactive chrome |
| `--foreground` | `#e6edf3` | Labels |
| `--primary` | `#3fb950` | Completions / check-in (unchanged) |
| `--destructive` | existing | Missed cells (unchanged) |
| `--freeze` (CSS var optional) | `#58a6ff` | Frozen heatmap fill/stroke accent |

---

## Spacing Scale

Inherited. Phase 8 additions:

| Token | Value | Usage |
|-------|-------|-------|
| touch-min | 44px | Omitir button, heatmap interactive cells |
| xs | 4px | Gap between Omitir and History buttons |

---

## Typography

| Role | Size | Weight | Color | Usage |
|------|------|--------|-------|-------|
| Heatmap tooltip status | existing | — | — | Status word + date |
| Button aria only | — | — | — | Omitir has no visible text label (icon button) |

---

## Copywriting Contract

| Element | Copy | Notes |
|---------|------|-------|
| Today Skip button aria | **Omitir** | Spanish — matches Hoy chrome mix; icon-only |
| Today Skip when frozen (if visible) | **Deshacer omisión** | Unfreeze |
| Heatmap tooltip status | **Omitido** | Must not reuse Completado / Perdido |
| Error toast (reuse) | **Couldn't update. Try again.** | Existing English heatmap toast — OK |

Do **not** add monthly-cap / nag copy (D-26 out of scope).

---

## Layout — Today HabitRow

```text
┌──────────────────────────────────────────────────────────┐
│ Habit name    🔥  [dots|chip]   [❄ Omitir] [📅 History] │
└──────────────────────────────────────────────────────────┘
     ↑ primary tap/swipe = complete          ↑ stopPropagation
```

| Property | Spec |
|----------|------|
| Primary action | Unchanged — row tap / swipe / Enter|Space → complete |
| Omitir control | `Button` variant ghost, size icon, `min-h-11 min-w-11`, lucide `Snowflake` |
| Placement | Immediately **before** History calendar button |
| Event handling | `onClick` + `stopPropagation` so row does not complete |
| After freeze today | Habit **removed from Hoy list** (D-08) — no persistent frozen row on Today |
| Check-in reward | Only on complete path — not on Omitir |

---

## Layout — History heatmap interaction

| Property | Spec |
|----------|------|
| Interaction model | **Cycle on tap** (not long-press) |
| Cycle order | empty/missed → **completed** → **frozen** → empty (clear) |
| daily/weekly interactive | Past/today **due** cells in `missed` \| `completed` \| `frozen` |
| times_per_week interactive | Past/today cells in `not-scheduled` \| `completed` \| `frozen` (freeze-eligible any day) |
| Future cells | Never interactive |
| Touch target | Existing cell hit area ≥44px where library allows; keep keyboard Enter/Space |

---

## Heatmap frozen visual

| State | Visual |
|-------|--------|
| completed | Existing habit-colored / level-4 fill |
| missed | Existing destructive stroke |
| not-scheduled | Existing dim opacity |
| future | Existing muted |
| **frozen** | Fill `#58a6ff` @ ~35% opacity (or habit-compatible ice tint); **dashed** stroke `#58a6ff`; not solid primary green; not destructive red |

Tooltip: `{dateFormatted}: Omitido` (same date format pattern as other statuses).

`prefers-reduced-motion`: no extra motion for freeze (static cell style).

---

## Panel

No freeze controls on `DashboardCard` (D-09). Overall rate updates via domain only.

---

## Motion

None required for Omitir / freeze cycle. Keep existing check-in reward on complete only.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button (existing) | not required |
| third-party | none | — |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — Omitir / Omitido / Deshacer omisión locked
- [x] Dimension 2 Visuals: PASS — secondary icon + cycle; no card hero
- [x] Dimension 3 Color: PASS — ice `#58a6ff` dashed vs green/red
- [x] Dimension 4 Typography: PASS — inherits heatmap tooltip
- [x] Dimension 5 Spacing: PASS — 44px Omitir target
- [x] Dimension 6 Registry Safety: PASS — no new registries

**Approval:** approved 2026-07-24 (yolo plan-phase)
