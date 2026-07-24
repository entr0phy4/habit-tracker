import { beforeEach, describe, expect, it } from 'vitest';
import { getCalendarWeekDates, getLocalDateString } from '@/domain/dates';
import { isHabitDueOnDate } from '@/domain/schedule';
import { HabitTrackerDB } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';

async function getTodayHabits(dbInstance: HabitTrackerDB) {
  const today = getLocalDateString(new Date());
  const weekDates = getCalendarWeekDates(new Date(`${today}T12:00:00`));
  const weekStart = weekDates[0]!;
  const weekEnd = weekDates[6]!;

  const weekRows = await dbInstance.completions
    .where('date')
    .between(weekStart, weekEnd, true, true)
    .toArray();

  const completedByHabit = new Map<string, Set<string>>();
  for (const row of weekRows) {
    let set = completedByHabit.get(row.habitId);
    if (!set) {
      set = new Set();
      completedByHabit.set(row.habitId, set);
    }
    set.add(row.date);
  }

  const habits = await dbInstance.habits
    .filter((habit) => {
      if (habit.archived) return false;
      const completedDates = completedByHabit.get(habit.id) ?? new Set();
      return isHabitDueOnDate(habit.frequency, today, completedDates);
    })
    .toArray();

  return habits.map((habit) => {
    const completedDates = completedByHabit.get(habit.id) ?? new Set();
    return {
      habit,
      isCompleted: completedDates.has(today),
      weekCompletions: completedDates.size,
    };
  });
}

describe('walking skeleton', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

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
