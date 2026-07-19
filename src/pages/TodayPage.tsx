import { AppShell } from '@/components/layout/AppShell';
import { FloatingAddButton } from '@/components/habits/FloatingAddButton';
import { HabitRow } from '@/components/habits/HabitRow';
import { useTodayHabits } from '@/hooks/useTodayHabits';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';

export function TodayPage() {
  const todayHabits = useTodayHabits();
  const { toggle } = useToggleCompletion();

  if (todayHabits === undefined) {
    return null;
  }

  return (
    <AppShell title="Today">
      {todayHabits.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
          <h2 className="text-[28px] font-semibold">No habits due today</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap + to add your first habit and start building your routine.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 pb-12">
          {todayHabits.map(({ habit, isCompleted }) => (
            <li key={habit.id}>
              <HabitRow
                habit={habit}
                isCompleted={isCompleted}
                onToggle={() => {
                  void toggle(habit.id);
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
