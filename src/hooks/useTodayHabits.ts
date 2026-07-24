import { useLiveQuery } from 'dexie-react-hooks';
import { getCalendarWeekDates, getLocalDateString } from '@/domain/dates';
import { isHabitDueOnDate } from '@/domain/schedule';
import type { Habit } from '@/domain/types';
import { db } from '@/infrastructure/db';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export type TodayHabitEntry = {
  habit: Habit;
  isCompleted: boolean;
  weekCompletions: number;
};

export type TodayHabitsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; habits: TodayHabitEntry[] };

export function useTodayHabits(todayKey?: string): TodayHabitsState {
  const today = todayKey ?? getLocalDateString(new Date());

  const result = useLiveQuery(async () => {
    try {
      const weekDates = getCalendarWeekDates(new Date(`${today}T12:00:00`));
      const weekStart = weekDates[0]!;
      const weekEnd = weekDates[6]!;

      const weekRows = await db.completions
        .where('date')
        .between(weekStart, weekEnd, true, true)
        .toArray();

      const completedByHabit = new Map<string, Set<string>>();
      for (const row of weekRows) {
        let set = completedByHabit.get(row.habitId);
        if (!set) {
          set = new Set();
          completedByHabit.set(row.habitId, set);
        }
        set.add(row.date);
      }

      const habits = await db.habits
        .filter((habit) => {
          if (habit.archived) return false;
          const completedDates = completedByHabit.get(habit.id) ?? new Set();
          return isHabitDueOnDate(habit.frequency, today, completedDates);
        })
        .toArray();

      return habits.map((habit) => {
        const completedDates = completedByHabit.get(habit.id) ?? new Set();
        return {
          habit,
          isCompleted: completedDates.has(today),
          weekCompletions: completedDates.size,
        };
      });
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
