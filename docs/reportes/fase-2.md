# Reporte Fase 2 — Motor de Simulación y Controles

**Roles responsables:** Core Engineer + UX Engineer  
**Fecha:** 2026-10-23  
**Estado:** Completado exitosamente  

---

## 1. Qué se hizo
- **`src/sim/clock.ts`:**
  - Reloj preciso basado en `requestAnimationFrame` que emite flancos en rango continuo de 0.25 a 8 Hz (sin `setInterval`).
  - Cálculo de fase angular/temporal `0..1` dentro del periodo para animaciones fluidas y deterministas.
  - Sincronización mediante el evento `visibilitychange`: al cambiar de pestaña y regresar se recalibra la referencia temporal (`performance.now()`), evitando ráfagas o acumulación de flancos pendientes (idéntico al manejo con `ultimoPaso = millis()` del sketch de Arduino A).
- **`src/sim/useSimulation.ts`:**
  - Hook centralizado que expone estado (`state`, `tick`, `running`, `hz`, `rst`, `history`, `phase`).
  - Métodos de control: `play()`, `pause()`, `toggle()`, `stepOnce()`, `reset()`, `setHz()`, `jumpTo()`, `injectState()`.
  - Integración reactiva con `HistoryBuffer` (últimos 64 flancos), registrando el pulso `rst=0` al reiniciar.
- **`src/ui/ControlBar.tsx`:**
  - Botones de transporte (Play/Pausa, Paso, Reset).
  - Deslizador de frecuencia con lectura numérica en formato monoespaciado (`0.25 .. 8.00 Hz`).
  - Telemetría en vivo: `PASO xx / 16`, vector binario `Q7..Q0`, valor decimal `DEC` y entrada serial `ENTRADA = NOT Q7 → x`.
  - Botón de ayuda interactivo.
- **`src/ui/ShortcutsHelp.tsx`:**
  - Modal accesible con la guía de atajos de teclado (`Espacio`, `→`, `R`, `+`/`-`, `T`, `1`–`4`, `?`).
- **Pruebas y estilos:**
  - Suite de pruebas unitarias para `SimulationClock` verificando arranque, parada, límites de frecuencia y prevención de deriva.
  - Estilos según diseño Scientific / Minimal con soporte de alto contraste y foco visible.

---

## 2. Qué se verificó
- **Pruebas unitarias:** 25/25 tests pasando en Vitest.
- **Linter & Compilación:** `npm run lint` y `npm run build` sin errores ni advertencias.
- **Comportamiento en pausa:** El botón "Paso" avanza exactamente un flanco únicamente si está pausado o pausa la marcha; Reset regresa al estado 0 y queda asentado con `rst=0` en el historial.

---

## 3. Dudas identificadas en las fuentes
- Ninguna. La lógica de temporización refleja exactamente el control por comandos serie (`p`, `s`, `r`, `+`, `-`) y el botón físico en el pin D11 de Arduino A.
