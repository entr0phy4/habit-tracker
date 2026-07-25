import { useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/habits/ConfirmDialog';
import { IosInstallModal } from '@/components/pwa/IosInstallModal';
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
import {
  getDeferredPrompt,
  isStandaloneDisplayMode,
  shouldShowChromiumInstallFlow,
  shouldShowIosInstallFlow,
  subscribeInstallPrompt,
  triggerInstallPrompt,
} from '@/platform/install';

const CHROMIUM_FALLBACK =
  'Abre el menú del navegador (⋮) y selecciona «Instalar app» o «Añadir a la pantalla de inicio».';

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingPayload, setPendingPayload] = useState<BackupPayload | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const hasDeferredPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    () => getDeferredPrompt() !== null,
    () => false,
  );

  async function handleExport() {
    const payload = await exportBackup();
    downloadBackupJson(payload, buildBackupFilename());
    toast.success('Backup exportado');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const text = await readFileAsText(file);
    const result = parseBackupJson(text);

    if (!result.ok) {
      if (result.error === 'unsupported_version') {
        toast.error('Versión de backup no compatible');
      } else {
        toast.error('Archivo no válido');
      }
      return;
    }

    setPendingPayload(result.data);
    setDialogOpen(true);
  }

  async function handleConfirmImport() {
    if (!pendingPayload) {
      return;
    }

    try {
      await importBackup(pendingPayload);
      setDialogOpen(false);
      setPendingPayload(null);
      toast.success('Backup restaurado');
      navigate('/');
    } catch {
      setDialogOpen(false);
      setPendingPayload(null);
      toast.error('No se pudo importar. Inténtalo de nuevo.');
    }
  }

  function handleCancelImport() {
    setDialogOpen(false);
    setPendingPayload(null);
  }

  const habitCount = pendingPayload?.habits.length ?? 0;
  const completionCount = pendingPayload?.completions.length ?? 0;

  return (
    <AppShell title="Ajustes">
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Volver
      </Link>

      {!isStandaloneDisplayMode() && (
        <section className="mb-8 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-muted-foreground">
            Instalar app
          </h2>
          <p className="mb-2 text-sm text-muted-foreground">
            Instala la app para acceder sin conexión y más rápido.
          </p>

          {shouldShowIosInstallFlow() && (
            <Button
              type="button"
              className="min-h-11 w-full"
              onClick={() => setIosModalOpen(true)}
            >
              Cómo instalar
            </Button>
          )}

          {shouldShowChromiumInstallFlow() && hasDeferredPrompt && (
            <Button
              type="button"
              className="min-h-11 w-full"
              onClick={() => {
                void triggerInstallPrompt();
              }}
            >
              Instalar
            </Button>
          )}

          {shouldShowChromiumInstallFlow() && !hasDeferredPrompt && (
            <p className="text-sm text-muted-foreground">{CHROMIUM_FALLBACK}</p>
          )}
        </section>
      )}

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

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            void handleFileChange(event);
          }}
        />
      </section>

      <ConfirmDialog
        open={dialogOpen}
        title="¿Reemplazar todos los datos?"
        description={`Se importarán ${habitCount} hábitos y ${completionCount} completados. Los datos actuales se eliminarán. Esta acción no se puede deshacer.`}
        confirmLabel="Reemplazar"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          void handleConfirmImport();
        }}
        onCancel={handleCancelImport}
      />

      <IosInstallModal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
      />
    </AppShell>
  );
}
