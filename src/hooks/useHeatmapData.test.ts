import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iterateDaysInRange } from '@/domain/dates';
import { getHeatmapDateRange } from '@/domain/heatmap';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';
import { freezeRepository } from '@/infrastructure/freezeRepository';
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
    await db.freezes.clear();
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

  it('exposes frozen cell state when habit day is frozen', async () => {
    const habit = await habitRepository.create({
      name: 'Frozen habit',
      frequency: { type: 'daily' },
    });
    await db.habits.update(habit.id, { createdAt: '2025-01-01T12:00:00.000Z' });
    await freezeRepository.set(habit.id, '2026-07-18');

    const { result } = renderHook(() =>
      useHeatmapData(habit.id, habit.frequency, todayKey),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cellStates.get('2026-07-18')).toBe('frozen');
  });

  it('cycles empty → completed → frozen → empty on a missed day', async () => {
    const habit = await habitRepository.create({
      name: 'Cycle habit',
      frequency: { type: 'daily' },
    });
    const date = '2026-07-18';

    const { result } = renderHook(() =>
      useHeatmapData(habit.id, habit.frequency, todayKey),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cellStates.get(date)).toBe('missed');

    await result.current.cycle(date);
    await waitFor(() => {
      expect(result.current.cellStates.get(date)).toBe('completed');
    });

    await result.current.cycle(date);
    await waitFor(() => {
      expect(result.current.cellStates.get(date)).toBe('frozen');
    });

    await result.current.cycle(date);
    await waitFor(() => {
      expect(result.current.cellStates.get(date)).toBe('missed');
    });
  });

  it('cycles missed day to completed via cycle', async () => {
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

    await result.current.cycle('2026-07-18');

    const dates = await completionRepository.getByHabitInRange(
      habit.id,
      '2026-07-18',
      '2026-07-18',
    );
    expect(dates).toEqual(['2026-07-18']);
  });
});
