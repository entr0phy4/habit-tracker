import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import { completionRepository } from '@/infrastructure/completionRepository';
import { db } from '@/infrastructure/db';

export function useDashboardHabits(todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());

  const result = useLiveQuery(async () => {
    const habits = await db.habits.filter((habit) => !habit.archived).toArray();

    const items = await Promise.all(
      habits.map(async (habit) => {
        const start = getHabitStartDate(habit);
        const dates = await completionRepository.getByHabitInRange(
          habit.id,
          start,
          today,
        );
        const completedDates = new Set(dates);

        return {
          habit,
          currentStreak: calculateCurrentStreak(
            completedDates,
            habit.frequency,
            today,
            start,
          ),
        };
      }),
    );

    return items.sort((a, b) => b.currentStreak - a.currentStreak);
  }, [today]);

  return {
    items: result ?? [],
    isLoading: result === undefined,
  };
}
