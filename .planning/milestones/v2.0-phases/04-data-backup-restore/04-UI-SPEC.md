---
phase: 4
slug: data-backup-restore
status: draft
shadcn_initialized: true
preset: new-york, baseColor zinc, dark mode, Vite — matches Phase 1–3
created: 2026-07-22
---

# Phase 4 — UI Design Contract

> Visual and interaction contract for Data Backup & Restore. Extends Phase 1–3 design system. Generated for gsd-plan-phase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (initialized) |
| Preset | `new-york`, `baseColor: zinc`, dark mode — inherited |
| Component library | Existing `Button`, `ConfirmDialog` |
| Icon library | lucide-react (`Settings`, `ChevronLeft`) |
| Font | Inter (inherited) |

**Phase 4 adds no new shadcn components.**

**Root dark class / CSS tokens:** Unchanged from Phase 1.

| Token | Hex | Phase 4 usage |
|-------|-----|---------------|
| `--background` | `#0d1117` | Settings page surface |
| `--card` | `#161b22` | ConfirmDialog panel |
| `--border` | `#30363d` | Dialog border |
| `--muted-foreground` | `#8b949e` | Section subtitle, back link, Manage link |
| `--foreground` | `#e6edf3` | Page title, body |
| `--primary` | `#3fb950` | Primary export button |
| `--destructive` | `#f85149` | Import confirm button |
| `--ring` | `#3fb950` | Focus on buttons / gear |

---

## Spacing Scale

Inherited. Phase 4 usage:

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Gap between export and import buttons |
| md | 16px | Page horizontal padding; section padding |
| lg | 24px | Back link → section heading |
| xl | 32px | Unused |

| Exception | Value | Usage |
|-----------|-------|-------|
| touch-min | 44px | Export/import buttons (`min-h-11`); Settings gear (`min-h-11 min-w-11`); back link |

Settings is **outside** MainLayout — use AppShell **without** `hasTabBar` (default `pb-16`).

---

## Typography

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Heading | 20px | 600 | AppShell title "Ajustes" |
| Body | 14px | 400 | Confirm description counts |
| Label | 12px | 600 | Section heading "Copia de seguridad" |
| Label | 12px | 400 | Helper line under section (optional) |

---

## COPY CONTRACT (Spanish)

### Settings page

| Element | Copy |
|---------|------|
| Page title | `Ajustes` |
| Back link | `Volver` |
| Section heading | `Copia de seguridad` |
| Section helper | `Exporta o restaura todos tus hábitos y completados.` |
| Export button | `Exportar datos` |
| Import button | `Importar backup` |

### Toasts

| Event | Copy |
|-------|------|
| Export success | `Backup exportado` |
| Import success | `Backup restaurado` |
| Invalid / corrupt JSON | `Archivo no válido` |
| `version !== 1` | `Versión de backup no compatible` |
| Import write failure | `No se pudo importar. Inténtalo de nuevo.` |

### ConfirmDialog (import)

| Prop | Copy |
|------|------|
| title | `¿Reemplazar todos los datos?` |
| description | `Se importarán {habits} hábitos y {completions} completados. Los datos actuales se eliminarán. Esta acción no se puede deshacer.` |
| confirmLabel | `Reemplazar` |
| cancelLabel | `Cancelar` |
| destructive | `true` |

### Today header

| Element | Copy / a11y |
|---------|-------------|
| Manage link | Keep existing `Manage habits` (English — pre-existing; do not Spanishize in this phase) |
| Settings gear | `aria-label="Ajustes"` (icon-only) |

---

## Layout

### Settings (`/settings`)

```
┌─────────────────────────────┐
│ Ajustes                     │
│ ← Volver                    │
│                             │
│ Copia de seguridad          │
│ Exporta o restaura…         │
│                             │
│ [ Exportar datos     ]      │  ← full width, default Button, min-h-11
│ [ Importar backup    ]      │  ← full width, outline Button, min-h-11
│                             │
└─────────────────────────────┘
```

- Max width 480px via AppShell
- Buttons stacked vertically, export above import
- Hidden file input; import button triggers `.click()` on input
- No cards, no tab bar, no FAB

### Today headerAction

```
[ Manage habits ]  [⚙]
```

- Flex row, `items-center gap-2`
- Gear: `Settings` icon `h-5 w-5`, link to `/settings`
- Do not place gear on Dashboard

### ConfirmDialog

Reuse existing component; description may be a string or short fragment with counts interpolated — no raw JSON preview.

---

## Interaction States

| Control | States |
|---------|--------|
| Export button | default → (optional disabled while exporting) → toast |
| Import button | default → file picker → validate → dialog or error toast |
| Confirm Reemplazar | closes dialog; on success toast + navigate `/`; on failure error toast, stay on Settings |
| Cancel / overlay | closes dialog; clears pending payload; no write |
| File input | reset `value` after each selection so same file can be re-chosen |

---

## Accessibility

- ConfirmDialog already `role="alertdialog"` with labelled title/description
- Gear link has visible focus ring and `aria-label="Ajustes"`
- File input associated via button click (visually hidden, not `display:none` if that breaks a11y — use `sr-only` or `className="hidden"` matching project convention)
- Buttons meet 44×44px minimum

---

## Out of Scope Visually

- Progress bars for large imports
- Backup preview tables
- Settings sections beyond backup (notifications, theme toggle)
- Spanishizing pre-existing Today/Manage English chrome (except new Ajustes strings)
