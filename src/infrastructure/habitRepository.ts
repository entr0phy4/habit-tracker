import { DEFAULT_HABIT_COLOR, normalizeHabitColor } from '@/domain/colors';
import type { Frequency, Habit } from '@/domain/types';
import { db } from './db';

const MAX_NAME_LENGTH = 100;

function validateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Habit name is required');
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new Error('Habit name too long');
  }
  return trimmed;
}

export const habitRepository = {
  async create(data: {
    name: string;
    frequency: Frequency;
    color?: string;
  }): Promise<Habit> {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: validateName(data.name),
      frequency: data.frequency,
      color: normalizeHabitColor(data.color ?? DEFAULT_HABIT_COLOR),
      archived: false,
      createdAt: new Date().toISOString(),
    };
    await db.habits.add(habit);
    return habit;
  },

  async update(
    id: string,
    data: Partial<Pick<Habit, 'name' | 'frequency' | 'archived' | 'color'>>,
  ): Promise<void> {
    const updates: Partial<Pick<Habit, 'name' | 'frequency' | 'archived' | 'color'>> =
      {
        ...data,
      };
    if (data.name !== undefined) {
      updates.name = validateName(data.name);
    }
    if (data.color !== undefined) {
      updates.color = normalizeHabitColor(data.color);
    }
    await db.habits.update(id, updates);
  },

  async archive(id: string): Promise<void> {
    await db.habits.update(id, { archived: true });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.habits, db.completions, async () => {
      await db.completions.where('habitId').equals(id).delete();
      await db.habits.delete(id);
    });
  },
};
