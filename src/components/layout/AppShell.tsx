import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title: string;
  headerAction?: ReactNode;
  hasTabBar?: boolean;
  children: ReactNode;
}

export function AppShell({
  title,
  headerAction,
  hasTabBar = false,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-6 md:mx-auto">
        <h1 className="text-xl font-semibold">{title}</h1>
        {headerAction}
      </header>
      <main
        className={cn(
          'mx-auto w-full max-w-[480px] px-4 md:mx-auto',
          hasTabBar ? 'pb-20' : 'pb-16',
        )}
      >
        {children}
      </main>
    </div>
  );
}
