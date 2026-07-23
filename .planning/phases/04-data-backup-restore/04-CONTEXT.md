# Phase 4: Data Backup & Restore - Context

**Gathered:** 2026-07-19
**Status:** Complete — verified + UAT passed

<domain>
## Phase Boundary

Users can export all local habits and completions to a versioned JSON backup file and restore from a previously exported backup. Import validates the file with Zod before any IndexedDB write, shows a destructive confirmation with counts from the file, replaces all local data in a transactional write, and restores streaks, dashboard, and heatmaps reactively. Cloud sync, merge-by-ID import, and encrypted backups remain out of scope.

</domain>

<decisions>
## Implementation Decisions

### Settings Page & Navigation
- **D-01:** Dedicated settings page at `/settings` — export/import live here, not mixed into habit CRUD
- **D-02:** Gear icon in Today page header navigates to `/settings` — primary entry point
- **D-03:** Tab bar (Hoy/Panel) hidden on `/settings` — same pattern as form/edit routes (no `MainLayout` wrapper)
- **D-04:** All settings labels in Spanish — "Exportar datos", "Importar backup", etc.

### Export Experience
- **D-05:** Single "Exportar datos" button triggers immediate JSON download — no preview step
- **D-06:** Filename pattern `habit-tracker-backup-YYYY-MM-DD.json` using local date
- **D-07:** Export includes all habits (including archived) and all completions — full backup
- **D-08:** Success feedback via sonner toast after download (Spanish copy)
- **D-09:** Empty database export allowed — valid JSON with empty arrays

### Import Flow & Confirmation
- **D-10:** Import strategy is full replace after user confirms — no merge-by-ID in v1
- **D-11:** Pre-import warning shows habit count and completion count parsed from file plus explicit message that current data will be replaced
- **D-12:** Use existing `ConfirmDialog` with `destructive` styling — same pattern as habit delete
- **D-13:** On successful import: Spanish success toast + redirect to `/` (Today) so restored data is visible immediately

### Validation, Errors & Trust
- **D-14:** Invalid/corrupt JSON rejected before confirm dialog — Spanish toast only ("Archivo no válido"), no raw Zod or Dexie error text in UI
- **D-15:** Backup `version` must be `1` in v1 — incompatible versions rejected with Spanish message ("Versión de backup no compatible")
- **D-16:** Import writes inside Dexie transaction — rollback on failure leaves current data intact; show Spanish error toast
- **D-17:** Backup JSON shape: `{ version: 1, exportedAt: ISO string, habits: Habit[], completions: Completion[] }` per stack convention

### Claude's Discretion
- Exact Spanish toast strings (tone consistent with existing sonner messages)
- Settings page layout within 480px AppShell (section headings, button order export above import)
- Hidden `<input type="file" accept=".json,application/json">` trigger pattern for import
- Whether gear icon also appears on Dashboard header or only Today
- Export implementation (`URL.createObjectURL` + anchor click vs File System Access API — prefer widest browser support)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria (export, import, validate-before-write, post-import UI consistency)
- `.planning/REQUIREMENTS.md` — DATA-02 (export JSON), DATA-03 (import JSON backup)
- `.planning/PROJECT.md` — local-first constraint, export/import as v1 backup strategy

### Stack & Patterns
- `AGENTS.md` — Zod validation before Dexie bulk write; backup shape `{ version, exportedAt, habits, completions }`; transactional writes
- `.planning/phases/01-habit-management-daily-logging/01-CONTEXT.md` — ConfirmDialog for destructive actions; sonner toasts; AppShell patterns
- `.planning/phases/03-dashboard-progress-visualization/03-CONTEXT.md` — Spanish UI labels; tab bar visibility rules; reactive Dexie via `useLiveQuery`

### Code Integration Points
- `src/infrastructure/db.ts` — Dexie schema v1 (`habits`, `completions` compound key)
- `src/domain/types.ts` — `Habit` and `Completion` shapes for Zod schema
- `src/components/habits/ConfirmDialog.tsx` — reuse for import confirmation
- `src/components/layout/AppShell.tsx` — settings page shell without tab bar
- `src/pages/TodayPage.tsx` — gear icon entry point in header

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ConfirmDialog` — destructive import confirmation with accessible alertdialog
- `AppShell` — page layout with optional `headerAction` slot for gear icon on Today
- `db` (HabitTrackerDB) — bulk clear + bulk put in `transaction('rw', ...)` for replace import
- `habitRepository` / `completionRepository` — patterns for Dexie access; export may read tables directly
- `sonner` toasts — established error/success feedback (ContributionHeatmap, HabitEditPage)

### Established Patterns
- Routes outside `MainLayout` for non-tab-bar pages (forms, manage) — settings follows same rule
- Spanish user-facing copy in Phase 3 (Hoy, Panel, Historial, empty states)
- Domain/infrastructure split — Zod schema likely in `src/domain/` or `src/infrastructure/`, not in components
- `useLiveQuery` reactivity — post-import UI updates without manual refresh if Dexie tables replaced in transaction

### Integration Points
- New route `/settings` in `App.tsx` (outside `MainLayout`)
- Gear icon `headerAction` on `TodayPage` → `Link` or `navigate` to `/settings`
- Import file picker → validate → ConfirmDialog → `db.transaction` clear habits/completions → bulkAdd
- Export reads `db.habits.toArray()` + `db.completions.toArray()` → JSON blob download

</code_context>

<specifics>
## Specific Ideas

- User wants full trust: validate before write, warn with counts, transactional rollback on failure
- Filename dated for easy manual sorting in Downloads folder
- After import, land on Today to immediately see restored habits

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 4-Data Backup & Restore*
*Context gathered: 2026-07-19*
