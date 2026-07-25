# Phase 4: Data Backup & Restore - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-19
**Phase:** 4-data-backup-restore
**Areas discussed:** Ubicación en la app, Flujo de importación, Experiencia de exportación, Errores y confianza

---

## Ubicación en la app

| Option | Description | Selected |
|--------|-------------|----------|
| Página dedicada /settings | Encaja con react-router, escala para más opciones | ✓ |
| Sección en Gestionar hábitos | Menos navegación, mezcla backup con CRUD | |
| Tú decides | Claude elige | |

**User's choice:** Página dedicada `/settings`
**Notes:** Acceso vía icono engranaje en header de Hoy. Tab bar oculta en Ajustes. Etiquetas en español.

---

## Flujo de importación

| Option | Description | Selected |
|--------|-------------|----------|
| Reemplazo total tras confirmar | Transacción Dexie limpia, alinea con ROADMAP | ✓ |
| Fusionar por ID | Complejo, fuera de MVP | |
| Advertencia con recuentos | X hábitos, Y completados + aviso de borrado | ✓ |
| ConfirmDialog destructivo | Patrón existente de eliminar hábito | ✓ |
| Toast + redirigir a Hoy | Ver datos restaurados al instante | ✓ |

**User's choice:** Reemplazo total, recuentos en diálogo, ConfirmDialog, toast + redirect a `/`

---

## Experiencia de exportación

| Option | Description | Selected |
|--------|-------------|----------|
| Botón → descarga inmediata | Una acción | ✓ |
| habit-tracker-backup-YYYY-MM-DD.json | Fácil de ordenar | ✓ |
| Todos hábitos (incl. archivados) + completados | Backup completo | ✓ |
| Toast "Backup exportado" | Feedback sonner | ✓ |
| Permitir export vacío | JSON válido sin datos | ✓ |

**User's choice:** Todas las opciones recomendadas

---

## Errores y confianza

| Option | Description | Selected |
|--------|-------------|----------|
| Toast español sin texto crudo | "Archivo no válido" | ✓ |
| Rechazar version !== 1 | "Versión de backup no compatible" | ✓ |
| Transacción con rollback | Datos actuales intactos si falla | ✓ |

**User's choice:** Todas las opciones recomendadas

---

## Claude's Discretion

- Textos exactos de toasts en español
- Layout de página Ajustes dentro de AppShell
- Patrón file input oculto para import
- Si el engranaje aparece también en Dashboard
- Mecanismo de descarga (createObjectURL vs File System Access API)

## Deferred Ideas

None
