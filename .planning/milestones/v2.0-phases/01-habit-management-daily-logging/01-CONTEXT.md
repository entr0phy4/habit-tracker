# Phase 1: Habit Management & Daily Logging - Context

**Gathered:** 2026-07-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create and manage habits, see what's due today, and log completions with one tap — with data that survives browser restarts. This phase delivers the complete daily habit loop: habit CRUD (create, edit, archive/delete), today view, one-tap check-in, past-day toggling (last 7 days), local persistence, and minimal dark responsive UI. Streaks, dashboard, heatmap, and export/import belong in later phases.

</domain>

<decisions>
## Implementation Decisions

### Today Screen Layout
- **D-01:** Primary structure is a flat scrollable list of habits due today
- **D-02:** Habits not due today are hidden entirely — only actionable habits appear
- **D-03:** "Add habit" is a floating action button (bottom-right)
- **D-04:** Each habit row shows name plus week day dots indicator (which days the habit is scheduled)

### Habit Creation Flow
- **D-05:** Habit creation uses a dedicated page (`/habits/new`), not a modal or drawer
- **D-06:** Frequency is set via day toggle buttons (M T W T F S S)
- **D-07:** Default frequency for new habits is Daily (all days pre-selected)
- **D-08:** After creating a habit: show toast confirmation and remain on Today view (form closes, user sees updated list)

### Check-in Interaction
- **D-09:** Mobile: swipe right on a habit row to mark complete
- **D-10:** Desktop: tap entire row to toggle complete (equivalent affordance to mobile swipe)
- **D-11:** Completed state: strikethrough on habit name plus muted row color
- **D-12:** Undo is instant — same swipe/tap toggles completion back off
- **D-13:** Full row is the touch target (≥44px height) with press animation feedback on tap

### Past Day Editing
- **D-14:** Past day toggling happens on a dedicated history screen per habit (navigate from habit row)
- **D-15:** Editable range in Phase 1 is last 7 days only
- **D-16:** History screen uses a week dot grid — tap individual dots to toggle that day
- **D-17:** Future dates cannot be marked complete — today and past only

### Claude's Discretion
- Habits not due today: hidden (user requested recommendation; accepted)
- Desktop tap-row as swipe equivalent on non-touch devices
- Edit habit flow: mirror creation pattern on dedicated page (`/habits/:id/edit`) unless research suggests inline edit is simpler
- Archive behavior: archived habits hidden from Today view, recoverable from a manage/archive section (exact UI left to planner)
- Empty state on Today view: prompt to add first habit via FAB when no habits exist

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints (local-first, dark mode, no auth), key decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: HABT-01–03, LOG-01–03, DATA-01, UI-01–02
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, MVP mode

### Research (stack & architecture)
- `.planning/research/STACK.md` — Vite 8 + React 19 + Dexie 4 + shadcn/ui + Tailwind v4
- `.planning/research/ARCHITECTURE.md` — Layered SPA, habit/completion data model, compute-on-read pattern
- `.planning/research/FEATURES.md` — Table stakes for habit trackers, MVP feature boundaries
- `.planning/research/PITFALLS.md` — Timezone/date storage pitfalls, local storage durability warnings
- `.planning/research/SUMMARY.md` — Executive summary and suggested build order

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No application source code exists yet.

### Established Patterns
- Research prescribes: Presentation → Hooks → Domain → Infrastructure (Dexie) layering
- Dates stored as local `YYYY-MM-DD` strings; completions keyed by `[habitId, date]`
- `useLiveQuery` from dexie-react-hooks for reactive UI updates

### Integration Points
- Today view is the app entry point / primary route
- `/habits/new` for creation; `/habits/:id/history` for past-day editing (route names at planner discretion)
- FAB on Today view navigates to habit creation

</code_context>

<specifics>
## Specific Ideas

- GitHub/Linear minimal dark aesthetic (from PROJECT.md)
- Week day dots on habit rows echo the contribution-graph mental model before Phase 3 heatmap ships
- Swipe-to-complete on mobile with satisfying press animation — frictionless core loop
- Toast on habit create — lightweight confirmation without leaving the daily flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Habit Management & Daily Logging*
*Context gathered: 2026-07-19*
