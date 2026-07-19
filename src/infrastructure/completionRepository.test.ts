import { beforeEach, describe, expect, it } from 'vitest';
import { completionRepository } from './completionRepository';
import { db } from './db';
import { habitRepository } from './habitRepository';

describe('completionRepository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
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

  it('rejects future date toggles', async () => {
    const habit = await habitRepository.create({
      name: 'Journal',
      frequency: { type: 'daily' },
    });

    await completionRepository.toggle(habit.id, '2099-01-01');
    expect(await db.completions.count()).toBe(0);
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
