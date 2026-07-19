import type { ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Activity } from 'react-activity-calendar';
import { ContributionHeatmap } from './ContributionHeatmap';

const mockToggle = vi.fn();
const todayKey = '2026-07-19';
const monWedFri = { type: 'weekly' as const, days: [1, 3, 5] };

const cellStates = new Map<string, string>([
  ['2026-07-13', 'missed'],
  ['2026-07-21', 'future'],
]);

const activities = [
  { date: '2026-07-13', count: 0, level: 0 },
  { date: '2026-07-21', count: 0, level: 0 },
];

const useHeatmapDataMock = vi.fn();

vi.mock('@/hooks/useHeatmapData', () => ({
  useHeatmapData: (...args: unknown[]) => useHeatmapDataMock(...args),
}));

vi.mock('react-activity-calendar', () => ({
  ActivityCalendar: ({
    data,
    renderBlock,
  }: {
    data: Activity[];
    renderBlock?: (
      block: ReactElement,
      activity: Activity,
    ) => ReactElement;
  }) => (
    <div data-testid="activity-calendar-mock">
      {data.map((activity) => {
        const block = <rect data-date={activity.date} />;
        return renderBlock ? (
          <div key={activity.date}>{renderBlock(block, activity)}</div>
        ) : (
          <div key={activity.date}>{block}</div>
        );
      })}
    </div>
  ),
}));

vi.mock('@/domain/dates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/dates')>();
  return {
    ...actual,
    getLocalDateString: () => todayKey,
  };
});

describe('ContributionHeatmap', () => {
  beforeEach(() => {
    mockToggle.mockReset();
    mockToggle.mockResolvedValue(undefined);
    useHeatmapDataMock.mockReturnValue({
      activities,
      cellStates,
      isLoading: false,
      toggle: mockToggle,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('returns null while loading', () => {
    useHeatmapDataMock.mockReturnValue({
      activities: [],
      cellStates: new Map(),
      isLoading: true,
      toggle: mockToggle,
    });

    const { container } = render(
      <ContributionHeatmap habitId="habit-1" frequency={monWedFri} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('wraps the calendar in overflow-x-auto container', () => {
    render(<ContributionHeatmap habitId="habit-1" frequency={monWedFri} />);

    const wrapper = screen.getByTestId('contribution-heatmap');
    expect(wrapper.className).toContain('overflow-x-auto');
  });

  it('calls toggle when a missed scheduled date cell is clicked', () => {
    render(<ContributionHeatmap habitId="habit-1" frequency={monWedFri} />);

    fireEvent.click(screen.getByTestId('heatmap-cell-2026-07-13'));

    expect(mockToggle).toHaveBeenCalledWith('2026-07-13');
  });

  it('does not call toggle when a future scheduled date cell is clicked', () => {
    render(<ContributionHeatmap habitId="habit-1" frequency={monWedFri} />);

    fireEvent.click(screen.getByTestId('heatmap-cell-2026-07-21'));

    expect(mockToggle).not.toHaveBeenCalled();
  });
});
