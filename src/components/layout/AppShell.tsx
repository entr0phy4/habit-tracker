import type { ReactNode } from 'react';

interface AppShellProps {
  title: string;
  children: ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[480px] items-center px-4 py-6">
        <h1 className="text-xl font-semibold">{title}</h1>
      </header>
      <main className="mx-auto w-full max-w-[480px] px-4 pb-16">{children}</main>
    </div>
  );
}
