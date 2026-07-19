import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';

Dexie.dependencies.indexedDB = indexedDB;

if (typeof globalThis.CSS === 'undefined') {
  globalThis.CSS = { supports: () => true } as CSS;
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
