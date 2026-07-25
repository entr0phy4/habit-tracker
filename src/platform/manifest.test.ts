import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const manifestPath = resolve(process.cwd(), 'public/manifest.webmanifest');

describe('manifest.webmanifest', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    theme_color: string;
    background_color: string;
    icons: Array<{ src: string; sizes: string; purpose?: string }>;
  };

  it('has required install fields', () => {
    expect(manifest.name).toBe('Habit Tracker');
    expect(manifest.short_name).toBe('Habit Tracker');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0d1117');
    expect(manifest.background_color).toBe('#0d1117');
  });

  it('lists separate any and maskable icon entries', () => {
    const icons = manifest.icons;
    expect(icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any')).toBe(
      true,
    );
    expect(icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any')).toBe(
      true,
    );
    expect(
      icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'maskable'),
    ).toBe(true);
    expect(
      icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable'),
    ).toBe(true);

    for (const icon of icons) {
      expect(icon.src.startsWith('/icons/')).toBe(true);
    }
  });
});
