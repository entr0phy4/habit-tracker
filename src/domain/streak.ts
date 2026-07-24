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

function weekStartString(dateStr: string): string {
  return getLocalDateString(
    startOfWeek(new Date(`${dateStr}T12:00:00`), WEEK_OPTS),
  );
}

function calculateCurrentWeekStreak(
  completedDates: Set<string>,
  times: number,
  today: string,
  habitStartDate: string,
): number {
  const habitWeekStart = weekStartString(habitStartDate);
  const todayWeekStart = weekStartString(today);
  let streak = 0;

  // Walk weeks backward from todayWeekStart
  let cursor = todayWeekStart;
  while (cursor >= habitWeekStart) {
    const hit = isWeekHit(completedDates, times, cursor);
    const isCurrentWeek = cursor === todayWeekStart;

    if (isCurrentWeek) {
      if (hit) {
        streak++;
      }
      // unmet current week: skip (do not break, do not count)
      cursor = weekStartString(getPreviousDay(cursor));
      continue;
    }

    if (!hit) {
      break;
    }

    streak++;
    cursor = weekStartString(getPreviousDay(cursor));
  }

  return streak;
}

function calculateLongestWeekStreak(
  completedDates: Set<string>,
  times: number,
  startDate: string,
  endDate: string,
): number {
  const todayWeekStart = weekStartString(endDate);
  let longest = 0;
  let current = 0;

  for (const { weekStart } of iterateCalendarWeeksInRange(startDate, endDate)) {
    const hit = isWeekHit(completedDates, times, weekStart);
    const isCurrentWeek = weekStart === todayWeekStart;

    // Unmet current week: treat as non-hit trailing (does not extend or break prior run for longest)
    if (isCurrentWeek && !hit) {
      longest = Math.max(longest, current);
      current = 0;
      continue;
    }

    if (hit) {
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
