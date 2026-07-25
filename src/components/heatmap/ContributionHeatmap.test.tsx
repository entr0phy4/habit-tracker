import type { ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Activity } from 'react-activity-calendar';
import { ContributionHeatmap } from './ContributionHeatmap';

const mockCycle = vi.fn();
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
    theme,
  }: {
    data: Activity[];
    theme?: { dark?: string[] };
    renderBlock?: (
      block: ReactElement,
      activity: Activity,
    ) => ReactElement;
  }) => (
    <div
      data-testid="activity-calendar-mock"
      data-theme-level0={theme?.dark?.[0]}
      data-theme-level3={theme?.dark?.[3]}
    >
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
    mockCycle.mockReset();
    mockCycle.mockResolvedValue(undefined);
    useHeatmapDataMock.mockReturnValue({
      activities,
      cellStates,
      isLoading: false,
      cycle: mockCycle,
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
      cycle: mockCycle,
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

  it('calls cycle when a missed scheduled date cell is clicked', () => {
    const { container } = render(
      <ContributionHeatmap habitId="habit-1" frequency={monWedFri} />,
    );

    const cell = container.querySelector('[data-date="2026-07-13"]');
    expect(cell).toBeTruthy();
    fireEvent.click(cell!);

    expect(mockCycle).toHaveBeenCalledWith('2026-07-13');
  });

  it('calls cycle when a frozen cell is clicked', () => {
    const frozenStates = new Map(cellStates);
    frozenStates.set('2026-07-13', 'frozen');
    useHeatmapDataMock.mockReturnValue({
      activities,
      cellStates: frozenStates,
      isLoading: false,
      cycle: mockCycle,
    });

    const { container } = render(
      <ContributionHeatmap habitId="habit-1" frequency={monWedFri} />,
    );

    const cell = container.querySelector('[data-date="2026-07-13"]');
    fireEvent.click(cell!);

    expect(mockCycle).toHaveBeenCalledWith('2026-07-13');
  });

  it('applies frozen cell styling with ice dashed stroke', () => {
    const frozenStates = new Map(cellStates);
    frozenStates.set('2026-07-13', 'frozen');
    useHeatmapDataMock.mockReturnValue({
      activities,
      cellStates: frozenStates,
      isLoading: false,
      cycle: mockCycle,
    });

    const { container } = render(
      <ContributionHeatmap habitId="habit-1" frequency={monWedFri} />,
    );

    const cell = container.querySelector('[data-date="2026-07-13"]') as SVGElement;
    expect(cell?.style.stroke).toBe('#58a6ff');
    expect(cell?.style.strokeDasharray).toBe('3 2');
  });

  it('does not call cycle when a future scheduled date cell is clicked', () => {
    const { container } = render(
      <ContributionHeatmap habitId="habit-1" frequency={monWedFri} />,
    );

    const cell = container.querySelector('[data-date="2026-07-21"]');
    expect(cell).toBeTruthy();
    fireEvent.click(cell!);

    expect(mockCycle).not.toHaveBeenCalled();
  });

  it('applies heatmap theme derived from habit color', () => {
    render(
      <ContributionHeatmap
        habitId="habit-1"
        frequency={monWedFri}
        color="#58a6ff"
      />,
    );

    const calendar = screen.getByTestId('activity-calendar-mock');
    expect(calendar.getAttribute('data-theme-level0')).toBe('#21262d');
    expect(calendar.getAttribute('data-theme-level3')).toBe('#58a6ff');
  });
});
