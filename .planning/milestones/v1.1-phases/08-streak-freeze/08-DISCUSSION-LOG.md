# Phase 8: Streak Freeze - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-24
**Phase:** 08-Streak Freeze
**Mode:** yolo / `--auto` (cloud agent — recommended defaults selected without interactive prompts)
**Areas discussed:** Freeze data model, Mark freeze UX, Streak bridge semantics, Rate & quota treatment, Heatmap distinction, Backup & Dexie schema, Integrity limits

[--auto] Selected all gray areas: Freeze data model, Mark freeze UX, Streak bridge semantics, Rate & quota treatment, Heatmap distinction, Backup & Dexie schema, Integrity limits

---

## Freeze Data Model

| Option | Description | Selected |
|--------|-------------|----------|
| Separate `{ habitId, date }` freeze entity / table | Parallel to completions; freeze ≠ done | ✓ |
| Status field on Completion (`done` \| `skip`) | Overloads completion semantics | |
| Completion-like rows with `type: 'freeze'` in same store | Couples toggle paths; muddies “completed” queries | |

**User's choice:** [auto] Separate Freeze entity (recommended)
**Notes:** Matches ROADMAP “frozen ≠ done” and PROJECT explicit/countable constraint.

| Option | Description | Selected |
|--------|-------------|----------|
| Mutual exclusion complete ↔ freeze | At most one per day | ✓ |
| Allow both complete and freeze same day | Nonsensical ledger | |

**User's choice:** [auto] Mutual exclusion (recommended)

---

## Mark Freeze UX

| Option | Description | Selected |
|--------|-------------|----------|
| Today secondary Skip + History freeze interaction | Preserve one-tap complete; ledger on History | ✓ |
| History-only freeze | Weaker for “skip today” vacation case | |
| Replace Today tap with three-state cycle | Breaks core one-tap complete value | |

**User's choice:** [auto] Today secondary + History freeze (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Hide frozen-today from Hoy | Today = actionable only (Phase 1 D-02) | ✓ |
| Keep row visible in frozen state on Hoy | Extra chrome on action queue | |

**User's choice:** [auto] Hide from Today when frozen (recommended)

---

## Streak Bridge Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Bridge without increment (like non-scheduled gap) | Preserves chain; streak stays honest | ✓ |
| Freeze counts as a completed day toward streak | Over-forgiving (FEATURES.md risk) | |
| Freeze only blocks break but zeros display | Punitive / confusing | |

**User's choice:** [auto] Bridge without increment (recommended)
**Notes:** Respects Phase 2 D-13 (no streak before first real completion) and D-15 grace when today is due+incomplete+unfrozen.

| Option | Description | Selected |
|--------|-------------|----------|
| X/week: day freezes reduce weekly `effectiveTimes` | Day-level model stays unified | ✓ |
| X/week: whole-week “skip week” only | Second product concept | |
| X/week: freeze ignored (day freezes N/A) | Breaks ENH-05 for flexible habits | |

**User's choice:** [auto] Reduce effective weekly quota per freeze day (recommended)

---

## Rate & Quota Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude freeze from numerator and denominator | Excused; frozen ≠ done, ≠ miss | ✓ |
| Count freeze as scheduled miss (0 in numerator) | Punishes intentional skip | |
| Count freeze as completed for rate | Misleading (ROADMAP forbids) | |

**User's choice:** [auto] Exclude from both sides (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| X/week scheduled uses `effectiveTimes` | Aligns rate with streak hit rule | ✓ |
| Keep full `times` in denominator when frozen | Undercounts honesty of skip | |

**User's choice:** [auto] `effectiveTimes` for scheduled (recommended)

---

## Heatmap Distinction

| Option | Description | Selected |
|--------|-------------|----------|
| New `WeekDayState: 'frozen'` + distinct visual/tooltip | ROADMAP SC3 | ✓ |
| Reuse missed with different tooltip only | Not visually distinct enough | |
| Reuse completed with badge | Violates frozen ≠ done | |

**User's choice:** [auto] New frozen state (recommended)

---

## Backup & Dexie Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Dexie v2 + `freezes` store; backup v1 + optional `freezes[]` | Additive backup; real DB migration | ✓ |
| Backup version 2 required | Forces migration story for all exports | |
| Encode freezes inside completions JSON blob | Opaque; breaks typed queries | |

**User's choice:** [auto] Dexie bump + backup v1 additive array (recommended)
**Notes:** Same additive backup pattern as Phase 5 color / Phase 7 frequency union.

---

## Integrity Limits

| Option | Description | Selected |
|--------|-------------|----------|
| Unlimited freezes; always explicit & visible | Countable via heatmap + export | ✓ |
| Hard monthly freeze cap | Extra product rules not in SC | |
| Silent auto-freeze / travel mode | Violates PROJECT explicit-only constraint | |

**User's choice:** [auto] Unlimited but explicit/visible (recommended)

---

## Claude's Discretion

- Skip/Omitir copy and Today secondary control chrome
- History cycle vs long-press/secondary freeze pattern
- Frozen cell tokens / reduced motion
- Repository and hook naming
- Optional lightweight skip feedback (no new reward system)

## Deferred Ideas

- Soft freeze quotas / nags
- Auto-freeze rules (weekends, travel mode)
- Reminders about freezes — v2.0
- Numeric completions — out of scope
