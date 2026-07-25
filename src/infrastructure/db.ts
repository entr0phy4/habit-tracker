import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Completion, Freeze, Habit } from '@/domain/types';

export class HabitTrackerDB extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  completions!: Table<Completion, [string, string]>;
  freezes!: Table<Freeze, [string, string]>;

  constructor() {
    super('habit-tracker');
    this.version(1).stores({
      habits: 'id, archived, createdAt',
      completions: '[habitId+date], habitId, date',
    });
    this.version(2).stores({
      habits: 'id, archived, createdAt',
      completions: '[habitId+date], habitId, date',
      freezes: '[habitId+date], habitId, date',
    });
  }
}

export const db = new HabitTrackerDB();
