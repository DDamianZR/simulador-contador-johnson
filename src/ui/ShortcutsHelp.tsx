import React from 'react';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="shortcuts-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <span className="label-datasheet">REFERENCIA DE TECLADO</span>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar ayuda"
          >
            ✕
          </button>
        </div>
        <table className="shortcuts-table mono">
          <tbody>
            <tr>
              <td>
                <kbd>Espacio</kbd>
              </td>
              <td>Iniciar / Pausar simulación</td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd>
              </td>
              <td>Avanzar un flanco de reloj (en pausa)</td>
            </tr>
            <tr>
              <td>
                <kbd>R</kbd>
              </td>
              <td>Reiniciar contador a 0 (equiv. botón D11 / 'r')</td>
            </tr>
            <tr>
              <td>
                <kbd>+</kbd> / <kbd>-</kbd>
              </td>
              <td>Aumentar / disminuir frecuencia (Hz)</td>
            </tr>
            <tr>
              <td>
                <kbd>T</kbd>
              </td>
              <td>Alternar tema Claro / Oscuro</td>
            </tr>
            <tr>
              <td>
                <kbd>1</kbd> – <kbd>4</kbd>
              </td>
              <td>Cambiar pestaña de vista activa</td>
            </tr>
            <tr>
              <td>
                <kbd>?</kbd>
              </td>
              <td>Abrir / cerrar este panel de ayuda</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
