# Phase 4: Data Backup & Restore - Research

**Researched:** 2026-07-22
**Domain:** Versioned JSON export/import, Zod validation, Dexie transactional replace, Settings UI
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Settings Page & Navigation
- **D-01:** Dedicated settings page at `/settings` — export/import live here, not mixed into habit CRUD
- **D-02:** Gear icon in Today page header navigates to `/settings` — primary entry point
- **D-03:** Tab bar (Hoy/Panel) hidden on `/settings` — same pattern as form/edit routes (no `MainLayout` wrapper)
- **D-04:** All settings labels in Spanish — "Exportar datos", "Importar backup", etc.

#### Export Experience
- **D-05:** Single "Exportar datos" button triggers immediate JSON download — no preview step
- **D-06:** Filename pattern `habit-tracker-backup-YYYY-MM-DD.json` using local date
- **D-07:** Export includes all habits (including archived) and all completions — full backup
- **D-08:** Success feedback via sonner toast after download (Spanish copy)
- **D-09:** Empty database export allowed — valid JSON with empty arrays

#### Import Flow & Confirmation
- **D-10:** Import strategy is full replace after user confirms — no merge-by-ID in v1
- **D-11:** Pre-import warning shows habit count and completion count parsed from file plus explicit message that current data will be replaced
- **D-12:** Use existing `ConfirmDialog` with `destructive` styling — same pattern as habit delete
- **D-13:** On successful import: Spanish success toast + redirect to `/` (Today) so restored data is visible immediately

#### Validation, Errors & Trust
- **D-14:** Invalid/corrupt JSON rejected before confirm dialog — Spanish toast only ("Archivo no válido"), no raw Zod or Dexie error text in UI
- **D-15:** Backup `version` must be `1` in v1 — incompatible versions rejected with Spanish message ("Versión de backup no compatible")
- **D-16:** Import writes inside Dexie transaction — rollback on failure leaves current data intact; show Spanish error toast
- **D-17:** Backup JSON shape: `{ version: 1, exportedAt: ISO string, habits: Habit[], completions: Completion[] }` per stack convention

### Claude's Discretion (locked for planning)
- Exact Spanish toast/dialog strings — see UI-SPEC COPY CONTRACT
- Settings layout: section "Copia de seguridad", export button above import, within 480px AppShell
- Hidden `<input type="file" accept=".json,application/json">` for import
- Gear icon on **Today only** (not Dashboard) — primary daily-loop entry; Manage habits text link retained beside gear
- Export download via `URL.createObjectURL` + temporary `<a download>` click (widest browser support; revokeObjectURL after click)
- `backupService` lives in `src/infrastructure/` (matches existing Dexie adapters; no `services/` folder in repo)
- Pure Zod schemas in `src/domain/backupSchema.ts`; `BackupPayload` type in `src/domain/types.ts`
- No `useBackup` hook — SettingsPage calls `backupService` directly (same pattern as HabitEditPage → habitRepository)

### Deferred Ideas (OUT OF SCOPE)
- Cloud sync, merge-by-ID import, encrypted backups
- Schema migrations beyond rejecting `version !== 1`
- Persistent storage permission prompts (`navigator.storage.persist`)
- Automatic backup reminders
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-02 | User can export their data to a JSON file | `exportBackup()` reads all habits + completions; `downloadBackupFile()` triggers dated JSON download; Settings "Exportar datos" |
| DATA-03 | User can import data from a JSON backup file | `parseBackupJson` + Zod validate → ConfirmDialog with counts → `importBackup` transactional clear+bulkAdd → toast + navigate `/` |
</phase_requirements>

## Summary

Phase 4 closes the local-first durability gap: users can download a versioned JSON backup of every habit (including archived) and every completion, then restore that file with full-replace semantics after confirmation. Zod validates the payload **before** any IndexedDB write; invalid files never open the confirm dialog. Compatible `version: 1` payloads replace data inside a single Dexie `rw` transaction so a mid-write failure rolls back and leaves prior data intact.

The codebase already has ConfirmDialog, AppShell, sonner, and the MainLayout vs outside-route split. Missing pieces: `zod` dependency, domain schema/types, `backupService`, Settings page, `/settings` route, and a gear entry on Today. Repositories lack bulk APIs by design — backup reads/writes Dexie tables directly (ARCHITECTURE Pattern 4).

