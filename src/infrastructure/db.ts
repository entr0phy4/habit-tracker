import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Completion, Habit } from '@/domain/types';

export class HabitTrackerDB extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  completions!: Table<Completion, [string, string]>;

  constructor() {
    super('habit-tracker');
    this.version(1).stores({
      habits: 'id, archived, createdAt',
      completions: '[habitId+date], habitId, date',
    });
  }
}

export const db = new HabitTrackerDB();
