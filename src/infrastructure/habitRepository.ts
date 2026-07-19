import type { Frequency, Habit } from '@/domain/types';

export const habitRepository = {
  async create(_data: { name: string; frequency: Frequency }): Promise<Habit> {
    throw new Error('habitRepository.create not implemented');
  },
};
