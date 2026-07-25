# Phase 9: PWA Install & Manifest - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-25
**Phase:** 9-PWA Install & Manifest
**Areas discussed:** Icono y marca, Aviso de instalación, Guía iOS, Entrada en Ajustes

---

## Icono y marca

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Extender favicon actual | Check verde sobre fondo oscuro, coherente con UI | |
| Llama/racha | Refuerza motivación de streaks, distinto del favicon | ✓ |
| Marca minimalista | Letra "H" o símbolo abstracto maskable | |

**Color de llama:** Verde (#3fb950) sobre fondo oscuro ✓  
**Fondo maskable:** #0d1117 con esquinas redondeadas ✓  
**Nombre en manifest:** "Habit Tracker" (inglés, como `<title>` actual) ✓

**Notas:** El usuario quiere un icono nuevo con temática de racha/llama, no una extensión del favicon existente.

---

## Aviso de instalación

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Tras engagement (2ª visita / 1er check-in) | Contextual, no primera visita | ✓ (discreción Claude) |
| Tras primer streak | Momento de valor tras recompensa visual | |
| Solo bajo demanda | Sin banner automático | |

**Ubicación:** Banner inferior encima del tab bar ✓  
**Mensaje:** Enfoque offline ("usar sin conexión y acceder más rápido") ✓  
**Descartar:** Ocultar 7 días, luego volver a mostrar ✓

---

## Guía iOS

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Detectar Safari iOS sin standalone | Mismo trigger que banner Android | ✓ (discreción Claude) |
| Pasos numerados con iconos | Compartir → Añadir → Confirmar | ✓ |
| Mencionar push ahora | Requisito para recordatorios futuros | ✓ |
| Banner + modal al tocar | Banner compacto, modal con pasos completos | ✓ |

**Notas:** El roadmap exige avisar que instalar en iOS es requisito para push. El usuario quiere mencionarlo ya en Fase 9.

---

## Entrada en Ajustes

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Nueva sección arriba de Copia de seguridad | Siempre visible si no instalado | ✓ |
| Ocultar si ya instalado | No mostrar en modo standalone | ✓ |
| Botón Instalar + fallback texto (Android) | Prompt nativo o instrucciones del navegador | ✓ (discreción Claude) |
| Botón "Cómo instalar" abre modal (iOS) | Mismo modal que el banner | ✓ |

---

## Claude's Discretion

- **Trigger de engagement:** 2ª visita o 1er check-in (lo que sea más fiable de detectar)
- **Detección iOS:** Safari en iOS, no standalone, mismo trigger de engagement
- **Android en Ajustes:** Botón Instalar + texto fallback si no hay `beforeinstallprompt`
- **`short_name`:** Decidir según truncamiento en iOS; default "Habit Tracker"

## Deferred Ideas

- Service worker, offline, update prompt → Fase 10
- Storage durability → Fase 11
- Reminder preferences y permisos → Fase 12
- Web Push → Fase 13
- Push relay → Fase 14
