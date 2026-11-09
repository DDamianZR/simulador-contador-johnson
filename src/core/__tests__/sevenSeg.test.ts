import { describe, it, expect } from 'vitest';
import golden from '../../../docs/golden.json';
import { DIGITS, splitDecimal, segmentsFor, APAGADO } from '../sevenSeg';

describe('Seven Segment Core Logic', () => {
  it('DIGITS array matches golden.json patterns exactly', () => {
    expect(APAGADO).toBe(0x00);
    Object.entries(golden.sevenSeg.digitos).forEach(([digitStr, pattern]) => {
      const d = parseInt(digitStr, 10);
      expect(DIGITS[d]).toBe(pattern);
    });
  });

  it('splitDecimal reproduces golden.json.display for all 16 states', () => {
    golden.estados.forEach((item) => {
      const [c, d, u] = splitDecimal(item.dec);
      const expectedDisplay = item.display; // [c, d, u] where "" means blank (null)

      const actualDisplay = [
        c === null ? '' : c.toString(),
        d === null ? '' : d.toString(),
        u.toString(),
      ];

      expect(actualDisplay).toEqual(expectedDisplay);
    });
  });

  it('correctly suppresses leading zeros across the full 0..255 range', () => {
    expect(splitDecimal(0)).toEqual([null, null, 0]);
    expect(splitDecimal(9)).toEqual([null, null, 9]);
    expect(splitDecimal(10)).toEqual([null, 1, 0]);
    expect(splitDecimal(99)).toEqual([null, 9, 9]);
    expect(splitDecimal(100)).toEqual([1, 0, 0]);
    expect(splitDecimal(255)).toEqual([2, 5, 5]);
  });

  it('segmentsFor generates expected boolean segments [a..g]', () => {
    // Digit 0: 0x3F = 0b00111111 (a,b,c,d,e,f ON, g OFF)
    expect(segmentsFor(0)).toEqual([true, true, true, true, true, true, false]);

    // Digit 1: 0x06 = 0b00000110 (b,c ON)
    expect(segmentsFor(1)).toEqual([
      false,
      true,
      true,
      false,
      false,
      false,
      false,
    ]);

    // Digit 8: 0x7F (all ON)
    expect(segmentsFor(8)).toEqual([true, true, true, true, true, true, true]);

    // null / invalid: all OFF
    expect(segmentsFor(null)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(segmentsFor(12)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });
});
