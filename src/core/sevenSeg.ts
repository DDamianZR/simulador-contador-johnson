/**
 * Patrones por dígito idénticos al arreglo NUMEROS[] del sketch Arduino B:
 * bit 0 = a ... bit 6 = g (1 = encendido, cátodo común)
 */
export const DIGITS: readonly number[] = Object.freeze([
  0x3f, // 0: a b c d e f
  0x06, // 1: b c
  0x5b, // 2: a b d e g
  0x4f, // 3: a b c d g
  0x66, // 4: b c f g
  0x6d, // 5: a c d f g
  0x7d, // 6: a c d e f g
  0x07, // 7: a b c
  0x7f, // 8: todos (a b c d e f g)
  0x6f, // 9: a b c d f g
]);

export const APAGADO = 0x00;

/**
 * Descompone un valor (0..255) en [centenas, decenas, unidades].
 * Aplica la lógica idéntica de Arduino B:
 * - Si centenas == 0: apagado (null)
 * - Si centenas == 0 y decenas == 0: apagado (null)
 * - Unidades siempre muestra dígito.
 */
export function splitDecimal(
  v: number
): [number | null, number | null, number] {
  const clamped = Math.max(0, Math.min(255, Math.floor(v)));
  const c = Math.floor(clamped / 100);
  const d = Math.floor((clamped / 10) % 10);
  const u = clamped % 10;

  return [c === 0 ? null : c, c === 0 && d === 0 ? null : d, u];
}

/**
 * Devuelve un arreglo de 7 booleanos [a, b, c, d, e, f, g] indicando
 * si cada segmento debe estar encendido (true) o apagado (false).
 */
export function segmentsFor(d: number | null): boolean[] {
  if (d === null || d < 0 || d > 9) {
    return [false, false, false, false, false, false, false];
  }
  const pattern = DIGITS[d];
  return [
    (pattern & (1 << 0)) !== 0, // a
    (pattern & (1 << 1)) !== 0, // b
    (pattern & (1 << 2)) !== 0, // c
    (pattern & (1 << 3)) !== 0, // d
    (pattern & (1 << 4)) !== 0, // e
    (pattern & (1 << 5)) !== 0, // f
    (pattern & (1 << 6)) !== 0, // g
  ];
}
