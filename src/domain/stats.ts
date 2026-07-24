import type { Frequency } from './types';
import { isDueOnDate } from './schedule';
import { isFutureDate, iterateDaysInRange } from './dates';

export type WeekDayState = 'completed' | 'missed' | 'not-scheduled' | 'future';

export type ScheduledCompletionCounts = {
  completed: number;
  scheduled: number;
};

export type OverallRateHabitInput = {
  frequency: Frequency;
  completedDates: Set<string>;
  startDate: string;
};

export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): ScheduledCompletionCounts {
  let scheduled = 0;
  let completed = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) continue;
    if (isFutureDate(date, today)) continue;
    scheduled++;
    if (completedDates.has(date)) completed++;
  }

  return { completed, scheduled };
}

export function calculateCompletionRate(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): number {
  const { completed, scheduled } = countScheduledCompletions(
    completedDates,
    frequency,
    startDate,
    endDate,
    today,
  );
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

export function calculateOverallCompletionRate(
  habits: OverallRateHabitInput[],
  endDate: string,
  today: Date = new Date(),
): number {
  let completedSum = 0;
  let scheduledSum = 0;

  for (const habit of habits) {
    const { completed, scheduled } = countScheduledCompletions(
      habit.completedDates,
      habit.frequency,
      habit.startDate,
      endDate,
      today,
    );
    completedSum += completed;
    scheduledSum += scheduled;
  }

  return scheduledSum === 0
    ? 0
    : Math.round((completedSum / scheduledSum) * 100);
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
