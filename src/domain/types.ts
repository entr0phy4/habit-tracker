// Frequency: days use JS convention 0=Sun … 6=Sat (matches Date.getDay())
export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] };

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
