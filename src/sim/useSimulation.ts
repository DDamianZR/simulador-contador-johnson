import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  State,
  reset as coreReset,
  step as coreStep,
  sequence,
} from '../core/johnson';
import { HistoryBuffer, HistoryEntry } from '../core/history';
import { SimulationClock } from './clock';

export interface UseSimulationReturn {
  state: State;
  tick: number;
  running: boolean;
  hz: number;
  rst: 0 | 1;
  history: HistoryEntry[];
  phase: number;
  ringMode: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepOnce: () => void;
  reset: () => void;
  setHz: (hz: number) => void;
  jumpTo: (stepIdx: number) => void;
  injectState: (s: State) => void;
  toggleRingMode: () => void;
}

export function useSimulation(initialHz = 1): UseSimulationReturn {
  const [state, setState] = useState<State>(() => coreReset());
  const [tick, setTick] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [hz, setHzState] = useState<number>(initialHz);
  const [rst, setRst] = useState<0 | 1>(1);
  const [phase, setPhase] = useState<number>(0);
  const [ringMode, setRingMode] = useState<boolean>(false);

  const historyBufferRef = useRef<HistoryBuffer>(new HistoryBuffer(64));
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const ringModeRef = useRef(ringMode);
  ringModeRef.current = ringMode;

  const clockRef = useRef<SimulationClock | null>(null);

  const syncHistory = useCallback(() => {
    setHistoryEntries(historyBufferRef.current.toArray());
  }, []);

  const executeStep = useCallback(() => {
    let nextState: State;
    if (ringModeRef.current) {
      // Modo Anillo sin inversor: entrada = Q7 directo
      const q7 = (stateRef.current >> 7) & 1;
      nextState = (((stateRef.current << 1) & 0xfe) | q7) & 0xff;
    } else {
      // Modo Johnson estándar con inversor: entrada = !Q7
      nextState = coreStep(stateRef.current);
    }

    const nextTick = tickRef.current + 1;

    setState(nextState);
    setTick(nextTick);
    setRst(1);

    historyBufferRef.current.push({
      tick: nextTick,
      state: nextState,
      rst: 1,
    });
    syncHistory();
  }, [syncHistory]);

  useEffect(() => {
    const clock = new SimulationClock({
      hz,
      onEdge: () => {
        executeStep();
      },
      onPhase: (p) => {
        setPhase(p);
      },
    });
    clockRef.current = clock;

    if (running) {
      clock.start();
    }

    return () => {
      clock.dispose();
    };
  }, [hz, executeStep, running]);

  useEffect(() => {
    historyBufferRef.current.push({
      tick: 0,
      state: 0,
      rst: 0,
    });
    syncHistory();
  }, [syncHistory]);

  const play = useCallback(() => {
    setRunning(true);
    clockRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    clockRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (running) {
      pause();
    } else {
      play();
    }
  }, [running, play, pause]);

  const stepOnce = useCallback(() => {
    if (running) {
      pause();
    }
    executeStep();
  }, [running, pause, executeStep]);

  const reset = useCallback(() => {
    const nextState = coreReset();
    const nextTick = tickRef.current + 1;

    setState(nextState);
    setTick(nextTick);
    setRst(0);

    historyBufferRef.current.push({
      tick: nextTick,
      state: nextState,
      rst: 0,
    });
    syncHistory();

    setTimeout(() => {
      setRst(1);
    }, 150);
  }, [syncHistory]);

  const setHz = useCallback((newHz: number) => {
    const clamped = Math.max(0.25, Math.min(8, newHz));
    setHzState(clamped);
    clockRef.current?.setHz(clamped);
  }, []);

  const jumpTo = useCallback(
    (stepIdx: number) => {
      const seq = sequence();
      if (stepIdx >= 0 && stepIdx < seq.length) {
        const nextState = seq[stepIdx];
        const nextTick = tickRef.current + 1;

        setState(nextState);
        setTick(nextTick);
        setRst(1);

        historyBufferRef.current.push({
          tick: nextTick,
          state: nextState,
          rst: 1,
        });
        syncHistory();
      }
    },
    [syncHistory]
  );

  const injectState = useCallback(
    (s: State) => {
      const validState = s & 0xff;
      const nextTick = tickRef.current + 1;

      setState(validState);
      setTick(nextTick);
      setRst(1);

      historyBufferRef.current.push({
        tick: nextTick,
        state: validState,
        rst: 1,
      });
      syncHistory();
    },
    [syncHistory]
  );

  const toggleRingMode = useCallback(() => {
    setRingMode((prev) => !prev);
  }, []);

  return useMemo(
    () => ({
      state,
      tick,
      running,
      hz,
      rst,
      history: historyEntries,
      phase,
      ringMode,
      play,
      pause,
      toggle,
      stepOnce,
      reset,
      setHz,
      jumpTo,
      injectState,
      toggleRingMode,
    }),
    [
      state,
      tick,
      running,
      hz,
      rst,
      historyEntries,
      phase,
      ringMode,
      play,
      pause,
      toggle,
      stepOnce,
      reset,
      setHz,
      jumpTo,
      injectState,
      toggleRingMode,
    ]
  );
}
