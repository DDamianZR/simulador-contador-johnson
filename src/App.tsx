import React, { useEffect, useState, useCallback } from 'react';
import { useSimulation } from './sim/useSimulation';
import { ControlBar, ShortcutsHelp, TheoryPanel } from './ui';
import { CircuitView } from './views/CircuitView';
import { LogicView } from './views/LogicView';
import { TimingView } from './views/TimingView';
import { DisplayPanel } from './views/DisplayPanel';

type Theme = 'light' | 'dark';
type MainTab = 'circuito' | 'logica';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sim-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('circuito');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sim = useSimulation(1);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sim-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          sim.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          sim.stepOnce();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          sim.reset();
          break;
        case '+':
        case '=':
          e.preventDefault();
          sim.setHz(Math.min(8, sim.hz + 0.25));
          break;
        case '-':
        case '_':
          e.preventDefault();
          sim.setHz(Math.max(0.25, sim.hz - 0.25));
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTheme();
          break;
        case '1':
          setActiveMainTab('circuito');
          break;
        case '2':
          setActiveMainTab('logica');
          break;
        case '?':
          e.preventDefault();
          setIsHelpOpen((prev) => !prev);
          break;
        case 'Escape':
          setIsHelpOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sim, toggleTheme]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-titles">
          <h1 className="header-title">Contador Johnson · 8 bits</h1>
          <p className="header-subtitle">
            Práctica 5 · 2×Arduino Uno · 3×F5101AH (Cátodo Común)
          </p>
        </div>
        <div className="header-actions">
          <span className="status-badge">
            <span className="active-indicator" />
            FLANCOS: <strong className="mono">{sim.tick}</strong>
          </span>
          <button
            type="button"
            className="btn-theme"
            onClick={toggleTheme}
            aria-label="Cambiar tema visual"
          >
            TEMA: {theme.toUpperCase()} (T)
          </button>
        </div>
      </header>

      {/* Barra de control principal con telemetría */}
      <ControlBar
        state={sim.state}
        running={sim.running}
        hz={sim.hz}
        ringMode={sim.ringMode}
        onTogglePlay={sim.toggle}
        onStep={sim.stepOnce}
        onReset={sim.reset}
        onHzChange={sim.setHz}
        onToggleRingMode={sim.toggleRingMode}
        onInjectInvalid={() => sim.injectState(0b01010101)} // dec 85
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Grid bifásico desktop: Vista Principal (Izquierda) + Display/Tabla (Derecha) */}
      <div className="main-dashboard-grid">
        <section className="dashboard-left-col">
          <nav className="tabs-nav" aria-label="Selector de esquema principal">
            <button
              type="button"
              className={`tab-btn ${activeMainTab === 'circuito' ? 'tab-active' : ''}`}
              onClick={() => setActiveMainTab('circuito')}
            >
              1. CIRCUITO FÍSICO (NETLIST)
            </button>
            <button
              type="button"
              className={`tab-btn ${activeMainTab === 'logica' ? 'tab-active' : ''}`}
              onClick={() => setActiveMainTab('logica')}
            >
              2. CIRCUITO LÓGICO (8 FF D + NOT)
            </button>
          </nav>

          <div className="primary-view-container">
            {activeMainTab === 'circuito' && (
              <CircuitView
                state={sim.state}
                clk={sim.phase > 0 && sim.phase < 0.25 ? 1 : 0}
                rst={sim.rst}
              />
            )}
            {activeMainTab === 'logica' && (
              <LogicView
                state={sim.state}
                tick={sim.tick}
                rst={sim.rst}
                phase={sim.phase}
                onBitClick={(bitIdx) =>
                  sim.injectState(sim.state ^ (1 << bitIdx))
                }
              />
            )}
          </div>
        </section>

        <section className="dashboard-right-col">
          <DisplayPanel state={sim.state} onJumpTo={sim.jumpTo} />
        </section>
      </div>

      {/* Carta de tiempos inferior a todo lo ancho */}
      <section className="dashboard-bottom-row">
        <TimingView history={sim.history} currentTick={sim.tick} />
      </section>

      {/* Panel colapsable de teoría */}
      <TheoryPanel />

      {/* Modal de ayuda */}
      <ShortcutsHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default App;
