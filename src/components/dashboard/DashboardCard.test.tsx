import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { DashboardCard } from './DashboardCard';

const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  frequency: { type: 'daily' },
  color: '#3fb950',
  archived: false,
  createdAt: '2026-07-19T12:00:00.000Z',
};

function renderCard(currentStreak = 7) {
  return render(
    <MemoryRouter>
      <DashboardCard habit={habit} currentStreak={currentStreak} />
    </MemoryRouter>,
  );
}

describe('DashboardCard', () => {
  afterEach(() => {
    cleanup();
    navigateMock.mockReset();
  });

  it('renders habit name and streak count', () => {
    renderCard(7);
    expect(screen.getByText('Morning run')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('has min-h-11 touch target class', () => {
    renderCard();
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-h-11');
  });

  it('truncates habit name', () => {
    renderCard();
    const name = screen.getByText('Morning run');
    expect(name.className).toContain('truncate');
  });

  it('includes streak count in Flame aria-label', () => {
    renderCard(7);
    expect(screen.getByLabelText('7 day streak')).toBeTruthy();
  });

  it('navigates to habit history on click', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button'));
    expect(navigateMock).toHaveBeenCalledWith('/habits/habit-1/history');
  });

  it('shows zero streak with Flame badge', () => {
    renderCard(0);
    expect(screen.getByLabelText('0 day streak')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });
});
