// Frequency: days use JS convention 0=Sun … 6=Sat (matches Date.getDay())
// times_per_week.times ∈ 1..7 (enforced by Zod + HabitForm; times:7 ≠ daily)
export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }
  | { type: 'times_per_week'; times: number };

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  /** Hex accent from curated presets (e.g. `#3fb950`). */
  color: string;
  archived: boolean;
  createdAt: string;
}

export interface Completion {
  habitId: string;
  date: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}
