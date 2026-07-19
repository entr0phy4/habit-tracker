import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppShell } from '@/components/layout/AppShell';
import { useCreateHabit } from '@/hooks/useCreateHabit';

export function HabitNewPage() {
  const navigate = useNavigate();
  const { create } = useCreateHabit();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await create({
        name,
        frequency: { type: 'daily' },
      });
      navigate('/');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Enter a habit name to continue.',
      );
    }
  }

  return (
    <AppShell title="New habit">
      <form className="flex flex-col gap-6" onSubmit={(event) => void handleSubmit(event)}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="habit-name">Habit name</Label>
          <Input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Morning run"
            maxLength={100}
            autoFocus
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <Button type="submit" size="lg" className="min-h-11">
          Create habit
        </Button>
      </form>
    </AppShell>
  );
}
