---
phase: 04-data-backup-restore
verified: 2026-07-23T00:45:00Z
status: human_needed
score: 18/19 must-haves verified
behavior_unverified: 1
overrides_applied: 0
behavior_unverified_items:
  - truth: "After a successful import, streaks, stats, dashboard, and contribution grids reflect the restored data"
    test: "Export a backup with habits+completions, change or clear local data, import the file, confirm on Today/Panel/History that restored habits, streaks, and heatmap match the backup without a hard refresh"
    expected: "Today lists restored due habits; Panel shows restored streaks; History heatmap cells match imported completions"
    why_human: "importBackup + navigate('/') is wired and useLiveQuery powers those views, but no E2E test asserts post-import UI across Today/Dashboard/Heatmap"
human_verification:
  - test: "Click Exportar datos in a real browser with seeded habits (incl. archived); open the downloaded habit-tracker-backup-YYYY-MM-DD.json"
    expected: "File downloads with local date in name; JSON has version 1, exportedAt, all habits including archived, and all completions"
    why_human: "Unit tests mock URL.createObjectURL/download; real browser download UX is unproven"
  - test: "Import a valid backup after confirming Reemplazar; check Hoy, Panel, and a habit Historial heatmap"
    expected: "Restored habits and completions appear; streaks and heatmap cells match backup without hard refresh"
    why_human: "Roadmap SC4 — reactive refresh after replace is architectural but not integration-tested across views"
  - test: "Open /settings on mobile width and confirm bottom tab bar (Hoy/Panel) is absent"
    expected: "Ajustes page shows no BottomTabBar; Volver returns to Today"
    why_human: "Route is outside MainLayout in App.tsx; visual absence of tab chrome is a human UX check"
  - test: "Attempt import of a truncated/corrupt .json and a file with version: 2"
    expected: "Spanish toasts Archivo no válido / Versión de backup no compatible; ConfirmDialog never opens; existing data unchanged"
    why_human: "Covered by unit/component tests with mocks; worth confirming with real file picker"
---

# Phase 4: Data Backup & Restore Verification Report

**Phase Goal:** Users can export their data for safekeeping and restore from a backup without losing trust in the app  
**Verified:** 2026-07-23T00:45:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

## User Flow Coverage

