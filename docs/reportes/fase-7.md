# Reporte Fase 7 — QA Final y Entrega

**Rol responsable:** QA / Reviewer  
**Fecha:** 2026-10-23  
**Estado:** Entregado y aprobado formalmente  

---

## 1. Auditoría de Calidad y Criterios de Aceptación

### A. Ejecución de Pipeline de Validación
- **Linter:** `npm run lint` (ESLint con Flat Config) ejecutado con **0 errores y 0 warnings**.
- **Pruebas unitarias:** 25/25 tests aprobados en Vitest.
  - Cobertura en `src/core/`: **100 % Stmts, 100 % Lines, 100 % Funcs, 95.77 % Branch**.
  - Aislamiento absoluto de React en el núcleo lógico.
- **Compilación de producción:** `npm run build` genera bundle estático en `dist/` en 630 ms sin advertencias ni errores de tipos (`tsc -b`).

### B. Conformidad Matemática y Hardware
1. **Verificación contra `docs/golden.json`:**
   - La función `sequence()` genera byte por byte los 16 estados esperados (0 a 15).
   - `splitDecimal(v)` reproduce exactamente la terna `[centenas, decenas, unidades]` con ceros no significativos apagados para los 16 pasos del ciclo.
   - La propiedad de distancia Hamming unitaria se cumple en cada una de las 16 transiciones.
2. **Verificación contra `docs/hardware.json`:**
   - Cada red del diagrama de circuito físico proviene exclusivamente de la netlist oficial (`hardware.json.redes`).
   - Mapeo de pines entre microcontroladores:
     - Salidas Arduino A: `D2..D9` (bits Q0..Q7), `D10` (CLK), `D11` (RST).
     - Entradas Arduino B: `A0..A5` (bits Q0..Q5), `D9..D10` (bits Q6..Q7).
     - Salidas de segmento Arduino B: `D2..D8` hacia `R_a..R_g` (1 kΩ) y pines de display.
     - Salidas de cátodo común Arduino B: `D11` (centenas), `D12` (decenas), `D13` (unidades) directo a terminal 3 de cada F5101AH.
3. **Integridad de Fuentes:**
   - Ni los archivos de `arduino/` ni los esquemas de `docs/*.json` fueron modificados.

---

## 2. Entregables Verificados
1. **`src/core/`**: Lógica de contador Johnson, display de 7 segmentos, buffer de historial circular y cálculo de nivel de netlist.
2. **`src/sim/`**: Reloj síncrono con `requestAnimationFrame` (0.25 a 8 Hz) resistente a la deriva temporal y hook unificado `useSimulation`.
3. **`src/views/`**:
   - `CircuitView`: Esquema de conexiones real con pan, zoom interactivo e inspección de redes.
   - `LogicView`: 8 flip-flops D con compuerta NOT IEEE en software, tokens animados y tooltips.
   - `TimingView`: Carta de tiempos digital continua para 32 ciclos con exportador a SVG y PNG.
   - `DisplayPanel`: 3 displays F5101AH de cátodo común con modo de visualización de multiplexado y tabla interactiva de 16 estados.
4. **`src/ui/`**: Barra de control con telemetría en vivo, atajos de teclado (`Espacio`, `→`, `R`, `+`/`-`, `T`, `1`–`2`, `?`), panel colapsable de teoría y modal accesible.
5. **`README.md`**: Documentación integral de arquitectura, correlación con sketches y guía de ejecución.
6. **`dist/`**: Compilación estática optimizada para despliegue en Vercel/Netlify.
