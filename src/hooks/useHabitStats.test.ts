import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { useHabitStats } from './useHabitStats';

const todayKey = '2026-07-21';

describe('useHabitStats', () => {
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

  it('returns current, longest, and rate on happy path', async () => {
    const habit = await habitRepository.create({
      name: 'Meditate',
      frequency: { type: 'daily' },
    });
    await db.habits.update(habit.id, {
      createdAt: '2026-07-19T12:00:00.000Z',
    });
    const seeded = { ...habit, createdAt: '2026-07-19T12:00:00.000Z' };

    await completionRepository.toggle(seeded.id, '2026-07-19');
    await completionRepository.toggle(seeded.id, '2026-07-20');
    await completionRepository.toggle(seeded.id, '2026-07-21');

    const { result } = renderHook(() => useHabitStats(seeded, todayKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.current).toBe(3);
    expect(result.current.longest).toBe(3);
    expect(result.current.rate).toBe(100);
  });

  it('returns zeros when IndexedDB read fails', async () => {
    const habit = await habitRepository.create({
      name: 'Broken',
      frequency: { type: 'daily' },
    });

    vi.spyOn(completionRepository, 'getByHabitInRange').mockRejectedValue(
      new DOMException('The operation failed', 'AbortError'),
    );

    const { result } = renderHook(() => useHabitStats(habit, todayKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.current).toBe(0);
    expect(result.current.longest).toBe(0);
    expect(result.current.rate).toBe(0);
  });
});