User story: *As a habit tracker user, I want to export and restore my habits as a JSON backup, so that my local data stays recoverable when the browser clears storage.*

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open Settings from Today | Gear link with aria-label Ajustes → `/settings` | `TodayPage.tsx` + `TodayPage.test.tsx` | ✓ |
| See Spanish Settings chrome | Title Ajustes; Exportar datos / Importar backup | `SettingsPage.tsx` + test | ✓ |
| Export data | Download versioned JSON; toast Backup exportado | `exportBackup` + `downloadBackupJson` + Settings tests | ✓ |
| Pick invalid file | Toast Archivo no válido; no dialog | `parseBackupJson` + SettingsPage test | ✓ |
| Pick unsupported version | Toast Versión de backup no compatible | D-15 path + test | ✓ |
| Pick valid file | ConfirmDialog with habit/completion counts | ConfirmDialog wiring + test | ✓ |
| Confirm replace | importBackup → toast Backup restaurado → `/` | SettingsPage handleConfirmImport + test | ✓ |
| Cancel replace | No write; dialog closes | Cancel test | ✓ |
| Outcome: trust + recoverability | Validate-before-write + transactional replace | Domain + service + UI tests | ✓ |
| Post-import views update | Today/Panel/History reflect restored data | useLiveQuery architecture; no cross-view E2E | ⚠️ present, behavior unverified |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can export all habits and completions to a downloadable JSON file (DATA-02, SC1) | ✓ VERIFIED | `exportBackup` + `downloadBackupJson`; Settings export test; empty + archived export service tests |
| 2 | User can import a previously exported JSON backup and see data restored (DATA-03, SC2) | ✓ VERIFIED | `importBackup` replace test; Settings confirm → `importBackup` + navigate `/` |
| 3 | Import validates before write and warns before replacing (SC3) | ✓ VERIFIED | `parseBackupJson` before dialog; ConfirmDialog destructive with counts; import only on confirm |
| 4 | After successful import, streaks/stats/dashboard/heatmaps reflect restored data (SC4) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Dexie replace + live queries + redirect; no E2E across views |
| 5 | Dedicated `/settings` outside MainLayout — no tab bar (D-01, D-03) | ✓ VERIFIED | `App.tsx` sibling route; `SettingsPage` AppShell without `hasTabBar` |
| 6 | Gear on Today navigates to Settings; Manage habits retained (D-02) | ✓ VERIFIED | `TodayPage` flex headerAction; test asserts both links |
| 7 | Spanish Settings labels and toasts (D-04, D-08, D-14, D-15) | ✓ VERIFIED | UI-SPEC copy in SettingsPage; tests assert toast strings |
| 8 | Export is one-tap download with dated filename (D-05, D-06) | ✓ VERIFIED | `buildBackupFilename` uses `getLocalDateString`; service + page tests |
| 9 | Export includes archived habits; empty DB allowed (D-07, D-09) | ✓ VERIFIED | `toArray()` no archived filter; empty export test |
| 10 | Full replace only — no merge (D-10) | ✓ VERIFIED | `clear` + `bulkAdd` both tables; no merge code |
| 11 | Confirm shows counts + destructive ConfirmDialog (D-11, D-12) | ✓ VERIFIED | Description interpolates lengths; `destructive` prop; test |
| 12 | Success toast + redirect to Today (D-13) | ✓ VERIFIED | `toast.success('Backup restaurado')` + `navigate('/')` test |
| 13 | Corrupt JSON → invalid toast, no dialog (D-14) | ✓ VERIFIED | schema + SettingsPage tests |
| 14 | version !== 1 → unsupported_version toast (D-15) | ✓ VERIFIED | schema short-circuit + SettingsPage test |
| 15 | Transactional import rollback on failure (D-16) | ✓ VERIFIED | `backupService.test.ts` bulkAdd throw leaves prior data |
| 16 | Backup shape `{ version: 1, exportedAt, habits, completions }` (D-17) | ✓ VERIFIED | `BackupPayload` type + Zod schema + export |
| 17 | No raw Zod/Dexie errors in UI | ✓ VERIFIED | Fixed Spanish strings only in catch/toast paths |
| 18 | Domain parse has no Dexie/React imports | ✓ VERIFIED | `backupSchema.ts` imports only `zod` + types |
| 19 | Filename must not use UTC slice | ✓ VERIFIED | `getLocalDateString`; no `toISOString().slice` in src |

