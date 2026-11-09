export interface ClockOptions {
  hz: number; // 0.25 .. 8 Hz
  onEdge: () => void;
  onPhase?: (phase: number) => void;
}

export class SimulationClock {
  private hz: number;
  private running = false;
  private animFrameId: number | null = null;
  private lastTime: number | null = null;
  private accumulatedMs = 0;
  private readonly onEdge: () => void;
  private readonly onPhase?: (phase: number) => void;

  constructor(options: ClockOptions) {
    this.hz = Math.max(0.25, Math.min(8, options.hz));
    this.onEdge = options.onEdge;
    this.onPhase = options.onPhase;

    // Sincronización al cambiar de pestaña para evitar ráfagas
    if (typeof document !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );
    }
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.lastTime = null;
    } else {
      this.lastTime = performance.now();
      this.accumulatedMs = 0;
    }
  };

  setHz(hz: number): void {
    this.hz = Math.max(0.25, Math.min(8, hz));
  }

  getHz(): number {
    return this.hz;
  }

  isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulatedMs = 0;
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.lastTime = null;
  }

  private loop = (): void => {
    if (!this.running) return;

    const now = performance.now();
    if (this.lastTime === null) {
      this.lastTime = now;
    }

    const deltaMs = now - this.lastTime;
    this.lastTime = now;

    // Si deltaMs es excesivo (p. ej. suspensión o tab en segundo plano), acotar
    const safeDeltaMs = Math.min(deltaMs, 2000);
    const periodMs = 1000 / this.hz;

    this.accumulatedMs += safeDeltaMs;

    if (this.accumulatedMs >= periodMs) {
      // Disparar flanco
      this.accumulatedMs %= periodMs;
      this.onEdge();
    }

    if (this.onPhase) {
      const phase = Math.min(1, Math.max(0, this.accumulatedMs / periodMs));
      this.onPhase(phase);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  dispose(): void {
    this.stop();
    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );
    }
  }
}
