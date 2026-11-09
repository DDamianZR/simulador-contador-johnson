import React, { useState, useRef, useMemo } from 'react';
import { HistoryEntry } from '../../core/history';
import { bit, serialInput } from '../../core/johnson';

export interface TimingViewProps {
  history?: HistoryEntry[];
  currentTick?: number;
}

interface SignalRow {
  id: string;
  label: string;
  getValue: (entry: HistoryEntry) => 0 | 1;
}

const SIGNALS: SignalRow[] = [
  { id: 'clk', label: 'CLK', getValue: (e) => (e.rst === 0 ? 0 : 1) }, // Pulso de reloj en cada transición
  { id: 'rst', label: 'RST̅', getValue: (e) => e.rst },
  { id: 'q0', label: 'Q0', getValue: (e) => bit(e.state, 0) },
  { id: 'q1', label: 'Q1', getValue: (e) => bit(e.state, 1) },
  { id: 'q2', label: 'Q2', getValue: (e) => bit(e.state, 2) },
  { id: 'q3', label: 'Q3', getValue: (e) => bit(e.state, 3) },
  { id: 'q4', label: 'Q4', getValue: (e) => bit(e.state, 4) },
  { id: 'q5', label: 'Q5', getValue: (e) => bit(e.state, 5) },
  { id: 'q6', label: 'Q6', getValue: (e) => bit(e.state, 6) },
  { id: 'q7', label: 'Q7', getValue: (e) => bit(e.state, 7) },
  {
    id: 'not_q7',
    label: 'ENTRADA (!Q7)',
    getValue: (e) => serialInput(e.state),
  },
];

