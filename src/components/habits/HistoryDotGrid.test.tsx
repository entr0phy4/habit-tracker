import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLast7Days } from '@/domain/dates';
import { HistoryDotGrid } from './HistoryDotGrid';

const mockToggle = vi.fn();
const fixedToday = new Date(2026, 6, 19);
const todayKey = '2026-07-19';
const last7Days = getLast7Days(fixedToday);

vi.mock('@/hooks/useCompletions', () => ({
  useCompletions: () => ({
    dates: last7Days,
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

  it('renders exactly 7 dot buttons', () => {
    render(<HistoryDotGrid habitId="habit-1" />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(7);
  });

  it('applies today ring class to the current day dot', () => {
    render(<HistoryDotGrid habitId="habit-1" />);
    const todayDot = screen.getByTestId(`history-dot-${todayKey}`);
    expect(todayDot.className).toContain('ring-2');
    expect(todayDot.className).toContain('ring-primary');
  });

  it('calls toggle with the tapped date string', () => {
    render(<HistoryDotGrid habitId="habit-1" />);
    const targetDate = last7Days[0];
    fireEvent.click(screen.getByTestId(`history-dot-${targetDate}`));
    expect(mockToggle).toHaveBeenCalledWith('habit-1', targetDate);
  });
});
