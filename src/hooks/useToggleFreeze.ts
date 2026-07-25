import { useCallback } from 'react';
import { getLocalDateString } from '@/domain/dates';
import { freezeRepository } from '@/infrastructure/freezeRepository';

export function useToggleFreeze() {
  const freezeToday = useCallback(async (habitId: string, date?: string) => {
    const targetDate = date ?? getLocalDateString(new Date());
    await freezeRepository.set(habitId, targetDate);
  }, []);

  return { freezeToday };
}
