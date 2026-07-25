import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
  dismissInstallBanner,
  getDeferredPrompt,
  isDismissed,
  isEngaged,
  isStandaloneDisplayMode,
  shouldShowChromiumInstallFlow,
  shouldShowIosInstallFlow,
  subscribeInstallPrompt,
  triggerInstallPrompt,
} from '@/platform/install';
import { IosInstallModal } from './IosInstallModal';

const CHROMIUM_FALLBACK =
  'Abre el menú del navegador (⋮) y selecciona «Instalar app» o «Añadir a la pantalla de inicio».';

export function InstallBanner() {
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const hasDeferredPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    () => getDeferredPrompt() !== null,
    () => false,
  );

  const visible =
    !isStandaloneDisplayMode() &&
    isEngaged() &&
    !isDismissed() &&
    (shouldShowIosInstallFlow() || shouldShowChromiumInstallFlow());

  if (!visible) {
    return (
      <IosInstallModal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
      />
    );
  }

  const isIos = shouldShowIosInstallFlow();
  const showChromiumInstallButton =
    shouldShowChromiumInstallFlow() && hasDeferredPrompt;
  const showChromiumFallback =
    shouldShowChromiumInstallFlow() && !hasDeferredPrompt;

  async function handleInstallClick() {
    if (isIos) {
      setIosModalOpen(true);
      return;
    }

    const outcome = await triggerInstallPrompt();
    if (outcome === 'accepted') {
      dismissInstallBanner(365);
    }
  }

  function handleDismiss() {
    dismissInstallBanner(7);
  }

  return (
    <>
      <aside
        className="fixed inset-x-0 z-50 mx-auto max-w-[480px] border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.25)]"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
        role="region"
        aria-label="Instalar aplicación"
      >
        <div className="flex items-start gap-3">
          <img
            src="/icons/icon-192.png"
            alt=""
            width={32}
            height={32}
            className="mt-0.5 h-8 w-8 shrink-0 rounded-md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Instala para usar sin conexión
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Accede más rápido desde tu pantalla de inicio.
            </p>

            {showChromiumFallback && (
              <p className="mt-2 text-sm text-muted-foreground">
                {CHROMIUM_FALLBACK}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {(isIos || showChromiumInstallButton) && (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => {
                    void handleInstallClick();
                  }}
                >
                  Instalar app
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-muted-foreground"
                onClick={handleDismiss}
              >
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <IosInstallModal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
      />
    </>
  );
}
