import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { habitRepository } from './habitRepository';

describe('habitRepository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  it('creates a habit with trimmed name', async () => {
    const habit = await habitRepository.create({
      name: '  Morning run  ',
      frequency: { type: 'daily' },
    });

    expect(habit.name).toBe('Morning run');
    expect(habit.archived).toBe(false);
  });

  it('rejects empty habit names', async () => {
    await expect(
      habitRepository.create({ name: '   ', frequency: { type: 'daily' } }),
    ).rejects.toThrow('Habit name is required');
  });

  it('rejects names longer than 100 characters', async () => {
    await expect(
      habitRepository.create({
        name: 'a'.repeat(101),
        frequency: { type: 'daily' },
      }),
    ).rejects.toThrow('Habit name too long');
  });

  it('updates habit fields', async () => {
    const habit = await habitRepository.create({
      name: 'Read',
      frequency: { type: 'daily' },
    });

    await habitRepository.update(habit.id, {
      name: 'Read books',
      frequency: { type: 'weekly', days: [1, 3, 5] },
    });

    const updated = await db.habits.get(habit.id);
    expect(updated?.name).toBe('Read books');
    expect(updated?.frequency).toEqual({ type: 'weekly', days: [1, 3, 5] });
  });

  it('archives a habit', async () => {
    const habit = await habitRepository.create({
      name: 'Meditate',
      frequency: { type: 'daily' },
    });

    await habitRepository.archive(habit.id);
    const archived = await db.habits.get(habit.id);
    expect(archived?.archived).toBe(true);
  });

  it('deletes a habit and cascades completions', async () => {
    const habit = await habitRepository.create({
      name: 'Water',
      frequency: { type: 'daily' },
    });

    await db.completions.put({ habitId: habit.id, date: '2026-07-19' });
    await habitRepository.delete(habit.id);

    expect(await db.habits.get(habit.id)).toBeUndefined();
    expect(await db.completions.where('habitId').equals(habit.id).count()).toBe(0);
  });
});
