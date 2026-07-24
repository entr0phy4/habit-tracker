import { cn } from '@/lib/utils';

interface WeekQuotaChipProps {
  done: number;
  times: number;
  accentColor: string;
  className?: string;
}

export function WeekQuotaChip({
  done,
  times,
  accentColor,
  className,
}: WeekQuotaChipProps) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold',
        className,
      )}
      style={{
        color: accentColor,
        borderColor: `${accentColor}66`,
      }}
      aria-label={`${done} of ${times} this week`}
    >
      {done}/{times}
    </span>
  );
}
