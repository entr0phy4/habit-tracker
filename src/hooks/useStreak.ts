import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export function useStreak(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    try {
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
    } catch {
      return QUERY_ERROR;
    }
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  if (result === QUERY_ERROR) {
    return {
      currentStreak: 0,
      isLoading: false,
    };
  }

  return {
    currentStreak: result ?? 0,
    isLoading: result === undefined,
  };
}
