import { cloneElement, useCallback } from 'react';
import { ActivityCalendar, type Activity, type BlockElement } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getLocalDateString } from '@/domain/dates';
import { formatHeatmapTooltip } from '@/domain/heatmap';
import type { Frequency } from '@/domain/types';
import { useHeatmapData } from '@/hooks/useHeatmapData';

const heatmapTheme = {
  dark: ['#21262d', '#0e4429', '#006d32', '#26a641', '#3fb950'],
};

interface ContributionHeatmapProps {
  habitId: string;
  frequency: Frequency;
}

export function ContributionHeatmap({ habitId, frequency }: ContributionHeatmapProps) {
  const today = getLocalDateString(new Date());
  const { activities, cellStates, isLoading, toggle } = useHeatmapData(
    habitId,
    frequency,
  );

  const handleCellClick = useCallback(
    async (date: string) => {
      try {
        await toggle(date);
      } catch {
        toast.error("Couldn't update. Try again.");
      }
    },
    [toggle],
  );

  const renderBlock = useCallback(
    (block: BlockElement, activity: Activity) => {
      const state = cellStates.get(activity.date);
      const isToday = activity.date === today;
      const isInteractive = state === 'completed' || state === 'missed';
      const isNotScheduled = state === 'not-scheduled';
      const isMissed = state === 'missed';
      const isFuture = state === 'future';

      const styledBlock = cloneElement(block, {
        style: {
          ...block.props.style,
          opacity: isNotScheduled ? 0.15 : isFuture ? 0.4 : 1,
          cursor: isInteractive ? 'pointer' : 'default',
        },
      });

      if (isNotScheduled) {
        return (
          <div data-testid={`heatmap-cell-${activity.date}`}>{styledBlock}</div>
        );
      }

      return (
        <div
          data-testid={`heatmap-cell-${activity.date}`}
          className={cn(
            'flex min-h-11 min-w-11 items-center justify-center',
            isMissed && 'rounded-sm ring-2 ring-destructive',
            isToday && 'rounded-sm ring-2 ring-primary',
          )}
          onClick={
            isInteractive
              ? () => void handleCellClick(activity.date)
              : undefined
          }
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={
            isInteractive
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    void handleCellClick(activity.date);
                  }
                }
              : undefined
          }
        >
          {styledBlock}
        </div>
      );
    },
    [cellStates, today, handleCellClick],
  );

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="overflow-x-auto -mx-4 px-4"
      data-testid="contribution-heatmap"
    >
      <ActivityCalendar
        data={activities}
        colorScheme="dark"
        weekStart={1}
        blockSize={12}
        blockMargin={3}
        minLevel={0}
        maxLevel={4}
        showColorLegend={false}
        showTotalCount={false}
        showWeekdayLabels
        showMonthLabels
        theme={heatmapTheme}
        tooltips={{
          activity: {
            text: ({ date }) =>
              formatHeatmapTooltip(date, cellStates.get(date)),
          },
        }}
        renderBlock={renderBlock}
      />
    </div>
  );
}
