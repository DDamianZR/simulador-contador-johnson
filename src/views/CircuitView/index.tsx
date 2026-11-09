import React, { useState, useRef, useMemo } from 'react';
import { State } from '../../core/johnson';
import {
  HARDWARE,
  NetItem,
  netLevel,
  SimulationContext,
} from '../../core/netlist';

export interface CircuitViewProps {
  state?: State;
  clk?: 0 | 1;
  rst?: 0 | 1;
  activeDigit?: 0 | 1 | 2 | null;
}

interface Point {
  x: number;
  y: number;
}

export const CircuitView: React.FC<CircuitViewProps> = ({
  state = 0,
  clk = 0,
  rst = 1,
  activeDigit = 2, // por defecto unidades o multiplexado
}) => {
  const [hoveredNet, setHoveredNet] = useState<NetItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });

  const ctx: SimulationContext = useMemo(
    () => ({
      state,
      clk,
      rst_n: rst,
      activeDigit,
    }),
    [state, clk, rst, activeDigit]
  );

  // Manejo de Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejo de Zoom con rueda
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, Math.min(2.5, prev * zoomFactor)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Posiciones fijas de los bloques en el esquemático (ancho total 1280 x 780)
  // 1. Arduino A (izquierda superior)
  const ardAX = 60;
  const ardAY = 80;
  const ardAWidth = 260;
  const ardAHeight = 340;

  // 2. Arduino B (derecha superior)
  const ardBX = 420;
  const ardBY = 80;
  const ardBWidth = 280;
  const ardBHeight = 440;

  // 3. Resistencias de segmento R_a .. R_g (entre B y Displays)
  const resX = 760;
  const resStartY = 90;
  const resGap = 32;

  // 4. Displays DS1 (centenas), DS2 (decenas), DS3 (unidades)
  const dispStartY = 70;
  const dispGap = 130;
  const dispX = 890;
  const dispWidth = 90;
  const dispHeight = 110;

  // Mapa de coordenadas de pines para dibujar las redes de hardware.json
  const pinCoordinates: Record<string, Point> = {
    // Arduino A
    'ARD_A.GND': { x: ardAX + 240, y: ardAY + 310 },
    'ARD_A.D2': { x: ardAX + 250, y: ardAY + 60 },
    'ARD_A.D3': { x: ardAX + 250, y: ardAY + 80 },
    'ARD_A.D4': { x: ardAX + 250, y: ardAY + 100 },
    'ARD_A.D5': { x: ardAX + 250, y: ardAY + 120 },
    'ARD_A.D6': { x: ardAX + 250, y: ardAY + 140 },
    'ARD_A.D7': { x: ardAX + 250, y: ardAY + 160 },
    'ARD_A.D8': { x: ardAX + 250, y: ardAY + 180 },
    'ARD_A.D9': { x: ardAX + 250, y: ardAY + 200 },
    'ARD_A.D10': { x: ardAX + 250, y: ardAY + 230 }, // CLK
    'ARD_A.D11': { x: ardAX + 250, y: ardAY + 260 }, // RST

    // Arduino B
    'ARD_B.GND': { x: ardBX + 30, y: ardBY + 410 },
    'ARD_B.A0': { x: ardBX + 20, y: ardBY + 80 },
    'ARD_B.A1': { x: ardBX + 20, y: ardBY + 100 },
    'ARD_B.A2': { x: ardBX + 20, y: ardBY + 120 },
    'ARD_B.A3': { x: ardBX + 20, y: ardBY + 140 },
    'ARD_B.A4': { x: ardBX + 20, y: ardBY + 160 },
    'ARD_B.A5': { x: ardBX + 20, y: ardBY + 180 },
    'ARD_B.D9': { x: ardBX + 20, y: ardBY + 210 },
    'ARD_B.D10': { x: ardBX + 20, y: ardBY + 230 },

    // Arduino B salidas hacia displays y resistencias
    'ARD_B.D2': { x: ardBX + 260, y: ardBY + 60 },
    'ARD_B.D3': { x: ardBX + 260, y: ardBY + 90 },
    'ARD_B.D4': { x: ardBX + 260, y: ardBY + 120 },
    'ARD_B.D5': { x: ardBX + 260, y: ardBY + 150 },
    'ARD_B.D6': { x: ardBX + 260, y: ardBY + 180 },
    'ARD_B.D7': { x: ardBX + 260, y: ardBY + 210 },
    'ARD_B.D8': { x: ardBX + 260, y: ardBY + 240 },

    // Cátodos de Arduino B
    'ARD_B.D11': { x: ardBX + 260, y: ardBY + 300 }, // Centenas
    'ARD_B.D12': { x: ardBX + 260, y: ardBY + 330 }, // Decenas
    'ARD_B.D13': { x: ardBX + 260, y: ardBY + 360 }, // Unidades

    // Resistencias R_a .. R_g
    'R_a.1': { x: resX, y: resStartY },
    'R_a.2': { x: resX + 50, y: resStartY },
    'R_b.1': { x: resX, y: resStartY + resGap },
    'R_b.2': { x: resX + 50, y: resStartY + resGap },
    'R_c.1': { x: resX, y: resStartY + 2 * resGap },
    'R_c.2': { x: resX + 50, y: resStartY + 2 * resGap },
    'R_d.1': { x: resX, y: resStartY + 3 * resGap },
    'R_d.2': { x: resX + 50, y: resStartY + 3 * resGap },
    'R_e.1': { x: resX, y: resStartY + 4 * resGap },
    'R_e.2': { x: resX + 50, y: resStartY + 4 * resGap },
    'R_f.1': { x: resX, y: resStartY + 5 * resGap },
    'R_f.2': { x: resX + 50, y: resStartY + 5 * resGap },
    'R_g.1': { x: resX, y: resStartY + 6 * resGap },
    'R_g.2': { x: resX + 50, y: resStartY + 6 * resGap },

    // Displays DS1 (centenas)
    'DS1.3': { x: dispX + 45, y: dispStartY + 10 },
    'DS1.8': { x: dispX + 45, y: dispStartY + 10 },
    'DS1.7': { x: dispX + 20, y: dispStartY + 25 }, // a
    'DS1.6': { x: dispX + 35, y: dispStartY + 25 }, // b
    'DS1.4': { x: dispX + 50, y: dispStartY + 25 }, // c
    'DS1.2': { x: dispX + 65, y: dispStartY + 25 }, // d
    'DS1.1': { x: dispX + 20, y: dispStartY + 85 }, // e
    'DS1.9': { x: dispX + 35, y: dispStartY + 85 }, // f
    'DS1.10': { x: dispX + 50, y: dispStartY + 85 }, // g

    // Displays DS2 (decenas)
    'DS2.3': { x: dispX + dispGap + 45, y: dispStartY + 10 },
    'DS2.8': { x: dispX + dispGap + 45, y: dispStartY + 10 },
    'DS2.7': { x: dispX + dispGap + 20, y: dispStartY + 25 },
    'DS2.6': { x: dispX + dispGap + 35, y: dispStartY + 25 },
    'DS2.4': { x: dispX + dispGap + 50, y: dispStartY + 25 },
    'DS2.2': { x: dispX + dispGap + 65, y: dispStartY + 25 },
    'DS2.1': { x: dispX + dispGap + 20, y: dispStartY + 85 },
    'DS2.9': { x: dispX + dispGap + 35, y: dispStartY + 85 },
    'DS2.10': { x: dispX + dispGap + 50, y: dispStartY + 85 },

    // Displays DS3 (unidades)
    'DS3.3': { x: dispX + 2 * dispGap + 45, y: dispStartY + 10 },
    'DS3.8': { x: dispX + 2 * dispGap + 45, y: dispStartY + 10 },
    'DS3.7': { x: dispX + 2 * dispGap + 20, y: dispStartY + 25 },
    'DS3.6': { x: dispX + 2 * dispGap + 35, y: dispStartY + 25 },
    'DS3.4': { x: dispX + 2 * dispGap + 50, y: dispStartY + 25 },
    'DS3.2': { x: dispX + 2 * dispGap + 65, y: dispStartY + 25 },
    'DS3.1': { x: dispX + 2 * dispGap + 20, y: dispStartY + 85 },
    'DS3.9': { x: dispX + 2 * dispGap + 35, y: dispStartY + 85 },
    'DS3.10': { x: dispX + 2 * dispGap + 50, y: dispStartY + 85 },
  };

  // Helper para dibujar rutas ortogonales con codos suaves
  const buildOrthogonalPath = (p1: Point, p2: Point): string => {
    const midX = (p1.x + p2.x) / 2;
    return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
  };

  return (
    <div className="circuit-view-container">
      <div className="circuit-header">
        <div className="circuit-title-group">
          <span className="label-datasheet">
            ESQUEMA FÍSICO REAL (2× ARDUINO UNO + 3× F5101AH)
          </span>
          <span className="mono circuit-subtitle">
            Netlist estricto de docs/hardware.json · Bus de 8 bits A→B · Cátodos
            directos sin transistores
          </span>
        </div>
        <div className="circuit-actions">
          <button
            type="button"
            className="btn-circuit-ctrl mono"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            aria-label="Acercar vista"
          >
            +
          </button>
          <button
            type="button"
            className="btn-circuit-ctrl mono"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            aria-label="Alejar vista"
          >
            -
          </button>
          <button
            type="button"
            className="btn-circuit-ctrl mono"
            onClick={handleResetView}
            aria-label="Restablecer encuadre"
          >
            AJUSTAR VISTA
          </button>
        </div>
      </div>

      <div
        className="circuit-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          viewBox="0 0 1340 760"
          className="circuit-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            className="circuit-zoom-group"
          >
            {/* 1. ARDUINO A */}
            <g className="arduino-block ard-a">
              <rect
                x={ardAX}
                y={ardAY}
                width={ardAWidth}
                height={ardAHeight}
                rx="6"
                className="board-base"
              />
              <text x={ardAX + 20} y={ardAY + 30} className="board-title mono">
                ARDUINO A (UNO)
              </text>
              <text x={ardAX + 20} y={ardAY + 46} className="board-sub mono">
                GENERADOR JOHNSON 8-BIT
              </text>

              {/* Registro interno en software dibujado dentro de Arduino A */}
              <rect
                x={ardAX + 16}
                y={ardAY + 65}
                width={200}
                height={160}
                rx="3"
                className="internal-reg-box"
              />
              <text
                x={ardAX + 24}
                y={ardAY + 82}
                className="internal-reg-title mono"
              >
                REGISTRO EN SOFTWARE:
              </text>
              {Array.from({ length: 8 }).map((_, i) => {
                const bitVal = (state >> i) & 1;
                return (
                  <g key={i}>
                    <rect
                      x={ardAX + 24 + (i % 4) * 44}
                      y={ardAY + 95 + Math.floor(i / 4) * 45}
                      width={38}
                      height={32}
                      className={`reg-cell ${bitVal === 1 ? 'cell-one' : 'cell-zero'}`}
                    />
                    <text
                      x={ardAX + 43 + (i % 4) * 44}
                      y={ardAY + 115 + Math.floor(i / 4) * 45}
                      className="reg-cell-text mono"
                      textAnchor="middle"
                    >
                      {bitVal}
                    </text>
                    <text
                      x={ardAX + 43 + (i % 4) * 44}
                      y={ardAY + 137 + Math.floor(i / 4) * 45}
                      className="reg-cell-label mono"
                      textAnchor="middle"
                    >
                      ff[{i}]
                    </text>
                  </g>
                );
              })}

              {/* Pines de salida D2..D9, D10 (CLK), D11 (RST) */}
              {[
                { name: 'D2 (Q0)', y: ardAY + 60 },
                { name: 'D3 (Q1)', y: ardAY + 80 },
                { name: 'D4 (Q2)', y: ardAY + 100 },
                { name: 'D5 (Q3)', y: ardAY + 120 },
                { name: 'D6 (Q4)', y: ardAY + 140 },
                { name: 'D7 (Q5)', y: ardAY + 160 },
                { name: 'D8 (Q6)', y: ardAY + 180 },
                { name: 'D9 (Q7)', y: ardAY + 200 },
                { name: 'D10 (CLK)', y: ardAY + 230 },
                { name: 'D11 (RST)', y: ardAY + 260 },
              ].map((p) => (
                <g key={p.name}>
                  <circle
                    cx={ardAX + 250}
                    cy={p.y}
                    r="4"
                    className="pin-circle pin-used"
                  />
                  <text
                    x={ardAX + 242}
                    y={p.y + 4}
                    className="pin-text-header mono"
                    textAnchor="end"
                  >
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Pin GND */}
              <circle
                cx={ardAX + 240}
                cy={ardAY + 310}
                r="4"
                className="pin-circle"
              />
              <text
                x={ardAX + 232}
                y={ardAY + 314}
                className="pin-text-header mono"
                textAnchor="end"
              >
                GND
              </text>
            </g>

            {/* 2. ARDUINO B */}
            <g className="arduino-block ard-b">
              <rect
                x={ardBX}
                y={ardBY}
                width={ardBWidth}
                height={ardBHeight}
                rx="6"
                className="board-base"
              />
              <text x={ardBX + 20} y={ardBY + 30} className="board-title mono">
                ARDUINO B (UNO)
              </text>
              <text x={ardBX + 20} y={ardBY + 46} className="board-sub mono">
                BUS DECODING & MULTIPLEX
              </text>

              {/* Pines de entrada del Bus (A0..A5, D9, D10) a la izquierda de B */}
              {[
                { name: 'A0 (Q0)', y: ardBY + 80 },
                { name: 'A1 (Q1)', y: ardBY + 100 },
                { name: 'A2 (Q2)', y: ardBY + 120 },
                { name: 'A3 (Q3)', y: ardBY + 140 },
                { name: 'A4 (Q4)', y: ardBY + 160 },
                { name: 'A5 (Q5)', y: ardBY + 180 },
                { name: 'D9 (Q6)', y: ardBY + 210 },
                { name: 'D10 (Q7)', y: ardBY + 230 },
              ].map((p) => (
                <g key={p.name}>
                  <circle
                    cx={ardBX + 20}
                    cy={p.y}
                    r="4"
                    className="pin-circle pin-used"
                  />
                  <text
                    x={ardBX + 30}
                    y={p.y + 4}
                    className="pin-text-header mono"
                  >
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Pines de salida hacia displays (D2..D8 segmentos, D11..D13 cátodos) a la derecha de B */}
              {[
                { name: 'D2 (a)', y: ardBY + 60 },
                { name: 'D3 (b)', y: ardBY + 90 },
                { name: 'D4 (c)', y: ardBY + 120 },
                { name: 'D5 (d)', y: ardBY + 150 },
                { name: 'D6 (e)', y: ardBY + 180 },
                { name: 'D7 (f)', y: ardBY + 210 },
                { name: 'D8 (g)', y: ardBY + 240 },
                { name: 'D11 (DIG1)', y: ardBY + 300 },
                { name: 'D12 (DIG2)', y: ardBY + 330 },
                { name: 'D13 (DIG3)', y: ardBY + 360 },
              ].map((p) => (
                <g key={p.name}>
                  <circle
                    cx={ardBX + 260}
                    cy={p.y}
                    r="4"
                    className="pin-circle pin-used"
                  />
                  <text
                    x={ardBX + 250}
                    y={p.y + 4}
                    className="pin-text-header mono"
                    textAnchor="end"
                  >
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Pin GND */}
              <circle
                cx={ardBX + 30}
                cy={ardBY + 410}
                r="4"
                className="pin-circle"
              />
              <text
                x={ardBX + 40}
                y={ardBY + 414}
                className="pin-text-header mono"
              >
                GND COMÚN
              </text>
            </g>

            {/* 3. RESISTENCIAS DE SEGMENTO R_a .. R_g (1 kΩ) */}
            <g className="resistors-group">
              {['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((seg, idx) => {
                const y = resStartY + idx * resGap;
                return (
                  <g key={seg} className="resistor-item">
                    <rect
                      x={resX}
                      y={y - 8}
                      width={50}
                      height={16}
                      rx="2"
                      className="resistor-body"
                    />
                    <text
                      x={resX + 25}
                      y={y + 3}
                      className="resistor-text mono"
                      textAnchor="middle"
                    >
                      R_{seg} 1k
                    </text>
                  </g>
                );
              })}
            </g>

            {/* 4. TRES DISPLAYS F5101AH */}
            {[
              { id: 'DS1', label: 'DS1 CENTENAS', x: dispX },
              { id: 'DS2', label: 'DS2 DECENAS', x: dispX + dispGap },
              { id: 'DS3', label: 'DS3 UNIDADES', x: dispX + 2 * dispGap },
            ].map((d) => (
              <g key={d.id} className="display-module">
                <rect
                  x={d.x}
                  y={dispStartY}
                  width={dispWidth}
                  height={dispHeight}
                  rx="4"
                  className="display-case"
                />
                <text
                  x={d.x + dispWidth / 2}
                  y={dispStartY + 20}
                  className="display-name mono"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
                <text
                  x={d.x + dispWidth / 2}
                  y={dispStartY + 32}
                  className="display-type mono"
                  textAnchor="middle"
                >
                  F5101AH (Cát. C.)
                </text>

                {/* Pines COM (cátodo común) */}
                <circle
                  cx={d.x + 45}
                  cy={dispStartY + 10}
                  r="3"
                  className="pin-circle"
                />
                <text
                  x={d.x + 45}
                  y={dispStartY + 8}
                  className="pin-tag-text mono"
                  textAnchor="middle"
                >
                  COM (pin 3)
                </text>
              </g>
            ))}

            {/* 5. CABLES GENERADOS DESDE hardware.json.redes */}
            {HARDWARE.redes.map((net) => {
              const level = netLevel(net, ctx);
              const isHovered = hoveredNet?.nombre === net.nombre;
              const isHigh = level === 1;

              let strokeColor = 'var(--ink-2)';
              if (net.nombre === 'GND') {
                strokeColor = 'var(--line)';
              } else if (isHigh) {
                strokeColor = 'var(--signal)';
              }

              // Conectar pares de nodos consecutivos en la red
              const paths: string[] = [];
              for (let i = 0; i < net.nodos.length - 1; i++) {
                const n1 = net.nodos[i];
                const n2 = net.nodos[i + 1];
                const p1 = pinCoordinates[n1];
                const p2 = pinCoordinates[n2];
                if (p1 && p2) {
                  paths.push(buildOrthogonalPath(p1, p2));
                }
              }

              return (
                <g
                  key={net.nombre}
                  className="net-wire-group"
                  onMouseEnter={() => setHoveredNet(net)}
                  onMouseLeave={() => setHoveredNet(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {paths.map((dStr, pIdx) => (
                    <path
                      key={pIdx}
                      d={dStr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 3.5 : 2}
                      strokeDasharray={net.opcional ? '3 3' : undefined}
                      className="net-wire-path"
                    />
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Tooltip con información de la red física inspeccionada */}
      <div className="circuit-tooltip-card mono">
        {hoveredNet ? (
          <div className="net-tooltip-content">
            <span className="net-tooltip-title">RED: {hoveredNet.nombre}</span>
            <span className="net-tooltip-item">
              NIVEL LÓGICO:{' '}
              <strong
                className={netLevel(hoveredNet, ctx) === 1 ? 'val-high' : ''}
              >
                {netLevel(hoveredNet, ctx)}
              </strong>
            </span>
            <span className="net-tooltip-item">
              SEÑAL ASOCIADA: <strong>{hoveredNet.senal}</strong>
            </span>
            <span className="net-tooltip-nodes">
              NODOS: {hoveredNet.nodos.join(' ↔ ')}
            </span>
          </div>
        ) : (
          <div className="net-tooltip-empty">
            Pasa el cursor sobre cualquier cable de la netlist para inspeccionar
            origen, destino y nivel lógico en tiempo real.
          </div>
        )}
      </div>
    </div>
  );
};
