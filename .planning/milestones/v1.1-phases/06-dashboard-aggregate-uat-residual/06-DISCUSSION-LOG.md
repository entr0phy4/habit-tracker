# Phase 6: Dashboard Aggregate & UAT Residual - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-23
**Phase:** 06-Dashboard Aggregate & UAT Residual
**Mode:** `--auto` / yolo (cloud agent — recommended defaults selected without interactive prompts)
**Areas discussed:** Overall rate placement, Overall rate formula, Reactive stats closeout, Dexie failure fallbacks

---

## Overall Rate Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Panel summary above card list | Single label+value metric above streak cards; cards unchanged | ✓ |
| On each DashboardCard | Add rate next to Flame on every card | |
| History-only aggregate | Show overall rate only on a settings/stats page | |
| Three-card Panel hero | Current / Longest / Overall as equal cards | |

**User's choice:** [auto] Panel summary above card list (recommended — respects Phase 3 D-05)
**Notes:** Per-card rate deferred; preserves glanceable streak leaderboard.

| Option | Description | Selected |
|--------|-------------|----------|
| Label above value, whole % | Match History StatCards typography; e.g. 72% | ✓ |
| Inline text in AppShell title | "Panel · 72%" in header | |
| Progress bar only | Visual bar without numeric percent | |

**User's choice:** [auto] Label above value, whole % (recommended)
**Notes:** Spanish label copy at Claude's discretion.

| Option | Description | Selected |
|--------|-------------|----------|
| Hide when no active habits; 0% if denominator 0 | Empty state owns viewport; otherwise honest zero | ✓ |
| Always show — including empty "—" | Placeholder even with no habits | |
| Show fraction "12/40" primary | Percent secondary | |

**User's choice:** [auto] Hide when empty; 0% when denominator 0 (recommended)

---

## Overall Rate Formula

| Option | Description | Selected |
|--------|-------------|----------|
| Pooled scheduled days across active habits | Σ completed ÷ Σ scheduled, then round | ✓ |
| Mean of per-habit rates | Average each habit's % equally | |
| Today-only overall | Due today completed ÷ due today | |
| Rolling 30 days | Recent window only | |

**User's choice:** [auto] Pooled lifetime across active habits (recommended)
**Notes:** Aligns with Phase 2 D-07 lifetime honesty; avoids overweighting short habits.

| Option | Description | Selected |
|--------|-------------|----------|
| Active habits only | Match Panel card filter | ✓ |
| Include archived | Full historical portfolio | |

**User's choice:** [auto] Active habits only (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Compose from calculateCompletionRate inputs | New aggregate helper on domain/stats | ✓ |
| Persist overall rate on a settings row | Denormalized Dexie field | |

**User's choice:** [auto] Compose compute-on-read (recommended — no schema change)

---

## Reactive Stats Closeout (QA-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Close UAT #1 for Flame + History StatCards; heatmap as reinterpretation of dots | Match roadmap SC #3 | ✓ |
| Only document that useLiveQuery exists | No verification update | |
| Require full E2E Playwright suite | Out of stack for v1.1 | |

**User's choice:** [auto] Close #1 with Flame + StatCards (+ heatmap where relevant); add Vitest reactivity check if feasible
**Notes:** Phase 2 "dot grid" wording obsolete after Phase 3 heatmap replace.

| Option | Description | Selected |
|--------|-------------|----------|
| Confirm StatCards String(n) for UAT #4 | Verification only, no redesign | ✓ |
| Add K/M abbreviation | Would fail UAT #4 | |

**User's choice:** [auto] Confirm full integers (recommended)

---

## Dexie Failure Fallbacks (QA-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror useTodayHabits QUERY_ERROR in useStreak, useHabitStats, useDashboardHabits (+ overall-rate hook) | Proven pattern | ✓ |
| Window.onerror toast only | Global catch, hooks unchanged | |
| Leave hooks as-is; human UAT only | Residual stays open | |

**User's choice:** [auto] Mirror QUERY_ERROR pattern (recommended)
**Notes:** Closes UAT #2 and #3; Phase 3 WR-02 on useDashboardHabits included.

| Option | Description | Selected |
|--------|-------------|----------|
| Show 0 / hide after error; never raw exception text | Safe empty/zero UI | ✓ |
| Show Spanish error banner with retry | Heavier UX | |
| Rethrow to error boundary | Can surface stack in dev overlays | |

**User's choice:** [auto] Safe 0/hide, no raw exception text (recommended)

---

## Claude's Discretion

- Exact Spanish copy for overall-rate label
- Summary placement under AppShell title vs above `<ul>`
- Domain/hook naming for aggregate
- Depth of automated Dexie failure-injection tests vs human backstop

## Deferred Ideas

- Per-card Panel rates (Phase 3 decision stands)
- Rolling windows for overall rate
- Phase 5 colors / Phase 7 X-week / Phase 8 freeze / v2 reminders
