import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { ConfirmDialog } from '@/components/habits/ConfirmDialog';
import { HabitForm, type HabitFormValues } from '@/components/habits/HabitForm';
import { Button } from '@/components/ui/button';
import { db } from '@/infrastructure/db';
import { habitRepository } from '@/infrastructure/habitRepository';

export function HabitEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const habit = useLiveQuery(() => (id ? db.habits.get(id) : undefined), [id]);

  if (!id) {
    return null;
  }

  if (habit === undefined) {
    return (
      <AppShell title="Edit habit">
        <Link
          to="/habits/manage"
          className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
      </AppShell>
    );
  }

  if (!habit) {
    return <Navigate to="/habits/manage" replace />;
  }

  async function handleUpdate(values: HabitFormValues) {
    await habitRepository.update(id!, {
      name: values.name,
      frequency: values.frequency,
      color: values.color,
    });
    toast.success('Habit updated');
    navigate('/habits/manage');
  }

  async function handleArchive() {
    await habitRepository.archive(id!);
    toast.success('Habit archived');
    navigate('/');
  }

  async function handleDelete() {
    await habitRepository.delete(id!);
    setShowDeleteDialog(false);
    navigate('/habits/manage');
  }

  return (
    <AppShell title="Edit habit">
      <Link
        to="/habits/manage"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <HabitForm
        submitLabel="Save changes"
        initialValues={{
          name: habit.name,
          frequency: habit.frequency,
          color: habit.color,
        }}
        onSubmit={handleUpdate}
      />

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 justify-start text-muted-foreground"
          onClick={() => void handleArchive()}
        >
          Archive habit
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 justify-start text-destructive hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete habit
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete habit permanently?"
        description="This removes the habit and all its completion history. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </AppShell>
  );
}
