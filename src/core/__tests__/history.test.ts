import { describe, it, expect } from 'vitest';
import { HistoryBuffer, DEFAULT_HISTORY_CAPACITY } from '../history';

describe('History Circular Buffer', () => {
  it('initializes empty with default capacity', () => {
    const hb = new HistoryBuffer();
    expect(hb.capacity).toBe(DEFAULT_HISTORY_CAPACITY);
    expect(hb.length).toBe(0);
    expect(hb.latest()).toBeUndefined();
    expect(hb.toArray()).toEqual([]);

    const hbNegative = new HistoryBuffer(-5);
    expect(hbNegative.capacity).toBe(DEFAULT_HISTORY_CAPACITY);
  });

  it('pushes and retrieves entries chronologically', () => {
    const hb = new HistoryBuffer(4);
    hb.push({ tick: 1, state: 0, rst: 1 });
    hb.push({ tick: 2, state: 1, rst: 1 });
    hb.push({ tick: 3, state: 3, rst: 1 });

    expect(hb.length).toBe(3);
    expect(hb.latest()).toEqual({ tick: 3, state: 3, rst: 1 });
    expect(hb.toArray()).toEqual([
      { tick: 1, state: 0, rst: 1 },
      { tick: 2, state: 1, rst: 1 },
      { tick: 3, state: 3, rst: 1 },
    ]);
  });

  it('wraps around circular buffer when capacity is exceeded', () => {
    const hb = new HistoryBuffer(3);
    hb.push({ tick: 1, state: 0, rst: 1 });
    hb.push({ tick: 2, state: 1, rst: 1 });
    hb.push({ tick: 3, state: 3, rst: 1 });
    hb.push({ tick: 4, state: 7, rst: 1 }); // overwrites tick 1

    expect(hb.length).toBe(3);
    expect(hb.latest()?.tick).toBe(4);
    expect(hb.toArray().map((e) => e.tick)).toEqual([2, 3, 4]);
  });

  it('clears correctly', () => {
    const hb = new HistoryBuffer(5);
    hb.push({ tick: 1, state: 0, rst: 0 });
    hb.clear();
    expect(hb.length).toBe(0);
    expect(hb.latest()).toBeUndefined();
    expect(hb.toArray()).toEqual([]);
  });
});
