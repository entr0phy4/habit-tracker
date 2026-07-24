import {
  countCompletionsInCalendarWeek,
  getLocalDateString,
  getPreviousDay,
  iterateCalendarWeeksInRange,
  iterateDaysInRange,
} from './dates';
import { isDueOnDate } from './schedule';
import type { Frequency } from './types';
import { startOfWeek } from 'date-fns/startOfWeek';

const WEEK_OPTS = { weekStartsOn: 1 as const };

export function isWeekHit(
  completedDates: Set<string>,
  times: number,
  dateInWeek: string,
): boolean {
  return countCompletionsInCalendarWeek(completedDates, dateInWeek) >= times;
}

function calculateCurrentWeekStreak(
  completedDates: Set<string>,
  times: number,
  today: string,
  habitStartDate: string,
): number {
  const habitWeekStart = getLocalDateString(
    startOfWeek(new Date(`${habitStartDate}T12:00:00`), WEEK_OPTS),
  );
  const currentWeekStart = getLocalDateString(
    startOfWeek(new Date(`${today}T12:00:00`), WEEK_OPTS),
  );

  let streak = 0;
  let cursor = currentWeekStart;

  while (cursor >= habitWeekStart) {
    const hit = isWeekHit(completedDates, times, cursor);
    const isCurrentWeek = cursor === currentWeekStart;

    if (isCurrentWeek) {
      if (hit) {
        streak++;
      }
      // unmet current week: grace — do not break, do not count
      cursor = getLocalDateString(
        startOfWeek(
          new Date(`${getPreviousDay(cursor)}T12:00:00`),
          WEEK_OPTS,
        ),
      );
      continue;
    }

    if (!hit) {
      break;
    }

    streak++;
    cursor = getLocalDateString(
      startOfWeek(new Date(`${getPreviousDay(cursor)}T12:00:00`), WEEK_OPTS),
    );
  }

  return streak;
}

function calculateLongestWeekStreak(
  completedDates: Set<string>,
  times: number,
  startDate: string,
  endDate: string,
): number {
  let longest = 0;
  let current = 0;

  for (const { weekStart } of iterateCalendarWeeksInRange(startDate, endDate)) {
    if (isWeekHit(completedDates, times, weekStart)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

export function calculateCurrentStreak(
  completedDates: Set<string>,
  frequency: Frequency,
  today: string,
  habitStartDate: string,
): number {
  if (frequency.type === 'times_per_week') {
    return calculateCurrentWeekStreak(
      completedDates,
      frequency.times,
      today,
      habitStartDate,
    );
  }

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
  if (frequency.type === 'times_per_week') {
    return calculateLongestWeekStreak(
      completedDates,
      frequency.times,
      startDate,
      endDate,
    );
  }

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
