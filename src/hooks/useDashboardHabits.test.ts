import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { useDashboardHabits } from './useDashboardHabits';

const todayKey = '2026-07-21';

async function seedHabit(name: string, createdAt = '2026-07-01T12:00:00.000Z') {
  const habit = await habitRepository.create({
    name,
    frequency: { type: 'daily' },
  });
  await db.habits.update(habit.id, { createdAt });
  return { ...habit, createdAt };
}

async function completeDays(habitId: string, dates: string[]) {
  for (const date of dates) {
    await completionRepository.toggle(habitId, date);
  }
}

describe('useDashboardHabits', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-21T12:00:00'));

    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns loading status while query is pending', () => {
    const { result } = renderHook(() => useDashboardHabits(todayKey));

    expect(result.current).toMatchObject({
      status: 'loading',
      isLoading: true,
      items: [],
      overallRate: 0,
    });
  });

  it('sorts habits by currentStreak descending', async () => {
    const lowStreak = await seedHabit('Short streak');
    const highStreak = await seedHabit('Long streak');

    await completeDays(lowStreak.id, ['2026-07-18', '2026-07-19', '2026-07-20']);
    await completeDays(highStreak.id, [
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
      '2026-07-19',
      '2026-07-20',
    ]);

    const { result } = renderHook(() => useDashboardHabits(todayKey));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]?.habit.name).toBe('Long streak');
    expect(result.current.items[0]?.currentStreak).toBe(7);
    expect(result.current.items[1]?.habit.name).toBe('Short streak');
    expect(result.current.items[1]?.currentStreak).toBe(3);
  });

  it('excludes archived habits from items and overallRate', async () => {
    const active = await seedHabit('Active', '2026-07-21T12:00:00.000Z');
    const archived = await seedHabit('Archived', '2026-07-21T12:00:00.000Z');

    await completeDays(active.id, ['2026-07-21']);
    await completeDays(archived.id, []);
    await habitRepository.archive(archived.id);

    const { result } = renderHook(() => useDashboardHabits(todayKey));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.habit.name).toBe('Active');
    // Active only: 1/1 → 100%; archived excluded
    expect(result.current.overallRate).toBe(100);
  });

  it('computes pooled overallRate across active habits', async () => {
    // Habit A: 1/1 complete; Habit B: 0/1 complete → pooled 50%
    const a = await seedHabit('A', '2026-07-21T12:00:00.000Z');
    await seedHabit('B', '2026-07-21T12:00:00.000Z');

    await completeDays(a.id, ['2026-07-21']);
    // B: no completions

    const { result } = renderHook(() => useDashboardHabits(todayKey));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.overallRate).toBe(50);
    expect(result.current.items).toHaveLength(2);
  });

  it('returns error status with empty items and zero rate on IndexedDB failure', async () => {
    await seedHabit('Will fail');

    vi.spyOn(db.habits, 'filter').mockImplementation(() => {
      throw new DOMException('The operation failed', 'AbortError');
    });

    const { result } = renderHook(() => useDashboardHabits(todayKey));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.overallRate).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates overallRate after completionRepository.toggle without reload', async () => {
    const habit = await seedHabit('Reactive', '2026-07-21T12:00:00.000Z');

    const { result } = renderHook(() => useDashboardHabits(todayKey));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.overallRate).toBe(0);
    expect(result.current.items[0]?.currentStreak).toBe(0);

    await completionRepository.toggle(habit.id, todayKey);

    await waitFor(() => {
      expect(result.current.overallRate).toBe(100);
      expect(result.current.items[0]?.currentStreak).toBe(1);
    });
  });
});
