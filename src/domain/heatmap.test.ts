import { describe, expect, it } from 'vitest';
import { iterateDaysInRange } from './dates';
import {
  buildHeatmapActivities,
  formatHeatmapTooltip,
  getHeatmapDateRange,
  HEATMAP_WEEKS,
} from './heatmap';

const daily = { type: 'daily' as const };
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };
const fixedToday = '2026-07-19';

function completed(...dates: string[]): Set<string> {
  return new Set(dates);
}

function countDaysInRange(start: string, end: string): number {
  let count = 0;
  for (const _date of iterateDaysInRange(start, end)) {
    count++;
  }
  return count;
}

describe('getHeatmapDateRange', () => {
  it('returns end equal to today and start ~52 weeks before inclusive', () => {
    const { start, end } = getHeatmapDateRange(fixedToday);

    expect(end).toBe(fixedToday);
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(countDaysInRange(start, end)).toBeGreaterThanOrEqual(HEATMAP_WEEKS * 7 - 7);
    expect(countDaysInRange(start, end)).toBeLessThanOrEqual(HEATMAP_WEEKS * 7 + 7);
  });
});

describe('buildHeatmapActivities', () => {
  const { start, end } = getHeatmapDateRange(fixedToday);

  it('returns activities length matching iterateDaysInRange day count', () => {
    const { activities } = buildHeatmapActivities(
      daily,
      completed(),
      start,
      end,
      fixedToday,
    );

    expect(activities).toHaveLength(countDaysInRange(start, end));
    expect(activities[0]?.date).toBe(start);
    expect(activities.at(-1)?.date).toBe(end);
  });

  it('maps a completed daily habit day to level 4 and state completed', () => {
    const completionDate = '2026-07-18';
    const { activities, cellStates } = buildHeatmapActivities(
      daily,
      completed(completionDate),
      start,
      end,
      fixedToday,
    );

    const cell = activities.find((activity) => activity.date === completionDate);
    expect(cell).toEqual({ date: completionDate, count: 1, level: 4 });
    expect(cellStates.get(completionDate)).toBe('completed');
  });

  it('maps a missed scheduled day to level 0 and state missed', () => {
    const missedDate = '2026-07-17';
    const { activities, cellStates } = buildHeatmapActivities(
      daily,
      completed(),
      start,
      end,
      fixedToday,
    );

    const cell = activities.find((activity) => activity.date === missedDate);
    expect(cell).toEqual({ date: missedDate, count: 0, level: 0 });
    expect(cellStates.get(missedDate)).toBe('missed');
  });

  it('marks Tuesday as not-scheduled for an MWF habit', () => {
    const tuesday = '2026-07-15';
    const { cellStates } = buildHeatmapActivities(
      monWedFri,
      completed(),
      start,
      end,
      fixedToday,
    );

    expect(cellStates.get(tuesday)).toBe('not-scheduled');
  });
});

describe('formatHeatmapTooltip', () => {
  it('includes Completado for completed state', () => {
    expect(formatHeatmapTooltip('2026-07-14', 'completed')).toContain('Completado');
  });

  it('includes Perdido for missed state', () => {
    expect(formatHeatmapTooltip('2026-07-14', 'missed')).toContain('Perdido');
  });
});
