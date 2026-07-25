import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';

Dexie.dependencies.indexedDB = indexedDB;

if (typeof globalThis.CSS === 'undefined') {
  Object.assign(globalThis, {
    CSS: { supports: () => true },
  });
} else if (!globalThis.CSS.supports) {
  globalThis.CSS.supports = () => true;
}

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * Override matchMedia matches in tests:
 * setMatchMedia({ '(display-mode: standalone)': true })
 */
export function setMatchMedia(matchesByQuery: Record<string, boolean>) {
  window.matchMedia = (query: string) => ({
    matches: matchesByQuery[query] ?? false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * Dispatch a synthetic beforeinstallprompt event for install prompt tests.
 */
export function dispatchBeforeInstallPrompt(
  promptImpl: () => Promise<void> = async () => {},
) {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  };
  event.prompt = promptImpl;
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
  window.dispatchEvent(event);
}
