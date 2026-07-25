import { describe, expect, it } from 'vitest';
import {
  calculateCompletionRate,
  calculateOverallCompletionRate,
  countScheduledCompletions,
  getWeekDayState,
} from './stats';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
const times3 = { type: 'times_per_week' as const, times: 3 };

function completed(...dates: string[]): Set<string> {
  return new Set(dates);
}

function frozen(...dates: string[]): Set<string> {
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

  it('caps times_per_week counts per Mon–Sun week (under quota)', () => {
    // One full past week Jul 6–12 with 2 completions; today Jul 16
    expect(
      countScheduledCompletions(
        completed('2026-07-06', '2026-07-08'),
        times3,
        '2026-07-06',
        '2026-07-12',
        fixedToday,
      ),
    ).toEqual({ completed: 2, scheduled: 3 });
  });

  it('caps times_per_week completed at times when over-completed', () => {
    expect(
      countScheduledCompletions(
        completed(
          '2026-07-06',
          '2026-07-07',
          '2026-07-08',
          '2026-07-09',
          '2026-07-10',
        ),
        times3,
        '2026-07-06',
        '2026-07-12',
        fixedToday,
      ),
    ).toEqual({ completed: 3, scheduled: 3 });
  });

  it('excludes frozen due days from scheduled and completed (2 due, 1 complete, 1 frozen → 1/1)', () => {
    expect(
      countScheduledCompletions(
        completed('2026-07-14'),
        daily,
        '2026-07-14',
        '2026-07-15',
        fixedToday,
        frozen('2026-07-15'),
      ),
    ).toEqual({ completed: 1, scheduled: 1 });
  });

  it('uses effectiveTimes for times_per_week with freezes (times:3, 1 freeze, 2 completions → 2/2)', () => {
    expect(
      countScheduledCompletions(
        completed('2026-07-14', '2026-07-15'),
        times3,
        '2026-07-13',
        '2026-07-16',
        fixedToday,
        frozen('2026-07-16'),
      ),
    ).toEqual({ completed: 2, scheduled: 2 });
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

  it('uses capped week counts for a times_per_week habit', () => {
    // One week Jul 6–12: 2 of 3 → 67%
    const dates = completed('2026-07-06', '2026-07-08');
    expect(
      calculateOverallCompletionRate(
        [
          {
            frequency: times3,
            completedDates: dates,
            startDate: '2026-07-06',
          },
        ],
        '2026-07-12',
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

  it('never returns missed for times_per_week empty past days', () => {
    expect(getWeekDayState('2026-07-20', times3, completed(), today)).toBe(
      'not-scheduled',
    );
  });

  it('returns completed for times_per_week days with a completion', () => {
    expect(
      getWeekDayState('2026-07-20', times3, completed('2026-07-20'), today),
    ).toBe('completed');
  });

  it("returns frozen for a frozen date", () => {
    expect(
      getWeekDayState(
        '2026-07-20',
        daily,
        completed(),
        today,
        frozen('2026-07-20'),
      ),
    ).toBe('frozen');
  });

  it('never returns missed for times_per_week empty past days even with freezes elsewhere', () => {
    expect(
      getWeekDayState(
        '2026-07-20',
        times3,
        completed(),
        today,
        frozen('2026-07-21'),
      ),
    ).toBe('not-scheduled');
  });
});
