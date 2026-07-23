import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { HabitHistoryPage } from './HabitHistoryPage';

const navigateMock = vi.fn();
const useLiveQueryMock = vi.fn();

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  frequency: { type: 'daily' },
  color: '#3fb950',
  archived: false,
  createdAt: '2026-07-19T12:00:00.000Z',
};

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => useLiveQueryMock(...args),
}));

vi.mock('@/hooks/useHabitStats', () => ({
  useHabitStats: () => ({
    current: 3,
    longest: 5,
    rate: 80,
    isLoading: false,
  }),
}));

vi.mock('@/components/heatmap/ContributionHeatmap', () => ({
  ContributionHeatmap: ({
    habitId,
    frequency,
  }: {
    habitId: string;
    frequency: Habit['frequency'];
  }) => (
    <div
      data-testid="contribution-heatmap-mock"
      data-habit-id={habitId}
      data-frequency={frequency.type}
    />
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/habits/habit-1/history']}>
      <Routes>
        <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HabitHistoryPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useLiveQueryMock.mockReturnValue(habit);
  });

  afterEach(() => {
    cleanup();
  });

  it('calls navigate(-1) when back button is clicked', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('shows Historial subtitle above the heatmap', () => {
    renderPage();

    expect(screen.getByText('Historial')).toBeTruthy();
    expect(screen.queryByText('This week')).toBeNull();
  });

  it('renders ContributionHeatmap with habit id and frequency', () => {
    renderPage();

    const heatmap = screen.getByTestId('contribution-heatmap-mock');
    expect(heatmap.getAttribute('data-habit-id')).toBe('habit-1');
    expect(heatmap.getAttribute('data-frequency')).toBe('daily');
  });

  it('uses navigate(-1) on loading shell back button', () => {
    useLiveQueryMock.mockReturnValue(undefined);

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
