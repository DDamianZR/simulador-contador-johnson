# Reporte Fase 1 — Núcleo Lógico

**Rol responsable:** Core Engineer  
**Fecha:** 2026-10-23  
**Estado:** Completado exitosamente  

---

## 1. Qué se hizo
- **`src/core/johnson.ts`:**
  - Implementación de tipos (`State`), constantes (`N_BITS = 8`, `PERIOD = 16`).
  - Funciones puras: `reset()`, `step(s)`, `serialInput(s)`, `bit(s, i)`, `stepIndex(s)`, `sequence()`, `toBinaryString(s)`.
  - Desplazamiento fiel a `ArduinoA_Contador_Johnson.ino`: entrada serial `NOT(Q7)` con corrimiento hacia la izquierda y bit 0 actualizado.
- **`src/core/sevenSeg.ts`:**
  - Definición estricta de `DIGITS` coincidente con `NUMEROS[]` de `ArduinoB_Display_3digitos.ino` (bit0=a … bit6=g).
  - Función `splitDecimal(v)` que implementa la supresión de ceros a la izquierda idéntica al sketch real.
  - Función `segmentsFor(d)` que produce el vector de 7 booleanos `[a..g]`.
- **`src/core/history.ts`:**
  - Implementación de `HistoryBuffer` circular con capacidad por defecto de 64 entradas `{ tick, state, rst }`.
  - Métodos `push()`, `toArray()`, `latest()`, `clear()`.
- **`src/core/netlist.ts`:**
  - Carga e inferencia de tipos de `docs/hardware.json`.
  - Función `netLevel(net, ctx)` que evalúa el nivel 0 o 1 para todas las señales (`const_low`, `clk`, `reset_n`, `q0..q7`, `seg_a..seg_g`, `dig1_n..dig3_n`).
- **Pruebas unitarias (`src/core/__tests__/`):**
  - Pruebas exhaustivas contra `docs/golden.json` (16 estados, bits y valores decimales).
  - Verificación de la propiedad de distancia Hamming unitaria en cada transición Johnson.
  - Comprobación de estados inválidos deterministas con `stepIndex(s) === null`.
  - Validación de unicidad de nodos y componentes en `docs/hardware.json`.

---

## 2. Qué se verificó
- **Pruebas unitarias:** 22/22 tests pasando sin fallos.
- **Cobertura de código en `src/core/`:**
  - Stmts: **100 %** (supera el criterio de ≥ 95 %).
  - Branch: **95.77 %** (supera el criterio de ≥ 95 %).
  - Funcs: **100 %**.
  - Lines: **100 %**.
- **Aislamiento:** Cero importaciones o dependencias de React en `src/core/`.
- **Linter & Build:** `npm run lint` y `npm run build` limpios sin advertencias.

---

## 3. Dudas identificadas en las fuentes
- Ninguna. Todo se verificó byte por byte contra `golden.json` y los sketches reales de Arduino.
