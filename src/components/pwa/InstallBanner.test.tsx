import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallBanner } from './InstallBanner';

const dismissInstallBannerMock = vi.fn();
const triggerInstallPromptMock = vi.fn();

let engaged = true;
let dismissed = false;
let standalone = false;
let iosFlow = false;
let chromiumFlow = true;
let hasDeferredPrompt = false;

vi.mock('@/platform/install', () => ({
  isStandaloneDisplayMode: () => standalone,
  isEngaged: () => engaged,
  isDismissed: () => dismissed,
  shouldShowIosInstallFlow: () => iosFlow,
  shouldShowChromiumInstallFlow: () => chromiumFlow,
  getDeferredPrompt: () => (hasDeferredPrompt ? ({} as Event) : null),
  subscribeInstallPrompt: (cb: () => void) => {
    cb();
    return () => {};
  },
  dismissInstallBanner: (...args: unknown[]) => dismissInstallBannerMock(...args),
  triggerInstallPrompt: (...args: unknown[]) => triggerInstallPromptMock(...args),
}));

describe('InstallBanner', () => {
  beforeEach(() => {
    engaged = true;
    dismissed = false;
    standalone = false;
    iosFlow = false;
    chromiumFlow = true;
    hasDeferredPrompt = false;
    dismissInstallBannerMock.mockReset();
    triggerInstallPromptMock.mockReset();
    triggerInstallPromptMock.mockResolvedValue('dismissed');
  });

  afterEach(() => {
    cleanup();
  });

  it('is not visible when not engaged', () => {
    engaged = false;
    render(<InstallBanner />);
    expect(screen.queryByRole('region', { name: 'Instalar aplicación' })).toBeNull();
  });

  it('shows Spanish headline when engaged and eligible', () => {
    render(<InstallBanner />);
    expect(screen.getByText('Instala para usar sin conexión')).toBeTruthy();
    expect(
      screen.getByText('Accede más rápido desde tu pantalla de inicio.'),
    ).toBeTruthy();
  });

  it('calls dismissInstallBanner when Ahora no is clicked', () => {
    render(<InstallBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
    expect(dismissInstallBannerMock).toHaveBeenCalledWith(7);
  });

  it('opens iOS modal on Instalar app tap for iOS flow', () => {
    iosFlow = true;
    chromiumFlow = false;
    render(<InstallBanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
    expect(
      screen.getByRole('dialog', { name: 'Instalar en la pantalla de inicio' }),
    ).toBeTruthy();
  });

  it('shows Chromium fallback when no deferred prompt', () => {
    hasDeferredPrompt = false;
    render(<InstallBanner />);

    expect(
      screen.getByText(/Abre el menú del navegador/),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Instalar app' })).toBeNull();
  });

  it('shows Instalar button when Chromium has deferred prompt', () => {
    hasDeferredPrompt = true;
    render(<InstallBanner />);

    expect(screen.getByRole('button', { name: 'Instalar app' })).toBeTruthy();
    expect(screen.queryByText(/Abre el menú del navegador/)).toBeNull();
  });
});
