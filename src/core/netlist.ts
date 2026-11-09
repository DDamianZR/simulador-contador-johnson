import hardwareJson from '../../docs/hardware.json';
import { State, bit } from './johnson';
import { splitDecimal, segmentsFor } from './sevenSeg';

export interface ComponentItem {
  id: string;
  tipo: string;
  rol?: string;
  pinesUsados?: string[];
  posicion?: 'centenas' | 'decenas' | 'unidades';
  catodoComun?: boolean;
  pinout?: Record<string, string>;
  valor?: string;
  opcional?: boolean;
  nota?: string;
  registroInterno?: {
    bits: number;
    entradaSerial: string;
    descripcion: string;
  };
}

export interface NetItem {
  nombre: string;
  senal: string;
  nodos: string[];
  opcional?: boolean;
}

export interface HardwareNetlist {
  descripcion: string;
  componentes: ComponentItem[];
  redes: NetItem[];
  senales: Record<string, string>;
}

export const HARDWARE: HardwareNetlist =
  hardwareJson as unknown as HardwareNetlist;

export interface SimulationContext {
  state: State;
  clk?: 0 | 1;
  rst_n?: 0 | 1; // 1 = pull-up inactivo, 0 = presionado
  activeDigit?: 0 | 1 | 2 | null; // 0=centenas (D11), 1=decenas (D12), 2=unidades (D13)
}

const SEGMENT_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

/**
 * Calcula el nivel lógico (0 o 1) de una red física en función del contexto de simulación.
 */
export function netLevel(net: NetItem, ctx: SimulationContext): 0 | 1 {
  const { senal } = net;

  if (senal === 'const_low') {
    return 0;
  }

  if (senal === 'clk') {
    return ctx.clk ?? 0;
  }

  if (senal === 'reset_n') {
    return ctx.rst_n ?? 1;
  }

  if (senal.startsWith('q')) {
    const bitNum = parseInt(senal.slice(1), 10);
    if (!isNaN(bitNum) && bitNum >= 0 && bitNum <= 7) {
      return bit(ctx.state, bitNum);
    }
  }

  if (senal.startsWith('seg_')) {
    const segChar = senal.slice(4);
    const segIdx = SEGMENT_NAMES.indexOf(segChar);
    if (segIdx >= 0) {
      if (ctx.activeDigit === null || ctx.activeDigit === undefined) {
        return 0;
      }
      const digits = splitDecimal(ctx.state);
      const digitVal = digits[ctx.activeDigit];
      const segs = segmentsFor(digitVal);
      return segs[segIdx] ? 1 : 0;
    }
  }

  if (senal === 'dig1_n') {
    // Cátodo activo en LOW (0) para centenas
    return ctx.activeDigit === 0 ? 0 : 1;
  }

  if (senal === 'dig2_n') {
    // Cátodo activo en LOW (0) para decenas
    return ctx.activeDigit === 1 ? 0 : 1;
  }

  if (senal === 'dig3_n') {
    // Cátodo activo en LOW (0) para unidades
    return ctx.activeDigit === 2 ? 0 : 1;
  }

  return 0;
}
