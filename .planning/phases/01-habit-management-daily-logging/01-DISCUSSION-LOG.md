# Phase 1: Habit Management & Daily Logging - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-19
**Phase:** 1-Habit Management & Daily Logging
**Areas discussed:** Today screen layout, Habit creation flow, Check-in interaction, Past day editing

---

## Today Screen Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Flat list | All due habits in one scrollable list | ✓ |
| Split sections | Incomplete on top, completed collapsed below | |
| Card grid | 2 columns on desktop, 1 on mobile | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden | Only show habits due today | ✓ |
| Grayed out | Visible but not actionable | |
| Separate section | "Not due today" below | |

| Option | Description | Selected |
|--------|-------------|----------|
| FAB | Floating action button bottom-right | ✓ |
| Header button | + in top bar | |
| Inline | At bottom of habit list | |

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Ultra minimal | |
| Name + frequency label | e.g. "Mon, Wed, Fri" | |
| Name + week dots | Day indicator dots | ✓ |

**User's choice:** Flat list, hidden not-due habits (Claude recommendation), FAB for add, name + week day dots on rows
**Notes:** User asked for Claude recommendation on not-due display; hidden was recommended and accepted.

---

## Habit Creation Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Modal/dialog | Overlay form | |
| Slide-over drawer | Panel from edge | |
| Dedicated page | /habits/new route | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Day toggles | M T W T F S S buttons | ✓ |
| Preset chips | Daily \| Weekdays \| Custom | |
| Dropdown | Daily / pick days... | |

| Option | Description | Selected |
|--------|-------------|----------|
| Default Daily | All days pre-selected | ✓ |
| No default | User must choose | |

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + stay on Today | Confirmation toast, remain on Today view | ✓ |
| Return to Today | Navigate back, habit visible | |
| Add another | Stay on form | |

**User's choice:** Dedicated page, day toggles, default Daily, toast confirmation on Today view

---

## Check-in Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Swipe right | Mobile gesture to complete | ✓ |
| Tap entire row | Row toggles complete | ✓ (desktop) |
| Checkbox/circle | Left-side control | |

| Option | Description | Selected |
|--------|-------------|----------|
| Strikethrough + muted | Name struck through, row muted | ✓ |
| Checkmark + green accent | Subtle green highlight | |
| Both | Checkmark + strikethrough + muted | |

| Option | Description | Selected |
|--------|-------------|----------|
| Tap toggle undo | Same gesture toggles back | ✓ |
| Undo toast | 5-second undo snackbar | |
| Both | Toggle + toast | |

| Option | Description | Selected |
|--------|-------------|----------|
| Full row + animation | ≥44px row with press feedback | ✓ |
| Full row only | Tappable row, no animation | |
| Checkbox only | Small target | |

**User's choice:** Swipe on mobile, tap row on desktop, strikethrough + muted completed state, instant toggle undo, full row with press animation
**Notes:** Desktop tap-row noted as swipe equivalent when moving to next area.

---

## Past Day Editing

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated history screen | Per-habit history view | ✓ |
| Habit detail + mini calendar | Tap habit opens calendar | |
| Inline expand | Row expands to last 7 days | |

| Option | Description | Selected |
|--------|-------------|----------|
| Last 7 days | Limited edit window | ✓ |
| Last 30 days | Broader window | |
| Any past date | Calendar picker | |

| Option | Description | Selected |
|--------|-------------|----------|
| Week dot grid | Tap dots to toggle | ✓ |
| Same toggle as today | One control per day | |
| Scrollable day list | List of recent days | |

| Option | Description | Selected |
|--------|-------------|----------|
| No future dates | Today and past only | ✓ |
| Allow future | Mark days in advance | |

**User's choice:** Dedicated history screen, 7-day window, week dot grid, no future marking

---

## Claude's Discretion

- Not-due habits hidden (user requested recommendation)
- Desktop tap-row as mobile swipe equivalent
- Edit habit page pattern mirroring creation
- Archive UX details (hidden from Today, recoverable)
- Empty state prompting first habit via FAB

## Deferred Ideas

None captured during this discussion.
