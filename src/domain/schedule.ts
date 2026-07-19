import type { Frequency } from './types';

export function isDueOnDate(frequency: Frequency, dateStr: string): boolean {
  if (frequency.type === 'daily') return true;
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return frequency.days.includes(day);
}

export function isDaily(frequency: Frequency): boolean {
  return (
    frequency.type === 'daily' ||
    (frequency.type === 'weekly' && frequency.days.length === 7)
  );
}
