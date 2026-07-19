import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iterateDaysInRange } from '@/domain/dates';
import { getHeatmapDateRange } from '@/domain/heatmap';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { useHeatmapData } from './useHeatmapData';

const todayKey = '2026-07-19';

function countDaysInRange(start: string, end: string): number {
  let count = 0;
  for (const _date of iterateDaysInRange(start, end)) {
    count++;
  }
  return count;
}

describe('useHeatmapData', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-19T12:00:00'));

    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns isLoading true and empty defaults while query is pending', () => {
    const { result } = renderHook(() =>
      useHeatmapData('habit-1', { type: 'daily' }, todayKey),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activities).toEqual([]);
    expect(result.current.cellStates.size).toBe(0);
  });

  it('queries completions across the 52-week heatmap range', async () => {
    const habit = await habitRepository.create({
      name: 'Daily habit',
      frequency: { type: 'daily' },
    });
    await db.habits.update(habit.id, { createdAt: '2025-01-01T12:00:00.000Z' });

    const { start, end } = getHeatmapDateRange(todayKey);
    await completionRepository.toggle(habit.id, '2026-07-18');

    const { result } = renderHook(() =>
      useHeatmapData(habit.id, habit.frequency, todayKey),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activities).toHaveLength(
      countDaysInRange(start, end),
    );
    expect(result.current.activities.at(-1)?.date).toBe(todayKey);
    expect(result.current.cellStates.get('2026-07-18')).toBe('completed');
    expect(result.current.cellStates.get('2026-07-17')).toBe('missed');
  });

  it('delegates toggle to completionRepository for habit and date', async () => {
    const habit = await habitRepository.create({
      name: 'Toggle habit',
      frequency: { type: 'daily' },
    });

    const { result } = renderHook(() =>
      useHeatmapData(habit.id, habit.frequency, todayKey),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.toggle('2026-07-18');

    const dates = await completionRepository.getByHabitInRange(
      habit.id,
      '2026-07-18',
      '2026-07-18',
    );
    expect(dates).toEqual(['2026-07-18']);
  });
});
