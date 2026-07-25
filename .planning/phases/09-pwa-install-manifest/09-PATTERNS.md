# Phase 9: PWA Install & Manifest - Pattern Map

**Mapped:** 2026-07-25
**Files analyzed:** 12
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `public/manifest.webmanifest` | config | transform | `src/index.css` + `index.html` | role-match |
| `public/icons/*` | config | file-I/O | `public/favicon.svg` | exact |
| `index.html` | config | transform | `index.html` (existing) | exact |
| `src/platform/install.ts` | utility | event-driven | `src/domain/schedule.ts` | role-match |
| `src/components/pwa/InstallBanner.tsx` | component | event-driven | `src/components/habits/FloatingAddButton.tsx` | exact |
| `src/components/pwa/IosInstallModal.tsx` | component | request-response | `src/components/habits/ConfirmDialog.tsx` | exact |
| `src/pages/SettingsPage.tsx` | component | request-response | `src/pages/SettingsPage.tsx` (existing sections) | exact |
| `src/App.tsx` | provider | event-driven | `src/App.tsx` + `src/components/layout/MainLayout.tsx` | exact |
| `src/platform/install.test.ts` | test | transform | `src/domain/streak.test.ts` + `src/test/setup.ts` | role-match |
| `src/platform/manifest.test.ts` | test | transform | `src/domain/backupSchema.test.ts` | role-match |
| `src/components/pwa/InstallBanner.test.tsx` | test | event-driven | `src/components/habits/HabitRow.test.tsx` | exact |
| `src/pages/SettingsPage.test.tsx` | test | request-response | `src/pages/SettingsPage.test.tsx` (extend) | exact |

## Pattern Assignments

### `public/manifest.webmanifest` (config, transform)

**Analog:** `src/index.css` (theme tokens) + `index.html` (app metadata)

**Color tokens** (lines 3-14 of `src/index.css`):

```css
@theme {
  --color-background: #0d1117;
  --color-card: #161b22;
  --color-border: #30363d;
  --color-muted: #21262d;
  --color-muted-foreground: #8b949e;
  --color-foreground: #e6edf3;
  --color-primary: #3fb950;
  --color-primary-foreground: #0d1117;
  --color-destructive: #f85149;
  --color-ring: #3fb950;
}
```

**Manifest field mapping:**
- `theme_color` / `background_color` → `#0d1117` (`--color-background`)
- `name` / `short_name` → `"Habit Tracker"` (matches `index.html` `<title>`)
- `display` → `"standalone"`
- `start_url` / `scope` → `"/"`
- Icons → `/icons/icon-192.png`, `/icons/icon-512.png`, separate `maskable-*` entries (not combined `any maskable`)

**Static asset convention:** Vite serves `public/` as-is (no import). Only `public/favicon.svg` exists today — manifest is the first JSON static asset in `public/`.

---

### `public/icons/*` (config, file-I/O)

**Analog:** `public/favicon.svg`

**Brand colors** (lines 1-4):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#3fb950"/>
  <path d="M10 16.5l4 4 8-9" stroke="#0d1117" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Copy from favicon:**
- Background/accent: `#0d1117` (stroke/dark) and `#3fb950` (primary green)
- Rounded rect: `rx="8"` on 32×32 → ~25% corner radius; maskable PNGs use `#0d1117` opaque background with flame in central 80% safe zone
- Phase 9 departs from green-check motif (D-01) but keeps palette and rounded-corner shape (D-03)

**File naming (from RESEARCH):** `icon-192.png`, `icon-512.png`, `maskable-192.png`, `maskable-512.png`, `apple-touch-icon.png` (180×180), optional `icon-source.svg` for design source.

---

### `index.html` (config, transform)

**Analog:** `index.html` (existing)

**Current head pattern** (lines 1-8):

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Habit Tracker</title>
  </head>
```

**Additions to mirror (append inside `<head>`, before `</head>`):**
- `<link rel="manifest" href="/manifest.webmanifest" />`
- `<meta name="theme-color" content="#0d1117" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
- `<meta name="apple-mobile-web-app-title" content="Habit Tracker" />`
- `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />`

