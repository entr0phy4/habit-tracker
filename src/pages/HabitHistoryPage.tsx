import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';

export function HabitHistoryPage() {
  return (
    <AppShell title="History">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>
      <p className="text-sm text-muted-foreground">History view coming in Plan 04.</p>
    </AppShell>
  );
}
