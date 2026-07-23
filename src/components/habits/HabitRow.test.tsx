import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { HabitRow } from './HabitRow';

const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/hooks/useStreak', () => ({
  useStreak: () => ({ currentStreak: 5, isLoading: false }),
}));

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  frequency: { type: 'daily' },
  color: '#3fb950',
  archived: false,
  createdAt: '2026-07-19T12:00:00.000Z',
};

function renderRow(onToggle = vi.fn()) {
  render(
    <MemoryRouter>
      <HabitRow habit={habit} isCompleted={false} onToggle={onToggle} />
    </MemoryRouter>,
  );
  return onToggle;
}

describe('HabitRow', () => {
  afterEach(() => {
    cleanup();
    navigateMock.mockReset();
  });

  it('renders with min-h-11 touch target class', () => {
    renderRow();
    const row = screen.getByTestId('habit-row-toggle');
    expect(row.className).toContain('min-h-11');
  });

  it('calls onToggle when row body is clicked on desktop', () => {
    const onToggle = renderRow();
    fireEvent.click(screen.getByTestId('habit-row-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not toggle when history button is clicked', () => {
    const onToggle = renderRow();
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit history for Morning run' }),
    );
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('navigates to habit history when calendar button is clicked', () => {
    renderRow();
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit history for Morning run' }),
    );
    expect(navigateMock).toHaveBeenCalledWith('/habits/habit-1/history');
  });

  it('shows streak count from useStreak', () => {
    renderRow();
    expect(screen.getByLabelText('5 day streak')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('shows streak badge when row is completed', () => {
    render(
      <MemoryRouter>
        <HabitRow habit={habit} isCompleted onToggle={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('5 day streak')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });
});
