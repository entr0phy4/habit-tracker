import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { BottomTabBar } from './BottomTabBar';

function renderTabBar(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomTabBar />
    </MemoryRouter>,
  );
}

describe('BottomTabBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Hoy and Panel labels', () => {
    renderTabBar();

    expect(screen.getByText('Hoy')).toBeTruthy();
    expect(screen.getByText('Panel')).toBeTruthy();
  });

  it('exposes primary navigation aria label', () => {
    renderTabBar();

    expect(screen.getByLabelText('Navegación principal')).toBeTruthy();
  });

  it('links Hoy to home and Panel to dashboard', () => {
    renderTabBar();

    expect(screen.getByRole('tab', { name: 'Hoy' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('tab', { name: 'Panel' }).getAttribute('href')).toBe(
      '/dashboard',
    );
  });
});
