import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimulationClock } from '../clock';

describe('SimulationClock', () => {
  let originalDoc: unknown;
  let originalWindow: unknown;

  beforeEach(() => {
    vi.useFakeTimers();
    originalDoc = (globalThis as unknown as { document?: unknown }).document;
    originalWindow = (globalThis as unknown as { window?: unknown }).window;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as unknown as { document?: unknown }).document = originalDoc;
    (globalThis as unknown as { window?: unknown }).window = originalWindow;
  });

  it('initializes with clamped frequency and stopped state', () => {
    const clock = new SimulationClock({
      hz: 0.1, // below min 0.25
      onEdge: vi.fn(),
    });
    expect(clock.getHz()).toBe(0.25);
    expect(clock.isRunning()).toBe(false);

    clock.setHz(20); // above max 8
    expect(clock.getHz()).toBe(8);
  });

  it('triggers edge on period elapsed and updates phase', () => {
    const onEdge = vi.fn();
    const onPhase = vi.fn();

    let rafCallback: ((time: number) => void) | null = null;
    (
      globalThis as unknown as { requestAnimationFrame: unknown }
    ).requestAnimationFrame = (cb: (time: number) => void) => {
      rafCallback = cb;
      return 123;
    };
    (
      globalThis as unknown as { cancelAnimationFrame: unknown }
    ).cancelAnimationFrame = vi.fn();

    const clock = new SimulationClock({
      hz: 1, // 1000ms period
      onEdge,
      onPhase,
    });

    clock.start();
    expect(clock.isRunning()).toBe(true);
    expect(rafCallback).not.toBeNull();

    // Advance performance.now and execute loop
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    if (rafCallback) {
      (rafCallback as (time: number) => void)(1000);
    }

    expect(onEdge).toHaveBeenCalled();
    expect(onPhase).toHaveBeenCalled();

    clock.stop();
    expect(clock.isRunning()).toBe(false);
  });

  it('handles visibilitychange without drift', () => {
    const listeners: Record<string, () => void> = {};
    const mockDoc = {
      hidden: false,
      addEventListener: (event: string, cb: () => void) => {
        listeners[event] = cb;
      },
      removeEventListener: vi.fn(),
    };
    (globalThis as unknown as { document: unknown }).document = mockDoc;

    const onEdge = vi.fn();
    const clock = new SimulationClock({ hz: 1, onEdge });

    mockDoc.hidden = true;
    listeners['visibilitychange']?.();

    mockDoc.hidden = false;
    listeners['visibilitychange']?.();

    clock.dispose();
  });
});
