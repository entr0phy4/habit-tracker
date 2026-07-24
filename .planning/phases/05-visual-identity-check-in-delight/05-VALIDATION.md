# Phase 5 — Validation Strategy

## ENH-01
- Unit: colors presets, normalize, heatmap theme
- Unit/component: HabitForm swatches submit color
- Component: HabitRow/DashboardCard/Heatmap consume color

## ENH-02
- Component: HabitRow reward attribute on complete-only
- Manual UAT: pulse visible; reduced-motion skips motion

## Nyquist mapping
| Requirement | Automated | Manual |
|-------------|-----------|--------|
| ENH-01 pick color | HabitForm.test | Create/edit habit |
| ENH-01 surfaces | HabitRow/Dashboard/Heatmap tests | Visual scan |
| ENH-02 reward | HabitRow reward tests | Toggle today |
| Contrast | buildHeatmapTheme level0 fixed | Spot-check swatches on dark bg |
