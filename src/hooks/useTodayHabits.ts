import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalDateString } from '@/domain/dates';
import { isDueOnDate } from '@/domain/schedule';
import { db } from '@/infrastructure/db';

export function useTodayHabits() {
  const today = getLocalDateString(new Date());

  return useLiveQuery(async () => {
    const habits = await db.habits
      .filter((habit) => !habit.archived && isDueOnDate(habit.frequency, today))
      .toArray();

    const completions = await db.completions.where('date').equals(today).toArray();
    const completedIds = new Set(completions.map((completion) => completion.habitId));

    return habits.map((habit) => ({
      habit,
      isCompleted: completedIds.has(habit.id),
    }));
  }, [today]);
}
