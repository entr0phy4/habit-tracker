# Phase 7: Flexible Weekly Frequency - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-24
**Phase:** 07-Flexible Weekly Frequency
**Mode:** `--auto` / yolo (cloud agent — recommended defaults selected without interactive prompts)
**Areas discussed:** Frequency data model, Due-today quota rules, Streak semantics, Completion rate & heatmap, HabitForm & progress UI, Backup compatibility

---

## Frequency Data Model

| Option | Description | Selected |
|--------|-------------|----------|
| New `{ type: 'times_per_week', count }` | Distinct variant; count 1–7; weekly+days stays specific weekdays | ✓ |
| Overload `{ type: 'weekly', count?, days? }` | Single weekly type with optional modes | |
| Encode as empty days + metadata elsewhere | Keep Frequency union; store count on Habit | |

**User's choice:** [auto] New `times_per_week` variant (recommended)
**Notes:** Avoids breaking weekday streak walk; clear discriminant for domain branches.

| Option | Description | Selected |
|--------|-------------|----------|
| Mon–Sun week (weekStartsOn: 1) | Match Phase 2 calendar week | ✓ |
| Sun–Sat week | Match JS getDay() mental default | |
| Rolling last-7-days window | Not a calendar week | |

**User's choice:** [auto] Mon–Sun calendar week (recommended)

---

## Due-Today / Weekly Quota Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Due while completionsThisWeek < count | Any day can fill quota; hide when met | ✓ |
| Due only if remaining days ≥ remaining need | Hide early when week already failed | |
| Always show all week; badge only | Breaks Phase 1 actionable-only Today | |
| Due on random/suggested days | App picks which days count | |

**User's choice:** [auto] Due while under weekly quota (recommended)
**Notes:** Completions-aware due check required in `useTodayHabits`.

| Option | Description | Selected |
|--------|-------------|----------|
| Allow over-quota toggles on History; cap rate credit | Flexible logging without rate inflation | ✓ |
| Hard-block toggles after count met | Stricter; fights History heatmap UX | |
| Treat over-quota as separate "bonus" metric | Scope creep | |

**User's choice:** [auto] Allow over-quota; cap rate at count/week (recommended)

---

## Streak Semantics for X/Week

| Option | Description | Selected |
|--------|-------------|----------|
| Consecutive successful weeks (quota met) | Streak unit = week | ✓ |
| Soft day walk treating every day as scheduled until quota | Day streak with dynamic schedule | |
| Same day-walk as weekly.days with all 7 days due | Breaks on any missed day — wrong for X/week | |

**User's choice:** [auto] Week-unit successful weeks (recommended)
**Notes:** Aligns with roadmap "respect the weekly quota (not daily weekday lists)".

| Option | Description | Selected |
|--------|-------------|----------|
| Mid-week grace if week not yet failed / already met | Analog of Phase 2 D-15 | ✓ |
| Current week always excluded until Sunday | Harsh mid-week zeroing | |
| Fail streak as soon as remaining days < need | Aggressive; still compatible but less kind | |

**User's choice:** [auto] Mid-week grace while success still possible or already met (recommended)
**Notes:** Impossible weeks (remaining days < remaining need) break like a missed scheduled day.

---

## Completion Rate & Heatmap

| Option | Description | Selected |
|--------|-------------|----------|
| Per week: scheduled += count; completed += min(n, count) | Quota-honest lifetime rate | ✓ |
| scheduled = 7 days/week; any miss paints red | Treats flexible days as daily | |
| Mean of weekly hit/miss booleans only | Loses partial credit visibility | |

**User's choice:** [auto] Per-week quota counts (recommended)
**Notes:** Composes into Phase 6 pooled overall rate.

| Option | Description | Selected |
|--------|-------------|----------|
| Flexible empty days = not-scheduled; never day-level missed | Honest rest days | ✓ |
| After week fails, paint all empty days missed | Arbitrary which days were "required" | |
| Paint last N empty days missed to match shortfall | Clever but confusing | |

**User's choice:** [auto] No day-level missed for times_per_week (recommended)

---

## HabitForm & Progress UI

| Option | Description | Selected |
|--------|-------------|----------|
| Three modes: Daily / Specific days / X times per week | Clear mental model | ✓ |
| Only day toggles + "any of selected" checkbox | Ambiguous with specific days | |
| Count only; remove specific weekdays | Regresses HABT-01 | |

**User's choice:** [auto] Three frequency modes (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Default count 3 when entering X/week mode | Common habit target | ✓ |
| Default count 1 | Too easy to miss intent | |
| Default count 7 (= daily) | Redundant with Daily mode | |

**User's choice:** [auto] Default count 3 (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Weekly progress cue (e.g. 2/3) instead of WeekDayDots | Matches quota model | ✓ |
| Keep 7 day dots all "on" | Misleading schedule signal | |
| Hide schedule chrome entirely | Less glanceable | |

**User's choice:** [auto] Weekly progress cue on Today rows (recommended)

---

## Backup Compatibility

| Option | Description | Selected |
|--------|-------------|----------|
| Keep version 1; additive Zod union member | Match Phase 5 color precedent | ✓ |
| Bump to version 2 | Forces migration path without need | |
| Stringly-typed frequency blob | Weaker validation | |

**User's choice:** [auto] Backup v1 + additive frequency variant (recommended)

---

## Claude's Discretion

- Helper naming / whether to overload `isDueOnDate`
- Progress component placement vs WeekDayDots variant
- Count control widget (stepper vs select)
- Streak/stats refactor shape
- Flexible-cell tooltip microcopy
- Optional over-quota History hint

## Deferred Ideas

- Phase 8 streak freeze composing with week success
- Every-N-days intervals
- Risk reminders for unmet weekly quota (v2)
- Hybrid "3× on these candidate days only"
