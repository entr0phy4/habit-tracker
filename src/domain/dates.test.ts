import { describe, expect, it } from 'vitest';
import { getLast7Days, getLocalDateString, isFutureDate } from './dates';

describe('getLocalDateString', () => {
  it('formats dates as yyyy-MM-dd in local time', () => {
    const date = new Date(2026, 6, 19, 23, 30);
    expect(getLocalDateString(date)).toBe('2026-07-19');
  });

  it('does not use UTC ISO slice for calendar day keys', () => {
    const source = getLocalDateString.toString();
    expect(source).not.toContain('toISOString');
    expect(source).not.toContain('slice(0, 10)');
  });
});

describe('getLast7Days', () => {
  it('returns seven consecutive local date strings ending today', () => {
    const today = new Date(2026, 6, 19);
    const days = getLast7Days(today);
    expect(days).toHaveLength(7);
    expect(days[6]).toBe('2026-07-19');
    expect(days[0]).toBe('2026-07-13');
  });
});

describe('isFutureDate', () => {
  it('rejects tomorrow', () => {
    const today = new Date(2026, 6, 19);
    expect(isFutureDate('2026-07-20', today)).toBe(true);
  });

  it('allows today and past dates', () => {
    const today = new Date(2026, 6, 19);
    expect(isFutureDate('2026-07-19', today)).toBe(false);
    expect(isFutureDate('2026-07-18', today)).toBe(false);
  });
});