**Conventions:** Keep `lang="en"` and `class="dark"` on `<html>`; do not add SW registration script in Phase 9.

---

### `src/platform/install.ts` (utility, event-driven)

**Analog:** `src/domain/schedule.ts` (pure exported functions, no React) + module-init side effects per RESEARCH

**Imports / export style** (from `src/domain/schedule.ts`, lines 1-3):

```typescript
import { countCompletionsInCalendarWeek } from './dates';
import type { Frequency } from './types';

/**
 * Weekday-only due check. For times_per_week always returns false —
 * callers that need all three frequencies must use isHabitDueOnDate.
 */
export function isDueOnDate(frequency: Frequency, dateStr: string): boolean {
```

**Apply to `install.ts`:**
- New `src/platform/` tier (first file); mirror `domain/` style: named exports, JSDoc on non-obvious helpers, no default export
- Namespaced `localStorage` keys: `ht_pwa_visit_count`, `ht_pwa_dismissed_until`, `ht_pwa_has_checked_in`
- Module-scope `window` listeners for `beforeinstallprompt` / `appinstalled` (not `useEffect`-only)
- `subscribeInstallPrompt` + `getDeferredPrompt` + `triggerInstallPrompt` singleton
- Pure detection: `isStandaloneDisplayMode()`, `isIosSafari()`, `shouldShowIosInstallFlow()`, `shouldShowChromiumInstallFlow()`
- Engagement: `recordSessionVisit()`, `markFirstCheckIn()`, `isEngaged()`, `dismissInstallBanner()`, `isDismissed()`

**Optional hook-up analog** (`src/hooks/useToggleCompletion.ts`, lines 5-9) — call `markFirstCheckIn()` after first successful toggle:

```typescript
export function useToggleCompletion() {
  const toggle = useCallback(async (habitId: string, date?: string) => {
    const targetDate = date ?? getLocalDateString(new Date());
    await completionRepository.toggle(habitId, targetDate);
  }, []);
```

**Note:** No `localStorage` usage exists elsewhere in `src/` — this module establishes the pattern. Do not use Dexie for dismiss/visit flags.

---

### `src/components/pwa/InstallBanner.tsx` (component, event-driven)

**Analog:** `src/components/habits/FloatingAddButton.tsx`

**Imports pattern** (lines 1-3):

```typescript
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
```

**Fixed positioning + z-index** (lines 9-17):

```typescript
    <Button
      type="button"
      size="icon"
      aria-label="Add habit"
      className="fixed bottom-[4.5rem] right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
      onClick={() => navigate('/habits/new')}
    >
```

**Apply to InstallBanner:**
- `z-50` matches FloatingAddButton; tab bar is `z-40` (`BottomTabBar.tsx` line 8)
- Banner: `fixed inset-x-0 z-50 mx-auto max-w-[480px]` with `bottom: calc(3.5rem + env(safe-area-inset-bottom))` — sits above `h-14` tab bar (`3.5rem`)
- Use `Button` with `min-h-11` (Settings pattern) for "Instalar" / "Ahora no"
- Spanish copy (D-08): e.g. "Instala para usar sin conexión y acceder más rápido"
- `role="region"` + `aria-label="Instalar aplicación"`
- Gate visibility: `!isStandaloneDisplayMode() && isEngaged() && !isDismissed()` plus platform branch (iOS vs Chromium)
- iOS tap → open `IosInstallModal`; Chromium tap → `triggerInstallPrompt()`
- Subscribe to install prompt via `useSyncExternalStore(subscribeInstallPrompt, ...)` per RESEARCH

**Tab bar reference** (`src/components/layout/BottomTabBar.tsx`, lines 7-12):

```typescript
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
      role="tablist"
    >
```

---

### `src/components/pwa/IosInstallModal.tsx` (component, request-response)

**Analog:** `src/components/habits/ConfirmDialog.tsx`

