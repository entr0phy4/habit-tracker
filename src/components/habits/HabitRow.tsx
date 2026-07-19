import { cn } from '@/lib/utils';
import type { Habit } from '@/domain/types';

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
}

export function HabitRow({ habit, isCompleted, onToggle }: HabitRowProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-11 w-full items-center rounded-lg border border-border px-4 py-3 text-left transition-transform active:scale-[0.98]',
        isCompleted ? 'bg-muted' : 'bg-card hover:bg-[#1c2128]',
      )}
      onClick={() => onToggle()}
    >
      <span
        className={cn(
          'truncate text-sm',
          isCompleted && 'text-muted-foreground line-through',
        )}
      >
        {habit.name}
      </span>
    </button>
  );
}
