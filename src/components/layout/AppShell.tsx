import type { ReactNode } from 'react';

interface AppShellProps {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, headerAction, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-6 md:mx-auto">
        <h1 className="text-xl font-semibold">{title}</h1>
        {headerAction}
      </header>
      <main className="mx-auto w-full max-w-[480px] px-4 pb-16 md:mx-auto">{children}</main>
    </div>
  );
}
