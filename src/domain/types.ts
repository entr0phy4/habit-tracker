// Frequency: days use JS convention 0=Sun … 6=Sat (matches Date.getDay())
export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] };

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  archived: boolean;
  createdAt: string;
}

export interface Completion {
  habitId: string;
  date: string;
}