**Imports pattern** (lines 1-2):

```typescript
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
```

**Modal overlay pattern** (lines 29-64):

```typescript
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <div
          id="confirm-dialog-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          {description}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
```

**Apply to IosInstallModal:**
- Reuse same `z-50` overlay, `bg-card`, `border-border`, `max-w-sm`, backdrop `bg-black/60`
- Props: `open`, `onClose` (single dismiss button — no destructive confirm)
- Numbered steps with `lucide-react` icons (`Share`, `PlusSquare`, `Check`)
- Spanish step copy (D-12) + footer mentioning future reminders (D-13) — static strings only, no `dangerouslySetInnerHTML`
- Consider `role="dialog"` instead of `alertdialog` (informational, not destructive confirm)
- Shared by `InstallBanner` and `SettingsPage` (D-14, D-18)

---

### `src/pages/SettingsPage.tsx` (component, request-response)

**Analog:** `src/pages/SettingsPage.tsx` (existing backup section)

**Imports pattern** (lines 1-15):

```typescript
import { useRef, useState, type ChangeEvent } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/habits/ConfirmDialog';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { parseBackupJson } from '@/domain/backupSchema';
import type { BackupPayload } from '@/domain/types';
import {
  buildBackupFilename,
  downloadBackupJson,
  exportBackup,
  importBackup,
} from '@/infrastructure/backupService';
```

**Section layout pattern** (lines 108-134):

```typescript
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-muted-foreground">
          Copia de seguridad
        </h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Exporta o restaura todos tus hábitos y completados.
        </p>

        <Button
          type="button"
          className="min-h-11 w-full"
          onClick={() => {
            void handleExport();
          }}
        >
          Exportar datos
        </Button>

        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          onClick={handleImportClick}
        >
          Importar backup
        </Button>
```

**Apply for "Instalar app" section (D-15–D-18):**
- Insert new `<section>` **above** "Copia de seguridad" with same structure: `h2` + `p` + `Button(s)`
- Heading: `Instalar app`; Spanish description + platform-specific CTA
- Wrap entire section: `{!isStandaloneDisplayMode() && (...)}` (D-16)
- Android: primary `Instalar` button calling `triggerInstallPrompt()`; fallback inline text for ⋮ menu
- iOS: `Cómo instalar` opens shared `IosInstallModal`
- Add `iosModalOpen` state + `<IosInstallModal open={...} onClose={...} />` alongside existing `ConfirmDialog`
- Import from `@/platform/install` and `@/components/pwa/IosInstallModal`

**AppShell wrapper** (lines 98-106):

```typescript
    <AppShell title="Ajustes">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Volver
      </Link>
```

---

### `src/App.tsx` (provider, event-driven)

**Analog:** `src/App.tsx` (Toaster mount) + `src/components/layout/MainLayout.tsx` (global chrome)

**Current App structure** (lines 1-28):

```typescript
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { HabitEditPage } from '@/pages/HabitEditPage';
import { HabitHistoryPage } from '@/pages/HabitHistoryPage';
import { HabitNewPage } from '@/pages/HabitNewPage';
import { ManageHabitsPage } from '@/pages/ManageHabitsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TodayPage } from '@/pages/TodayPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
        </Route>
        <Route path="/habits/new" element={<HabitNewPage />} />
        <Route path="/habits/manage" element={<ManageHabitsPage />} />
        <Route path="/habits/:id/edit" element={<HabitEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
```

**Apply:**
- Import `InstallBanner` from `@/components/pwa/InstallBanner`
- Import `recordSessionVisit` from `@/platform/install`; call once on mount via `useEffect` in `App` or thin `AppInit` child
- Mount `<InstallBanner />` as sibling to `<Toaster />` inside `BrowserRouter` (banner only on tabbed routes — either always mount or gate inside banner when path is `/` or `/dashboard`)
- Side-effect import: `import '@/platform/install'` at top of `App.tsx` or `main.tsx` to register `beforeinstallprompt` before React hydrates
- Optional: pass `offset` to `<Toaster>` when banner visible (Sonner supports via `src/components/ui/sonner.tsx` spread props, line 19)

