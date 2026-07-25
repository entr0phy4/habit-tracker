import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackupPayload } from '@/domain/types';
import { SettingsPage } from './SettingsPage';

const navigateMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

const exportBackupMock = vi.fn();
const downloadBackupJsonMock = vi.fn();
const buildBackupFilenameMock = vi.fn();
const importBackupMock = vi.fn();
const parseBackupJsonMock = vi.fn();

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
  downloadBackupJson: (...args: unknown[]) => downloadBackupJsonMock(...args),
  buildBackupFilename: (...args: unknown[]) => buildBackupFilenameMock(...args),
  importBackup: (...args: unknown[]) => importBackupMock(...args),
}));

vi.mock('@/domain/backupSchema', () => ({
  parseBackupJson: (...args: unknown[]) => parseBackupJsonMock(...args),
}));

let standaloneMode = false;
let iosInstallFlow = false;
let hasDeferredPrompt = false;

const triggerInstallPromptMock = vi.fn();

vi.mock('@/platform/install', () => ({
  isStandaloneDisplayMode: () => standaloneMode,
  shouldShowIosInstallFlow: () => iosInstallFlow,
  shouldShowChromiumInstallFlow: () => !iosInstallFlow,
  getDeferredPrompt: () => (hasDeferredPrompt ? ({} as Event) : null),
  subscribeInstallPrompt: (cb: () => void) => {
    cb();
    return () => {};
  },
  triggerInstallPrompt: (...args: unknown[]) => triggerInstallPromptMock(...args),
}));

const emptyPayload: BackupPayload = {
  version: 1,
  exportedAt: '2026-07-22T12:00:00.000Z',
  habits: [],
  completions: [],
};

const samplePayload: BackupPayload = {
  version: 1,
  exportedAt: '2026-07-22T12:00:00.000Z',
  habits: [
    {
      id: 'h1',
      name: 'Run',
      frequency: { type: 'daily' },
      color: '#3fb950',
      archived: false,
      createdAt: '2026-07-01T10:00:00.000Z',
    },
  ],
  completions: [{ habitId: 'h1', date: '2026-07-14' }],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <SettingsPage />
    </MemoryRouter>,
  );
}

async function uploadFile(content: string) {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File([content], 'backup.json', { type: 'application/json' });

  Object.defineProperty(input, 'files', {
    configurable: true,
    value: {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file;
      },
    },
  });

  fireEvent.change(input);
  await waitFor(() => {
    expect(parseBackupJsonMock).toHaveBeenCalled();
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    exportBackupMock.mockReset();
    downloadBackupJsonMock.mockReset();
    buildBackupFilenameMock.mockReset();
    importBackupMock.mockReset();
    parseBackupJsonMock.mockReset();
    triggerInstallPromptMock.mockReset();

    standaloneMode = false;
    iosInstallFlow = false;
    hasDeferredPrompt = false;

    exportBackupMock.mockResolvedValue(emptyPayload);
    buildBackupFilenameMock.mockReturnValue(
      'habit-tracker-backup-2026-07-22.json',
    );
    importBackupMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Spanish settings chrome', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Volver/i }).getAttribute('href')).toBe(
      '/',
    );
    expect(screen.getByText('Copia de seguridad')).toBeTruthy();
    expect(
      screen.getByText('Exporta o restaura todos tus hábitos y completados.'),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Exportar datos' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Importar backup' }),
    ).toBeTruthy();

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input.accept).toContain('.json');
    expect(input.accept).toContain('application/json');
    expect(input.className).toContain('hidden');
  });

  it('exports backup and shows success toast', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar datos' }));

    await waitFor(() => {
      expect(exportBackupMock).toHaveBeenCalledOnce();
      expect(downloadBackupJsonMock).toHaveBeenCalledWith(
        emptyPayload,
        'habit-tracker-backup-2026-07-22.json',
      );
      expect(toastSuccess).toHaveBeenCalledWith('Backup exportado');
    });
  });

  it('rejects invalid file without opening confirm dialog', async () => {
    parseBackupJsonMock.mockReturnValue({ ok: false, error: 'invalid' });
    renderPage();

    await uploadFile('{not json');

    expect(toastError).toHaveBeenCalledWith('Archivo no válido');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(importBackupMock).not.toHaveBeenCalled();
  });

  it('rejects unsupported version without opening confirm dialog', async () => {
    parseBackupJsonMock.mockReturnValue({
      ok: false,
      error: 'unsupported_version',
    });
    renderPage();

    await uploadFile('{"version":2}');

    expect(toastError).toHaveBeenCalledWith(
      'Versión de backup no compatible',
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('opens confirm dialog with counts for a valid backup', async () => {
    parseBackupJsonMock.mockReturnValue({ ok: true, data: samplePayload });
    renderPage();

    await uploadFile(JSON.stringify(samplePayload));

    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(
      screen.getByText('¿Reemplazar todos los datos?'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Se importarán 1 hábitos y 1 completados. Los datos actuales se eliminarán. Esta acción no se puede deshacer.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reemplazar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(importBackupMock).not.toHaveBeenCalled();
  });

  it('imports on confirm, toasts, and navigates home', async () => {
    parseBackupJsonMock.mockReturnValue({ ok: true, data: samplePayload });
    renderPage();

    await uploadFile(JSON.stringify(samplePayload));
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

    await waitFor(() => {
      expect(importBackupMock).toHaveBeenCalledWith(samplePayload);
      expect(toastSuccess).toHaveBeenCalledWith('Backup restaurado');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows error toast and does not navigate when import fails', async () => {
    parseBackupJsonMock.mockReturnValue({ ok: true, data: samplePayload });
    importBackupMock.mockRejectedValueOnce(new Error('dexie boom'));
    renderPage();

    await uploadFile(JSON.stringify(samplePayload));
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        'No se pudo importar. Inténtalo de nuevo.',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('cancels import without writing', async () => {
    parseBackupJsonMock.mockReturnValue({ ok: true, data: samplePayload });
    renderPage();

    await uploadFile(JSON.stringify(samplePayload));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(importBackupMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  describe('install section', () => {
    it('hides install section when standalone', () => {
      standaloneMode = true;
      renderPage();

      expect(screen.queryByText('Instalar app')).toBeNull();
    });

    it('shows install section above backup when not standalone', () => {
      renderPage();

      const installHeading = screen.getByText('Instalar app');
      const backupHeading = screen.getByText('Copia de seguridad');
      expect(
        installHeading.compareDocumentPosition(backupHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        screen.getByText(
          'Instala la app para acceder sin conexión y más rápido.',
        ),
      ).toBeTruthy();
    });

    it('shows Cómo instalar on iOS and opens modal with reminders intro', () => {
      iosInstallFlow = true;
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: 'Cómo instalar' }));

      expect(
        screen.getByText(
          'Para recibir recordatorios de hábitos, necesitas instalar la app en tu pantalla de inicio.',
        ),
      ).toBeTruthy();
    });

    it('shows Instalar button on Android with deferred prompt', () => {
      hasDeferredPrompt = true;
      renderPage();

      expect(screen.getByRole('button', { name: 'Instalar' })).toBeTruthy();
    });

    it('shows fallback instructions on Android without deferred prompt', () => {
      hasDeferredPrompt = false;
      renderPage();

      expect(
        screen.getByText(/Abre el menú del navegador/),
      ).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Instalar' })).toBeNull();
    });
  });
});