**Score:** 18/19 must-haves verified (1 present, behavior-unverified for SC4)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/domain/types.ts` | `BackupPayload` | ✓ VERIFIED | `version: 1`, arrays |
| `src/domain/backupSchema.ts` | Zod parse | ✓ VERIFIED | `parseBackupJson` |
| `src/domain/backupSchema.test.ts` | Parse predicates | ✓ VERIFIED | 7 tests |
| `src/infrastructure/backupService.ts` | Export/import/download | ✓ VERIFIED | Transactional replace |
| `src/infrastructure/backupService.test.ts` | Round-trip + rollback | ✓ VERIFIED | 6 tests |
| `src/pages/SettingsPage.tsx` | Settings UX | ✓ VERIFIED | Export/import/dialog |
| `src/pages/SettingsPage.test.tsx` | UI trust loop | ✓ VERIFIED | 8 tests |
| `src/App.tsx` | `/settings` route | ✓ VERIFIED | Outside MainLayout |
| `src/pages/TodayPage.tsx` | Gear entry | ✓ VERIFIED | Settings + Manage |
| `package.json` | zod dependency | ✓ VERIFIED | `"zod": "^4.4.3"` |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| TodayPage | `/settings` | gear Link | ✓ WIRED | `aria-label="Ajustes"` |
| App | SettingsPage | Route outside MainLayout | ✓ WIRED | Sibling of manage/edit |
| SettingsPage | `exportBackup` / `downloadBackupJson` | handleExport | ✓ WIRED | Toast after download |
| SettingsPage | `parseBackupJson` | handleFileChange | ✓ WIRED | Before dialog open |
| SettingsPage | ConfirmDialog | pendingPayload state | ✓ WIRED | Counts from arrays |
| SettingsPage | `importBackup` | onConfirm only | ✓ WIRED | Then navigate `/` |
| `importBackup` | Dexie | `transaction('rw', habits, completions)` | ✓ WIRED | clear + bulkAdd |
| `buildBackupFilename` | `getLocalDateString` | dates.ts | ✓ WIRED | Local YYYY-MM-DD |

### Data-Flow Trace

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `exportBackup` | habits, completions | `db.*.toArray()` | Yes — fake-indexeddb service tests | ✓ FLOWING |
| `parseBackupJson` | BackupPayload | Zod safeParse | Yes — fixture JSON tests | ✓ FLOWING |
| `importBackup` | tables | validated payload | Yes — replace + rollback tests | ✓ FLOWING |
| SettingsPage | pendingPayload | file → parse | Yes — component tests with File + mocks | ✓ FLOWING |
| Post-import UI | live queries | Dexie after replace | Architectural only — not E2E tested | ⚠️ UNVERIFIED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Schema unit tests | `npx vitest run src/domain/backupSchema.test.ts` | 7 passed | ✓ PASS |
| Service tests | `npx vitest run src/infrastructure/backupService.test.ts` | 6 passed | ✓ PASS |
| Settings + Today UI | `npx vitest run src/pages/SettingsPage.test.tsx src/pages/TodayPage.test.tsx` | 12 passed | ✓ PASS |
| Full suite | `npm test` | 121 passed (24 files) | ✓ PASS |
| Production build | `npm run build` (prior execution) | tsc + vite succeeded | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no probe scripts for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| **DATA-02** | 04-01, 04-02, 04-03 | User can export their data to a JSON file | ✓ SATISFIED | Service + Settings export path |
| **DATA-03** | 04-01, 04-02, 04-03 | User can import data from a JSON backup file | ✓ SATISFIED | Parse + confirm + import path |

No orphaned requirement IDs — DATA-02 and DATA-03 mapped and checked in REQUIREMENTS.md.

### Prohibitions Verified

| Prohibition | Status | Evidence |
|-------------|--------|----------|
| Must not clear IndexedDB before successful parse/validation | ✓ CLEAR | Parse → dialog → confirm → import |
| Must not put Zod schemas in React components | ✓ CLEAR | Schema in `domain/backupSchema.ts` |
| Must not use `toISOString().slice(0,10)` for filenames | ✓ CLEAR | `getLocalDateString` only |
| Must not nest `/settings` under MainLayout | ✓ CLEAR | Outside in `App.tsx` |
| Must not remove Manage habits from Today | ✓ CLEAR | Link still present |
| Must not show raw Zod/Dexie errors | ✓ CLEAR | Fixed Spanish toasts |
| Must not call `importBackup` before confirm | ✓ CLEAR | Only in `handleConfirmImport` |
| Must not merge-by-ID | ✓ CLEAR | Full replace only |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None | — | No TBD/FIXME/XXX/TODO stubs in phase deliverables |

### Human Verification Required

### 1. Real browser export download

**Test:** Seed habits (including one archived) + completions; click Exportar datos; open the downloaded file.  
**Expected:** Filename `habit-tracker-backup-YYYY-MM-DD.json` (local date); payload includes archived habit and all completions; toast "Backup exportado".  
**Why human:** Download path mocked in unit tests.

### 2. Post-import UI consistency (Roadmap SC4)

**Test:** Import a known backup via ConfirmDialog; inspect Hoy, Panel, and Historial heatmap.  
**Expected:** Restored habits/streaks/heatmap match backup without hard refresh.  
**Why human:** Cross-view reactivity after replace not covered by E2E tests.

### 3. Settings has no tab bar

**Test:** Open `/settings` on ~375px viewport.  
**Expected:** No Hoy/Panel bottom tab bar; Volver returns home.  
**Why human:** Visual chrome check.

### 4. Real file-picker rejection paths

**Test:** Import corrupt JSON and a `version: 2` file via the OS file picker.  
**Expected:** Matching Spanish error toasts; dialog never opens; prior data intact.  
**Why human:** Complements mocked component tests with real picker UX.

### Gaps Summary

No implementation gaps found for DATA-02/DATA-03. All planned artifacts exist, are wired, and pass **121** automated tests. Phase status is `human_needed` because Roadmap SC4 (post-import views) and real-browser download/file-picker checks require human UAT before full sign-off.

---

_Verified: 2026-07-23T00:45:00Z_  
_Verifier: Claude (gsd-verifier)_
