import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCompletionRate } from '@/domain/stats';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';
import { freezeRepository } from '@/infrastructure/freezeRepository';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export function useHabitStats(habit: Habit, todayKey?: string) {
  const today = todayKey ?? getLocalDateString(new Date());
  const startDate = getHabitStartDate(habit);

  const result = useLiveQuery(async () => {
    try {
      const [dates, freezeDates] = await Promise.all([
        completionRepository.getByHabitInRange(habit.id, startDate, today),
        freezeRepository.getByHabitInRange(habit.id, startDate, today),
      ]);
      const completedDates = new Set(dates);
      const frozenDates = new Set(freezeDates);
      const todayDate = new Date(`${today}T12:00:00`);

      return {
        current: calculateCurrentStreak(
          completedDates,
          habit.frequency,
          today,
          startDate,
          frozenDates,
        ),
        longest: calculateLongestStreak(
          completedDates,
          habit.frequency,
          startDate,
          today,
          frozenDates,
        ),
        rate: calculateCompletionRate(
          completedDates,
          habit.frequency,
          startDate,
          today,
          todayDate,
          frozenDates,
        ),
      };
    } catch {
      return QUERY_ERROR;
    }
  }, [habit.id, habit.frequency, habit.createdAt, today]);

  if (result === QUERY_ERROR) {
    return {
      current: 0,
      longest: 0,
      rate: 0,
      isLoading: false,
    };
  }

  return {
    current: result?.current ?? 0,
    longest: result?.longest ?? 0,
    rate: result?.rate ?? 0,
    isLoading: result === undefined,
  };
}
