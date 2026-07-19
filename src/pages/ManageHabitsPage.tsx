import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { useArchivedHabits, useHabits } from '@/hooks/useHabits';
import { habitRepository } from '@/infrastructure/habitRepository';

export function ManageHabitsPage() {
  const navigate = useNavigate();
  const { habits: activeHabits, isLoading: activeLoading } = useHabits();
  const { habits: archivedHabits, isLoading: archivedLoading } = useArchivedHabits();

  if (activeLoading || archivedLoading) {
    return null;
  }

  async function handleRestore(habitId: string) {
    await habitRepository.update(habitId, { archived: false });
  }

  return (
    <AppShell title="Manage habits">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <section className="flex flex-col gap-2">
        {activeHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active habits</p>
        ) : (
          activeHabits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              className="flex min-h-11 items-center rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:bg-[#1c2128]"
              onClick={() => navigate(`/habits/${habit.id}/edit`)}
            >
              <span className="truncate">{habit.name}</span>
            </button>
          ))
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Archived</h2>
        {archivedHabits.length === 0 ? (
          <p className="text-xs text-muted-foreground">No archived habits</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {archivedHabits.map((habit) => (
              <li
                key={habit.id}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <span className="truncate text-sm text-muted-foreground">
                  {habit.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 shrink-0"
                  onClick={() => void handleRestore(habit.id)}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
