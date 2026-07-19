import { format } from 'date-fns/format';
import { cn } from '@/lib/utils';
import { getLocalDateString } from '@/domain/dates';
import { getWeekDayState } from '@/domain/stats';
import type { Frequency } from '@/domain/types';
import { useCompletions } from '@/hooks/useCompletions';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';
import { toast } from 'sonner';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

interface HistoryDotGridProps {
  habitId: string;
  frequency: Frequency;
}

function getDayLabel(date: string): string {
  return format(new Date(`${date}T12:00:00`), 'EEEE');
}

export function HistoryDotGrid({ habitId, frequency }: HistoryDotGridProps) {
  const { dates, completedDates, isLoading } = useCompletions(habitId);
  const { toggle } = useToggleCompletion();
  const today = getLocalDateString(new Date());

  if (isLoading) {
    return null;
  }

  async function handleDotClick(date: string) {
    try {
      await toggle(habitId, date);
    } catch {
      toast.error("Couldn't update. Try again.");
    }
  }

  return (
    <div className="flex justify-center gap-4" data-testid="history-dot-grid">
      {dates.map((date, index) => {
        const state = getWeekDayState(date, frequency, completedDates, today);
        const isToday = date === today;
        const dayLabel = DAY_LABELS[index];

        if (state === 'not-scheduled') {
          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{dayLabel}</span>
              <div className="h-11 w-11" aria-hidden />
            </div>
          );
        }

        const isCompleted = state === 'completed';
        const isMissed = state === 'missed';
        const isFuture = state === 'future';

        const dotButton = (
          <button
            type="button"
            data-testid={`history-dot-${date}`}
            aria-pressed={isCompleted}
            aria-label={
              isMissed ? `${getDayLabel(date)} missed, tap to complete` : undefined
            }
            disabled={isFuture}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full active:scale-90',
              isMissed && 'ring-2 ring-destructive',
              isFuture && 'opacity-40',
              isCompleted && 'bg-primary/10',
            )}
            onClick={() => void handleDotClick(date)}
          >
            <span
              className={cn(
                'h-3 w-3 rounded-full',
                isCompleted ? 'bg-primary' : 'bg-transparent',
                isFuture && !isCompleted && 'bg-[#30363d]',
              )}
              aria-hidden
            />
          </button>
        );

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{dayLabel}</span>
            {isToday ? (
              <div className="rounded-full ring-2 ring-primary">{dotButton}</div>
            ) : (
              dotButton
            )}
          </div>
        );
      })}
    </div>
  );
}
