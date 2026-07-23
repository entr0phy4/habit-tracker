import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TodayHabitsState } from '@/hooks/useTodayHabits';
import { TodayPage } from './TodayPage';

const useTodayHabitsMock = vi.fn<() => TodayHabitsState>();

vi.mock('@/hooks/useTodayHabits', () => ({
  useTodayHabits: () => useTodayHabitsMock(),
}));

vi.mock('@/hooks/useToggleCompletion', () => ({
  useToggleCompletion: () => ({ toggle: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );
}

describe('TodayPage', () => {
  beforeEach(() => {
    useTodayHabitsMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows centered error copy when storage is unavailable', () => {
    useTodayHabitsMock.mockReturnValue({ status: 'error' });

    renderPage();

    expect(
      screen.getByText("Couldn't save your data. Try refreshing the page."),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Today' })).toBeTruthy();
  });

  it('does not render Add habit FAB in error state', () => {
    useTodayHabitsMock.mockReturnValue({ status: 'error' });

    renderPage();

    expect(screen.queryByRole('button', { name: 'Add habit' })).toBeNull();
  });

  it('renders empty state when ready with no habits', () => {
    useTodayHabitsMock.mockReturnValue({ status: 'ready', habits: [] });

    renderPage();

    expect(screen.getByRole('heading', { name: 'No habits due today' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add habit' })).toBeTruthy();
  });

  it('keeps Manage habits link and adds Settings gear to header', () => {
    useTodayHabitsMock.mockReturnValue({ status: 'ready', habits: [] });

    renderPage();

    const manage = screen.getByRole('link', { name: 'Manage habits' });
    expect(manage.getAttribute('href')).toBe('/habits/manage');

    const settings = screen.getByRole('link', { name: 'Ajustes' });
    expect(settings.getAttribute('href')).toBe('/settings');
  });
});
