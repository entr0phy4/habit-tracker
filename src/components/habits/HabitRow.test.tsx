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

function renderRow(onToggle = vi.fn(), onSkip = vi.fn()) {
  render(
    <MemoryRouter>
      <HabitRow
        habit={habit}
        isCompleted={false}
        onToggle={onToggle}
        onSkip={onSkip}
      />
    </MemoryRouter>,
  );
  return { onToggle, onSkip };
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
    const { onToggle } = renderRow();
    fireEvent.click(screen.getByTestId('habit-row-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders Omitir skip button and invokes onSkip without toggling row', () => {
    const { onToggle, onSkip } = renderRow();
    const skipButton = screen.getByRole('button', { name: 'Omitir' });
    expect(skipButton).toBeTruthy();
    fireEvent.click(skipButton);
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('does not toggle when history button is clicked', () => {
    const { onToggle } = renderRow();
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

  it('exposes habit color accent on the row', () => {
    renderRow();
    expect(screen.getByTestId('habit-row-toggle').getAttribute('data-habit-color')).toBe(
      '#3fb950',
    );
  });

  it('plays check-in reward when toggling an incomplete habit to complete', () => {
    renderRow();
    fireEvent.click(screen.getByTestId('habit-row-toggle'));
    expect(
      screen.getByTestId('habit-row-toggle').getAttribute('data-checkin-reward'),
    ).toBe('true');
  });

  it('does not play check-in reward when un-completing', () => {
    render(
      <MemoryRouter>
        <HabitRow habit={habit} isCompleted onToggle={vi.fn()} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId('habit-row-toggle'));
    expect(
      screen.getByTestId('habit-row-toggle').getAttribute('data-checkin-reward'),
    ).not.toBe('true');
  });

  it('renders WeekQuotaChip for times_per_week habits', () => {
    const timesHabit: Habit = {
      ...habit,
      frequency: { type: 'times_per_week', times: 3 },
    };
    render(
      <MemoryRouter>
        <HabitRow
          habit={timesHabit}
          isCompleted={false}
          weekCompletions={2}
          onToggle={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/2\/3/)).toBeTruthy();
    expect(screen.getByLabelText('2 of 3 this week')).toBeTruthy();
    expect(screen.queryByLabelText('Scheduled days')).toBeNull();
  });

  it('renders WeekDayDots for daily habits', () => {
    renderRow();
    expect(screen.getByLabelText('Scheduled days')).toBeTruthy();
  });

  it('uses week streak wording for times_per_week flame aria', () => {
    const timesHabit: Habit = {
      ...habit,
      frequency: { type: 'times_per_week', times: 3 },
    };
    render(
      <MemoryRouter>
        <HabitRow
          habit={timesHabit}
          isCompleted={false}
          weekCompletions={1}
          onToggle={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('5 week streak')).toBeTruthy();
  });
});