**MainLayout pattern** (`src/components/layout/MainLayout.tsx`, lines 4-10):

```typescript
export function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  );
}
```

Alternative: mount `InstallBanner` inside `MainLayout` next to `BottomTabBar` so it only appears on tabbed pages — cleaner than global App mount.

---

### `src/platform/install.test.ts` (test, transform)

**Analog:** `src/domain/streak.test.ts` + `src/test/setup.ts`

**Unit test structure** (from `src/domain/streak.test.ts`, lines 1-4):

```typescript
import { describe, expect, it } from 'vitest';
import { calculateCurrentStreak, calculateLongestStreak } from './streak';
```

**matchMedia mock** (from `src/test/setup.ts`, lines 15-26):

```typescript
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
```

**Apply:**
- Extend `setup.ts` with configurable `matchMedia` helper and `localStorage` reset in `beforeEach`
- Test `isStandaloneDisplayMode()` by mocking `matchMedia('(display-mode: standalone)').matches`
- Test `isEngaged()` visit count: 0 → false, 2 → true; `markFirstCheckIn()` path
- Test `isDismissed()` with `Date.now()` + fake timers (`vi.useFakeTimers()`)
- Test `shouldShowIosInstallFlow()` with mocked `navigator.userAgent` and `navigator.standalone`
- Mock `beforeinstallprompt` via `window.dispatchEvent(new Event('beforeinstallprompt'))` with `preventDefault` stub
- Use `beforeEach` to `localStorage.clear()` — first localStorage tests in project

---

### `src/platform/manifest.test.ts` (test, transform)

**Analog:** `src/domain/backupSchema.test.ts`

**JSON validation test pattern** (lines 28-32):

```typescript
describe('parseBackupJson', () => {
  it('accepts a valid minimal payload with empty arrays', () => {
    const result = parseBackupJson(JSON.stringify(validEmpty));
    expect(result).toEqual({ ok: true, data: validEmpty });
  });
```

**Apply:**
- Read `public/manifest.webmanifest` with `fs.readFileSync` + `JSON.parse` (no existing fs test in repo — acceptable for static asset gate)
- Assert required fields: `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`
- Assert `display === 'standalone'`
- Assert `theme_color` / `background_color === '#0d1117'`
- Assert `icons` array has 192 and 512 entries with separate `purpose: 'any'` and `purpose: 'maskable'`
- Assert icon `src` paths start with `/icons/`

---

### `src/components/pwa/InstallBanner.test.tsx` (test, event-driven)

**Analog:** `src/components/habits/HabitRow.test.tsx`

**Test setup pattern** (lines 1-15):

```typescript
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '@/domain/types';
import { HabitRow } from './HabitRow';

const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});
```

**Apply:**
- `vi.mock('@/platform/install', ...)` to control `isEngaged`, `isDismissed`, `isStandaloneDisplayMode`, `shouldShowIosInstallFlow`, `triggerInstallPrompt`
- Assert banner hidden when not engaged / dismissed / standalone
- Assert Spanish copy visible when engaged
- `fireEvent.click` on "Ahora no" → verify `dismissInstallBanner` called
- `fireEvent.click` on "Instalar" → verify `triggerInstallPrompt` or iOS modal open callback
- `afterEach(() => cleanup())`

---

### `src/pages/SettingsPage.test.tsx` (test, request-response)

**Analog:** `src/pages/SettingsPage.test.tsx` (extend existing file)

**Mock pattern** (lines 17-41):

```typescript
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock('@/infrastructure/backupService', () => ({
  exportBackup: (...args: unknown[]) => exportBackupMock(...args),
  ...
}));
```

**Spanish chrome assertion** (lines 120-128):

```typescript
  it('renders Spanish settings chrome', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeTruthy();
    ...
    expect(screen.getByText('Copia de seguridad')).toBeTruthy();
```

