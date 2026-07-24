import { describe, expect, it } from 'vitest';
import {
  buildHeatmapTheme,
  DEFAULT_HABIT_COLOR,
  HABIT_COLOR_PRESETS,
  normalizeHabitColor,
} from './colors';

describe('colors', () => {
  it('exports 8 presets including the default green', () => {
    expect(HABIT_COLOR_PRESETS).toHaveLength(8);
    expect(HABIT_COLOR_PRESETS).toContain('#3fb950');
    expect(DEFAULT_HABIT_COLOR).toBe('#3fb950');
  });

  it('normalizeHabitColor maps missing/invalid to default', () => {
    expect(normalizeHabitColor(undefined)).toBe(DEFAULT_HABIT_COLOR);
    expect(normalizeHabitColor('')).toBe(DEFAULT_HABIT_COLOR);
    expect(normalizeHabitColor('#ffffff')).toBe(DEFAULT_HABIT_COLOR);
    expect(normalizeHabitColor('#58a6ff')).toBe('#58a6ff');
  });

  it('buildHeatmapTheme returns a 5-level dark scale with muted empty cell', () => {
    const theme = buildHeatmapTheme('#3fb950');
    expect(theme.dark).toHaveLength(5);
    expect(theme.dark[0]).toBe('#21262d');
    expect(new Set(theme.dark).size).toBe(5);
  });
});
