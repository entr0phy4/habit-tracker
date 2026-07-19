import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalDateString } from '@/domain/dates';
import { isDueOnDate } from '@/domain/schedule';
import type { Habit } from '@/domain/types';
import { db } from '@/infrastructure/db';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export type TodayHabitEntry = {
  habit: Habit;
  isCompleted: boolean;
};

export type TodayHabitsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; habits: TodayHabitEntry[] };

export function useTodayHabits(todayKey?: string): TodayHabitsState {
  const today = todayKey ?? getLocalDateString(new Date());

  const result = useLiveQuery(async () => {
    try {
      const habits = await db.habits
        .filter((habit) => !habit.archived && isDueOnDate(habit.frequency, today))
        .toArray();

      const completions = await db.completions.where('date').equals(today).toArray();
      const completedIds = new Set(completions.map((completion) => completion.habitId));

      return habits.map((habit) => ({
        habit,
        isCompleted: completedIds.has(habit.id),
      }));
    } catch {
      return QUERY_ERROR;
    }
  }, [today]);

  if (result === undefined) {
    return { status: 'loading' };
  }

  if (result === QUERY_ERROR) {
    return { status: 'error' };
  }

  return { status: 'ready', habits: result };
}
