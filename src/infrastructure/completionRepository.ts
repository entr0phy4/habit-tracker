import { isFutureDate } from '@/domain/dates';
import { db } from './db';

export const completionRepository = {
  async toggle(habitId: string, date: string): Promise<void> {
    if (isFutureDate(date)) return;

    const key = [habitId, date] as [string, string];
    const existing = await db.completions.get(key);
    if (existing) {
      await db.completions.delete(key);
      return;
    }

    await db.completions.put({ habitId, date });
  },

  async getByHabitInRange(
    habitId: string,
    start: string,
    end: string,
  ): Promise<string[]> {
    const completions = await db.completions
      .where('[habitId+date]')
      .between([habitId, start], [habitId, end], true, true)
      .toArray();

    return completions.map((completion) => completion.date);
  },
};
