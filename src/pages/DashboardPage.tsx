import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { AppShell } from '@/components/layout/AppShell';
import { useDashboardHabits } from '@/hooks/useDashboardHabits';

export function DashboardPage() {
  const { status, items, overallRate, isLoading } = useDashboardHabits();

  if (isLoading || status === 'loading') {
    return null;
  }

  if (status === 'error') {
    return (
      <AppShell title="Panel" hasTabBar>
        <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar los hábitos.
          </p>
        </div>
      </AppShell>
    );
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
        <div className="pb-36">
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Tasa general</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {overallRate}%
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {items.map(({ habit, currentStreak }) => (
              <li key={habit.id}>
                <DashboardCard habit={habit} currentStreak={currentStreak} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
