import { describe, expect, it } from 'vitest';
import {
  countCompletionsInCalendarWeek,
  getCalendarWeekDates,
  getLast7Days,
  getLocalDateString,
  getPreviousDay,
  isFutureDate,
  iterateCalendarWeeksInRange,
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
  it('counts only completions in the Mon–Sun week of dateInWeek', () => {
    // Week of 2026-07-19 (Sun): Mon 13 – Sun 19
    const completed = new Set([
      '2026-07-13',
      '2026-07-15',
      '2026-07-19',
      '2026-07-20', // next Monday — outside week
      '2026-07-12', // previous Sunday — outside week
    ]);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-19')).toBe(3);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-15')).toBe(3);
  });

  it('uses Mon–Sun boundaries across week start', () => {
    const completed = new Set(['2026-07-20', '2026-07-26']);
    // Week Mon 20 – Sun 26
    expect(countCompletionsInCalendarWeek(completed, '2026-07-20')).toBe(2);
    expect(countCompletionsInCalendarWeek(completed, '2026-07-23')).toBe(2);
  });
});

describe('iterateCalendarWeeksInRange', () => {
  it('yields Mon–Sun weeks overlapping the range', () => {
    const weeks = [...iterateCalendarWeeksInRange('2026-07-15', '2026-07-22')];
    expect(weeks).toEqual([
      { weekStart: '2026-07-13', weekEnd: '2026-07-19' },
      { weekStart: '2026-07-20', weekEnd: '2026-07-26' },
    ]);
  });
});
