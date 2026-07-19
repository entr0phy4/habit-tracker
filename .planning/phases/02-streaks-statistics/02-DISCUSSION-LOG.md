# Phase 2: Streaks & Statistics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-19
**Phase:** 02-Streaks & Statistics
**Areas discussed:** Streak placement, Stats layout, Weekly overview, Streak counting rules

---

## Streak Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline next to name | Flame + number beside habit name; most visible at check-in | ✓ |
| Right-side badge | Compact pill before history button | |
| History page only | Today stays minimal | |
| You decide | Match GitHub/Linear minimal aesthetic | |

**User's choice:** Inline next to habit name on Today rows

| Option | Description | Selected |
|--------|-------------|----------|
| Flame icon + number | lucide-react Flame; classic streak affordance | ✓ |
| Number only | Text without icon | |
| Hide when zero | Show only when streak ≥ 1 | |

**User's choice:** Flame icon + number

| Option | Description | Selected |
|--------|-------------|----------|
| Both views, history more detailed | Today = current inline; history = current + longest + rate | ✓ |
| Today = current only | History has all three in header | |
| History page hero | Large current streak as focal point | |

**User's choice:** Both views prominent; history more detailed

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible | Streak shows even when row completed | ✓ |
| Muted when completed | Dims with strikethrough | |
| Brief highlight on check-in | Pulse green when extending streak | |

**User's choice:** Always visible on completed rows

---

## Stats Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Three stat cards in a row | Current \| Longest \| Rate as equal cards | ✓ |
| Compact inline row | Single line text | |
| Hero current + secondary | Large current, smaller longest/rate | |

**User's choice:** Three stat cards in a row

| Option | Description | Selected |
|--------|-------------|----------|
| Label above value | 12px muted label, 20px semibold value | ✓ |
| Value above label | Dashboard-style | |
| Icon + label | Flame/trophy/percent icons | |

**User's choice:** Label above value

| Option | Description | Selected |
|--------|-------------|----------|
| All scheduled days since creation | Lifetime completion rate | ✓ |
| Rolling 30 days | Recent performance | |
| Rolling 7 days | Matches old grid window | |

**User's choice:** All scheduled days since habit created

| Option | Description | Selected |
|--------|-------------|----------|
| Whole number percent | "85%" rounded | ✓ |
| One decimal | "85.3%" | |
| Fraction style | "17/20" with percent secondary | |

**User's choice:** Whole number percent

---

## Weekly Overview

| Option | Description | Selected |
|--------|-------------|----------|
| Calendar week Mon–Sun | True "this week" mental model | ✓ |
| Rolling last 7 days | Same as Phase 1 grid | |
| Current week, scheduled only | Show only due days | |

**User's choice:** Calendar week Mon–Sun

| Option | Description | Selected |
|--------|-------------|----------|
| Extend HistoryDotGrid | 3 states: completed, missed, not scheduled | ✓ |
| Separate section | New read-only component | |
| Replace grid entirely | Unified week view | |

**User's choice:** Extend HistoryDotGrid pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Red outline dot | Empty circle with destructive border for missed | ✓ |
| Muted empty dot | Gray outline, softer | |
| X mark | Explicit failure indicator | |

**User's choice:** Red outline for missed scheduled days

| Option | Description | Selected |
|--------|-------------|----------|
| Same grid, dual purpose | Tappable + overview; replaces rolling 7-day grid | ✓ |
| Two sections | Read-only overview + separate edit grid | |
| Overview read-only | Keep 7-day edit grid separate | |

**User's choice:** Same grid serves overview and editing

---

## Streak Counting Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Starts at 0 until first completion | No streak before first scheduled day done | ✓ |
| Shows 1 after first completion | Streak = consecutive days including today | |
| Hidden until streak ≥ 1 | Badge doesn't appear until active | |

**User's choice:** Zero until first completion

| Option | Description | Selected |
|--------|-------------|----------|
| Missing any scheduled day breaks streak | Walk backward; first missed scheduled day resets | ✓ |
| Today is grace period | Incomplete today doesn't break yet | |
| Weekly gap OK | Non-scheduled gaps don't break (standard rule) | |

**User's choice:** Missing any scheduled day breaks streak (weekly habits skip non-scheduled days)

| Option | Description | Selected |
|--------|-------------|----------|
| Count from today if complete, else yesterday | Incomplete today shows yesterday's run | ✓ |
| Must include today | Current only if today complete | |
| Yesterday-based only | Current means ending yesterday | |

**User's choice:** Count from today if due and complete, else yesterday

| Option | Description | Selected |
|--------|-------------|----------|
| All-time maximum run | Scan full history for longest consecutive run | ✓ |
| Highlight when tied | Personal best indicator when current = longest | |
| Since creation only | Same as all-time (data model already implies) | |

**User's choice:** All-time maximum

---

## Claude's Discretion

- Stat cards responsive layout on mobile
- Non-scheduled days hidden vs dimmed in week grid
- Inline flame+number spacing relative to name and WeekDayDots
- Personal best indicator when current equals longest
- Centralize completion range queries via repository

## Deferred Ideas

- Streak freeze (ENH-05) — v2
- Flame animation on check-in (ENH-02) — v2
- Dashboard all-streaks glance (DASH-01) — Phase 3
- GitHub heatmap (VIZ-01) — Phase 3
