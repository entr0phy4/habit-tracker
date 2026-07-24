import { describe, expect, it } from 'vitest';
import { isDaily, isDueOnDate, isHabitDueOnDate } from './schedule';

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

  it('evaluates each weekday boundary for Mon/Wed/Fri schedule', () => {
    const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
    const week = [
      { date: '2026-07-19', day: 'Sunday', due: false },
      { date: '2026-07-20', day: 'Monday', due: true },
      { date: '2026-07-21', day: 'Tuesday', due: false },
      { date: '2026-07-22', day: 'Wednesday', due: true },
      { date: '2026-07-23', day: 'Thursday', due: false },
      { date: '2026-07-24', day: 'Friday', due: true },
      { date: '2026-07-25', day: 'Saturday', due: false },
    ];

    for (const { date, due } of week) {
      expect(isDueOnDate(monWedFri, date)).toBe(due);
    }
  });

  it('returns false for times_per_week on any date', () => {
    const thrice = { type: 'times_per_week' as const, times: 3 };
    expect(isDueOnDate(thrice, '2026-07-20')).toBe(false);
    expect(isDueOnDate(thrice, '2026-07-22')).toBe(false);
  });
});

describe('isHabitDueOnDate', () => {
  const thrice = { type: 'times_per_week' as const, times: 3 };

  it('is due when week completions are below times', () => {
    const completed = new Set(['2026-07-20', '2026-07-21']);
    expect(isHabitDueOnDate(thrice, '2026-07-22', completed)).toBe(true);
  });

  it('is not due when week quota is met', () => {
    const completed = new Set(['2026-07-20', '2026-07-21', '2026-07-22']);
    expect(isHabitDueOnDate(thrice, '2026-07-23', completed)).toBe(false);
  });

  it('is not due when over-completed in the week', () => {
    const completed = new Set([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
    ]);
    expect(isHabitDueOnDate(thrice, '2026-07-24', completed)).toBe(false);
  });

  it('matches isDueOnDate for daily and weekly (ignores completions)', () => {
    const empty = new Set<string>();
    const filled = new Set(['2026-07-20', '2026-07-21', '2026-07-22']);
    expect(isHabitDueOnDate({ type: 'daily' }, '2026-07-21', filled)).toBe(
      true,
    );
    const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
    expect(isHabitDueOnDate(monWedFri, '2026-07-20', empty)).toBe(true);
    expect(isHabitDueOnDate(monWedFri, '2026-07-21', empty)).toBe(false);
  });
});

describe('isDaily', () => {
  it('returns true for daily and all-seven-day weekly frequencies', () => {
    expect(isDaily({ type: 'daily' })).toBe(true);
    expect(isDaily({ type: 'weekly', days: [0, 1, 2, 3, 4, 5, 6] })).toBe(true);
    expect(isDaily({ type: 'weekly', days: [1, 3, 5] })).toBe(false);
  });

  it('returns false for times_per_week even when times is 7', () => {
    expect(isDaily({ type: 'times_per_week', times: 7 })).toBe(false);
    expect(isDaily({ type: 'times_per_week', times: 3 })).toBe(false);
  });
});
