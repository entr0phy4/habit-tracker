import { useEffect } from 'react';
import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IosInstallModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  'Toca el botón Compartir',
  'Selecciona «Añadir a la pantalla de inicio»',
  'Toca «Añadir» para confirmar',
] as const;

export function IosInstallModal({ open, onClose }: IosInstallModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="ios-install-title"
        aria-describedby="ios-install-description"
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="ios-install-title" className="text-lg font-semibold">
          Instalar en la pantalla de inicio
        </h2>
        <p
          id="ios-install-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          Para recibir recordatorios de hábitos, necesitas instalar la app en tu
          pantalla de inicio.
        </p>

        <ol
          className="mt-4 flex list-none flex-col gap-4"
          aria-label="Pasos para instalar"
        >
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="font-semibold text-primary">{index + 1}.</span>
              <span>
                {index === 0 ? (
                  <>
                    {step}{' '}
                    <Share
                      className="inline h-5 w-5 text-primary"
                      aria-hidden
                    />
                  </>
                ) : (
                  step
                )}
              </span>
            </li>
          ))}
        </ol>

        <Button
          type="button"
          className="mt-6 min-h-11 w-full"
          onClick={onClose}
        >
          Entendido
        </Button>
      </div>
    </div>
  );
}
