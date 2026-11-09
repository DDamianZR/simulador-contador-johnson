# Reporte Fase 4 — Circuito Lógico

**Rol responsable:** Visual Engineer  
**Fecha:** 2026-10-23  
**Estado:** Completado exitosamente  

---

## 1. Qué se hizo
- **`src/views/LogicView/index.tsx`:**
  - Renderizado SVG limpio de los 8 flip-flops tipo D (`FF0` a `FF7`) con símbolos esquemáticos estándar (entradas D, CLK de flanco dinámico, RST activo bajo con burbuja y salidas Q).
  - Lazo de retroalimentación superior ortogonal con compuerta inversora NOT (símbolo IEEE) conectando `Q7` hacia `D0` con color dinámico según nivel lógico (`--signal` para HIGH, `--ink-2` para LOW).
  - Envolvente punteada con etiqueta `ARDUINO A · REGISTRO EN SOFTWARE` para enfatizar ante los alumnos que la estructura secuencial se ejecuta en el firmware del microcontrolador ATmega328P.
  - Conexión de buses inferiores de reloj común (CLK) y reinicio común (RST̅) sincronizados con los flancos de la simulación.
  - Token circular dentro de cada FF que indica el bit almacenado (`0` o `1`) con animación de transición suave de 260 ms.
  - Flechas de salida hacia los pines físicos del microcontrolador (`A.D2` a `A.D9`).
  - Tarjeta de tooltip interactiva al hacer hover sobre cualquier flip-flop que muestra el nombre, valor de salida `Qn`, pin de salida en Arduino A y pin de destino en Arduino B (`hardware.json`).
  - Capacidad de hacer clic sobre cualquier flip-flop para inyectar/invertir bits y comprobar el comportamiento de estados fuera del ciclo Johnson estándar.
- **Accesibilidad:**
  - Respeto total de `prefers-reduced-motion` mediante tokens CSS sin desplazamientos desorientadores.

---

## 2. Qué se verificó
- **Pruebas unitarias:** 25/25 pruebas en verde.
- **Mapeo de pines:** Verificado contra `hardware.json` (`FF0 -> A.D2 -> B.A0` hasta `FF7 -> A.D9 -> B.D10`).
- **Linter & Compilación:** `npm run lint` y `npm run build` sin errores ni advertencias.

---

## 3. Dudas identificadas en las fuentes
- Ninguna. La lógica de inversión `NOT(Q7) -> D0` coincide plenamente con `ArduinoA_Contador_Johnson.ino` y `docs/golden.json`.
