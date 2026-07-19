import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { useTodayHabits } from './useTodayHabits';

describe('useTodayHabits', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-21T12:00:00'));

    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty list when no habits are due today', async () => {
    await habitRepository.create({
      name: 'Gym',
      frequency: { type: 'weekly', days: [1, 3, 5] },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('includes weekly habits due on the mocked today date', async () => {
    const habit = await habitRepository.create({
      name: 'Team standup',
      frequency: { type: 'weekly', days: [2] },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current?.[0]?.habit.id).toBe(habit.id);
      expect(result.current?.[0]?.isCompleted).toBe(false);
    });
  });

  it('excludes archived habits even when due today', async () => {
    const habit = await habitRepository.create({
      name: 'Daily read',
      frequency: { type: 'daily' },
    });

    await habitRepository.archive(habit.id);

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('includes daily habits on any weekday', async () => {
    const habit = await habitRepository.create({
      name: 'Water',
      frequency: { type: 'daily' },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current?.[0]?.habit.id).toBe(habit.id);
    });
  });
});
