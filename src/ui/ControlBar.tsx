import React from 'react';
import { State, stepIndex, serialInput, toBinaryString } from '../core/johnson';

interface ControlBarProps {
  state: State;
  running: boolean;
  hz: number;
  ringMode?: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onHzChange: (hz: number) => void;
  onToggleRingMode?: () => void;
  onInjectInvalid?: () => void;
  onOpenHelp: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  state,
  running,
  hz,
  ringMode = false,
  onTogglePlay,
  onStep,
  onReset,
  onHzChange,
  onToggleRingMode,
  onInjectInvalid,
  onOpenHelp,
}) => {
  const currentStep = stepIndex(state);
  const nextInput = ringMode ? (state >> 7) & 1 : serialInput(state);
  const binary = toBinaryString(state);

  const fOut = (hz / 16).toFixed(3);

  const stepText =
    currentStep !== null
      ? `PASO ${String(currentStep).padStart(2, '0')} / 16`
      : 'ESTADO INVÁLIDO (SUBCICLO)';

  return (
    <div className="control-bar">
      <div className="control-actions">
        <button
          type="button"
          className={`btn-ctrl ${running ? 'btn-active' : ''}`}
          onClick={onTogglePlay}
          aria-label={
            running
              ? 'Pausar simulación (Espacio)'
              : 'Iniciar simulación (Espacio)'
          }
        >
          {running ? 'PAUSA' : 'PLAY'}
        </button>

        <button
          type="button"
          className="btn-ctrl"
          onClick={onStep}
          disabled={running}
          aria-label="Avanzar un flanco de reloj (Flecha derecha)"
        >
          PASO (→)
        </button>

        <button
          type="button"
          className="btn-ctrl btn-reset"
          onClick={onReset}
          aria-label="Reiniciar contador (R)"
        >
          RESET (R)
        </button>

        <div className="speed-control">
          <label htmlFor="hz-slider" className="label-datasheet">
            RELOJ:
          </label>
          <input
            id="hz-slider"
            type="range"
            min="0.25"
            max="8"
            step="0.25"
            value={hz}
            onChange={(e) => onHzChange(parseFloat(e.target.value))}
            aria-label="Frecuencia de simulación en Hertz"
          />
          <span className="hz-value mono">{hz.toFixed(2)} Hz</span>
        </div>

        {onToggleRingMode && (
          <button
            type="button"
            className={`btn-ctrl ${ringMode ? 'btn-ring-active' : ''}`}
            onClick={onToggleRingMode}
            title="Alterna entre Johnson (!Q7) y Anillo (Q7 directo)"
            aria-pressed={ringMode}
          >
            {ringMode ? 'MODO: ANILLO (SIN NOT)' : 'MODO: JOHNSON (CON NOT)'}
          </button>
        )}

        {onInjectInvalid && (
          <button
            type="button"
            className="btn-ctrl"
            onClick={onInjectInvalid}
            title="Forzar estado espurio 01010101 (dec 85) para explorar ciclos inválidos"
          >
            INVÁLIDO (85)
          </button>
        )}

        <button
          type="button"
          className="btn-ctrl btn-help"
          onClick={onOpenHelp}
          aria-label="Ayuda de atajos de teclado (?)"
        >
          ?
        </button>
      </div>

      <div className="telemetry-bar mono">
        <div className="telemetry-chip">
          <span className="chip-key">CICLO</span>
          <span className="chip-val">{stepText}</span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-key">Q7..Q0</span>
          <span className="chip-val highlight">{binary}</span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-key">DEC</span>
          <span className="chip-val">{String(state).padStart(3, ' ')}</span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-key">ENTRADA</span>
          <span className="chip-val">
            {ringMode ? `Q7 → ${nextInput}` : `NOT Q7 → ${nextInput}`}
          </span>
        </div>
        <div className="telemetry-chip">
          <span className="chip-key">DIVISOR Q7 (f_out)</span>
          <span className="chip-val highlight">{fOut} Hz (f_clk / 16)</span>
        </div>
      </div>
    </div>
  );
};
