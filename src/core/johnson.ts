export type State = number; // 0..255, bit0 = ff[0] = Arduino A D2 ... bit7 = ff[7] = Arduino A D9

export const N_BITS = 8;
export const PERIOD = 16;

/**
 * Retorna el estado inicial del contador tras un reset (todos los flip-flops en 0).
 */
export function reset(): State {
  return 0;
}

/**
 * Retorna el valor de entrada serie que entrará a ff[0] en el próximo flanco: NOT(ff[7]).
 */
export function serialInput(s: State): 0 | 1 {
  return (((s >> (N_BITS - 1)) & 1) ^ 1) as 0 | 1;
}

/**
 * Retorna el siguiente estado aplicando el desplazamiento con retroalimentación invertida:
 * ff[i] = ff[i-1], ff[0] = NOT ff[7].
 */
export function step(s: State): State {
  const nextInput = serialInput(s);
  return (((s << 1) & 0xfe) | nextInput) & 0xff;
}

/**
 * Retorna el bit i-ésimo del estado (0..7).
 */
export function bit(s: State, i: number): 0 | 1 {
  if (i < 0 || i >= N_BITS) return 0;
  return ((s >> i) & 1) as 0 | 1;
}

// Secuencia precomputada de los 16 estados estándar
const PRECOMPUTED_SEQUENCE: readonly State[] = (() => {
  const seq: number[] = [0];
  let cur = 0;
  for (let i = 1; i < PERIOD; i++) {
    cur = step(cur);
    seq.push(cur);
  }
  return Object.freeze(seq);
})();

/**
 * Retorna la secuencia completa de los 16 estados del contador Johnson partiendo de 0.
 */
export function sequence(): State[] {
  return [...PRECOMPUTED_SEQUENCE];
}

/**
 * Retorna el índice de paso (0..15) del estado dentro del ciclo estándar,
 * o null si se trata de un estado inválido fuera del ciclo Johnson principal.
 */
export function stepIndex(s: State): number | null {
  const idx = PRECOMPUTED_SEQUENCE.indexOf(s);
  return idx >= 0 ? idx : null;
}

/**
 * Convierte el estado a una cadena binaria de 8 caracteres 'Q7..Q0' (MSB a la izquierda).
 */
export function toBinaryString(s: State): string {
  let str = '';
  for (let i = N_BITS - 1; i >= 0; i--) {
    str += ((s >> i) & 1).toString();
  }
  return str;
}
