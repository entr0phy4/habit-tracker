---
phase: 04-data-backup-restore
plan: 01
subsystem: domain+infrastructure
tags: [zod, backup, dexie, tdd, export, import]

provides:
  - BackupPayload type
  - parseBackupJson with invalid / unsupported_version discrimination
  - exportBackup / importBackup transactional replace
  - buildBackupFilename + downloadBackupJson
affects:
  - 04-02-settings-shell
  - 04-03-settings-ux

tech-stack:
  added: [zod@4.4.3]
  patterns:
    - Pure domain Zod parse before any Dexie write
    - Dexie rw transaction clear + bulkAdd for full replace

key-files:
  created:
    - src/domain/backupSchema.ts
    - src/domain/backupSchema.test.ts
    - src/infrastructure/backupService.ts
    - src/infrastructure/backupService.test.ts
  modified:
    - src/domain/types.ts
    - package.json
    - package-lock.json

requirements-completed: [DATA-02, DATA-03]

duration: 8min
completed: 2026-07-23
status: complete
---

# Phase 04 Plan 01: Backup Schema & Service Summary

**Zod-validated backup parse and Dexie export/import service with transactional replace**

## Accomplishments
- Installed `zod@4.4.3`
- `parseBackupJson` returns `invalid` / `unsupported_version` / ok payload
- `exportBackup` includes archived habits; empty DB export allowed
- `importBackup` rolls back when bulkAdd throws inside transaction
- Dated filename helper `habit-tracker-backup-YYYY-MM-DD.json`

## Self-Check: PASSED
- FOUND: src/domain/backupSchema.ts
- FOUND: src/infrastructure/backupService.ts
- TESTS: 13/13 green for schema + service
