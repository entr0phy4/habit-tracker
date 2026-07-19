import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { subDays } from 'date-fns/subDays';
import { isAfter, startOfDay } from 'date-fns';
import type { Habit } from './types';

export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function getLast7Days(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    getLocalDateString(subDays(today, 6 - index)),
  );
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
