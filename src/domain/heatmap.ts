import { format } from 'date-fns/format';
import { es } from 'date-fns/locale';
import { subWeeks } from 'date-fns/subWeeks';
import type { Activity } from 'react-activity-calendar';
import type { Frequency } from './types';
import { getLocalDateString, iterateDaysInRange } from './dates';
import { getWeekDayState, type WeekDayState } from './stats';

export const HEATMAP_WEEKS = 52;

const STATUS_LABELS: Record<WeekDayState, string> = {
  completed: 'Completado',
  missed: 'Perdido',
  'not-scheduled': 'No programado',
  future: 'Futuro',
};

export function getHeatmapDateRange(today: string): { start: string; end: string } {
  const startDate = subWeeks(new Date(`${today}T12:00:00`), HEATMAP_WEEKS);
  return { start: getLocalDateString(startDate), end: today };
}

export function buildHeatmapActivities(
  frequency: Frequency,
  completedDates: Set<string>,
  start: string,
  end: string,
  today: string,
): { activities: Activity[]; cellStates: Map<string, WeekDayState> } {
  const cellStates = new Map<string, WeekDayState>();
  const activities: Activity[] = [];

  for (const date of iterateDaysInRange(start, end)) {
    const state = getWeekDayState(date, frequency, completedDates, today);
    cellStates.set(date, state);
    activities.push({
      date,
      count: state === 'completed' ? 1 : 0,
      level: state === 'completed' ? 4 : 0,
    });
  }

  return { activities, cellStates };
}

export function formatHeatmapTooltip(date: string, state?: WeekDayState): string {
  const label = format(new Date(`${date}T12:00:00`), 'EEE d MMM', { locale: es });
  return `${label} — ${STATUS_LABELS[state ?? 'not-scheduled']}`;
}
