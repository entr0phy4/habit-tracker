import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { HabitForm, type HabitFormValues } from '@/components/habits/HabitForm';
import { useCreateHabit } from '@/hooks/useCreateHabit';

export function HabitNewPage() {
  const navigate = useNavigate();
  const { create } = useCreateHabit();

  async function handleCreate(values: HabitFormValues) {
    await create(values);
    toast.success('Habit created');
    navigate('/');
  }

  return (
    <AppShell title="New habit">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>
      <HabitForm submitLabel="Create habit" onSubmit={handleCreate} />
    </AppShell>
  );
}
