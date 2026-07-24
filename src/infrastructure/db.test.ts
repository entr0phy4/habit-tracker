import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HabitTrackerDB } from './db';

describe('HabitTrackerDB', () => {
  let database: HabitTrackerDB;

  beforeEach(async () => {
    database = new HabitTrackerDB();
    await database.delete();
    await database.open();
  });

  afterEach(async () => {
    await database.delete();
    await database.close();
  });

  it('persists data across closing and reopening the database', async () => {
    await database.habits.add({
      id: 'habit-1',
      name: 'Read',
      frequency: { type: 'daily' },
      color: '#3fb950',
      archived: false,
      createdAt: new Date().toISOString(),
    });

    await database.close();

    const reopened = new HabitTrackerDB();
    await reopened.open();
    const habit = await reopened.habits.get('habit-1');

    expect(habit?.name).toBe('Read');
    await reopened.delete();
    await reopened.close();
  });
});
