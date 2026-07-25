import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';
import { freezeRepository } from '@/infrastructure/freezeRepository';
import { habitRepository } from '@/infrastructure/habitRepository';
import { useStreak } from './useStreak';

const todayKey = '2026-07-21';

describe('useStreak', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-21T12:00:00'));

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

  it('returns current streak from seeded completions', async () => {
    const habit = await habitRepository.create({
      name: 'Run',
      frequency: { type: 'daily' },
    });
    await db.habits.update(habit.id, {
      createdAt: '2026-07-01T12:00:00.000Z',
    });
    const seeded = { ...habit, createdAt: '2026-07-01T12:00:00.000Z' };

    await completionRepository.toggle(seeded.id, '2026-07-19');
    await completionRepository.toggle(seeded.id, '2026-07-20');
    await completionRepository.toggle(seeded.id, '2026-07-21');

    const { result } = renderHook(() => useStreak(seeded, todayKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentStreak).toBe(3);
  });

  it('preserves streak across a frozen due day', async () => {
    const habit = await habitRepository.create({
      name: 'Run',
      frequency: { type: 'daily' },
    });
    await db.habits.update(habit.id, {
      createdAt: '2026-07-01T12:00:00.000Z',
    });
    const seeded = { ...habit, createdAt: '2026-07-01T12:00:00.000Z' };

    await completionRepository.toggle(seeded.id, '2026-07-19');
    await completionRepository.toggle(seeded.id, '2026-07-20');
    await freezeRepository.set(seeded.id, '2026-07-21');

    const { result } = renderHook(() => useStreak(seeded, todayKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentStreak).toBe(3);
  });

  it('returns zero streak when IndexedDB read fails', async () => {
    const habit = await habitRepository.create({
      name: 'Fail',
      frequency: { type: 'daily' },
    });

    vi.spyOn(completionRepository, 'getByHabitInRange').mockRejectedValue(
      new DOMException('The operation failed', 'AbortError'),
    );

    const { result } = renderHook(() => useStreak(habit, todayKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentStreak).toBe(0);
  });
});
