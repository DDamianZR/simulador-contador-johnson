import { describe, it, expect } from 'vitest';
import golden from '../../../docs/golden.json';
import {
  reset,
  step,
  serialInput,
  bit,
  sequence,
  stepIndex,
  toBinaryString,
  PERIOD,
  N_BITS,
} from '../johnson';

describe('Johnson Core Logic', () => {
  it('reset() yields state 0', () => {
    expect(reset()).toBe(0);
  });

  it('sequence() matches golden.json byte by byte and state by state', () => {
    const seq = sequence();
    expect(seq.length).toBe(PERIOD);

    golden.estados.forEach((expected, i) => {
      const state = seq[i];
      expect(state).toBe(expected.dec);
      expect(toBinaryString(state)).toBe(expected.bits);
      expect(stepIndex(state)).toBe(expected.paso);
    });
  });

  it('has exact period of 16 without repetitions before cycle completes', () => {
    let s = reset();
    const seen = new Set<number>();

    for (let i = 0; i < PERIOD; i++) {
      expect(seen.has(s)).toBe(false);
      seen.add(s);
      s = step(s);
    }

    expect(s).toBe(reset());
    expect(seen.size).toBe(PERIOD);
  });

  it('satisfies Johnson Hamming distance property: exactly 1 bit changes per step', () => {
    let s = reset();
    for (let i = 0; i < PERIOD; i++) {
      const next = step(s);
      const diff = s ^ next;
      // Hammin distance is 1 <=> diff is a power of 2
      expect(diff).toBeGreaterThan(0);
      expect((diff & (diff - 1)) === 0).toBe(true);
      s = next;
    }
  });

  it('correctly calculates serialInput(s) as NOT(Q7)', () => {
    expect(serialInput(0)).toBe(1); // bit 7 is 0 -> NOT 0 = 1
    expect(serialInput(127)).toBe(1); // bit 7 is 0 -> NOT 0 = 1
    expect(serialInput(128)).toBe(0); // bit 7 is 1 -> NOT 1 = 0
    expect(serialInput(255)).toBe(0); // bit 7 is 1 -> NOT 1 = 0
  });

  it('handles bit accessor and bounds safely', () => {
    // 0b10000001 = 129
    expect(bit(129, 0)).toBe(1);
    expect(bit(129, 1)).toBe(0);
    expect(bit(129, 7)).toBe(1);
    expect(bit(129, -1)).toBe(0);
    expect(bit(129, 8)).toBe(0);
  });

  it('handles invalid states deterministically with stepIndex returning null', () => {
    const invalidState = 0b01010101; // 85 (alternating bits, not in standard Johnson cycle)
    expect(stepIndex(invalidState)).toBeNull();

    // step should still operate deterministically according to hardware logic
    // bit 7 is 0 -> serialInput = 1
    // (85 << 1) & 0xFE = (170 & 254) = 170 = 0b10101010
    // next = 170 | 1 = 171 = 0b10101011
    const next = step(invalidState);
    expect(next).toBe(0b10101011);
    expect(stepIndex(next)).toBeNull();
  });

  it('constants match architecture', () => {
    expect(N_BITS).toBe(8);
    expect(PERIOD).toBe(16);
  });
});
