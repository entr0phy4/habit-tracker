import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';
import { isAfter, startOfDay } from 'date-fns';

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
