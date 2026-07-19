import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCompletionRate } from '@/domain/stats';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';

export function useHabitStats(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(
      habit.id,
      startDate,
      today,
    );
    const completedDates = new Set(dates);
    const todayDate = new Date(`${today}T12:00:00`);

    return {
      current: calculateCurrentStreak(
        completedDates,
        habit.frequency,
        today,
        startDate,
      ),
      longest: calculateLongestStreak(
        completedDates,
        habit.frequency,
        startDate,
        today,
      ),
      rate: calculateCompletionRate(
        completedDates,
        habit.frequency,
        startDate,
        today,
        todayDate,
      ),
    };
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  return {
    current: result?.current ?? 0,
    longest: result?.longest ?? 0,
    rate: result?.rate ?? 0,
    isLoading: result === undefined,
  };
}
