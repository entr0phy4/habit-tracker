---
phase: 4
slug: data-backup-restore
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** `npx vitest run <changed-test-file> -x`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DATA-03 | unit | `npx vitest run src/domain/backupSchema.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DATA-02 | unit | `npx vitest run src/domain/backupSchema.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | DATA-02, DATA-03 | integration | `npx vitest run src/infrastructure/backupService.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | DATA-02, DATA-03 | component | `npx vitest run src/pages/SettingsPage.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | DATA-02 | component | `npx vitest run src/pages/TodayPage.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | DATA-02, DATA-03 | component | `npx vitest run src/pages/SettingsPage.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 3 | DATA-03 | component | `npx vitest run src/pages/SettingsPage.test.tsx -x` | ❌ W0 | ⬜ pending |

---

## Nyquist Predicates (must be tested)

### DATA-02 Export

1. Empty DB → payload with `version: 1`, empty arrays, non-empty `exportedAt`
2. Habits including archived + all completions appear in export
3. Filename matches `habit-tracker-backup-YYYY-MM-DD.json` for local today

### DATA-03 Import

1. Valid payload round-trips (export → clear DB → import → equal data)
2. Invalid JSON → `invalid` (no DB mutation)
3. `version: 2` (or other) → `unsupported_version`
4. Missing required habit fields → `invalid`
5. Failed transaction leaves prior habits/completions intact
6. Confirm dialog shows habit and completion counts from parsed file
7. Successful import navigates to `/` (assert `navigate` or location)

### UI

1. `/settings` renders Spanish labels from UI-SPEC
2. Today header exposes link to `/settings` with `aria-label="Ajustes"`
3. Invalid file never opens ConfirmDialog

---

## Validation Sign-Off

- [ ] All tasks have automated verify
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
