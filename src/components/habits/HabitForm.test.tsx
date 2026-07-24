import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HABIT_COLOR_PRESETS } from '@/domain/colors';
import { HabitForm } from './HabitForm';

describe('HabitForm color picker', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders eight color swatches', () => {
    render(<HabitForm submitLabel="Create habit" onSubmit={vi.fn()} />);
    for (const color of HABIT_COLOR_PRESETS) {
      expect(
        screen.getByRole('radio', { name: new RegExp(color, 'i') }),
      ).toBeTruthy();
    }
  });

  it('includes selected color in submit values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HabitForm submitLabel="Create habit" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: /#58a6ff/i }));
    fireEvent.change(screen.getByLabelText(/habit name/i), {
      target: { value: 'Run' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create habit/i }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Run', color: '#58a6ff' }),
      );
    });
  });

  it('preselects initialValues.color', () => {
    render(
      <HabitForm
        submitLabel="Save"
        initialValues={{
          name: 'Gym',
          frequency: { type: 'daily' },
          color: '#f778ba',
        }}
        onSubmit={vi.fn()}
      />,
    );
    const swatch = screen.getByRole('radio', { name: /#f778ba/i });
    expect(swatch.getAttribute('aria-checked')).toBe('true');
  });
});
