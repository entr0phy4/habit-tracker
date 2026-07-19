import { useLiveQuery } from 'dexie-react-hooks';
import { getLast7Days } from '@/domain/dates';
import { db } from '@/infrastructure/db';

export function useCompletions(habitId: string) {
  const dates = getLast7Days();

  const completions = useLiveQuery(
    () =>
      db.completions
        .where('[habitId+date]')
        .between(
          [habitId, dates[0]],
          [habitId, dates[dates.length - 1]],
          true,
          true,
        )
        .toArray(),
    [habitId, dates[0], dates[dates.length - 1]],
  );

  const completedDates = new Set((completions ?? []).map((completion) => completion.date));

  return {
    dates,
    completedDates,
    isLoading: completions === undefined,
  };
}
