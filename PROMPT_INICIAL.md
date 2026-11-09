# Prompt inicial para Antigravity (pegar tal cual)

---

Vas a construir un simulador web educativo de un **contador Johnson de 8 bits** que replica exactamente un circuito físico real hecho **solo con 2 Arduino Uno**, 3 displays de 7 segmentos F5101AH de cátodo común y resistencias. El Arduino A implementa los 8 flip-flops en software y manda los bits por un bus de 8 cables al Arduino B, que multiplexa los displays. No hay registros 74HC, transistores ni capacitores: no los dibujes.

**Antes de escribir cualquier código, lee completos y en este orden:**

1. `AGENTS.md` — reglas, stack fijo, arquitectura, roles y lenguaje visual.
2. `PLAN_MAESTRO.md` — fases con entregables y checklists.
3. `docs/golden.json` — la secuencia correcta de 16 estados.
4. `docs/hardware.json` — la netlist real del circuito (componentes, pines y redes).
5. `arduino/ArduinoA_Contador_Johnson/ArduinoA_Contador_Johnson.ino` y `arduino/ArduinoB_Display_3digitos/ArduinoB_Display_3digitos.ino` — la lógica real. Son de solo lectura.

**Cómo vas a trabajar:**

- Ejecuta **solo la Fase 0** ahora.
- Usa exactamente el stack de `AGENTS.md`. No agregues Tailwind, librerías de UI, de gráficas ni de animación.
- No modifiques nada dentro de `arduino/` ni de `docs/*.json`.
- Al terminar la fase: corre `npm run lint && npm test && npm run build`, marca el checklist de la fase en `PLAN_MAESTRO.md`, escribe `docs/reportes/fase-0.md` (qué hiciste, qué verificaste, dudas) y **detente**. Espera mi "siguiente fase".
- Si algo de las fuentes es ambiguo, anótalo como duda en el reporte en vez de inventar.

Responde primero con un resumen de 5 líneas de lo que entendiste (qué es un Johnson de 8 bits, cuántos estados tiene, cuál es la retroalimentación y las 4 vistas que vas a construir) y después empieza la Fase 0.

---

## Prompts para las fases siguientes

Después de revisar cada reporte, manda:

> Siguiente fase: ejecuta la **Fase N** de `PLAN_MAESTRO.md` con el rol indicado. Antes de cerrar, actúa como QA: corre lint/test/build, compara contra `golden.json` y `hardware.json`, marca el checklist y escribe `docs/reportes/fase-N.md`. Detente al terminar.

Si una fase sale mal:

> La Fase N no pasa QA: [describe el problema]. Corrígelo sin tocar `core/` salvo que el error sea de `core/`, vuelve a correr lint/test/build y actualiza el reporte.

Prompt de pulido visual (útil después de la Fase 6):

> Revisa todas las vistas contra la sección "Lenguaje visual — Scientific / Minimal" de `AGENTS.md`. Lista cada desviación (colores fuera de tokens, fuentes, grosores de línea, tiempos de animación, espaciado irregular, sombras) y corrígelas. No agregues features nuevas.
