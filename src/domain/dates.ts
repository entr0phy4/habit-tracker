import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { subDays } from 'date-fns/subDays';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfWeek } from 'date-fns/endOfWeek';
import { startOfWeek } from 'date-fns/startOfWeek';
import { isAfter, startOfDay } from 'date-fns';
import type { Habit } from './types';

const WEEK_OPTS = { weekStartsOn: 1 as const };

export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function getLast7Days(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    getLocalDateString(subDays(today, 6 - index)),
  );
}

export function getCalendarWeekDates(today: Date = new Date()): string[] {
  return eachDayOfInterval({
    start: startOfWeek(today, WEEK_OPTS),
    end: endOfWeek(today, WEEK_OPTS),
  }).map(getLocalDateString);
}

/** Count YYYY-MM-DD keys that fall in the Mon–Sun week containing dateInWeek. */
export function countCompletionsInCalendarWeek(
  completedDates: Set<string>,
  dateInWeek: string,
): number {
  const weekDates = getCalendarWeekDates(new Date(`${dateInWeek}T12:00:00`));
  let count = 0;
  for (const date of weekDates) {
    if (completedDates.has(date)) count++;
  }
  return count;
}

/**
 * Yield each Mon–Sun week overlapping [startDate, endDate] as inclusive
 * local date strings { weekStart, weekEnd }.
 */
export function* iterateCalendarWeeksInRange(
  startDate: string,
  endDate: string,
): Generator<{ weekStart: string; weekEnd: string }> {
  if (startDate > endDate) return;

  let cursor = getLocalDateString(
    startOfWeek(new Date(`${startDate}T12:00:00`), WEEK_OPTS),
  );
  const lastWeekStart = getLocalDateString(
    startOfWeek(new Date(`${endDate}T12:00:00`), WEEK_OPTS),
  );

  while (cursor <= lastWeekStart) {
    const weekEnd = getLocalDateString(
      endOfWeek(new Date(`${cursor}T12:00:00`), WEEK_OPTS),
    );
    yield { weekStart: cursor, weekEnd };
    cursor = getLocalDateString(addDays(new Date(`${cursor}T12:00:00`), 7));
  }
}

export function isFutureDate(dateStr: string, today: Date = new Date()): boolean {
  return isAfter(startOfDay(new Date(`${dateStr}T00:00:00`)), startOfDay(today));
}

export function getPreviousDay(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return getLocalDateString(subDays(date, 1));
}

export function* iterateDaysInRange(start: string, end: string): Generator<string> {
  let cursor = start;
  while (cursor <= end) {
    yield cursor;
    if (cursor === end) break;
    const date = new Date(`${cursor}T12:00:00`);
    cursor = getLocalDateString(addDays(date, 1));
  }
}

export function getHabitStartDate(habit: Habit): string {
  return getLocalDateString(new Date(habit.createdAt));
}
