import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StatCards } from './StatCards';

describe('StatCards', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders three stat labels and formatted rate', () => {
    render(<StatCards current={5} longest={12} rate={85} />);

    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.getByText('Longest')).toBeTruthy();
    expect(screen.getByText('Rate')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('85%')).toBeTruthy();
  });

  it('returns null while loading', () => {
    const { container } = render(
      <StatCards current={0} longest={0} rate={0} isLoading />,
    );

    expect(container.firstChild).toBeNull();
  });
});
