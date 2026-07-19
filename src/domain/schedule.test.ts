import { describe, expect, it } from 'vitest';
import { isDaily, isDueOnDate } from './schedule';

describe('isDueOnDate', () => {
  it('returns true for daily frequency on any date', () => {
    expect(isDueOnDate({ type: 'daily' }, '2026-07-19')).toBe(true);
  });

  it('returns true only on scheduled weekdays for weekly frequency', () => {
    const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

    expect(isDueOnDate(monWedFri, '2026-07-20')).toBe(true);
    expect(isDueOnDate(monWedFri, '2026-07-21')).toBe(false);
    expect(isDueOnDate(monWedFri, '2026-07-22')).toBe(true);
    expect(isDueOnDate(monWedFri, '2026-07-23')).toBe(false);
    expect(isDueOnDate(monWedFri, '2026-07-24')).toBe(true);
    expect(isDueOnDate(monWedFri, '2026-07-25')).toBe(false);
    expect(isDueOnDate(monWedFri, '2026-07-26')).toBe(false);
  });
});

describe('isDaily', () => {
  it('returns true for daily and all-seven-day weekly frequencies', () => {
    expect(isDaily({ type: 'daily' })).toBe(true);
    expect(isDaily({ type: 'weekly', days: [0, 1, 2, 3, 4, 5, 6] })).toBe(true);
    expect(isDaily({ type: 'weekly', days: [1, 3, 5] })).toBe(false);
  });
});
