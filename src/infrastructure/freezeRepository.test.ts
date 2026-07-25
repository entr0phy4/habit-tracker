import { subDays } from 'date-fns/subDays';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocalDateString } from '@/domain/dates';
import { completionRepository } from './completionRepository';
import { db } from './db';
import { freezeRepository } from './freezeRepository';
import { habitRepository } from './habitRepository';

describe('freezeRepository', () => {
  beforeEach(async () => {
    vi.setSystemTime(new Date('2026-07-21T12:00:00'));
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
    if (db.freezes) {
      await db.freezes.clear();
    }
  });

  it('set freeze clears existing completion for the same day', async () => {
    const habit = await habitRepository.create({
      name: 'Read',
      frequency: { type: 'daily' },
    });
    const yesterday = getLocalDateString(subDays(new Date(), 1));

    await completionRepository.toggle(habit.id, yesterday);
    expect(await db.completions.get([habit.id, yesterday])).toBeDefined();

    await freezeRepository.set(habit.id, yesterday);

    expect(await db.freezes?.get([habit.id, yesterday])).toBeDefined();
    expect(await db.completions.get([habit.id, yesterday])).toBeUndefined();
  });

  it('toggle off clears an existing freeze', async () => {
    const habit = await habitRepository.create({
      name: 'Stretch',
      frequency: { type: 'daily' },
    });
    const yesterday = getLocalDateString(subDays(new Date(), 1));

    await freezeRepository.set(habit.id, yesterday);
    expect(await db.freezes?.get([habit.id, yesterday])).toBeDefined();

    await freezeRepository.toggle(habit.id, yesterday);
    expect(await db.freezes?.get([habit.id, yesterday])).toBeUndefined();
  });

  it('rejects future date freezes', async () => {
    const habit = await habitRepository.create({
      name: 'Journal',
      frequency: { type: 'daily' },
    });

    await freezeRepository.set(habit.id, '2099-01-01');
    expect(await db.freezes?.count()).toBe(0);
  });
});
