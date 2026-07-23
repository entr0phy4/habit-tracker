import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Link } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { FloatingAddButton } from '@/components/habits/FloatingAddButton';
import { HabitRow } from '@/components/habits/HabitRow';
import { getLocalDateString } from '@/domain/dates';
import { useTodayHabits } from '@/hooks/useTodayHabits';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';

export function TodayPage() {
  const [todayKey, setTodayKey] = useState(() => getLocalDateString(new Date()));
  const state = useTodayHabits(todayKey);
  const { toggle } = useToggleCompletion();

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setTodayKey(getLocalDateString(new Date()));
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (state.status === 'loading') {
    return null;
  }

  if (state.status === 'error') {
    return (
      <AppShell title="Today" hasTabBar>
        <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            Couldn't save your data. Try refreshing the page.
          </p>
        </div>
      </AppShell>
    );
  }

  const todayHabits = state.habits;

  return (
    <AppShell
      title="Today"
      hasTabBar
      headerAction={
        <div className="flex items-center gap-2">
          <Link
            to="/habits/manage"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Manage habits
          </Link>
          <Link
            to="/settings"
            aria-label="Ajustes"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      }
    >
      {todayHabits.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
          <h2 className="text-[28px] font-semibold">No habits due today</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap + to add your first habit and start building your routine.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 pb-28">
          {todayHabits.map(({ habit, isCompleted }) => (
            <li key={habit.id}>
              <HabitRow
                habit={habit}
                isCompleted={isCompleted}
                todayKey={todayKey}
                onToggle={() => {
                  void toggle(habit.id, todayKey);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <FloatingAddButton />
    </AppShell>
  );
}
