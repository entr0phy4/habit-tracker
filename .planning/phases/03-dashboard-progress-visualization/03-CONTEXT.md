# Phase 3: Dashboard & Progress Visualization - Context

**Gathered:** 2026-07-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see all streaks at a glance on a dedicated dashboard and explore each habit's full history on a GitHub-style contribution heatmap. This phase delivers a bottom tab bar (Hoy + Panel), a dashboard listing every active habit's current streak, and replacement of the Phase 2 calendar-week dot grid with a 52-week contribution heatmap on the habit history page — with tap-to-toggle on today and past scheduled days. Export/import, streak freeze, and streak animations remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Bottom Tab Navigation
- **D-01:** Add a fixed bottom tab bar with two tabs: **Hoy** and **Panel**
- **D-02:** Tab labels in Spanish — "Hoy" and "Panel" (not English, not icon-only)
- **D-03:** Today remains the app home at `/`; dashboard lives at `/dashboard` as the second tab — daily check-in loop unchanged
- **D-04:** Tab bar visible on main views (Today and Dashboard at minimum); planner discretion on whether form/edit pages hide it

### Dashboard Card Layout
- **D-05:** Each dashboard card shows habit name + Flame icon + current streak count only — minimal glanceable summary (no completion rate, no week dots)
- **D-06:** Habits sorted by current streak descending — highest streak at top for motivation
- **D-07:** Tap a dashboard card navigates to `/habits/:id/history` (stats + heatmap detail view)
- **D-08:** Dashboard shows active habits only — archived habits hidden, consistent with Today view

### Heatmap Placement on History Page
- **D-09:** Replace Phase 2 `HistoryDotGrid` calendar-week grid with the full GitHub-style contribution heatmap — do not keep both week grid and heatmap
- **D-10:** Heatmap lives on existing route `/habits/:id/history` below stat cards — no new detail route
- **D-11:** Section subtitle **"Historial"** replaces Phase 2's "Esta semana" above the heatmap
- **D-12:** History page back link uses browser history (`navigate(-1)`) — returning to Panel when user came from dashboard, to Today when from Today

### Heatmap Scope & Interaction
- **D-13:** Heatmap shows last 52 weeks (one year) GitHub-style; horizontal scroll on mobile per VIZ-01 responsive requirement
- **D-14:** Non-scheduled days hidden or very dim — only scheduled days are meaningful cells (consistent with Phase 2 schedule-aware stats)
- **D-15:** Cell tooltip shows date + status — e.g., "Lun 14 jul — Completado" / "Perdido" / "No programado" via `react-activity-calendar`
- **D-16:** Tap toggles completion on today and past scheduled days; future dates disabled — same boundary as Phase 2 (`isFutureDate` guard)

### Claude's Discretion
- Tab bar icon pairing with Spanish labels (e.g., Check + LayoutGrid or Flame)
- `react-activity-calendar` theme mapping to existing `#3fb950` accent and dark tokens from Phase 1 UI-SPEC
- Whether `HistoryDotGrid` component is deleted vs kept unused for reference
- Dashboard empty state copy when no active habits exist
- Exact card layout (list vs compact cards) within 480px AppShell max-width
- Heatmap cell size and block margin for 44px touch targets on mobile

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints (local-first, dark mode, no auth), key decisions
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: DASH-01, VIZ-01
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, MVP mode, depends on Phase 2

### Phase 2 Context (carry-forward decisions)
- `.planning/phases/02-streaks-statistics/02-CONTEXT.md` — Streak rules, Flame badge pattern, stat cards, schedule-aware logic
- `.planning/phases/02-streaks-statistics/02-UI-SPEC.md` — Dark mode tokens, typography, touch targets, accent colors
- `.planning/phases/02-streaks-statistics/02-RESEARCH.md` — Domain patterns, hook wiring, test matrix

### Phase 1 Context (navigation & shell)
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — Today layout, history route, FAB pattern
- `.planning/phases/01-habit-management-daily-logging/01-UI-SPEC.md` — Design system baseline

### Research (stack & architecture)
- `.planning/research/STACK.md` — `react-activity-calendar@3.2.1`, `colorScheme="dark"`, GitHub green theme
- `.planning/research/ARCHITECTURE.md` — `domain/heatmap.ts`, dashboard summary pattern, compute-on-read
- `.planning/research/PITFALLS.md` — No full heatmaps on dashboard (summary only); memoize grid cells; heatmap on detail view
- `.planning/research/SUMMARY.md` — Dashboard before heatmap ordering; `react-activity-calendar` click-to-toggle may need wrapper

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/hooks/useStreak.ts` — Current streak per habit; reuse on dashboard cards
- `src/hooks/useHabitStats.ts` — Stats for history page stat cards (unchanged)
- `src/hooks/useHabits.ts` / `useTodayHabits.ts` — Habit list queries; dashboard needs all active habits with streaks
- `src/components/habits/HabitRow.tsx` — Flame + streak badge pattern to echo on dashboard cards
- `src/components/habits/StatCards.tsx` — Stays on history page above heatmap
- `src/components/habits/HistoryDotGrid.tsx` — **Replaced** by heatmap this phase (D-09)
- `src/components/layout/AppShell.tsx` — 480px max-width shell; tab bar wraps or sits below main content
- `src/domain/streak.ts`, `src/domain/stats.ts` — Schedule-aware streak/stats for heatmap cell state derivation
- `src/hooks/useToggleCompletion.ts` — Wire heatmap cell tap to same toggle path as Phase 2 dots

### Established Patterns
- Compute-on-read via `useLiveQuery` + `completionRepository.getByHabitInRange()`
- Local `YYYY-MM-DD` date keys with noon-local parse (DST-safe)
- GitHub-dark accent `#3fb950` for completed states; `#f85149` destructive for missed
- React Router 8 file-based routes in `App.tsx`; no bottom nav yet

### Integration Points
- `App.tsx` — Add `/dashboard` route + bottom tab bar component
- `DashboardPage` (new) — List active habits with `useStreak`, sorted by streak desc
- `HabitHistoryPage` — Replace `HistoryDotGrid` with `ContributionHeatmap` (or similar) using `react-activity-calendar`
- New domain module: `domain/heatmap.ts` — Build activity data array from completions + schedule
- Package install: `react-activity-calendar@3.2.1` (not yet in package.json)

</code_context>

<specifics>
## Specific Ideas

- Bottom tab bar "Hoy" + "Panel" in Spanish — first persistent navigation in the app
- Dashboard is streak leaderboard feel — highest streak on top, tap through to full history
- Heatmap replaces week dots — one unified history visualization instead of two grids
- "Historial" subtitle anchors the heatmap section below stat cards
- Browser back preserves navigation context between Panel and history detail

</specifics>

<deferred>
## Deferred Ideas

- Three-tab bar including "Gestionar" — user chose two tabs only; manage stays at `/habits/manage`
- Dashboard as app home — user kept Today at `/`
- Dashboard cards with completion rate or week dots — user chose name + streak only
- Heatmap showing full history from habit creation — user chose 52-week window
- Week grid + heatmap coexistence — user chose replace, not supplement
- Numeric/partial completion heatmap intensity levels — ENH scope, binary done/undone for v1
- Streak animations on dashboard (ENH-02) — v2 enhancement

</deferred>

---

*Phase: 3-Dashboard & Progress Visualization*
*Context gathered: 2026-07-19*