**Primary recommendation:** Install `zod@4.4.3`, add pure `parseBackupJson` / Zod schemas, implement `backupService` with fake-indexeddb round-trip tests, then ship Settings UI outside MainLayout with Spanish copy and ConfirmDialog-gated import.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Backup JSON schema + parse | Domain | — | Pure Zod; no Dexie/React |
| Export read + import replace | Infrastructure | Domain (validate first) | Cross-table transaction; bypasses habit/completion repos |
| Download blob / file picker | Browser / Client | Infrastructure (payload) | DOM APIs in page or thin helpers |
| Settings UI + confirm | Browser / Client | Infrastructure | Thin wrapper over backupService |
| Post-import UI refresh | Database / Storage | Hooks (`useLiveQuery`) | Transactional replace invalidates live queries automatically |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zod` | 4.4.3 | Runtime validation of backup JSON | Locked in STACK.md; validate before Dexie write |
| `dexie` | 4.4.4 (installed) | Transactional clear + bulkAdd | Existing schema v1; Pattern 4 |
| `sonner` | 2.0.7 (installed) | Success/error toasts | Established feedback channel |
| `react-router` | 8.2.0 (installed) | `/settings` route outside MainLayout | Same pattern as manage/edit |
| `lucide-react` | 1.25.0 (installed) | `Settings` gear icon on Today | Matches icon library |
| `date-fns` / `getLocalDateString` | 4.4.0 (installed) | Filename local date `YYYY-MM-DD` | Avoid UTC slice in filenames (D-06) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `fake-indexeddb` | 6.x (dev, installed) | Service integration tests | Round-trip export/import without browser |
| `@testing-library/react` | 16.x (installed) | SettingsPage + ConfirmDialog flows | File input + dialog interactions |
| Existing `ConfirmDialog` | — | Destructive import confirm | Do not add new Radix dialog |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| File System Access API for save | Weaker Safari/Firefox support than createObjectURL download |
| Merge-by-ID import | Explicitly deferred (D-10) |
| `useBackup` hook | No live query; page→service matches HabitEditPage pattern |
| `src/services/` folder | Repo has no services/; keep Dexie orchestration in infrastructure |
| localStorage backup | Contradicts IndexedDB + PROJECT.md constraints |

## Project Constraints (non-negotiable)

- Local-first only — no backend, auth, or cloud sync
- Validate with Zod before any IndexedDB write
- Version-stamp backups (`version: 1`)
- Transactional replace with rollback on failure
- Spanish UI labels/toasts for Settings (D-04); no raw Zod/Dexie errors in UI
- Touch targets ≥44px on export/import buttons and header gear

## Codebase Patterns (reuse)

| Pattern | Where | Apply to Phase 4 |
|---------|-------|------------------|
| Outside-MainLayout routes | `App.tsx` manage/edit/new | Add `/settings` sibling |
| ConfirmDialog destructive | `HabitEditPage` | Import confirm with counts in `description` |
| AppShell + back ChevronLeft Link | `ManageHabitsPage` | Settings back to `/` |
| Dexie `transaction('rw', ...)` | `habitRepository.delete` | Import clear + bulkAdd |
| fake-indexeddb `db.delete/open/clear` | `*Repository.test.ts`, hooks | `backupService.test.ts` |
| Page tests mock or MemoryRouter | `TodayPage.test.tsx` | SettingsPage tests |
| Per-function date-fns / local date | `dates.ts` | Filename via `getLocalDateString` |

## Don't Hand-Roll

| Problem | Use Instead |
|---------|-------------|
| Ad-hoc JSON shape checks | Zod schemas mirroring `Habit` / `Completion` / `Frequency` |
| Clear-then-write without transaction | Single `db.transaction('rw', db.habits, db.completions, ...)` |
| `toISOString().slice(0,10)` for filename | `getLocalDateString()` |
| Showing `error.message` from Zod/Dexie | Fixed Spanish toast strings only |
| Merge import logic | Full replace after confirm (D-10) |

## Common Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| PITFALLS #3: validate after clear | Parse+Zod **before** opening ConfirmDialog; never clear until confirm |
| Transaction not covering both tables | Pass `db.habits` and `db.completions` to the same transaction |
| Export omits archived habits | `db.habits.toArray()` with no archived filter (D-07) |
| Confirm dialog on invalid file | Reject invalid/unsupported version with toast only (D-14, D-15) |
| Gear replaces Manage habits | Keep Manage link; add Settings gear beside it |
| Domain imports Dexie | Keep Zod parse pure in domain; service owns DB I/O |

## Validation Rules (Zod)

```typescript
// Conceptual — implement in backupSchema.ts
BackupPayload = {
  version: literal(1),
  exportedAt: string (non-empty ISO-ish string),
  habits: Habit[],
  completions: Completion[],
}
Frequency = { type: 'daily' } | { type: 'weekly', days: number[] (0–6) }
Habit = { id, name, frequency, archived, createdAt }
Completion = { habitId, date } // date matches YYYY-MM-DD
```

Parse strategy:
1. `JSON.parse` in try/catch → on throw → `{ ok: false, error: 'invalid' }`
2. If parsed object has `version` present and `version !== 1` → `{ ok: false, error: 'unsupported_version' }` (even if other fields fail)
3. Else full Zod safeParse → fail → `invalid`
4. Success → `{ ok: true, data: BackupPayload }`

## Security (ASVS L1)

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Malicious/corrupt JSON wipe | High | Validate before write; confirm dialog; transactional rollback |
| Unsupported future schema | Medium | Reject `version !== 1` with clear message |
| XSS via habit names in UI | Low | React text escaping; never `dangerouslySetInnerHTML` on backup fields |
| Oversized file DoS | Low | Accept for v1 personal data; Zod still validates structure |

## Sources

- `.planning/phases/04-data-backup-restore/04-CONTEXT.md` — locked decisions (HIGH)
- `.planning/research/ARCHITECTURE.md` Pattern 4 — versioned backup payload (HIGH)
- `.planning/research/PITFALLS.md` Pitfall 3 — unsafe import (HIGH)
- STACK.md — zod 4.4.3, Dexie transactional writes (HIGH)
- Existing `habitRepository.delete` transaction — in-repo pattern (HIGH)

## Research Complete

Ready for pattern mapping, UI-SPEC, validation strategy, and plan generation.
