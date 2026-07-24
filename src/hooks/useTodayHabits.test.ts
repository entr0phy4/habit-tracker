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
    vi.restoreAllMocks();
  });

  it('returns loading status while query is pending', () => {
    const { result } = renderHook(() => useTodayHabits());

    expect(result.current).toEqual({ status: 'loading' });
  });

  it('returns an empty list when no habits are due today', async () => {
    await habitRepository.create({
      name: 'Gym',
      frequency: { type: 'weekly', days: [1, 3, 5] },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toEqual({ status: 'ready', habits: [] });
    });
  });

  it('includes weekly habits due on the mocked today date', async () => {
    const habit = await habitRepository.create({
      name: 'Team standup',
      frequency: { type: 'weekly', days: [2] },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status !== 'ready') return;
      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0]?.habit.id).toBe(habit.id);
      expect(result.current.habits[0]?.isCompleted).toBe(false);
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
      expect(result.current).toEqual({ status: 'ready', habits: [] });
    });
  });

  it('includes daily habits on any weekday', async () => {
    const habit = await habitRepository.create({
      name: 'Water',
      frequency: { type: 'daily' },
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status !== 'ready') return;
      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0]?.habit.id).toBe(habit.id);
    });
  });

  it('returns error status when IndexedDB query fails', async () => {
    vi.spyOn(db.habits, 'filter').mockImplementation(() => {
      throw new DOMException('The operation failed', 'AbortError');
    });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toEqual({ status: 'error' });
    });
  });

  it('includes times_per_week habits when week completions are below quota', async () => {
    const habit = await habitRepository.create({
      name: 'Yoga',
      frequency: { type: 'times_per_week', times: 3 },
    });
    // Week Mon 2026-07-20 … Sun 2026-07-26; today Tue 2026-07-21
    await db.completions.put({ habitId: habit.id, date: '2026-07-20' });
    await db.completions.put({ habitId: habit.id, date: '2026-07-21' });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status !== 'ready') return;
      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0]?.habit.id).toBe(habit.id);
      expect(result.current.habits[0]?.weekCompletions).toBe(2);
    });
  });

  it('hides times_per_week habits when weekly quota is met', async () => {
    const habit = await habitRepository.create({
      name: 'Yoga',
      frequency: { type: 'times_per_week', times: 3 },
    });
    await db.completions.put({ habitId: habit.id, date: '2026-07-20' });
    await db.completions.put({ habitId: habit.id, date: '2026-07-21' });
    await db.completions.put({ habitId: habit.id, date: '2026-07-22' });

    const { result } = renderHook(() => useTodayHabits());

    await waitFor(() => {
      expect(result.current).toEqual({ status: 'ready', habits: [] });
    });
  });
});
