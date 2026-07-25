import { useCallback } from 'react';
import { getLocalDateString } from '@/domain/dates';
import { completionRepository } from '@/infrastructure/completionRepository';
import { markFirstCheckIn } from '@/platform/install';

export function useToggleCompletion() {
  const toggle = useCallback(async (habitId: string, date?: string) => {
    const targetDate = date ?? getLocalDateString(new Date());
    await completionRepository.toggle(habitId, targetDate);
    markFirstCheckIn();
  }, []);

  return { toggle };
}
