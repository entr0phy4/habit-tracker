# Phase 3: Dashboard & Progress Visualization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-19
**Phase:** 3-Dashboard & Progress Visualization
**Areas discussed:** Navegación, Tarjetas del dashboard, Ubicación del heatmap, Interacción del heatmap

---

## Navegación

| Option | Description | Selected |
|--------|-------------|----------|
| Barra inferior fija | Pestañas "Hoy" y "Panel" siempre visibles | ✓ |
| Enlace en cabecera | Icono o texto "Panel" en header de Hoy | |
| Tú decides | Dejar al planificador | |

**User's choice:** Barra inferior con dos pestañas "Hoy" + "Panel", etiquetas en español, Hoy sigue siendo `/` e inicio de la app.

---

## Tarjetas del dashboard

| Option | Description | Selected |
|--------|-------------|----------|
| Nombre + racha | Flame + número; mínimo y legible | ✓ |
| Nombre + racha + tasa | Añadir % completitud | |
| Nombre + racha + puntos semana | WeekDayDots | |

**User's choice:** Nombre + Flame + racha; orden por racha descendente; tap → historial; solo hábitos activos.

---

## Ubicación del heatmap

| Option | Description | Selected |
|--------|-------------|----------|
| Reemplazar rejilla semanal | Solo heatmap; elimina HistoryDotGrid | ✓ |
| Debajo de la semana | Mantener ambos | |
| Pestaña alternable | Semana vs Año | |

**User's choice:** Reemplazar week grid en `/habits/:id/history`; subtítulo "Historial"; back con historial del navegador.

---

## Interacción del heatmap

| Option | Description | Selected |
|--------|-------------|----------|
| 52 semanas | Estilo GitHub, scroll horizontal móvil | ✓ |
| Desde creación | Todo el historial | |
| Ocultar no programados | Solo días programados visibles | ✓ |
| Tooltip fecha + estado | Completado/Perdido/No programado | ✓ |
| Toggle hoy y pasado | Futuro deshabilitado | ✓ |

**User's choice:** Año GitHub, días no programados ocultos, tooltips con estado, toggle en hoy y pasado.

---

## Claude's Discretion

- Iconos de pestañas junto a etiquetas españolas
- Mapeo de tema react-activity-calendar a tokens existentes
- Eliminación vs conservación de HistoryDotGrid
- Empty state del dashboard
- Tamaño de celdas para touch targets 44px

## Deferred Ideas

- Tres pestañas con Gestionar
- Panel como pantalla de inicio
- Tarjetas con tasa o week dots
- Heatmap de historial completo
- Intensidad numérica en celdas (v2)
