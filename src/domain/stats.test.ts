import { describe, expect, it } from 'vitest';
import { calculateCompletionRate, getWeekDayState } from './stats';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

function completed(...dates: string[]): Set<string> {
  return new Set(dates);
}

describe('calculateCompletionRate', () => {
  const fixedToday = new Date(2026, 6, 16);

  it('returns 0% for a new habit with no completions', () => {
    expect(
      calculateCompletionRate(
        completed(),
        daily,
        '2026-07-16',
        '2026-07-16',
        fixedToday,
      ),
    ).toBe(0);
  });

  it('returns 100% when all scheduled days since creation are complete', () => {
    expect(
      calculateCompletionRate(
        completed('2026-07-14', '2026-07-15', '2026-07-16'),
        daily,
        '2026-07-14',
        '2026-07-16',
        fixedToday,
      ),
    ).toBe(100);
  });

  it('returns 67% when 2 of 3 scheduled days are complete (D-08)', () => {
    expect(
      calculateCompletionRate(
        completed('2026-07-14', '2026-07-15'),
        daily,
        '2026-07-14',
        '2026-07-16',
        fixedToday,
      ),
    ).toBe(67);
  });

  it('excludes future scheduled days from the denominator', () => {
    expect(
      calculateCompletionRate(
        completed('2026-07-14', '2026-07-15'),
        daily,
        '2026-07-14',
        '2026-07-20',
        fixedToday,
      ),
    ).toBe(67);
  });
});

describe('getWeekDayState', () => {
  const today = '2026-07-23';

  it('returns not-scheduled for a non-due day on MWF habit (Tuesday)', () => {
    expect(getWeekDayState('2026-07-21', monWedFri, completed(), today)).toBe(
      'not-scheduled',
    );
  });

  it('returns missed for a scheduled past day without completion', () => {
    expect(getWeekDayState('2026-07-20', monWedFri, completed(), today)).toBe(
      'missed',
    );
  });

  it('returns future for a scheduled day later in the calendar week', () => {
    expect(getWeekDayState('2026-07-24', monWedFri, completed(), today)).toBe(
      'future',
    );
  });

  it('returns completed when the scheduled day is in the completion set', () => {
    expect(
      getWeekDayState('2026-07-20', monWedFri, completed('2026-07-20'), today),
    ).toBe('completed');
  });
});
