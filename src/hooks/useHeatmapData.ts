import { useLiveQuery } from 'dexie-react-hooks';
import {
  buildHeatmapActivities,
  getHeatmapDateRange,
} from '@/domain/heatmap';
import { getLocalDateString } from '@/domain/dates';
import type { Frequency } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';
import { useToggleCompletion } from '@/hooks/useToggleCompletion';

export function useHeatmapData(
  habitId: string,
  frequency: Frequency,
  todayKey?: string,
) {
  const today = todayKey ?? getLocalDateString(new Date());
  const { start, end } = getHeatmapDateRange(today);
  const { toggle } = useToggleCompletion();

  const result = useLiveQuery(async () => {
    const dates = await completionRepository.getByHabitInRange(
      habitId,
      start,
      end,
    );
    const completedDates = new Set(dates);
    return buildHeatmapActivities(
      frequency,
      completedDates,
      start,
      end,
      today,
    );
  }, [habitId, frequency, start, end, today]);

  return {
    activities: result?.activities ?? [],
    cellStates: result?.cellStates ?? new Map(),
    isLoading: result === undefined,
    toggle: (date: string) => toggle(habitId, date),
  };
}
