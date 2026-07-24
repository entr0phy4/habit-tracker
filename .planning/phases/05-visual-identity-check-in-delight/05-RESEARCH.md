# Phase 5 — Research

**Researched:** 2026-07-23  
**Domain:** Habit color personalization + check-in micro-rewards on existing Vite/React/Dexie SPA

## Summary

Phase 5 extends the Habit model with a persisted hex `color`, wires a curated swatch picker into `HabitForm`, tints Today/Panel/heatmap accents, and adds a CSS-only completion pulse. No new runtime dependencies. Backup stays at version 1 with optional `color` and a default fill for legacy rows/imports.

## Current State

| Area | State |
|------|--------|
| `Habit` type | No `color` field |
| Visual accents | Global `--primary` `#3fb950` |
| Heatmap theme | Fixed GitHub green scale |
| Check-in feedback | Strikethrough + muted bg + flame |
| Dexie | v1 stores; no color index needed |
| Backup Zod | Strict habit fields; adding optional `color` is backward compatible |

## Technical Approach

### Color persistence
- Add `color: string` to `Habit`
- `HABIT_COLOR_PRESETS` + `DEFAULT_HABIT_COLOR` in `src/domain/colors.ts`
- `normalizeHabitColor(value?: string): string` validates against presets (or accepts any preset hex); unknown → default
- Repository `create`/`update` accept `color`; normalize on write
- Read paths: when mapping habits for UI, normalize missing color (IndexedDB may hold pre-migration objects)

### Heatmap theme from hex
- Pure helper `buildHeatmapTheme(hex: string): { dark: string[] }`
- Level 0 = `#21262d` (existing empty)
- Levels 1–4 = mix hex toward white/brighter or darken progressively — keep WCAG-ish visibility on `#0d1117`
- Pass theme into `ActivityCalendar` `theme` prop

### Check-in animation
- Local React state `justCompleted` on HabitRow when `onToggle` fires and prior `isCompleted === false`
- CSS class with `@keyframes habit-check-pulse` (background-color flash) + short `scale(1.01)`
- `prefers-reduced-motion: reduce` → skip animation class
- Clear flag after ~300ms via `setTimeout` / `animationend`

### Backup
- Zod: `color: z.string().optional()` then map with normalize in parse or import path
- Prefer normalizing in `parseBackupJson` success path OR in `importBackup` when writing habits — keep domain pure: normalize in a domain helper called from import service

## Risks

| Risk | Mitigation |
|------|------------|
| Fixture tests omit `color` | Shared test helper `makeHabit()` with default color |
| Heatmap colors too dark | Unit-test theme has 5 distinct levels; visual check in UAT |
| Animation jank on swipe | Trigger pulse after toggle settles; don't fight swipe transform |
| Old backups reject | Optional color field; never require color in Zod |

## Out of Scope

ENH-03/04/05, QA-01, animation libraries, free color pickers

## Sources

- Existing codebase: HabitRow, DashboardCard, ContributionHeatmap, backupSchema
- `.planning/research/ARCHITECTURE.md` Habit.color?
- `react-activity-calendar` theme.dark array API (already in use)
