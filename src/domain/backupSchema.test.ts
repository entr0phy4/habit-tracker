import { describe, expect, it } from 'vitest';
import { parseBackupJson } from './backupSchema';

const validEmpty = {
  version: 1 as const,
  exportedAt: '2026-07-22T12:00:00.000Z',
  habits: [],
  completions: [],
};

const dailyHabit = {
  id: 'h1',
  name: 'Run',
  frequency: { type: 'daily' as const },
  archived: false,
  createdAt: '2026-07-01T10:00:00.000Z',
};

const weeklyHabit = {
  id: 'h2',
  name: 'Gym',
  frequency: { type: 'weekly' as const, days: [1, 3, 5] },
  archived: true,
  createdAt: '2026-07-02T10:00:00.000Z',
};

describe('parseBackupJson', () => {
  it('accepts a valid minimal payload with empty arrays', () => {
    const result = parseBackupJson(JSON.stringify(validEmpty));
    expect(result).toEqual({ ok: true, data: validEmpty });
  });

  it('preserves daily habit and completion fields', () => {
    const payload = {
      ...validEmpty,
      habits: [dailyHabit],
      completions: [{ habitId: 'h1', date: '2026-07-14' }],
    };
    const result = parseBackupJson(JSON.stringify(payload));
    expect(result).toEqual({ ok: true, data: payload });
  });

  it('accepts weekly frequency with days 0–6', () => {
    const payload = { ...validEmpty, habits: [weeklyHabit] };
    const result = parseBackupJson(JSON.stringify(payload));
    expect(result).toEqual({ ok: true, data: payload });
  });

  it('returns invalid for corrupt JSON', () => {
    expect(parseBackupJson('{not json')).toEqual({
      ok: false,
      error: 'invalid',
    });
  });

  it('returns unsupported_version when version is not 1', () => {
    const payload = { ...validEmpty, version: 2 };
    expect(parseBackupJson(JSON.stringify(payload))).toEqual({
      ok: false,
      error: 'unsupported_version',
    });
  });

  it('returns invalid when version 1 is missing habits', () => {
    const { habits: _habits, ...rest } = validEmpty;
    expect(parseBackupJson(JSON.stringify(rest))).toEqual({
      ok: false,
      error: 'invalid',
    });
  });

  it('returns invalid when a habit is missing id', () => {
    const { id: _id, ...habitWithoutId } = dailyHabit;
    const payload = { ...validEmpty, habits: [habitWithoutId] };
    expect(parseBackupJson(JSON.stringify(payload))).toEqual({
      ok: false,
      error: 'invalid',
    });
  });
});
