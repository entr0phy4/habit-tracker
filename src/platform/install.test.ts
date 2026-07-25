import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dismissInstallBanner,
  isDismissed,
  isEngaged,
  isIosSafari,
  isStandaloneDisplayMode,
  markFirstCheckIn,
  recordSessionVisit,
  shouldShowIosInstallFlow,
} from './install';

function setMatchMedia(matchesByQuery: Record<string, boolean>) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: matchesByQuery[query] ?? false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe('install platform module', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setMatchMedia({});
    Object.defineProperty(navigator, 'standalone', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      writable: true,
    });
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'Win32',
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isStandaloneDisplayMode is true when display-mode standalone matches', () => {
    setMatchMedia({ '(display-mode: standalone)': true });
    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it('isStandaloneDisplayMode is true when navigator.standalone is true', () => {
    Object.defineProperty(navigator, 'standalone', {
      configurable: true,
      value: true,
    });
    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it('isEngaged is false on first visit and true on second', () => {
    recordSessionVisit();
    expect(isEngaged()).toBe(false);

    sessionStorage.clear();
    recordSessionVisit();
    expect(isEngaged()).toBe(true);
  });

  it('isEngaged is true after markFirstCheckIn on first visit', () => {
    recordSessionVisit();
    expect(isEngaged()).toBe(false);

    markFirstCheckIn();
    expect(isEngaged()).toBe(true);
  });

  it('isDismissed respects 7-day snooze', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T12:00:00Z'));

    dismissInstallBanner(7);
    expect(isDismissed()).toBe(true);

    vi.setSystemTime(new Date('2026-08-01T12:00:00Z'));
    expect(isDismissed()).toBe(false);
  });

  it('shouldShowIosInstallFlow is true on iOS when not standalone', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    Object.defineProperty(navigator, 'standalone', {
      configurable: true,
      value: false,
    });

    expect(isIosSafari()).toBe(true);
    expect(shouldShowIosInstallFlow()).toBe(true);
  });

  it('shouldShowIosInstallFlow is false when standalone', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    setMatchMedia({ '(display-mode: standalone)': true });

    expect(shouldShowIosInstallFlow()).toBe(false);
  });

  it('recordSessionVisit increments only once per session', () => {
    recordSessionVisit();
    recordSessionVisit();
    recordSessionVisit();

    expect(localStorage.getItem('ht_pwa_visit_count')).toBe('1');
  });
});
