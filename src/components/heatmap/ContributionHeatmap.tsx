import { cloneElement, useCallback, useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import { ActivityCalendar, type Activity, type BlockElement } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { toast } from 'sonner';
import { buildHeatmapTheme, normalizeHabitColor } from '@/domain/colors';
import { getLocalDateString } from '@/domain/dates';
import { formatHeatmapTooltip } from '@/domain/heatmap';
import type { Frequency } from '@/domain/types';
import type { WeekDayState } from '@/domain/stats';
import { useHeatmapData } from '@/hooks/useHeatmapData';

const FREEZE_COLOR = '#58a6ff';

function isInteractiveCell(state: WeekDayState | undefined): boolean {
  return (
    state === 'completed' ||
    state === 'missed' ||
    state === 'frozen' ||
    state === 'not-scheduled'
  );
}

interface ContributionHeatmapProps {
  habitId: string;
  frequency: Frequency;
  color?: string;
}

export function ContributionHeatmap({
  habitId,
  frequency,
  color,
}: ContributionHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = getLocalDateString(new Date());
  const accent = normalizeHabitColor(color);
  const heatmapTheme = useMemo(() => buildHeatmapTheme(accent), [accent]);
  const { activities, cellStates, isLoading, cycle } = useHeatmapData(
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
        await cycle(date);
      } catch {
        toast.error("Couldn't update. Try again.");
      }
    },
    [cycle],
  );

  const renderBlock = useCallback(
    (block: BlockElement, activity: Activity) => {
      const state = cellStates.get(activity.date);
      const isInteractive = isInteractiveCell(state);
      const isNotScheduled = state === 'not-scheduled';
      const isMissed = state === 'missed';
      const isFrozen = state === 'frozen';
      const isToday = activity.date === today;
      const isFuture = state === 'future';

      return cloneElement(block, {
        style: {
          ...block.props.style,
          fill: isFrozen ? 'rgba(88, 166, 255, 0.35)' : block.props.style?.fill,
          opacity: isNotScheduled ? 0.2 : isFuture ? 0.4 : 1,
          cursor: isInteractive ? 'pointer' : 'default',
          stroke: isFrozen
            ? FREEZE_COLOR
            : isMissed
              ? 'var(--destructive)'
              : isToday
                ? 'var(--primary)'
                : block.props.style?.stroke,
          strokeWidth: isFrozen || isMissed || isToday ? 2 : block.props.style?.strokeWidth,
          strokeDasharray: isFrozen ? '3 2' : block.props.style?.strokeDasharray,
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
