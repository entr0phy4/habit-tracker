import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCalendarWeekDates,
  getLocalDateString,
} from '@/domain/dates';
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

  const habits = await dbInstance.habits
    .filter((habit) => !habit.archived)
    .toArray();

  const weekCompletions = await dbInstance.completions
    .where('date')
    .between(weekStart, weekEnd, true, true)
    .toArray();

  const byHabit = new Map<string, Set<string>>();
  for (const completion of weekCompletions) {
    let set = byHabit.get(completion.habitId);
    if (!set) {
      set = new Set();
      byHabit.set(completion.habitId, set);
    }
    set.add(completion.date);
  }

  return habits
    .filter((habit) =>
      isHabitDueOnDate(
        habit.frequency,
        today,
        byHabit.get(habit.id) ?? new Set(),
      ),
    )
    .map((habit) => ({
      habit,
      isCompleted: (byHabit.get(habit.id) ?? new Set()).has(today),
    }));
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
