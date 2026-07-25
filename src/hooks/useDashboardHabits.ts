import { useLiveQuery } from 'dexie-react-hooks';
import { getHabitStartDate, getLocalDateString } from '@/domain/dates';
import { calculateOverallCompletionRate } from '@/domain/stats';
import { calculateCurrentStreak } from '@/domain/streak';
import type { Habit } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';
import { freezeRepository } from '@/infrastructure/freezeRepository';
import { db } from '@/infrastructure/db';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export type DashboardHabitItem = {
  habit: Habit;
  currentStreak: number;
};

export type DashboardHabitsState = {
  status: 'loading' | 'error' | 'ready';
  items: DashboardHabitItem[];
  overallRate: number;
  isLoading: boolean;
};

export function useDashboardHabits(todayKey?: string): DashboardHabitsState {
  const today = todayKey ?? getLocalDateString(new Date());

  const result = useLiveQuery(async () => {
    try {
      const habits = await db.habits.filter((habit) => !habit.archived).toArray();

      const withCompletions = await Promise.all(
        habits.map(async (habit) => {
          const start = getHabitStartDate(habit);
          const [dates, freezeDates] = await Promise.all([
            completionRepository.getByHabitInRange(habit.id, start, today),
            freezeRepository.getByHabitInRange(habit.id, start, today),
          ]);
          const completedDates = new Set(dates);
          const frozenDates = new Set(freezeDates);

          return {
            habit,
            completedDates,
            frozenDates,
            startDate: start,
            currentStreak: calculateCurrentStreak(
              completedDates,
              habit.frequency,
              today,
              start,
              frozenDates,
            ),
          };
        }),
      );

      const items = withCompletions
        .map(({ habit, currentStreak }) => ({ habit, currentStreak }))
        .sort((a, b) => b.currentStreak - a.currentStreak);

      const overallRate = calculateOverallCompletionRate(
        withCompletions.map(({ habit, completedDates, frozenDates, startDate }) => ({
          frequency: habit.frequency,
          completedDates,
          frozenDates,
          startDate,
        })),
        today,
        new Date(`${today}T12:00:00`),
      );

      return { items, overallRate };
    } catch {
      return QUERY_ERROR;
    }
  }, [today]);

  if (result === undefined) {
    return {
      status: 'loading',
      items: [],
      overallRate: 0,
      isLoading: true,
    };
  }

  if (result === QUERY_ERROR) {
    return {
      status: 'error',
      items: [],
      overallRate: 0,
      isLoading: false,
    };
  }

  return {
    status: 'ready',
    items: result.items,
    overallRate: result.overallRate,
    isLoading: false,
  };
}
