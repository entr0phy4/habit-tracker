import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';

export function useStreak(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(
      habit.id,
      startDate,
      today,
    );
    const completedDates = new Set(dates);
    return calculateCurrentStreak(
      completedDates,
      habit.frequency,
      today,
      startDate,
    );
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  return {
    currentStreak: result ?? 0,
    isLoading: result === undefined,
  };
}
