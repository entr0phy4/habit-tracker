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

describe('HabitForm schedule modes', () => {
  afterEach(() => {
    cleanup();
  });

  it('submits times_per_week when Times per week mode is selected', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HabitForm submitLabel="Create habit" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: /times per week/i }));
    // default times is 3; change to 3 explicitly via toggle if needed
    fireEvent.click(screen.getByRole('radio', { name: /^3$/ }));
    fireEvent.change(screen.getByLabelText(/habit name/i), {
      target: { value: 'Read' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create habit/i }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Read',
          frequency: { type: 'times_per_week', times: 3 },
        }),
      );
    });
  });

  it('submits daily when Specific days keeps all seven selected', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HabitForm submitLabel="Create habit" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/habit name/i), {
      target: { value: 'Water' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create habit/i }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Water',
          frequency: { type: 'daily' },
        }),
      );
    });
  });

  it('shows times control and hides day toggles in times_per_week mode', () => {
    render(<HabitForm submitLabel="Create habit" onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('radio', { name: /times per week/i }));
    expect(screen.getByRole('radio', { name: /^1$/ })).toBeTruthy();
    expect(screen.queryByLabelText('Repeat on days')).toBeNull();
  });
});
