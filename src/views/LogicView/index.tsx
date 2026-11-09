import React, { useState } from 'react';
import { State, bit, serialInput } from '../../core/johnson';

export interface LogicViewProps {
  state?: State;
  tick?: number;
  clk?: 0 | 1;
  rst?: 0 | 1;
  phase?: number;
  onBitClick?: (bitIndex: number) => void;
}

interface FFMapping {
  ffIdx: number;
  qPinA: string;
  inPinB: string;
}

const FF_MAPPINGS: FFMapping[] = [
  { ffIdx: 0, qPinA: 'D2', inPinB: 'A0' },
  { ffIdx: 1, qPinA: 'D3', inPinB: 'A1' },
  { ffIdx: 2, qPinA: 'D4', inPinB: 'A2' },
  { ffIdx: 3, qPinA: 'D5', inPinB: 'A3' },
  { ffIdx: 4, qPinA: 'D6', inPinB: 'A4' },
  { ffIdx: 5, qPinA: 'D7', inPinB: 'A5' },
  { ffIdx: 6, qPinA: 'D8', inPinB: 'D9' },
  { ffIdx: 7, qPinA: 'D9', inPinB: 'D10' },
];

export const LogicView: React.FC<LogicViewProps> = ({
  state = 0,
  tick = 0,
  rst = 1,
  phase = 0,
  onBitClick,
}) => {
  const [hoveredFF, setHoveredFF] = useState<FFMapping | null>(null);

  const nextSerial = serialInput(state);
  const q7Val = bit(state, 7);

  // El pulso de reloj está activo durante el primer cuarto del ciclo
  const clkActive = phase > 0 && phase < 0.25;
  const isResetActive = rst === 0;

  // Parámetros de diseño SVG
  const svgWidth = 920;
  const svgHeight = 440;
  const startX = 60;
  const ffWidth = 84;
  const ffHeight = 110;
  const gap = 24;
  const ffY = 160;

  const clkLineY = ffY + ffHeight + 40;
  const rstLineY = clkLineY + 30;

  return (
    <div className="logic-view-container">
      <div className="logic-header">
        <div className="logic-title-group">
          <span className="label-datasheet">
            CIRCUITO LÓGICO EQUIVALENTE (8 FLIP-FLOPS TIPO D + LAZO INVERSOR)
          </span>
          <span className="mono logic-subtitle">
            Implementado dentro del software de Arduino A · Desplazamiento Q[i]
            = Q[i-1], Q0 = !Q7
          </span>
        </div>
        <div className="logic-badges mono">
          <span className="badge-pill">TICK: {tick}</span>
          <span className={`badge-pill ${clkActive ? 'pill-active' : ''}`}>
            CLK: {clkActive ? 'ALTO (PULSO)' : 'BAJO'}
          </span>
          <span className={`badge-pill ${isResetActive ? 'pill-reset' : ''}`}>
            RST̅: {isResetActive ? '0 (REINICIO)' : '1 (REPOSO)'}
          </span>
        </div>
      </div>

      <div className="logic-svg-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="logic-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Contenedor punteado Arduino A (Registro en Software) */}
          <rect
            x="20"
            y="40"
            width={svgWidth - 40}
            height={svgHeight - 100}
            rx="4"
            className="software-boundary"
          />
          <text x="32" y="60" className="software-boundary-label mono">
            ARDUINO A · REGISTRO EN SOFTWARE (ATmega328P)
          </text>

          {/* Lazo de retroalimentación superior: Q7 -> NOT -> D0 */}
          {/* Tramo 1: Desde Q7 (salida de FF7) hacia arriba */}
          {(() => {
            const ff7X = startX + 7 * (ffWidth + gap);
            const q7OutX = ff7X + ffWidth;
            const q7OutY = ffY + 35;
            const wireColorQ7 = q7Val === 1 ? 'var(--signal)' : 'var(--ink-2)';
            const wireColorNext =
              nextSerial === 1 ? 'var(--signal)' : 'var(--ink-2)';

            // Ruta: de (q7OutX, q7OutY) a (q7OutX + 15, q7OutY) -> arriba a y=90 -> a la izquierda a NOT -> a (startX - 20, 90) -> baja a D0 (startX, ffY + 35)
            const notGateX = 480;
            const notGateY = 90;

            return (
              <g className="feedback-loop">
                {/* Cable Q7 hacia el inversor */}
                <path
                  d={`M ${q7OutX} ${q7OutY} L ${q7OutX + 16} ${q7OutY} L ${q7OutX + 16} ${notGateY} L ${notGateX + 22} ${notGateY}`}
                  fill="none"
                  stroke={wireColorQ7}
                  strokeWidth="2"
                  className="wire-line"
                />

                {/* Símbolo de compuerta NOT IEEE (orientada hacia la izquierda) */}
                <g
                  transform={`translate(${notGateX}, ${notGateY})`}
                  className="not-gate-group"
                >
                  {/* Triángulo apuntando a la izquierda */}
                  <polygon
                    points="20,-12 20,12 -8,0"
                    fill="var(--paper)"
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                  />
                  {/* Burbuja invertida a la salida izquierda */}
                  <circle
                    cx="-12"
                    cy="0"
                    r="4"
                    fill="var(--paper)"
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="7"
                    y="3"
                    className="not-gate-text mono"
                    textAnchor="middle"
                  >
                    NOT
                  </text>
                </g>

                {/* Cable desde salida del inversor hacia D0 */}
                <path
                  d={`M ${notGateX - 16} ${notGateY} L ${startX - 20} ${notGateY} L ${startX - 20} ${ffY + 35} L ${startX} ${ffY + 35}`}
                  fill="none"
                  stroke={wireColorNext}
                  strokeWidth="2"
                  className="wire-line"
                />

                {/* Etiquetas de nivel en el lazo */}
                <text
                  x={notGateX + 32}
                  y={notGateY - 8}
                  fill={wireColorQ7}
                  className="wire-badge-text mono"
                >
                  Q7={q7Val}
                </text>
                <text
                  x={notGateX - 60}
                  y={notGateY - 8}
                  fill={wireColorNext}
                  className="wire-badge-text mono"
                >
                  D0=NOT({q7Val})={nextSerial}
                </text>
              </g>
            );
          })()}

          {/* Líneas comunes inferiores de CLK y RST */}
          {/* Línea CLK */}
          <line
            x1={startX - 30}
            y1={clkLineY}
            x2={startX + 7 * (ffWidth + gap) + ffWidth + 10}
            y2={clkLineY}
            stroke={clkActive ? 'var(--signal)' : 'var(--ink-2)'}
            strokeWidth="2"
            className="wire-line"
          />
          <text
            x={startX - 42}
            y={clkLineY + 4}
            className="bus-label mono"
            fill={clkActive ? 'var(--signal)' : 'var(--ink-2)'}
            textAnchor="end"
          >
            CLK
          </text>

          {/* Línea RST */}
          <line
            x1={startX - 30}
            y1={rstLineY}
            x2={startX + 7 * (ffWidth + gap) + ffWidth + 10}
            y2={rstLineY}
            stroke={isResetActive ? 'var(--signal)' : 'var(--ink-2)'}
            strokeWidth="2"
            className="wire-line"
          />
          <text
            x={startX - 42}
            y={rstLineY + 4}
            className="bus-label mono"
            fill={isResetActive ? 'var(--signal)' : 'var(--ink-2)'}
            textAnchor="end"
          >
            RST̅
          </text>

          {/* Renderizado de los 8 Flip-Flops */}
          {FF_MAPPINGS.map((item, idx) => {
            const x = startX + idx * (ffWidth + gap);
            const currentBit = bit(state, item.ffIdx);
            const isOne = currentBit === 1;
            const qWireColor = isOne ? 'var(--signal)' : 'var(--ink-2)';

            // Conexión entre este FF y el siguiente (Q_i -> D_{i+1})
            const nextX = x + ffWidth + gap;
            const hasInterFFWire = idx < 7;

            return (
              <g
                key={item.ffIdx}
                className="ff-group"
                onMouseEnter={() => setHoveredFF(item)}
                onMouseLeave={() => setHoveredFF(null)}
                onClick={() => onBitClick?.(item.ffIdx)}
                style={{ cursor: onBitClick ? 'pointer' : 'default' }}
              >
                {/* Conexión serial inter-FF (Q[i] a D[i+1]) */}
                {hasInterFFWire && (
                  <path
                    d={`M ${x + ffWidth} ${ffY + 35} L ${nextX} ${ffY + 35}`}
                    fill="none"
                    stroke={qWireColor}
                    strokeWidth="2"
                    className="wire-line"
                  />
                )}

                {/* Conexión vertical a línea CLK */}
                <line
                  x1={x + 24}
                  y1={ffY + ffHeight}
                  x2={x + 24}
                  y2={clkLineY}
                  stroke={clkActive ? 'var(--signal)' : 'var(--ink-2)'}
                  strokeWidth="1.5"
                />

                {/* Conexión vertical a línea RST */}
                <line
                  x1={x + 58}
                  y1={ffY + ffHeight + 8}
                  x2={x + 58}
                  y2={rstLineY}
                  stroke={isResetActive ? 'var(--signal)' : 'var(--ink-2)'}
                  strokeWidth="1.5"
                />

                {/* Caja del Flip-Flop */}
                <rect
                  x={x}
                  y={ffY}
                  width={ffWidth}
                  height={ffHeight}
                  rx="3"
                  className={`ff-box ${hoveredFF?.ffIdx === item.ffIdx ? 'ff-box-hovered' : ''}`}
                />

                {/* Encabezado del FF */}
                <text
                  x={x + ffWidth / 2}
                  y={ffY + 18}
                  className="ff-name mono"
                  textAnchor="middle"
                >
                  FF{item.ffIdx}
                </text>

                {/* Etiquetas de pines D y Q */}
                <text x={x + 8} y={ffY + 39} className="ff-pin-label mono">
                  D
                </text>
                <text
                  x={x + ffWidth - 16}
                  y={ffY + 39}
                  className="ff-pin-label mono"
                >
                  Q
                </text>

                {/* Triángulo de reloj CLK */}
                <polygon
                  points={`${x + 18},${ffY + ffHeight} ${x + 24},${ffY + ffHeight - 8} ${x + 30},${ffY + ffHeight}`}
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.5"
                />

                {/* Burbuja de RST activo bajo */}
                <circle
                  cx={x + 58}
                  cy={ffY + ffHeight + 4}
                  r="4"
                  fill="var(--paper)"
                  stroke="var(--ink)"
                  strokeWidth="1.5"
                />
                <text
                  x={x + 58}
                  y={ffY + ffHeight - 6}
                  className="ff-pin-label mono"
                  textAnchor="middle"
                >
                  R
                </text>

                {/* Token circular animado con el bit actual dentro del FF */}
                <g className="token-group">
                  <circle
                    cx={x + ffWidth / 2}
                    cy={ffY + 62}
                    r="16"
                    className={`token-circle ${isOne ? 'token-one' : 'token-zero'}`}
                  />
                  <text
                    x={x + ffWidth / 2}
                    y={ffY + 67}
                    className={`token-val mono ${isOne ? 'token-val-one' : 'token-val-zero'}`}
                    textAnchor="middle"
                  >
                    {currentBit}
                  </text>
                </g>

                {/* Salida física hacia el Bus: flecha hacia pin Arduino A */}
                <line
                  x1={x + ffWidth}
                  y1={ffY + 35}
                  x2={x + ffWidth + 8}
                  y2={ffY + 35}
                  stroke={qWireColor}
                  strokeWidth="2"
                />
                <line
                  x1={x + ffWidth / 2}
                  y1={ffY + 86}
                  x2={x + ffWidth / 2}
                  y2={ffY + ffHeight + 70}
                  stroke={qWireColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <polygon
                  points={`${x + ffWidth / 2 - 4},${ffY + ffHeight + 68} ${x + ffWidth / 2 + 4},${ffY + ffHeight + 68} ${x + ffWidth / 2},${ffY + ffHeight + 76}`}
                  fill={qWireColor}
                />
                <rect
                  x={x + ffWidth / 2 - 20}
                  y={ffY + ffHeight + 78}
                  width="40"
                  height="18"
                  rx="2"
                  className="pin-chip-rect"
                />
                <text
                  x={x + ffWidth / 2}
                  y={ffY + ffHeight + 91}
                  className="pin-chip-text mono"
                  textAnchor="middle"
                >
                  A.{item.qPinA}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip informativo al hacer hover en un Flip-Flop */}
      <div className="logic-tooltip-card mono">
        {hoveredFF ? (
          <div className="tooltip-content">
            <span className="tooltip-title">FLIP-FLOP FF{hoveredFF.ffIdx}</span>
            <span className="tooltip-item">
              Estado Q{hoveredFF.ffIdx} ={' '}
              <strong
                className={bit(state, hoveredFF.ffIdx) === 1 ? 'val-high' : ''}
              >
                {bit(state, hoveredFF.ffIdx)}
              </strong>
            </span>
            <span className="tooltip-item">
              Salida Arduino A: <strong>{hoveredFF.qPinA}</strong>
            </span>
            <span className="tooltip-item">
              Entrada Arduino B: <strong>{hoveredFF.inPinB}</strong>
            </span>
            <span className="tooltip-hint">
              (Clic en el FF para invertir bit en pruebas)
            </span>
          </div>
        ) : (
          <div className="tooltip-empty">
            Pasa el cursor sobre un flip-flop para ver mapeo de pines y estado
            individual.
          </div>
        )}
      </div>
    </div>
  );
};
