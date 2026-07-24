import { z } from 'zod';
import { normalizeHabitColor } from './colors';
import type { BackupPayload, Habit } from './types';

const frequencySchema = z.union([
  z.object({ type: z.literal('daily') }),
  z.object({
    type: z.literal('weekly'),
    days: z.array(z.number().int().min(0).max(6)),
  }),
]);

const habitSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  frequency: frequencySchema,
  color: z.string().optional(),
  archived: z.boolean(),
  createdAt: z.string().min(1),
});

const completionSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const backupPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().min(1),
  habits: z.array(habitSchema),
  completions: z.array(completionSchema),
});

export type ParseBackupResult =
  | { ok: true; data: BackupPayload }
  | { ok: false; error: 'invalid' | 'unsupported_version' };

function withNormalizedColors(
  habits: z.infer<typeof habitSchema>[],
): Habit[] {
  return habits.map((habit) => ({
    ...habit,
    color: normalizeHabitColor(habit.color),
  }));
}

export function parseBackupJson(raw: string): ParseBackupResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid' };
  }

  if (
    parsed !== null &&
    typeof parsed === 'object' &&
    'version' in parsed &&
    (parsed as { version: unknown }).version !== 1
  ) {
    return { ok: false, error: 'unsupported_version' };
  }

  const result = backupPayloadSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: 'invalid' };
  }

  return {
    ok: true,
    data: {
      ...result.data,
      habits: withNormalizedColors(result.data.habits),
    },
  };
}
