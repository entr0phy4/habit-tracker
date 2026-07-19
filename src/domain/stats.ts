import type { Frequency } from './types';
import { isDueOnDate } from './schedule';
import { isFutureDate, iterateDaysInRange } from './dates';

export type WeekDayState = 'completed' | 'missed' | 'not-scheduled' | 'future';

export function calculateCompletionRate(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): number {
  let scheduled = 0;
  let completed = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) continue;
    if (isFutureDate(date, today)) continue;
    scheduled++;
    if (completedDates.has(date)) completed++;
  }

  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

export function getWeekDayState(
  date: string,
  frequency: Frequency,
  completedDates: Set<string>,
  today: string,
): WeekDayState {
  if (!isDueOnDate(frequency, date)) return 'not-scheduled';
  if (isFutureDate(date, new Date(`${today}T12:00:00`))) return 'future';
  return completedDates.has(date) ? 'completed' : 'missed';
}
