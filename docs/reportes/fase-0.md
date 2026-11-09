# Reporte Fase 0 — Scaffold y Entorno Base

**Rol responsable:** UX Engineer  
**Fecha:** 2026-10-23  
**Estado:** Completado exitosamente  

---

## 1. Qué se hizo
- **Scaffold del proyecto:** Se inicializó la aplicación con Vite, React 18 (`18.3.1`), TypeScript en modo estricto (`strict: true`), ESLint flat config (`eslint.config.js`), Prettier (`.prettierrc`) y Vitest con cobertura V8.
- **Tipografías y fuentes:** Instalación e integración offline de `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`.
- **Diseño y variables CSS (`src/styles/tokens.css`):**
  - Implementación de la paleta Scientific / Minimal en modos claro y oscuro (`--paper`, `--ink`, `--ink-2`, `--grid`, `--line`, `--signal`, `--signal-soft`, `--seg-off`).
  - Detección automática por `prefers-color-scheme` y persistencia manual mediante el atributo `data-theme` en `<html>` y `localStorage`.
  - Soporte de accesibilidad para `prefers-reduced-motion` y estilos de números monoespaciados con `font-variant-numeric: tabular-nums`.
- **Estructura arquitectónica modular:**
  - `src/core/`: `johnson.ts`, `sevenSeg.ts`, `netlist.ts`, `history.ts` y test inicial en `__tests__/setup.test.ts`.
  - `src/sim/`: `clock.ts`, `useSimulation.ts`.
  - `src/views/`: `CircuitView/`, `LogicView/`, `TimingView/`, `DisplayPanel/`.
  - `src/ui/`: `index.ts`.
- **Página base (`src/App.tsx`):**
  - Encabezado con título `"Contador Johnson · 8 bits"` y subtítulo `"Práctica 5 · 2×Arduino Uno · 3×F5101AH"`.
  - Botón selector de tema con atajo de teclado (`T`).
  - Tarjeta de presentación de arquitectura con los 4 bloques del simulador.

---

## 2. Qué se verificó
- **Servidor de desarrollo:** `npm run dev` arranca de inmediato (257 ms) sin advertencias.
- **Linter:** `npm run lint` pasa en limpio (0 errores, 0 warnings).
- **Pruebas unitarias:** `npm test` y `npm run test:cov` corren en Vitest con 100 % de éxito.
- **Compilación de producción:** `npm run build` (`tsc -b && vite build`) genera los bundles y fuentes en `dist/` sin ningún error de tipos ni advertencias.
- **Cambio de tema:** Verificado el selector manual y la clase / atributo `data-theme`.

---

## 3. Dudas identificadas en las fuentes
- Ninguna discrepancia bloqueante. `docs/golden.json`, `docs/hardware.json` y los dos sketches `.ino` están completamente alineados:
  - Arduino A ejecuta el registro de 8 flip-flops D con retroalimentación invertida `!ff[7] -> ff[0]`.
  - La secuencia produce exactamente 16 estados cíclicos (0 → 1 → 3 → 7 → 15 → 31 → 63 → 127 → 255 → 254 → 252 → 248 → 240 → 224 → 192 → 128 → 0).
  - Arduino B multiplexa directamente los 3 dígitos F5101AH con lógica de cátodo común activo en LOW y ceros no significativos apagados.
