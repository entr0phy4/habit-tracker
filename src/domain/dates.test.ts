import { describe, expect, it } from 'vitest';
import {
  countCompletionsInCalendarWeek,
  getCalendarWeekDates,
  getLast7Days,
  getLocalDateString,
  getPreviousDay,
  isFutureDate,
  iterateDaysInRange,
} from './dates';

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

describe('getPreviousDay', () => {
  it('returns the prior calendar day across a month boundary', () => {
    expect(getPreviousDay('2026-07-01')).toBe('2026-06-30');
  });
});

describe('iterateDaysInRange', () => {
  it('yields inclusive start and end dates', () => {
    const dates = [...iterateDaysInRange('2026-07-13', '2026-07-15')];
    expect(dates).toEqual(['2026-07-13', '2026-07-14', '2026-07-15']);
  });
});

describe('getCalendarWeekDates', () => {
  it('returns Mon–Sun calendar week containing today (D-09)', () => {
    const fixedToday = new Date(2026, 6, 19);
    const dates = getCalendarWeekDates(fixedToday);
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-07-13');
    expect(dates[6]).toBe('2026-07-19');
  });
});

describe('countCompletionsInCalendarWeek', () => {
  it('counts Mon–Sun membership for a date in the week', () => {
    // Week of 2026-07-13 (Mon) … 2026-07-19 (Sun)
    const completed = new Set([
      '2026-07-13',
      '2026-07-15',
      '2026-07-19',
      '2026-07-12', // previous Sunday — outside
      '2026-07-20', // next Monday — outside
    ]);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-16')).toBe(3);
  });

  it('ignores completions outside the Mon–Sun week', () => {
    const completed = new Set(['2026-07-12', '2026-07-20', '2026-07-06']);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-15')).toBe(0);
  });

  it('includes Sunday and Monday boundary dates of the same week', () => {
    const completed = new Set(['2026-07-13', '2026-07-19']);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-13')).toBe(2);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-19')).toBe(2);
  });
});
