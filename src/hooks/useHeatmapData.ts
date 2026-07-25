import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  buildHeatmapActivities,
  getHeatmapDateRange,
} from '@/domain/heatmap';
import { getWeekDayState } from '@/domain/stats';
import { getLocalDateString } from '@/domain/dates';
import type { Frequency } from '@/domain/types';
import { completionRepository } from '@/infrastructure/completionRepository';
import { freezeRepository } from '@/infrastructure/freezeRepository';

export function useHeatmapData(
  habitId: string,
  frequency: Frequency,
  todayKey?: string,
) {
  const today = todayKey ?? getLocalDateString(new Date());
  const { start, end } = getHeatmapDateRange(today);

  const result = useLiveQuery(async () => {
    const [dates, freezeDates] = await Promise.all([
      completionRepository.getByHabitInRange(habitId, start, end),
      freezeRepository.getByHabitInRange(habitId, start, end),
    ]);
    const completedDates = new Set(dates);
    const frozenDates = new Set(freezeDates);
    return buildHeatmapActivities(
      frequency,
      completedDates,
      start,
      end,
      today,
      frozenDates,
    );
  }, [habitId, frequency, start, end, today]);

  const cycle = useCallback(
    async (date: string) => {
      const [dates, freezeDates] = await Promise.all([
        completionRepository.getByHabitInRange(habitId, date, date),
        freezeRepository.getByHabitInRange(habitId, date, date),
      ]);
      const completedDates = new Set(dates);
      const frozenDates = new Set(freezeDates);
      const state = getWeekDayState(
        date,
        frequency,
        completedDates,
        today,
        frozenDates,
      );

      if (state === 'future') return;

      switch (state) {
        case 'missed':
        case 'not-scheduled':
          await completionRepository.toggle(habitId, date);
          break;
        case 'completed':
          await freezeRepository.set(habitId, date);
          break;
        case 'frozen':
          await freezeRepository.clear(habitId, date);
          break;
      }
    },
    [habitId, frequency, today],
  );

  return {
    activities: result?.activities ?? [],
    cellStates: result?.cellStates ?? new Map(),
    isLoading: result === undefined,
    cycle,
  };
}
