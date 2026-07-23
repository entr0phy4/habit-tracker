---
status: complete
phase: 04-data-backup-restore
source: [04-VERIFICATION.md]
started: 2026-07-23T00:45:00Z
updated: 2026-07-23T12:01:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Real browser export download
expected: Seed habits (including archived) + completions; click Exportar datos; open downloaded file. Filename uses local date; payload complete; toast Backup exportado.
result: pass

### 2. Post-import UI consistency (Roadmap SC4)
expected: Import a known backup via Reemplazar; Hoy, Panel, and Historial heatmap show restored habits/streaks/completions without hard refresh.
result: pass

### 3. Settings has no tab bar
expected: Open /settings on ~375px viewport — no Hoy/Panel bottom tab bar; Volver returns to Today.
result: pass

### 4. Real file-picker rejection paths
expected: Import corrupt JSON → Archivo no válido; import version 2 → Versión de backup no compatible; ConfirmDialog never opens; prior data intact.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

*(none)*
