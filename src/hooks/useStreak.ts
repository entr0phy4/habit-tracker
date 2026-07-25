import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateCurrentStreak } from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';
import { freezeRepository } from '@/infrastructure/freezeRepository';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export function useStreak(habit: Habit, todayKey?: string) {
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
      return calculateCurrentStreak(
        completedDates,
        habit.frequency,
        today,
        startDate,
        frozenDates,
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
