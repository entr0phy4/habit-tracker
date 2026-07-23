import { useCallback } from 'react';
import type { Frequency, Habit } from '@/domain/types';
import { habitRepository } from '@/infrastructure/habitRepository';

export function useCreateHabit() {
  const create = useCallback(
    async (data: {
      name: string;
      frequency: Frequency;
      color?: string;
    }): Promise<Habit> => {
      return habitRepository.create(data);
    },
    [],
  );

  return { create };
}
