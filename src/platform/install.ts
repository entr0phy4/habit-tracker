export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const KEYS = {
  visitCount: 'ht_pwa_visit_count',
  dismissedUntil: 'ht_pwa_dismissed_until',
  hasCheckedIn: 'ht_pwa_has_checked_in',
  sessionRecorded: 'ht_pwa_session_recorded',
} as const;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener());
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((listener) => listener());
  });
}

export function subscribeInstallPrompt(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export async function triggerInstallPrompt(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  if (!deferredPrompt) {
    return 'unavailable';
  }

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((listener) => listener());
  return outcome;
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return isIOS;
}

export function shouldShowIosInstallFlow(): boolean {
  return isIosSafari() && !isStandaloneDisplayMode();
}

export function shouldShowChromiumInstallFlow(): boolean {
  return !isIosSafari() && !isStandaloneDisplayMode();
}

export function recordSessionVisit(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (sessionStorage.getItem(KEYS.sessionRecorded) === '1') {
    return;
  }

  sessionStorage.setItem(KEYS.sessionRecorded, '1');
  const count = Number(localStorage.getItem(KEYS.visitCount) ?? '0') + 1;
  localStorage.setItem(KEYS.visitCount, String(count));
}

export function markFirstCheckIn(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(KEYS.hasCheckedIn, '1');
}

export function isEngaged(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const visits = Number(localStorage.getItem(KEYS.visitCount) ?? '0');
  const checkedIn = localStorage.getItem(KEYS.hasCheckedIn) === '1';
  return visits >= 2 || checkedIn;
}

export function dismissInstallBanner(days = 7): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(KEYS.dismissedUntil, String(until));
}

export function isDismissed(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const until = Number(localStorage.getItem(KEYS.dismissedUntil) ?? '0');
  return until > Date.now();
}
