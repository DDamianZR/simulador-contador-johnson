import { State } from './johnson';

export interface HistoryEntry {
  readonly tick: number;
  readonly state: State;
  readonly rst: 0 | 1; // 1 = reposo (inactivo), 0 = pulso de reset activo
}

export const DEFAULT_HISTORY_CAPACITY = 64;

export class HistoryBuffer {
  private readonly buffer: (HistoryEntry | undefined)[];
  private head = 0;
  private count = 0;
  readonly capacity: number;

  constructor(capacity = DEFAULT_HISTORY_CAPACITY) {
    this.capacity = capacity > 0 ? capacity : DEFAULT_HISTORY_CAPACITY;
    this.buffer = new Array(this.capacity);
  }

  push(entry: HistoryEntry): void {
    this.buffer[this.head] = entry;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  get length(): number {
    return this.count;
  }

  clear(): void {
    this.head = 0;
    this.count = 0;
    for (let i = 0; i < this.capacity; i++) {
      this.buffer[i] = undefined;
    }
  }

  /**
   * Retorna las entradas ordenadas cronológicamente (de la más antigua a la más reciente).
   */
  toArray(): HistoryEntry[] {
    const result: HistoryEntry[] = [];
    if (this.count === 0) return result;

    const start =
      this.count < this.capacity
        ? 0
        : (this.head - this.count + this.capacity) % this.capacity;

    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      const item = this.buffer[idx];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Retorna la entrada más reciente o undefined si está vacío.
   */
  latest(): HistoryEntry | undefined {
    if (this.count === 0) return undefined;
    const lastIdx = (this.head - 1 + this.capacity) % this.capacity;
    return this.buffer[lastIdx];
  }
}
