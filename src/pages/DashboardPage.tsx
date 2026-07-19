import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { AppShell } from '@/components/layout/AppShell';
import { useDashboardHabits } from '@/hooks/useDashboardHabits';

export function DashboardPage() {
  const { items, isLoading } = useDashboardHabits();

  if (isLoading) {
    return null;
  }

  return (
    <AppShell title="Panel" hasTabBar>
      {items.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
          <h2 className="text-[28px] font-semibold">No hay hábitos activos</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Toca + en Hoy para crear tu primer hábito.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 pb-20">
          {items.map(({ habit, currentStreak }) => (
            <li key={habit.id}>
              <DashboardCard habit={habit} currentStreak={currentStreak} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
