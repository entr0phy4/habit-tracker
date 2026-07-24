import { Navigate, useNavigate, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ContributionHeatmap } from '@/components/heatmap/ContributionHeatmap';
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
      <p className="mt-4 text-xs text-muted-foreground">Historial</p>

      <div className="mt-8">
        <ContributionHeatmap
          habitId={habit.id}
          frequency={habit.frequency}
          color={habit.color}
        />
      </div>
    </>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden />
      Back
    </button>
  );
}

export function HabitHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const habit = useLiveQuery(() => (id ? db.habits.get(id) : undefined), [id]);

  if (!id) {
    return null;
  }

  if (habit === undefined) {
    return (
      <AppShell title="History" hasTabBar>
        <BackButton onClick={() => navigate(-1)} />
      </AppShell>
    );
  }

  if (!habit) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell title="History" hasTabBar>
      <BackButton onClick={() => navigate(-1)} />

      <HabitHistoryContent habit={habit} />
    </AppShell>
  );
}
