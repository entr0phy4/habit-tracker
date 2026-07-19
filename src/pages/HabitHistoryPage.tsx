import { Navigate, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { HistoryDotGrid } from '@/components/habits/HistoryDotGrid';
import { StatCards } from '@/components/habits/StatCards';
import { useHabitStats } from '@/hooks/useHabitStats';
import type { Habit } from '@/domain/types';
import { db } from '@/infrastructure/db';

function HabitHistoryContent({ habit }: { habit: Habit }) {
  const { current, longest, rate, isLoading } = useHabitStats(habit);

  return (
    <>
      <h2 className="line-clamp-2 break-words text-xl font-semibold">{habit.name}</h2>
      <StatCards
        current={current}
        longest={longest}
        rate={rate}
        isLoading={isLoading}
      />
      <p className="mt-4 text-xs text-muted-foreground">This week</p>

      <div className="mt-8 flex justify-center">
        <HistoryDotGrid habitId={habit.id} />
      </div>
    </>
  );
}

export function HabitHistoryPage() {
  const { id } = useParams<{ id: string }>();

  const habit = useLiveQuery(() => (id ? db.habits.get(id) : undefined), [id]);

  if (!id) {
    return null;
  }

  if (habit === undefined) {
    return (
      <AppShell title="History">
        <Link
          to="/"
          className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
      </AppShell>
    );
  }

  if (!habit) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell title="History">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <HabitHistoryContent habit={habit} />
    </AppShell>
  );
}
