import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IosInstallModal } from './IosInstallModal';

describe('IosInstallModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders null when closed', () => {
    const { container } = render(
      <IosInstallModal open={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows Spanish copy and all three steps when open', () => {
    render(<IosInstallModal open onClose={vi.fn()} />);

    expect(
      screen.getByRole('dialog', { name: 'Instalar en la pantalla de inicio' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Para recibir recordatorios de hábitos, necesitas instalar la app en tu pantalla de inicio.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Toca el botón Compartir/)).toBeTruthy();
    expect(screen.getByText(/Selecciona «Añadir a la pantalla de inicio»/)).toBeTruthy();
    expect(screen.getByText(/Toca «Añadir» para confirmar/)).toBeTruthy();
  });

  it('includes Share icon in step 1', () => {
    const { container } = render(<IosInstallModal open onClose={vi.fn()} />);
    expect(container.querySelector('svg.lucide-share')).toBeTruthy();
  });

  it('calls onClose when Entendido is clicked', () => {
    const onClose = vi.fn();
    render(<IosInstallModal open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<IosInstallModal open onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
