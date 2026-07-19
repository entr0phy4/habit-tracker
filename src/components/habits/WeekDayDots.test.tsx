import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeekDayDots } from './WeekDayDots';

describe('WeekDayDots', () => {
  it('renders all 7 dots filled for daily frequency', () => {
    const { container } = render(<WeekDayDots frequency={{ type: 'daily' }} />);

    const filledDots = container.querySelectorAll('.bg-primary');
    expect(filledDots).toHaveLength(7);
  });

  it('renders only scheduled weekday dots filled for weekly frequency', () => {
    const { container } = render(
      <WeekDayDots frequency={{ type: 'weekly', days: [1, 3, 5] }} />,
    );

    const dayColumns = container.querySelectorAll('.flex.flex-col.items-center.gap-1');
    expect(dayColumns).toHaveLength(7);

    const filledIndices = [1, 3, 5];
    dayColumns.forEach((column, index) => {
      const dot = column.querySelector('span.rounded-full');
      const expectedClass = filledIndices.includes(index) ? 'bg-primary' : 'bg-border';
      expect(dot?.classList.contains(expectedClass)).toBe(true);
    });
  });
});
