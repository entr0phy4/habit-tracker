/** Curated habit accent palette (dark-UI friendly). See Phase 5 D-03. */
export const HABIT_COLOR_PRESETS = [
  '#3fb950',
  '#58a6ff',
  '#f778ba',
  '#d29922',
  '#a371f7',
  '#39c5cf',
  '#f85149',
  '#8b949e',
] as const;

export type HabitColorPreset = (typeof HABIT_COLOR_PRESETS)[number];

export const DEFAULT_HABIT_COLOR: HabitColorPreset = '#3fb950';

const PRESET_SET = new Set<string>(HABIT_COLOR_PRESETS);

export function normalizeHabitColor(value?: string | null): string {
  if (value && PRESET_SET.has(value)) {
    return value;
  }
  return DEFAULT_HABIT_COLOR;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace('#', '');
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Mix `hex` toward white by `amount` (0–1). */
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

/** Mix `hex` toward black by `amount` (0–1). */
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/**
 * Build react-activity-calendar dark theme from a habit accent.
 * Level 0 stays the empty cell muted surface; 1–4 ramp the habit color.
 */
export function buildHeatmapTheme(hex: string): { dark: string[] } {
  const base = normalizeHabitColor(hex);
  return {
    dark: [
      '#21262d',
      darken(base, 0.45),
      darken(base, 0.2),
      base,
      lighten(base, 0.25),
    ],
  };
}
