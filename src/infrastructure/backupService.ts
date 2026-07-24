import { getLocalDateString } from '@/domain/dates';
import { normalizeHabitColor } from '@/domain/colors';
import type { BackupPayload } from '@/domain/types';
import { db } from './db';

export async function exportBackup(): Promise<BackupPayload> {
  const [habitsRaw, completions] = await Promise.all([
    db.habits.toArray(),
    db.completions.toArray(),
  ]);

  const habits = habitsRaw.map((habit) => ({
    ...habit,
    color: normalizeHabitColor(habit.color),
  }));

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    completions,
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  const habits = payload.habits.map((habit) => ({
    ...habit,
    color: normalizeHabitColor(habit.color),
  }));

  await db.transaction('rw', db.habits, db.completions, async () => {
    await db.habits.clear();
    await db.completions.clear();
    await db.habits.bulkAdd(habits);
    await db.completions.bulkAdd(payload.completions);
  });
}

export function buildBackupFilename(today: Date = new Date()): string {
  return `habit-tracker-backup-${getLocalDateString(today)}.json`;
}

export function downloadBackupJson(
  payload: BackupPayload,
  filename: string,
): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
