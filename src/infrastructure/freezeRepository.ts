import { isFutureDate } from '@/domain/dates';
import { db } from './db';

export const freezeRepository = {
  async set(habitId: string, date: string): Promise<void> {
    if (isFutureDate(date)) return;

    const key = [habitId, date] as [string, string];
    await db.transaction('rw', db.completions, db.freezes, async () => {
      await db.completions.delete(key);
      await db.freezes.put({ habitId, date });
    });
  },

  async clear(habitId: string, date: string): Promise<void> {
    const key = [habitId, date] as [string, string];
    await db.freezes.delete(key);
  },

  async toggle(habitId: string, date: string): Promise<void> {
    if (isFutureDate(date)) return;

    const key = [habitId, date] as [string, string];
    const existing = await db.freezes.get(key);
    if (existing) {
      await db.freezes.delete(key);
      return;
    }

    await this.set(habitId, date);
  },

  async getByHabitInRange(
    habitId: string,
    start: string,
    end: string,
  ): Promise<string[]> {
    const freezes = await db.freezes
      .where('[habitId+date]')
      .between([habitId, start], [habitId, end], true, true)
      .toArray();

    return freezes.map((freeze) => freeze.date);
  },
};