export const TimingView: React.FC<TimingViewProps> = ({
  history = [],
  currentTick = 0,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Tomamos los últimos 32 ciclos para la ventana
  const windowEntries = useMemo(() => {
    if (history.length <= 32) return history;
    return history.slice(history.length - 32);
  }, [history]);

  const numCycles = Math.max(16, windowEntries.length);
  const labelWidth = 140;
  const cycleWidth = 26;
  const rowHeight = 32;
  const waveHeight = 18;
  const headerHeight = 30;
  const totalWidth = labelWidth + numCycles * cycleWidth + 40;
  const totalHeight = headerHeight + SIGNALS.length * rowHeight + 20;

  // Exportar SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contador_johnson_timing_tick_${currentTick}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar PNG
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = totalWidth * 2; // retina 2x
      canvas.height = totalHeight * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, totalHeight);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `contador_johnson_timing_tick_${currentTick}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="timing-view-container">
      <div className="timing-header">
        <div className="timing-title-group">
          <span className="label-datasheet">
            CARTA DE TIEMPOS DIGITAL (VENTANA MÓVIL DE 32 CICLOS)
          </span>
          <span className="mono timing-subtitle">
            Ondas cuadradas sincronizadas · Patrón progresivo Johnson (llenado
            1s / vaciado 0s)
          </span>
        </div>
        <div className="timing-actions">
          <button
            type="button"
            className="btn-timing-export mono"
            onClick={handleExportSVG}
            aria-label="Exportar carta de tiempos en formato SVG"
          >
            EXPORTAR SVG
          </button>
          <button
            type="button"
            className="btn-timing-export mono"
            onClick={handleExportPNG}
            aria-label="Exportar carta de tiempos en formato PNG"
          >
            EXPORTAR PNG
          </button>
        </div>
      </div>

      <div className="timing-scroll-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="timing-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fondo para exportación limpia */}
          <rect
            x="0"
            y="0"
            width={totalWidth}
            height={totalHeight}
            fill="var(--paper)"
          />

          {/* Rejilla de ciclos vertical */}
          {Array.from({ length: numCycles }).map((_, cIdx) => {
            const x = labelWidth + cIdx * cycleWidth;
            const entry = windowEntries[cIdx];
            return (
              <g key={cIdx} className="timing-col-group">
                <line
                  x1={x}
                  y1={headerHeight}
                  x2={x}
                  y2={totalHeight - 15}
                  stroke="var(--grid)"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                {entry && (
                  <text
                    x={x + cycleWidth / 2}
                    y={headerHeight - 8}
                    className="timing-tick-label mono"
                    textAnchor="middle"
                  >
                    T{entry.tick % 100}
                  </text>
                )}
              </g>
            );
          })}

          {/* Resaltado del cursor del ciclo seleccionado / hover */}
          {hoverIndex !== null && hoverIndex < windowEntries.length && (
            <rect
              x={labelWidth + hoverIndex * cycleWidth}
              y={headerHeight}
              width={cycleWidth}
              height={SIGNALS.length * rowHeight}
              fill="var(--signal-soft)"
              opacity="0.5"
            />
          )}

          {/* Filas de señales */}
          {SIGNALS.map((sig, rIdx) => {
            const rowY = headerHeight + rIdx * rowHeight;
            const lowY = rowY + waveHeight;
            const highY = rowY + 4;

            // Construir ruta de onda cuadrada
            let pathD = '';
            let prevVal: 0 | 1 | null = null;

            windowEntries.forEach((entry, cIdx) => {
              const xStart = labelWidth + cIdx * cycleWidth;
              const xEnd = xStart + cycleWidth;
              const val = sig.getValue(entry);
              const yVal = val === 1 ? highY : lowY;

              if (cIdx === 0) {
                pathD += `M ${xStart} ${yVal} L ${xEnd} ${yVal}`;
              } else {
                if (prevVal !== val) {
                  // Transición vertical nítida
                  pathD += ` L ${xStart} ${yVal} L ${xEnd} ${yVal}`;
                } else {
                  pathD += ` L ${xEnd} ${yVal}`;
                }
              }
              prevVal = val;
            });

            const isHighRow = sig.id.startsWith('q') || sig.id === 'clk';

            return (
              <g key={sig.id} className="signal-row-group">
                {/* Separador horizontal de fila */}
                <line
                  x1={10}
                  y1={rowY + rowHeight - 2}
                  x2={totalWidth - 10}
                  y2={rowY + rowHeight - 2}
                  stroke="var(--grid)"
                  strokeWidth="1"
                />

                {/* Etiqueta de la señal */}
                <text
                  x={labelWidth - 16}
                  y={rowY + 16}
                  className="timing-signal-name mono"
                  textAnchor="end"
                >
                  {sig.label}
                </text>

                {/* Trazado de la onda */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighRow ? 'var(--signal)' : 'var(--ink)'}
                    strokeWidth="1.75"
                    className="wave-path"
                  />
                )}
              </g>
            );
          })}

          {/* Capa invisible para detección interactiva de hover sobre cada ciclo */}
          {windowEntries.map((_, cIdx) => {
            const x = labelWidth + cIdx * cycleWidth;
            return (
              <rect
                key={cIdx}
                x={x}
                y={headerHeight}
                width={cycleWidth}
                height={SIGNALS.length * rowHeight}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIndex(cIdx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Telemetría del ciclo bajo el cursor */}
      <div className="timing-inspection-card mono">
        {hoverIndex !== null && windowEntries[hoverIndex] ? (
          <div className="inspection-content">
            <span className="inspection-title">
              CICLO TICK: <strong>{windowEntries[hoverIndex].tick}</strong>
            </span>
            <span className="inspection-item">
              ESTADO DEC: <strong>{windowEntries[hoverIndex].state}</strong>
            </span>
            <span className="inspection-item">
              RST:{' '}
              <strong>
                {windowEntries[hoverIndex].rst === 0 ? '0 (ACTIVO)' : '1'}
              </strong>
            </span>
            <span className="inspection-item">
              Q7..Q0:{' '}
              <strong className="highlight">
                {[7, 6, 5, 4, 3, 2, 1, 0]
                  .map((b) => bit(windowEntries[hoverIndex].state, b))
                  .join('')}
              </strong>
            </span>
          </div>
        ) : (
          <span className="inspection-empty">
            Pasa el cursor sobre la carta de tiempos para inspeccionar valores
            instantáneos por ciclo.
          </span>
        )}
      </div>
    </div>
  );
};
