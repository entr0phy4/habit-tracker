import type { Frequency } from './types';
import { isDueOnDate } from './schedule';
import {
  countCompletionsInCalendarWeek,
  countFreezesInCalendarWeek,
  getLocalDateString,
  isFutureDate,
  iterateCalendarWeeksInRange,
  iterateDaysInRange,
} from './dates';

export type WeekDayState =
  | 'completed'
  | 'missed'
  | 'not-scheduled'
  | 'future'
  | 'frozen';

export type ScheduledCompletionCounts = {
  completed: number;
  scheduled: number;
};

export type OverallRateHabitInput = {
  frequency: Frequency;
  completedDates: Set<string>;
  startDate: string;
  frozenDates?: Set<string>;
};

export function countScheduledCompletions(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
  today: Date = new Date(),
  frozenDates: Set<string> = new Set(),
): ScheduledCompletionCounts {
  if (frequency.type === 'times_per_week') {
    let scheduled = 0;
    let completed = 0;
    const todayLocal = getLocalDateString(today);

    for (const { weekStart } of iterateCalendarWeeksInRange(
      startDate,
      endDate,
    )) {
      if (weekStart > todayLocal) continue;
      const freezeCount = countFreezesInCalendarWeek(frozenDates, weekStart);
      const effectiveTimes = Math.max(0, frequency.times - freezeCount);
      scheduled += effectiveTimes;
      completed += Math.min(
        countCompletionsInCalendarWeek(completedDates, weekStart),
        effectiveTimes,
      );
    }

    return { completed, scheduled };
  }

  let scheduled = 0;
  let completed = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) continue;
    if (isFutureDate(date, today)) continue;
    if (frozenDates.has(date)) continue;
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
  frozenDates: Set<string> = new Set(),
): number {
  const { completed, scheduled } = countScheduledCompletions(
    completedDates,
    frequency,
    startDate,
    endDate,
    today,
    frozenDates,
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
      habit.frozenDates ?? new Set(),
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
  frozenDates: Set<string> = new Set(),
): WeekDayState {
  if (frozenDates.has(date)) return 'frozen';

  if (frequency.type === 'times_per_week') {
    if (completedDates.has(date)) return 'completed';
    if (isFutureDate(date, new Date(`${today}T12:00:00`))) return 'future';
    return 'not-scheduled';
  }

  if (!isDueOnDate(frequency, date)) return 'not-scheduled';
  if (isFutureDate(date, new Date(`${today}T12:00:00`))) return 'future';
  return completedDates.has(date) ? 'completed' : 'missed';
}
