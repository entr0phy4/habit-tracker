import { getPreviousDay, iterateDaysInRange } from './dates';
import { isDueOnDate } from './schedule';
import type { Frequency } from './types';

export function calculateCurrentStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  today: string,
  habitStartDate: string,
): number {
  let streak = 0;
  let cursor = today;

  if (isDueOnDate(frequency, today) && !completedDates.has(today)) {
    cursor = getPreviousDay(today);
  }

  while (cursor >= habitStartDate) {
    if (!isDueOnDate(frequency, cursor)) {
      cursor = getPreviousDay(cursor);
      continue;
    }

    if (!completedDates.has(cursor)) {
      break;
    }

    streak++;
    cursor = getPreviousDay(cursor);
  }

  return streak;
}

export function calculateLongestStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  startDate: string,
  endDate: string,
): number {
  let longest = 0;
  let current = 0;

  for (const date of iterateDaysInRange(startDate, endDate)) {
    if (!isDueOnDate(frequency, date)) {
      continue;
    }

    if (completedDates.has(date)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}
