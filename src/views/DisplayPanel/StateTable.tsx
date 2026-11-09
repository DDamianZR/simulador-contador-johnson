import React, { useEffect, useRef } from 'react';
import golden from '../../../docs/golden.json';
import { State, stepIndex, bit } from '../../core/johnson';

interface StateTableProps {
  currentState: State;
  onJumpTo: (stepIdx: number) => void;
}

export const StateTable: React.FC<StateTableProps> = ({
  currentState,
  onJumpTo,
}) => {
  const currentStep = stepIndex(currentState);
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStep]);

  return (
    <div className="state-table-container">
      <div className="table-header-title">
        <span className="label-datasheet">SECUENCIA DE ESTADOS (16 PASOS)</span>
        <span className="mono table-hint">Clic en una fila para saltar</span>
      </div>
      <div className="table-scroll-wrapper">
        <table className="state-table mono">
          <thead>
            <tr>
              <th>PASO</th>
              <th>Q7</th>
              <th>Q6</th>
              <th>Q5</th>
              <th>Q4</th>
              <th>Q3</th>
              <th>Q2</th>
              <th>Q1</th>
              <th>Q0</th>
              <th>DEC</th>
            </tr>
          </thead>
          <tbody>
            {golden.estados.map((entry) => {
              const isCurrent = currentStep === entry.paso;
              return (
                <tr
                  key={entry.paso}
                  ref={isCurrent ? activeRowRef : null}
                  className={`state-row ${isCurrent ? 'row-active' : ''}`}
                  onClick={() => onJumpTo(entry.paso)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onJumpTo(entry.paso);
                    }
                  }}
                  role="button"
                  aria-label={`Paso ${entry.paso}, decimal ${entry.dec}`}
                >
                  <td className="step-cell">
                    {String(entry.paso).padStart(2, '0')}
                  </td>
                  {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => {
                    const bVal = bit(entry.dec, b);
                    return (
                      <td
                        key={b}
                        className={`bit-cell ${bVal === 1 ? 'bit-one' : 'bit-zero'}`}
                      >
                        {bVal}
                      </td>
                    );
                  })}
                  <td className="dec-cell">
                    {String(entry.dec).padStart(3, ' ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
