import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackupPayload, Habit } from '@/domain/types';
import {
  buildBackupFilename,
  downloadBackupJson,
  exportBackup,
  importBackup,
} from './backupService';
import { db } from './db';

const activeHabit: Habit = {
  id: 'active-1',
  name: 'Run',
  frequency: { type: 'daily' },
  archived: false,
  createdAt: '2026-07-01T10:00:00.000Z',
};

const archivedHabit: Habit = {
  id: 'archived-1',
  name: 'Old gym',
  frequency: { type: 'weekly', days: [1, 3, 5] },
  archived: true,
  createdAt: '2026-06-01T10:00:00.000Z',
};

describe('backupService', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await db.habits.clear();
    await db.completions.clear();
  });

  it('exports empty arrays from an empty database', async () => {
    const payload = await exportBackup();
    expect(payload.version).toBe(1);
    expect(payload.habits).toEqual([]);
    expect(payload.completions).toEqual([]);
    expect(payload.exportedAt.length).toBeGreaterThan(0);
  });

  it('exports all habits including archived and all completions', async () => {
    await db.habits.bulkAdd([activeHabit, archivedHabit]);
    await db.completions.bulkAdd([
      { habitId: 'active-1', date: '2026-07-14' },
      { habitId: 'archived-1', date: '2026-06-10' },
    ]);

    const payload = await exportBackup();
    expect(payload.habits).toHaveLength(2);
    expect(payload.habits.map((h) => h.id).sort()).toEqual([
      'active-1',
      'archived-1',
    ]);
    expect(payload.completions).toHaveLength(2);
  });

  it('replaces existing data on import', async () => {
    await db.habits.add(activeHabit);
    await db.completions.add({ habitId: 'active-1', date: '2026-07-14' });

    const incoming: BackupPayload = {
      version: 1,
      exportedAt: '2026-07-22T12:00:00.000Z',
      habits: [archivedHabit],
      completions: [{ habitId: 'archived-1', date: '2026-06-10' }],
    };

    await importBackup(incoming);

    expect(await db.habits.toArray()).toEqual([archivedHabit]);
    expect(await db.completions.toArray()).toEqual([
      { habitId: 'archived-1', date: '2026-06-10' },
    ]);
  });

  it('rolls back when bulkAdd throws inside the transaction', async () => {
    await db.habits.add(activeHabit);
    await db.completions.add({ habitId: 'active-1', date: '2026-07-14' });

    const bulkAddSpy = vi
      .spyOn(db.completions, 'bulkAdd')
      .mockRejectedValueOnce(new Error('write failed'));

    const incoming: BackupPayload = {
      version: 1,
      exportedAt: '2026-07-22T12:00:00.000Z',
      habits: [archivedHabit],
      completions: [{ habitId: 'archived-1', date: '2026-06-10' }],
    };

    await expect(importBackup(incoming)).rejects.toThrow('write failed');

    expect(await db.habits.toArray()).toEqual([activeHabit]);
    expect(await db.completions.toArray()).toEqual([
      { habitId: 'active-1', date: '2026-07-14' },
    ]);

    bulkAddSpy.mockRestore();
  });

  it('builds filename with local YYYY-MM-DD date', () => {
    expect(buildBackupFilename(new Date('2026-07-22T15:00:00'))).toBe(
      'habit-tracker-backup-2026-07-22.json',
    );
  });

  it('downloadBackupJson creates an application/json blob download', () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi.fn();
    const anchor = {
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement;
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor);

    const payload: BackupPayload = {
      version: 1,
      exportedAt: '2026-07-22T12:00:00.000Z',
      habits: [],
      completions: [],
    };

    downloadBackupJson(payload, 'habit-tracker-backup-2026-07-22.json');

    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('application/json');
    expect(anchor.download).toBe('habit-tracker-backup-2026-07-22.json');
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    createElement.mockRestore();
    vi.unstubAllGlobals();
  });
});
