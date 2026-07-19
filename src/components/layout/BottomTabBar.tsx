import { NavLink } from 'react-router';
import { CalendarCheck, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
      role="tablist"
    >
      <div className="mx-auto flex h-14 max-w-[480px]">
        <NavLink
          to="/"
          end
          role="tab"
          aria-label="Hoy"
          className={({ isActive }) =>
            cn(
              'flex min-h-11 min-w-[44px] flex-1 flex-col items-center justify-center gap-1 text-xs',
              isActive
                ? 'text-primary [&_span]:font-medium [&_span]:text-foreground'
                : 'text-muted-foreground',
            )
          }
        >
          <CalendarCheck className="h-5 w-5" aria-hidden />
          <span>Hoy</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          role="tab"
          aria-label="Panel"
          className={({ isActive }) =>
            cn(
              'flex min-h-11 min-w-[44px] flex-1 flex-col items-center justify-center gap-1 text-xs',
              isActive
                ? 'text-primary [&_span]:font-medium [&_span]:text-foreground'
                : 'text-muted-foreground',
            )
          }
        >
          <LayoutGrid className="h-5 w-5" aria-hidden />
          <span>Panel</span>
        </NavLink>
      </div>
    </nav>
  );
}
