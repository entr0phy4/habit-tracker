import { cn } from '@/lib/utils';
import type { Habit } from '@/domain/types';
import { WeekDayDots } from './WeekDayDots';

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
        'flex min-h-11 w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-transform active:scale-[0.98]',
        isCompleted ? 'bg-muted' : 'bg-card hover:bg-[#1c2128]',
      )}
      onClick={() => onToggle()}
    >
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          isCompleted && 'text-muted-foreground line-through',
        )}
      >
        {habit.name}
      </span>
      <WeekDayDots frequency={habit.frequency} className="shrink-0" />
    </button>
  );
}
