import { describe, it, expect } from 'vitest';
import hardware from '../../../docs/hardware.json';
import { HARDWARE, netLevel, NetItem } from '../netlist';

describe('Netlist and Hardware Validation', () => {
  it('HARDWARE object matches hardware.json', () => {
    expect(HARDWARE.componentes.length).toBe(hardware.componentes.length);
    expect(HARDWARE.redes.length).toBe(hardware.redes.length);
  });

  it('no node is repeated within any single net (no self-loops / redundant connections)', () => {
    HARDWARE.redes.forEach((net) => {
      const nodeSet = new Set<string>();
      net.nodos.forEach((node) => {
        expect(nodeSet.has(node)).toBe(false);
        nodeSet.add(node);
      });
    });
  });

  it('verifies that each referenced pin corresponds to a valid component format', () => {
    const validComponentIds = new Set(HARDWARE.componentes.map((c) => c.id));
    HARDWARE.redes.forEach((net) => {
      net.nodos.forEach((node) => {
        const [compId, pinId] = node.split('.');
        expect(validComponentIds.has(compId)).toBe(true);
        expect(pinId).toBeDefined();
        expect(pinId.length).toBeGreaterThan(0);
      });
    });
  });

  it('correctly evaluates netLevel for const_low, clk, reset_n, and qN', () => {
    const constLowNet: NetItem = {
      nombre: 'GND',
      senal: 'const_low',
      nodos: [],
    };
    expect(netLevel(constLowNet, { state: 255 })).toBe(0);

    const clkNet: NetItem = { nombre: 'CLK', senal: 'clk', nodos: [] };
    expect(netLevel(clkNet, { state: 0, clk: 1 })).toBe(1);
    expect(netLevel(clkNet, { state: 0, clk: 0 })).toBe(0);

    const rstNet: NetItem = {
      nombre: 'RESET_N',
      senal: 'reset_n',
      nodos: [],
    };
    expect(netLevel(rstNet, { state: 0, rst_n: 0 })).toBe(0);
    expect(netLevel(rstNet, { state: 0, rst_n: 1 })).toBe(1);
    expect(netLevel(rstNet, { state: 0 })).toBe(1); // default pull-up 1

    const q0Net: NetItem = { nombre: 'Q0', senal: 'q0', nodos: [] };
    const q7Net: NetItem = { nombre: 'Q7', senal: 'q7', nodos: [] };
    // state 127 = 0b01111111 -> Q0=1, Q7=0
    expect(netLevel(q0Net, { state: 127 })).toBe(1);
    expect(netLevel(q7Net, { state: 127 })).toBe(0);
    // state 128 = 0b10000000 -> Q0=0, Q7=1
    expect(netLevel(q0Net, { state: 128 })).toBe(0);
    expect(netLevel(q7Net, { state: 128 })).toBe(1);
  });

  it('correctly evaluates netLevel for segment and digit signals', () => {
    // state 127 -> [1, 2, 7]
    // centenas = 1, decenas = 2, unidades = 7
    const segANet: NetItem = { nombre: 'SEG_a', senal: 'seg_a', nodos: [] };
    const segBNet: NetItem = { nombre: 'SEG_b', senal: 'seg_b', nodos: [] };
    const dig1Net: NetItem = { nombre: 'DIG1', senal: 'dig1_n', nodos: [] };
    const dig2Net: NetItem = { nombre: 'DIG2', senal: 'dig2_n', nodos: [] };

    // When activeDigit is 0 (centenas, digit value is 1)
    // 1 has segments: b, c (a is 0)
    expect(netLevel(segANet, { state: 127, activeDigit: 0 })).toBe(0);
    expect(netLevel(segBNet, { state: 127, activeDigit: 0 })).toBe(1);
    expect(netLevel(dig1Net, { state: 127, activeDigit: 0 })).toBe(0); // active LOW
    expect(netLevel(dig2Net, { state: 127, activeDigit: 0 })).toBe(1); // inactive HIGH

    // When activeDigit is null (e.g. all digits off during dead time)
    expect(netLevel(segANet, { state: 127, activeDigit: null })).toBe(0);

    // dig3_n: active for units (activeDigit === 2)
    const dig3Net: NetItem = { nombre: 'DIG3', senal: 'dig3_n', nodos: [] };
    expect(netLevel(dig3Net, { state: 127, activeDigit: 2 })).toBe(0); // active LOW
    expect(netLevel(dig3Net, { state: 127, activeDigit: 1 })).toBe(1); // inactive HIGH

    // Unknown signal / segment fallback
    const unknownNet: NetItem = {
      nombre: 'UNKNOWN',
      senal: 'foo_bar',
      nodos: [],
    };
    expect(netLevel(unknownNet, { state: 0 })).toBe(0);
    const unknownSegNet: NetItem = {
      nombre: 'SEG_X',
      senal: 'seg_z',
      nodos: [],
    };
    expect(netLevel(unknownSegNet, { state: 0 })).toBe(0);
  });
});
