import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/db';

export function useHabits() {
  const habits = useLiveQuery(() =>
    db.habits.filter((habit) => !habit.archived).toArray(),
  );

  return { habits: habits ?? [], isLoading: habits === undefined };
}

export function useArchivedHabits() {
  const habits = useLiveQuery(() =>
    db.habits.filter((habit) => habit.archived).toArray(),
  );

  return { habits: habits ?? [], isLoading: habits === undefined };
}
