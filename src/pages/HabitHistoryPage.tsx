import { Navigate, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { HistoryDotGrid } from '@/components/habits/HistoryDotGrid';
import { db } from '@/infrastructure/db';

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

      <h2 className="line-clamp-2 break-words text-xl font-semibold">{habit.name}</h2>
      <p className="mt-1 text-xs text-muted-foreground">Last 7 days</p>

      <div className="mt-8 flex justify-center">
        <HistoryDotGrid habitId={habit.id} />
      </div>
    </AppShell>
  );
}
