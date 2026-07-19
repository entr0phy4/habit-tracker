import { describe, expect, it } from 'vitest';
import { calculateCurrentStreak, calculateLongestStreak } from './streak';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

function completed(...dates: string[]): Set<string> {
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
});
