import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { HabitRow } from './HabitRow';

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  frequency: { type: 'daily' },
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
});
