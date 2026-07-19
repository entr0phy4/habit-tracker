import { describe, expect, it } from 'vitest';
import { getLocalDateString } from '@/domain/dates';
import { isDueOnDate } from '@/domain/schedule';
import { HabitTrackerDB } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { completionRepository } from '@/infrastructure/completionRepository';

async function getTodayHabits(db: HabitTrackerDB) {
  const today = getLocalDateString(new Date());
  const habits = await db.habits
    .filter((habit) => !habit.archived && isDueOnDate(habit.frequency, today))
    .toArray();

  const completions = await db.completions.where('date').equals(today).toArray();
  const completedIds = new Set(completions.map((completion) => completion.habitId));

  return habits.map((habit) => ({
    habit,
    isCompleted: completedIds.has(habit.id),
  }));
}

describe('walking skeleton', () => {
  it('creates a daily habit, shows it on today, toggles completion, and persists across db reopen', async () => {
    const habit = await habitRepository.create({
      name: 'Morning run',
      frequency: { type: 'daily' },
    });

    const todayHabits = await getTodayHabits(new HabitTrackerDB());
    expect(todayHabits).toHaveLength(1);
    expect(todayHabits[0]?.habit.id).toBe(habit.id);
    expect(todayHabits[0]?.isCompleted).toBe(false);

    const today = getLocalDateString(new Date());
    await completionRepository.toggle(habit.id, today);

    const reopenedDb = new HabitTrackerDB();
    const persistedHabit = await reopenedDb.habits.get(habit.id);
    const persistedCompletion = await reopenedDb.completions.get([habit.id, today]);

    expect(persistedHabit?.name).toBe('Morning run');
    expect(persistedCompletion).toBeDefined();

    const afterToggle = await getTodayHabits(reopenedDb);
    expect(afterToggle[0]?.isCompleted).toBe(true);
  });
});
