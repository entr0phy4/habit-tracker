import { cloneElement, useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { ActivityCalendar, type Activity, type BlockElement } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { toast } from 'sonner';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const today = getLocalDateString(new Date());
  const { activities, cellStates, isLoading, toggle } = useHeatmapData(
    habitId,
    frequency,
  );

  useEffect(() => {
    if (isLoading) return;

    requestAnimationFrame(() => {
      const scrollEl = containerRef.current?.querySelector(
        '.react-activity-calendar__scroll-container',
      ) as HTMLElement | null;
      if (scrollEl) {
        scrollEl.scrollLeft = scrollEl.scrollWidth;
      }
    });
  }, [isLoading, activities.length]);

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
      const isInteractive = state === 'completed' || state === 'missed';
      const isNotScheduled = state === 'not-scheduled';
      const isMissed = state === 'missed';
      const isToday = activity.date === today;
      const isFuture = state === 'future';

      return cloneElement(block, {
        style: {
          ...block.props.style,
          opacity: isNotScheduled ? 0.2 : isFuture ? 0.4 : 1,
          cursor: isInteractive ? 'pointer' : 'default',
          stroke: isMissed
            ? 'var(--destructive)'
            : isToday
              ? 'var(--primary)'
              : block.props.style?.stroke,
          strokeWidth: isMissed || isToday ? 2 : block.props.style?.strokeWidth,
        },
        onClick: isInteractive
          ? () => void handleCellClick(activity.date)
          : undefined,
        onKeyDown: isInteractive
          ? (event: KeyboardEvent<SVGRectElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                void handleCellClick(activity.date);
              }
            }
          : undefined,
        role: isInteractive ? 'button' : undefined,
        tabIndex: isInteractive ? 0 : undefined,
      });
    },
    [cellStates, today, handleCellClick],
  );

  if (isLoading) {
    return null;
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
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
