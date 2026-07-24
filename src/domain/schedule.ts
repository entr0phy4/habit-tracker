import { countCompletionsInCalendarWeek } from './dates';
import type { Frequency } from './types';

/**
 * Weekday-only due check. For times_per_week ALWAYS returns false
 * (quotas are not "due on a weekday"). Callers that need all three
 * frequencies MUST use isHabitDueOnDate.
 */
export function isDueOnDate(frequency: Frequency, dateStr: string): boolean {
  if (frequency.type === 'times_per_week') return false;
  if (frequency.type === 'daily') return true;
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return frequency.days.includes(day);
}

/**
 * Universal due helper.
 * - daily / weekly: same as isDueOnDate (completedDates ignored)
 * - times_per_week: true iff completions in Mon–Sun week of dateStr < times
 */
export function isHabitDueOnDate(
  frequency: Frequency,
  dateStr: string,
  completedDates: Set<string>,
): boolean {
  if (frequency.type === 'times_per_week') {
    return (
      countCompletionsInCalendarWeek(completedDates, dateStr) < frequency.times
    );
  }
  return isDueOnDate(frequency, dateStr);
}

export function isDaily(frequency: Frequency): boolean {
  if (frequency.type === 'times_per_week') return false;
  return (
    frequency.type === 'daily' ||
    (frequency.type === 'weekly' && frequency.days.length === 7)
  );
}
