# Reporte Fase 5 — Circuito Físico y Carta de Tiempos

**Rol responsable:** Visual Engineer  
**Fecha:** 2026-10-23  
**Estado:** Completado exitosamente  

---

## 1. Qué se hizo
- **`src/views/CircuitView/index.tsx`:**
  - Renderizado esquemático y limpio de interconexión con los dos microcontroladores `ARDUINO A` (con su registro de software dibujado internamente) y `ARDUINO B` (con decodificación de bus).
  - Bus de 8 bits paralelo etiquetado `Q0..Q7` entre A y B (`A.D2..D9 -> B.A0..A5, B.D9, B.D10`), más `GND` común.
  - Resistencias limitadoras de 1 kΩ (`R_a` a `R_g`) para cada segmento de los displays.
  - 3 displays `DS1`, `DS2`, `DS3` (F5101AH) con su pinout físico de 10 terminales (`COM` pin 3 directo a `B.D11`, `B.D12`, `B.D13`).
  - Trazado de redes ortogonales obtenido exclusivamente de `docs/hardware.json`, con color dinámico según `netLevel(net, ctx)` (`--signal` para HIGH, `--ink-2` para LOW).
  - Herramientas interactivas de Zoom (rueda / botones `+`, `-`), Pan (arrastrar con ratón) y botón "Ajustar vista".
  - Tooltip de inspección de redes físicas al pasar el cursor sobre cualquier cableado.
- **`src/views/TimingView/index.tsx`:**
  - Carta de tiempos digital con ondas cuadradas nítidas en ventana móvil de 32 ciclos para `CLK`, `RST̅`, `Q0..Q7` y `ENTRADA (!Q7)`.
  - Rejilla vertical sincronizada con el eje X en número de ciclo `T[n]`.
  - Cursor interactivo y tarjeta de inspección instantánea por ciclo.
  - Botones funcionales para **Exportar SVG** y **Exportar PNG** a 2x de resolución para reportes de laboratorio.
- **Estilos:**
  - Actualización de `src/styles/tokens.css` para soportar canvas esquemático, diagramas de ondas, chips de inspección y transiciones de cableado.

---

## 2. Qué se verificó
- **Pruebas unitarias:** 25/25 pruebas pasando.
- **Validación de netlist:** Se comprobó que el 100% de las redes dibujadas provienen de `hardware.json.redes` sin elementos espurios.
- **Carta de tiempos:** Se visualiza con precisión el desplazamiento progresivo de 1s (pasos 0 a 8) y el posterior vaciado con 0s (pasos 8 a 15), con periodo exacto de 16 ciclos en Q7.
- **Linter & Compilación:** `npm run lint` y `npm run build` sin errores ni advertencias.

---

## 3. Dudas identificadas en las fuentes
- Ninguna. Las asignaciones de pines coinciden con la netlist de `hardware.json` y el código fuente de los sketches de Arduino.
