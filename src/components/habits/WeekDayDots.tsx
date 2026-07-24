import { cn } from '@/lib/utils';
import type { Frequency } from '@/domain/types';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

interface WeekDayDotsProps {
  frequency: Frequency;
  className?: string;
  accentColor?: string;
}

function getScheduledDays(frequency: Frequency): Set<number> {
  if (frequency.type === 'weekly') {
    return new Set(frequency.days);
  }
  if (frequency.type === 'times_per_week') {
    return new Set(); // HabitRow uses WeekQuotaChip instead
  }
  return new Set([0, 1, 2, 3, 4, 5, 6]);
}

export function WeekDayDots({ frequency, className, accentColor }: WeekDayDotsProps) {
  const scheduledDays = getScheduledDays(frequency);

  return (
    <div
      className={cn('flex items-end gap-1', className)}
      aria-label="Scheduled days"
    >
      {DAY_LABELS.map((label, dayIndex) => {
        const isScheduled = scheduledDays.has(dayIndex);

        return (
          <div key={dayIndex} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isScheduled && !accentColor && 'bg-primary',
                !isScheduled && 'bg-border',
              )}
              style={
                isScheduled && accentColor
                  ? { backgroundColor: accentColor }
                  : undefined
              }
              aria-hidden
            />
          </div>
        );
      })}
    </div>
  );
}
