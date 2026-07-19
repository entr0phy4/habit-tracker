import { cn } from '@/lib/utils';
import { getLocalDateString, isFutureDate } from '@/domain/dates';
import { useCompletions } from '@/hooks/useCompletions';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';
import { toast } from 'sonner';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HistoryDotGridProps {
  habitId: string;
}

export function HistoryDotGrid({ habitId }: HistoryDotGridProps) {
  const { dates, completedDates, isLoading } = useCompletions(habitId);
  const { toggle } = useToggleCompletion();
  const today = getLocalDateString(new Date());

  if (isLoading) {
    return null;
  }

  async function handleDotClick(date: string) {
    if (isFutureDate(date)) {
      return;
    }

    try {
      await toggle(habitId, date);
    } catch {
      toast.error("Couldn't update. Try again.");
    }
  }

  return (
    <div className="flex justify-center gap-4" data-testid="history-dot-grid">
      {dates.map((date) => {
        const isComplete = completedDates.has(date);
        const isToday = date === today;
        const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{DAY_LABELS[dayOfWeek]}</span>
            <button
              type="button"
              data-testid={`history-dot-${date}`}
              aria-pressed={isComplete}
              disabled={isFutureDate(date)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full active:scale-90',
                isToday && 'ring-2 ring-primary',
              )}
              onClick={() => void handleDotClick(date)}
            >
              <span
                className={cn(
                  'h-3 w-3 rounded-full',
                  isComplete ? 'bg-primary' : 'bg-[#30363d]',
                )}
                aria-hidden
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