**Apply (new tests in same file):**
- Add `vi.mock('@/platform/install', ...)` with `isStandaloneDisplayMode` toggle
- When standalone: `expect(screen.queryByText('Instalar app')).toBeNull()`
- When not standalone: expect section heading "Instalar app" and button "Instalar" or "Cómo instalar"
- iOS mock: click "Cómo instalar" → modal with numbered steps visible
- Keep existing backup tests unchanged; install section appears **above** "Copia de seguridad" in DOM order

---

## Shared Patterns

### Spanish UI Copy
**Source:** `src/pages/SettingsPage.tsx`
**Apply to:** `InstallBanner`, `IosInstallModal`, Settings install section

```typescript
<h2 className="text-xs font-semibold text-muted-foreground">
  Copia de seguridad
</h2>
<p className="mb-2 text-sm text-muted-foreground">
  Exporta o restaura todos tus hábitos y completados.
</p>
```

Use same `text-xs font-semibold text-muted-foreground` for section headings and `text-sm text-muted-foreground` for descriptions.

### Touch Targets (min-h-11)
**Source:** `src/pages/SettingsPage.tsx` (lines 116-118)
**Apply to:** All install CTAs

```typescript
<Button
  type="button"
  className="min-h-11 w-full"
  onClick={() => { void handleExport(); }}
>
```

### Dark Theme Colors
**Source:** `src/index.css`
**Apply to:** manifest, `theme-color` meta, icon backgrounds

- Background: `#0d1117`
- Primary/accent: `#3fb950`
- Card surface: `#161b22`
- Border: `#30363d`

### Fixed Bottom Layer Stack
**Source:** `BottomTabBar.tsx` + `FloatingAddButton.tsx` + `App.tsx`
**Apply to:** `InstallBanner` z-index and positioning

| Layer | z-index | File |
|-------|---------|------|
| Tab bar | `z-40` | `BottomTabBar.tsx` |
| FAB / Install banner | `z-50` | `FloatingAddButton.tsx` |
| Modal overlay | `z-50` | `ConfirmDialog.tsx` |
| Toasts | portal default | `App.tsx` `<Toaster position="bottom-center" />` |

### Modal Overlay
**Source:** `src/components/habits/ConfirmDialog.tsx`
**Apply to:** `IosInstallModal`

```typescript
className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
// inner: w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg
```

### Path Alias Imports
**Source:** project-wide (`@/` → `src/`)
**Apply to:** all new TS/TSX files

```typescript
import { Button } from '@/components/ui/button';
import { recordSessionVisit } from '@/platform/install';
```

### Vitest + Testing Library
**Source:** `vite.config.ts` + `src/test/setup.ts`
**Apply to:** all new test files

```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
},
```

### Page Content Padding (banner clearance)
**Source:** `src/pages/TodayPage.tsx` (line 77)
**Apply to:** tabbed pages when banner visible

```typescript
<ul className="flex flex-col gap-2 pb-28">
```

`pb-28` already clears FAB + tab bar; may need `pb-36` or dynamic padding when install banner is visible.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All planned files have analogs |

**Notes for planner:**
- `src/platform/` is a new directory — no existing `platform/` tier; closest is `src/domain/` for pure logic
- `localStorage` persistence is new to the codebase — no prior key-naming convention beyond RESEARCH's `ht_pwa_*` prefix
- `manifest.test.ts` fs-read pattern is new — no prior static-asset test; follow `backupSchema.test.ts` assertion style
- RESEARCH mentions optional `SettingsInstallSection.tsx` — can be inline in `SettingsPage` following existing section pattern (preferred for minimal scope)

## Metadata

**Analog search scope:** `public/`, `index.html`, `src/App.tsx`, `src/pages/`, `src/components/`, `src/domain/`, `src/hooks/`, `src/test/`, `src/index.css`, `vite.config.ts`
**Files scanned:** 84 TypeScript/TSX/HTML files
**Pattern extraction date:** 2026-07-25
