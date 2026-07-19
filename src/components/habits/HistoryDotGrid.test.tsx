import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCalendarWeekDates } from '@/domain/dates';
import { HistoryDotGrid } from './HistoryDotGrid';

const mockToggle = vi.fn();
const fixedToday = new Date(2026, 6, 19);
const todayKey = '2026-07-19';
const calendarWeek = getCalendarWeekDates(fixedToday);
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

vi.mock('@/hooks/useCompletions', () => ({
  useCompletions: () => ({
    dates: calendarWeek,
    completedDates: new Set<string>(),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useToggleCompletion', () => ({
  useToggleCompletion: () => ({
    toggle: mockToggle,
  }),
}));

vi.mock('@/domain/dates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/dates')>();
  return {
    ...actual,
    getLocalDateString: () => todayKey,
  };
});

describe('HistoryDotGrid', () => {
  beforeEach(() => {
    mockToggle.mockReset();
    mockToggle.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a dot button for each scheduled day in the calendar week', () => {
    render(<HistoryDotGrid habitId="habit-1" frequency={monWedFri} />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(3);
  });

  it('has no tappable button on a non-scheduled Tuesday column', () => {
    render(<HistoryDotGrid habitId="habit-1" frequency={monWedFri} />);
    expect(screen.queryByTestId('history-dot-2026-07-14')).toBeNull();
  });

  it('applies ring-destructive on a missed scheduled past day', () => {
    render(<HistoryDotGrid habitId="habit-1" frequency={monWedFri} />);
    const missedDot = screen.getByTestId('history-dot-2026-07-13');
    expect(missedDot.className).toContain('ring-destructive');
    expect(missedDot.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies today ring class to the current day dot', () => {
    render(<HistoryDotGrid habitId="habit-1" frequency={{ type: 'daily' }} />);
    const todayDot = screen.getByTestId(`history-dot-${todayKey}`);
    expect(todayDot.parentElement?.className).toContain('ring-primary');
  });

  it('calls toggle with the tapped date string', () => {
    render(<HistoryDotGrid habitId="habit-1" frequency={monWedFri} />);
    fireEvent.click(screen.getByTestId('history-dot-2026-07-13'));
    expect(mockToggle).toHaveBeenCalledWith('habit-1', '2026-07-13');
  });
});
