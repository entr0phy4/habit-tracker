import { describe, expect, it } from 'vitest';
import { calculateCurrentStreak, calculateLongestStreak } from './streak';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
const times3 = { type: 'times_per_week' as const, times: 3 };

function completed(...dates: string[]): Set<string> {
  return new Set(dates);
}

function frozen(...dates: string[]): Set<string> {
  return new Set(dates);
}

describe('calculateCurrentStreak', () => {
  it('returns 0 for a new habit with no completions (D-13)', () => {
    expect(
      calculateCurrentStreak(completed(), daily, '2026-07-19', '2026-07-19'),
    ).toBe(0);
  });

  it('returns 5 when daily habit has 5-day run and today is incomplete (D-15)', () => {
    const dates = completed(
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
    );
    expect(calculateCurrentStreak(dates, daily, '2026-07-19', '2026-07-14')).toBe(5);
  });

  it('returns 6 when daily habit has 5-day run and today is complete', () => {
    const dates = completed(
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
      '2026-07-19',
    );
    expect(calculateCurrentStreak(dates, daily, '2026-07-19', '2026-07-14')).toBe(6);
  });

  it('counts only scheduled days for MWF — Mon complete on Tuesday rest day', () => {
    const dates = completed('2026-07-20');
    expect(
      calculateCurrentStreak(dates, monWedFri, '2026-07-21', '2026-07-20'),
    ).toBe(1);
  });

  it('counts Mon and Wed for MWF when both complete and evaluated on Thursday', () => {
    const dates = completed('2026-07-20', '2026-07-22');
    expect(
      calculateCurrentStreak(dates, monWedFri, '2026-07-23', '2026-07-20'),
    ).toBe(2);
  });

  it('returns 0 when a scheduled day was missed (D-14)', () => {
    const dates = completed(
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      // 2026-07-18 missed
      '2026-07-19',
    );
    expect(calculateCurrentStreak(dates, daily, '2026-07-19', '2026-07-14')).toBe(1);
  });

  it('counts consecutive past hit weeks and grants grace for unmet current week', () => {
    // Weeks: Jun 29–Jul 5 hit, Jul 6–12 hit, Jul 13–19 (today Thu) unmet
    const dates = completed(
      '2026-06-29',
      '2026-07-01',
      '2026-07-03',
      '2026-07-06',
      '2026-07-08',
      '2026-07-10',
      '2026-07-13',
    );
    expect(
      calculateCurrentStreak(dates, times3, '2026-07-16', '2026-06-29'),
    ).toBe(2);
  });

  it('breaks current streak when a fully past week misses the quota', () => {
    // Jul 6–12 miss (only 1), Jul 13–19 unmet → streak 0
    const dates = completed('2026-07-06', '2026-07-14');
    expect(
      calculateCurrentStreak(dates, times3, '2026-07-16', '2026-07-06'),
    ).toBe(0);
  });

  it('counts the current week toward streak when quota is already met', () => {
    const dates = completed(
      '2026-07-06',
      '2026-07-08',
      '2026-07-10',
      '2026-07-13',
      '2026-07-14',
      '2026-07-15',
    );
    expect(
      calculateCurrentStreak(dates, times3, '2026-07-16', '2026-07-06'),
    ).toBe(2);
  });

  it('returns 0 for times_per_week until the first hit week', () => {
    expect(
      calculateCurrentStreak(completed(), times3, '2026-07-16', '2026-07-13'),
    ).toBe(0);
  });

  it('bridges frozen due day without incrementing (Mon complete + freeze Tue + Wed complete → 2)', () => {
    const dates = completed('2026-07-20', '2026-07-22');
    const freezes = frozen('2026-07-21');
    expect(
      calculateCurrentStreak(
        dates,
        daily,
        '2026-07-22',
        '2026-07-20',
        freezes,
      ),
    ).toBe(2);
  });

  it('returns 0 when only freezes exist on a new habit (freeze never starts streak)', () => {
    expect(
      calculateCurrentStreak(
        completed(),
        daily,
        '2026-07-19',
        '2026-07-19',
        frozen('2026-07-19'),
      ),
    ).toBe(0);
  });

  it('includes yesterday when today is frozen after yesterday complete (D-13 bridge)', () => {
    const dates = completed('2026-07-18');
    const freezes = frozen('2026-07-19');
    expect(
      calculateCurrentStreak(
        dates,
        daily,
        '2026-07-19',
        '2026-07-18',
        freezes,
      ),
    ).toBe(1);
  });

  it('breaks streak on due miss (neither complete nor frozen)', () => {
    const dates = completed('2026-07-14', '2026-07-15', '2026-07-17');
    expect(
      calculateCurrentStreak(
        dates,
        daily,
        '2026-07-17',
        '2026-07-14',
        frozen(),
      ),
    ).toBe(1);
  });

  it('counts times_per_week week as hit with 1 freeze + 2 completions (effectiveTimes 2)', () => {
    const dates = completed('2026-07-14', '2026-07-15');
    const freezes = frozen('2026-07-16');
    expect(
      calculateCurrentStreak(
        dates,
        times3,
        '2026-07-16',
        '2026-07-13',
        freezes,
      ),
    ).toBe(1);
  });

  it('breaks times_per_week streak when past week misses effectiveTimes quota', () => {
    // Week Jul 6–12: 1 freeze, 1 completion → effectiveTimes 2, only 1 hit → miss
    const dates = completed('2026-07-06');
    const freezes = frozen('2026-07-07');
    expect(
      calculateCurrentStreak(
        dates,
        times3,
        '2026-07-16',
        '2026-07-06',
        freezes,
      ),
    ).toBe(0);
  });
});

describe('calculateLongestStreak', () => {
  it('returns 0 when no completions exist', () => {
    expect(
      calculateLongestStreak(completed(), daily, '2026-07-01', '2026-07-19'),
    ).toBe(0);
  });

  it('returns all-time max when past run exceeds current run (D-16)', () => {
    const dates = completed(
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      // gap on 2026-07-11
      '2026-07-12',
      '2026-07-13',
      '2026-07-14',
    );
    expect(calculateLongestStreak(dates, daily, '2026-07-01', '2026-07-14')).toBe(10);
    expect(calculateCurrentStreak(dates, daily, '2026-07-14', '2026-07-01')).toBe(3);
  });

  it('tracks longest run across non-scheduled gaps for MWF', () => {
    const dates = completed('2026-07-20', '2026-07-22', '2026-07-24');
    expect(
      calculateLongestStreak(dates, monWedFri, '2026-07-20', '2026-07-24'),
    ).toBe(3);
  });

  it('returns max consecutive hit weeks for times_per_week', () => {
    // Three hit weeks then a miss then one hit
    const dates = completed(
      '2026-06-22',
      '2026-06-23',
      '2026-06-24', // week Jun 22–28 hit
      '2026-06-29',
      '2026-07-01',
      '2026-07-03', // week Jun 29–Jul 5 hit
      '2026-07-06',
      '2026-07-08',
      '2026-07-10', // week Jul 6–12 hit
      // Jul 13–19 miss (0)
      '2026-07-20',
      '2026-07-21',
      '2026-07-22', // week Jul 20–26 hit
    );
    expect(
      calculateLongestStreak(dates, times3, '2026-06-22', '2026-07-22'),
    ).toBe(3);
  });
});
