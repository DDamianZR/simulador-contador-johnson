import React from 'react';
import { segmentsFor } from '../../core/sevenSeg';

interface Digit7SegProps {
  digit: number | null; // null = apagado
  active?: boolean; // para modo multiplexado: si este dígito está recibiendo cátodo
  label: string; // 'CENT', 'DEC', 'UNID'
  pinName: string; // 'D11', 'D12', 'D13'
}

export const Digit7Seg: React.FC<Digit7SegProps> = ({
  digit,
  active = true,
  label,
  pinName,
}) => {
  // Si está multiplexado y este dígito no está activo, todos los segmentos se ven apagados
  const segs = active
    ? segmentsFor(digit)
    : [false, false, false, false, false, false, false];

  return (
    <div className={`digit-unit ${active ? 'digit-active' : 'digit-inactive'}`}>
      <div className="digit-svg-container">
        <svg
          viewBox="0 0 72 112"
          className="seven-seg-svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Dígito ${label}: ${digit !== null ? digit : 'apagado'}`}
        >
          <g transform="skewX(-4) translate(6, 0)">
            {/* Segmento a */}
            <polygon
              points="14,10 19,6 49,6 54,10 49,14 19,14"
              className={`seg ${segs[0] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento b */}
            <polygon
              points="55,12 59,16 59,48 55,52 51,48 51,16"
              className={`seg ${segs[1] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento c */}
            <polygon
              points="55,54 59,58 59,92 55,96 51,92 51,58"
              className={`seg ${segs[2] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento d */}
            <polygon
              points="14,98 19,94 49,94 54,98 49,102 19,102"
              className={`seg ${segs[3] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento e */}
            <polygon
              points="13,54 17,58 17,92 13,96 9,92 9,58"
              className={`seg ${segs[4] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento f */}
            <polygon
              points="13,12 17,16 17,48 13,52 9,48 9,16"
              className={`seg ${segs[5] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Segmento g */}
            <polygon
              points="14,53 19,49 49,49 54,53 49,57 19,57"
              className={`seg ${segs[6] ? 'seg-on' : 'seg-off'}`}
            />
            {/* Punto decimal (DP) siempre visible pero apagado */}
            <circle cx="64" cy="98" r="3.2" className="seg seg-off" />
          </g>
        </svg>
      </div>

      <div className="digit-footer mono">
        <span className="digit-pos">{label}</span>
        <span className="digit-pin">B.{pinName}</span>
      </div>
    </div>
  );
};
