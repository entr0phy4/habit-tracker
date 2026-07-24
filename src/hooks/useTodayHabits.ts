import { useLiveQuery } from 'dexie-react-hooks';
import {
  getCalendarWeekDates,
  getLocalDateString,
} from '@/domain/dates';
import { isHabitDueOnDate } from '@/domain/schedule';
import type { Habit } from '@/domain/types';
import { db } from '@/infrastructure/db';

const QUERY_ERROR = Symbol('QUERY_ERROR');

export type TodayHabitEntry = {
  habit: Habit;
  isCompleted: boolean;
  /** Completions in the current Mon–Sun week (for quota chip). */
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

      const activeHabits = await db.habits
        .filter((habit) => !habit.archived)
        .toArray();

      const weekCompletions = await db.completions
        .where('date')
        .between(weekStart, weekEnd, true, true)
        .toArray();

      const completionsByHabit = new Map<string, Set<string>>();
      for (const completion of weekCompletions) {
        let set = completionsByHabit.get(completion.habitId);
        if (!set) {
          set = new Set();
          completionsByHabit.set(completion.habitId, set);
        }
        set.add(completion.date);
      }

      const dueHabits: TodayHabitEntry[] = [];
      for (const habit of activeHabits) {
        const dates = completionsByHabit.get(habit.id) ?? new Set<string>();
        if (!isHabitDueOnDate(habit.frequency, today, dates)) {
          continue;
        }
        dueHabits.push({
          habit,
          isCompleted: dates.has(today),
          weekCompletions: dates.size,
        });
      }

      return dueHabits;
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
