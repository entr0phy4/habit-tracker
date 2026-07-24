# Phase 7: Flexible Weekly Frequency - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-24
**Phase:** 07-Flexible Weekly Frequency
**Mode:** yolo / cloud agent — recommended defaults selected without interactive prompts
**Areas discussed:** Frequency data model, Due-today weekly quota, Streak unit for X/week, Rate & heatmap semantics, HabitForm & list chrome, Backup compatibility

---

## Frequency Data Model

| Option | Description | Selected |
|--------|-------------|----------|
| New `{ type: 'times_per_week'; times: 1..7 }` | Third union member; keep daily + weekly days | ✓ |
| Encode as weekly with empty days + parallel count field | Overload weekly shape | |
| Treat times=7 as daily | Collapse daily into X/week | |

**User's choice:** [auto] New `times_per_week` variant (recommended)
**Notes:** Preserves existing habits and weekday semantics; avoids `times: 7` ≡ daily confusion.

| Option | Description | Selected |
|--------|-------------|----------|
| Modes mutually exclusive in form | Specific days XOR times/week | ✓ |
| Allow both constraints at once | Days AND quota | |

**User's choice:** [auto] Mutually exclusive (recommended)

---

## Due-Today Weekly Quota

| Option | Description | Selected |
|--------|-------------|----------|
| Due until weekly completions ≥ times; then hide | Remaining quota; any day counts | ✓ |
| Due only if remaining days ≥ remaining needed | Pressure scheduling | |
| Always show every day regardless of quota | Can over-complete from Today | |

**User's choice:** [auto] Due until quota met, then hide (recommended — Phase 1 D-02)
**Notes:** Mon–Sun week from Phase 2 D-09 / `dates.ts`.

| Option | Description | Selected |
|--------|-------------|----------|
| Over-complete allowed on History; rate caps at times/week | Extra check-ins OK | ✓ |
| Hard-block toggles after quota | Prevent extra completions | |

**User's choice:** [auto] Allow over-complete; cap rate credit (recommended)

---

## Streak Unit for X/Week

| Option | Description | Selected |
|--------|-------------|----------|
| Consecutive weeks meeting quota | Week is hit/miss unit | ✓ |
| Synthetic day-level walk | Invent N scheduled slots as days | |
| Same weekday walk as MWF | Incorrect for flexible days | |

**User's choice:** [auto] Week-level hit/miss (recommended — matches ROADMAP "weekly quota")
**Notes:** Past failed week breaks; in-progress current week does not (Phase 2 D-15 spirit).

---

## Rate & Heatmap Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Per week: scheduled+=times, completed+=min(n,times) | Lifetime honesty | ✓ |
| Mean of weekly % only | Different formula | |
| Count every calendar day as scheduled | Inflates denominator | |

**User's choice:** [auto] Per-week capped counts (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Empty X/week days dim (not red missed) | Quota fail via streak/rate | ✓ |
| Red-miss every empty past day | Noisy / misleading | |
| Red-miss only on Sunday if week failed | Complex cell rule | |

**User's choice:** [auto] Dim empty days; no per-day red miss for X/week (recommended)

---

## HabitForm & List Chrome

| Option | Description | Selected |
|--------|-------------|----------|
| Mode toggle: specific days vs times/week; default daily | Extend HabitForm | ✓ |
| Replace day toggles entirely with X/week | Drop weekday UX | |
| Times/week only on advanced settings | Hidden affordance | |

**User's choice:** [auto] Explicit mode toggle; keep day toggles (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Quota chip `done/times` on Today for X/week | Replace WeekDayDots | ✓ |
| Keep seven dots with no meaning | Misleading | |
| Text-only schedule on row | Weak glanceability | |

**User's choice:** [auto] Quota chip with habit color (recommended)

---

## Backup Compatibility

| Option | Description | Selected |
|--------|-------------|----------|
| Keep version 1; extend Zod frequency union | Additive like color | ✓ |
| Bump backup to version 2 | Forces migration story | |
| Store times_per_week as weekly+meta sidecar | Non-canonical | |

**User's choice:** [auto] Version 1 + union extension (recommended)

---

## Claude's Discretion

- Exact copy (ES/EN) for mode labels and quota chip
- 1–7 control widget type (stepper vs segmented)
- Domain helper naming / whether to overload `isDueOnDate`
- Heatmap tooltip wording for X/week empty days

## Deferred Ideas

- Streak freeze / skip (ENH-05) — Phase 8
- Every-N-days interval schedules — not in v1.1
- Reminders for unmet mid-week quota — v2.0
