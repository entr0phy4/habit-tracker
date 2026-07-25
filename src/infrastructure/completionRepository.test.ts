import { subDays } from 'date-fns/subDays';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocalDateString } from '@/domain/dates';
import { completionRepository } from './completionRepository';
import { db } from './db';
import { freezeRepository } from './freezeRepository';
import { habitRepository } from './habitRepository';

describe('completionRepository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  it('toggles completion on yesterday', async () => {
    const habit = await habitRepository.create({
      name: 'Read',
      frequency: { type: 'daily' },
    });
    const yesterday = getLocalDateString(subDays(new Date(), 1));

    await completionRepository.toggle(habit.id, yesterday);
    expect(await db.completions.get([habit.id, yesterday])).toBeDefined();
  });

  it('toggles completion on and off idempotently', async () => {
    const habit = await habitRepository.create({
      name: 'Stretch',
      frequency: { type: 'daily' },
    });

    await completionRepository.toggle(habit.id, '2026-07-19');
    expect(await db.completions.get([habit.id, '2026-07-19'])).toBeDefined();

    await completionRepository.toggle(habit.id, '2026-07-19');
    expect(await db.completions.get([habit.id, '2026-07-19'])).toBeUndefined();
  });

  it('returns to original state when toggling a past day twice', async () => {
    const habit = await habitRepository.create({
      name: 'Meditate',
      frequency: { type: 'daily' },
    });
    const pastDate = getLocalDateString(subDays(new Date(), 3));

    await completionRepository.toggle(habit.id, pastDate);
    await completionRepository.toggle(habit.id, pastDate);

    expect(await db.completions.get([habit.id, pastDate])).toBeUndefined();
  });

  it('rejects future date toggles', async () => {
    const habit = await habitRepository.create({
      name: 'Journal',
      frequency: { type: 'daily' },
    });

    await completionRepository.toggle(habit.id, '2099-01-01');
    expect(await db.completions.count()).toBe(0);
  });

  it('toggling completion on clears existing freeze for same day', async () => {
    vi.setSystemTime(new Date('2026-07-21T12:00:00'));
    const habit = await habitRepository.create({
      name: 'Yoga',
      frequency: { type: 'daily' },
    });
    const yesterday = getLocalDateString(subDays(new Date(), 1));

    await freezeRepository.set(habit.id, yesterday);
    expect(await db.freezes?.get([habit.id, yesterday])).toBeDefined();

    await completionRepository.toggle(habit.id, yesterday);

    expect(await db.completions.get([habit.id, yesterday])).toBeDefined();
    expect(await db.freezes?.get([habit.id, yesterday])).toBeUndefined();
  });

  it('returns completed dates in range', async () => {
    const habit = await habitRepository.create({
      name: 'Walk',
      frequency: { type: 'daily' },
    });

    await completionRepository.toggle(habit.id, '2026-07-17');
    await completionRepository.toggle(habit.id, '2026-07-19');

    const dates = await completionRepository.getByHabitInRange(
      habit.id,
      '2026-07-15',
      '2026-07-20',
    );

    expect(dates.sort()).toEqual(['2026-07-17', '2026-07-19']);
  });
});
