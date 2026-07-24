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

  it('renders large integers without abbreviation', () => {
    render(<StatCards current={1234} longest={5678} rate={100} />);

    expect(screen.getByText('1234')).toBeTruthy();
    expect(screen.getByText('5678')).toBeTruthy();
    expect(screen.queryByText(/1\.2K|5\.7K|1K|5K/i)).toBeNull();
  });
});
