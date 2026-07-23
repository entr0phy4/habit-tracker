import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { DashboardPage } from './DashboardPage';

const useDashboardHabitsMock = vi.fn();

vi.mock('@/hooks/useDashboardHabits', () => ({
  useDashboardHabits: () => useDashboardHabitsMock(),
}));

function makeHabit(id: string, name: string): Habit {
  return {
    id,
    name,
    frequency: { type: 'daily' },
    color: '#3fb950',
    archived: false,
    createdAt: '2026-07-19T12:00:00.000Z',
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useDashboardHabitsMock.mockReset();
  });

  it('returns null while loading', () => {
    useDashboardHabitsMock.mockReturnValue({ items: [], isLoading: true });

    const { container } = renderPage();

    expect(container.firstChild).toBeNull();
  });

  it('shows empty state when no active habits', () => {
    useDashboardHabitsMock.mockReturnValue({ items: [], isLoading: false });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'No hay hábitos activos' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Toca + en Hoy para crear tu primer hábito.'),
    ).toBeTruthy();
  });

  it('renders Panel page title', () => {
    useDashboardHabitsMock.mockReturnValue({ items: [], isLoading: false });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Panel' })).toBeTruthy();
  });

  it('lists habits in streak order from hook', () => {
    useDashboardHabitsMock.mockReturnValue({
      items: [
        { habit: makeHabit('h1', 'High streak'), currentStreak: 7 },
        { habit: makeHabit('h2', 'Low streak'), currentStreak: 3 },
      ],
      isLoading: false,
    });

    renderPage();

    const highStreak = screen.getByText('High streak');
    const lowStreak = screen.getByText('Low streak');
    expect(
      highStreak.compareDocumentPosition(lowStreak) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
