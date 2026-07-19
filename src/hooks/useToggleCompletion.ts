import { useCallback } from 'react';
import { getLocalDateString } from '@/domain/dates';
import { completionRepository } from '@/infrastructure/completionRepository';

export function useToggleCompletion() {
  const toggle = useCallback(async (habitId: string, date?: string) => {
    const targetDate = date ?? getLocalDateString(new Date());
    await completionRepository.toggle(habitId, targetDate);
  }, []);

  return { toggle };
}
