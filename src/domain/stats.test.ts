import { describe, expect, it } from 'vitest';
import {
  calculateCompletionRate,
  calculateOverallCompletionRate,
  countScheduledCompletions,
  getWeekDayState,
} from './stats';

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

describe('countScheduledCompletions', () => {
  const fixedToday = new Date(2026, 6, 16);

  it('returns completed 2 and scheduled 3 for daily habit with 2 of 3 days done', () => {
    expect(
      countScheduledCompletions(
        completed('2026-07-14', '2026-07-15'),
        daily,
        '2026-07-14',
        '2026-07-16',
        fixedToday,
      ),
    ).toEqual({ completed: 2, scheduled: 3 });
  });

  it('caps times_per_week week at times for scheduled and completed (D-14)', () => {
    const thrice = { type: 'times_per_week' as const, times: 3 };
    const today = new Date(2026, 6, 22); // after week Mon 13 – Sun 19
    expect(
      countScheduledCompletions(
        completed('2026-07-13', '2026-07-14'),
        thrice,
        '2026-07-13',
        '2026-07-19',
        today,
      ),
    ).toEqual({ completed: 2, scheduled: 3 });

    expect(
      countScheduledCompletions(
        completed(
          '2026-07-13',
          '2026-07-14',
          '2026-07-15',
          '2026-07-16',
          '2026-07-17',
        ),
        thrice,
        '2026-07-13',
        '2026-07-19',
        today,
      ),
    ).toEqual({ completed: 3, scheduled: 3 });
  });
});

describe('calculateOverallCompletionRate', () => {
  const fixedToday = new Date(2026, 6, 16);

  it('matches calculateCompletionRate for a single habit', () => {
    const dates = completed('2026-07-14', '2026-07-15');
    const overall = calculateOverallCompletionRate(
      [{ frequency: daily, completedDates: dates, startDate: '2026-07-14' }],
      '2026-07-16',
      fixedToday,
    );
    const perHabit = calculateCompletionRate(
      dates,
      daily,
      '2026-07-14',
      '2026-07-16',
      fixedToday,
    );
    expect(overall).toBe(perHabit);
  });

  it('pools counts across habits — not the mean of per-habit rates (D-06)', () => {
    // Habit A: 1/1 = 100%; Habit B: 0/99 = 0%; mean would be 50%, pooled = 1%
    const habitADates = completed('2026-07-16');
    const habitBDates = completed();
    const habitBStart = '2026-04-09'; // 99 days through 2026-07-16 inclusive

    const overall = calculateOverallCompletionRate(
      [
        {
          frequency: daily,
          completedDates: habitADates,
          startDate: '2026-07-16',
        },
        {
          frequency: daily,
          completedDates: habitBDates,
          startDate: habitBStart,
        },
      ],
      '2026-07-16',
      fixedToday,
    );

    expect(overall).toBe(1);
    expect(overall).not.toBe(50);
  });

  it('returns 0 for an empty habit list (D-04)', () => {
    expect(calculateOverallCompletionRate([], '2026-07-16', fixedToday)).toBe(
      0,
    );
  });

  it('returns 0 when all habits have scheduled === 0', () => {
    // Range entirely in the future relative to fixedToday
    expect(
      calculateOverallCompletionRate(
        [
          {
            frequency: daily,
            completedDates: completed(),
            startDate: '2026-07-20',
          },
        ],
        '2026-07-22',
        fixedToday,
      ),
    ).toBe(0);
  });

  it('pools times_per_week using week-capped counts', () => {
    const thrice = { type: 'times_per_week' as const, times: 3 };
    const today = new Date(2026, 6, 22);
    // One week, 2 of 3 → 67%
    expect(
      calculateOverallCompletionRate(
        [
          {
            frequency: thrice,
            completedDates: completed('2026-07-13', '2026-07-14'),
            startDate: '2026-07-13',
          },
        ],
        '2026-07-19',
        today,
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

  it('never returns missed for times_per_week empty past days (D-16)', () => {
    const thrice = { type: 'times_per_week' as const, times: 3 };
    expect(getWeekDayState('2026-07-20', thrice, completed(), today)).toBe(
      'not-scheduled',
    );
    expect(
      getWeekDayState('2026-07-20', thrice, completed('2026-07-20'), today),
    ).toBe('completed');
    expect(getWeekDayState('2026-07-24', thrice, completed(), today)).toBe(
      'future',
    );
  });
});
