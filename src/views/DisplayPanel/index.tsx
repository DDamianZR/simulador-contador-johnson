import React, { useState, useEffect } from 'react';
import { State } from '../../core/johnson';
import { splitDecimal } from '../../core/sevenSeg';
import { Digit7Seg } from './Digit7Seg';
import { StateTable } from './StateTable';

export interface DisplayPanelProps {
  state?: State;
  onJumpTo?: (stepIdx: number) => void;
}

export const DisplayPanel: React.FC<DisplayPanelProps> = ({
  state = 0,
  onJumpTo = () => {},
}) => {
  const [multiplexMode, setMultiplexMode] = useState(false);
  const [activeDigitIdx, setActiveDigitIdx] = useState<0 | 1 | 2>(0);

  const [c, d, u] = splitDecimal(state);

  // Ciclo visual de multiplexado cuando está activado el modo
  useEffect(() => {
    if (!multiplexMode) return;
    const interval = setInterval(() => {
      setActiveDigitIdx((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 280);
    return () => clearInterval(interval);
  }, [multiplexMode]);

  return (
    <div className="display-panel-layout">
      <div className="display-visual-section">
        <div className="display-header">
          <span className="label-datasheet">
            3× DISPLAY F5101AH (CÁTODO COMÚN MULTIPLEXADO)
          </span>
          <button
            type="button"
            className={`btn-toggle-mux mono ${multiplexMode ? 'mux-active' : ''}`}
            onClick={() => setMultiplexMode((prev) => !prev)}
            aria-pressed={multiplexMode}
          >
            {multiplexMode
              ? 'MULTIPLEXADO: ACTIVO (LENTO)'
              : 'VER MULTIPLEXADO'}
          </button>
        </div>

        <div className="display-bezel">
          <Digit7Seg
            digit={c}
            active={!multiplexMode || activeDigitIdx === 0}
            label="CENT"
            pinName="D11"
          />
          <Digit7Seg
            digit={d}
            active={!multiplexMode || activeDigitIdx === 1}
            label="DEC"
            pinName="D12"
          />
          <Digit7Seg
            digit={u}
            active={!multiplexMode || activeDigitIdx === 2}
            label="UNID"
            pinName="D13"
          />
        </div>

        <div className="display-info-bar mono">
          <div className="info-item">
            <span className="label-datasheet">REFRESCO REAL B:</span>
            <span>~110 Hz (~3 ms/dígito)</span>
          </div>
          <div className="info-item">
            <span className="label-datasheet">LÓGICA CÁTODO:</span>
            <span>LOW = ENCENDIDO</span>
          </div>
          <div className="info-item">
            <span className="label-datasheet">DÍGITO ACTIVO:</span>
            <span className="highlight">
              {multiplexMode
                ? activeDigitIdx === 0
                  ? 'CENT (D11 LOW)'
                  : activeDigitIdx === 1
                    ? 'DEC (D12 LOW)'
                    : 'UNID (D13 LOW)'
                : 'TODOS (PERSISTENCIA VISUAL)'}
            </span>
          </div>
        </div>
      </div>

      <div className="display-table-section">
        <StateTable currentState={state} onJumpTo={onJumpTo} />
      </div>
    </div>
  );
};
