# Plan maestro — Simulador Contador Johnson 8 bits

Objetivo: una app web, estilo **Scientific / Minimal**, que muestre el mismo circuito que se arma físicamente en la Práctica 5, en cuatro vistas sincronizadas: **circuito**, **circuito lógico**, **carta de tiempos** y **display + tabla de estados**. Todo interactivo y animado.

Reglas generales en `AGENTS.md`. Trabaja **una fase por vez**. Al terminar cada fase:

1. Corre `npm run lint && npm test && npm run build`.
2. Marca el checklist de la fase en este archivo.
3. Escribe `docs/reportes/fase-N.md`.
4. Detente y espera confirmación antes de empezar la siguiente fase.

---

## Fase 0 — Scaffold (rol: UX Engineer)

- `npm create vite@latest . -- --template react-ts`, TS strict.
- Instalar: `vitest`, `@vitest/coverage-v8`, `eslint`, `prettier`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`.
- Scripts: `dev`, `build`, `preview`, `test`, `test:cov`, `lint`, `format`.
- Crear la estructura de carpetas de `AGENTS.md` (archivos vacíos con un `export {}` donde haga falta).
- `src/styles/tokens.css` con todos los tokens claro/oscuro; tema por `prefers-color-scheme` y botón manual (`data-theme` en `<html>`).
- Página base: fondo `--paper` con cuadrícula de 24 px muy sutil, título "Contador Johnson · 8 bits", subtítulo "Práctica 5 · 2×Arduino Uno · 3×F5101AH".

**Checklist**

- [x] `npm run dev` levanta sin errores
- [x] lint, test (aunque sea 1 test trivial) y build pasan
- [x] Tokens claro/oscuro funcionando con el botón de tema

---

## Fase 1 — Núcleo lógico (rol: Core Engineer)

Archivos: `src/core/johnson.ts`, `sevenSeg.ts`, `history.ts`, `netlist.ts` + tests en `src/core/__tests__/`.

**johnson.ts**

```ts
export type State = number; // 0..255, bit0 = ff[0] = Arduino A D2
export const N_BITS = 8;
export const PERIOD = 16;
export function reset(): State; // 0
export function step(s: State): State; // ff[i]=ff[i-1], ff[0]=NOT ff[7]
export function serialInput(s: State): 0 | 1; // valor que entrará en el próximo flanco
export function bit(s: State, i: number): 0 | 1;
export function stepIndex(s: State): number | null; // 0..15, null si es estado inválido
export function sequence(): State[]; // los 16 estados desde 0
```

**sevenSeg.ts**

```ts
export const DIGITS: readonly number[]; // [0x3F,0x06,0x5B,0x4F,0x66,0x6D,0x7D,0x07,0x7F,0x6F]
export function splitDecimal(v: number): [number | null, number | null, number]; // null = apagado
export function segmentsFor(d: number | null): boolean[]; // [a..g]
```

**history.ts:** buffer circular de los últimos 64 flancos: `{ tick, state, rst }`.
**netlist.ts:** carga `docs/hardware.json` (import JSON), tipos, y `netLevel(net, ctx) => 0|1` usando el campo `senal` (`qN`, `clk`, `reset_n`, `seg_x`, `digN_n`, etc.). Las redes con `opcional: true` se dibujan punteadas.

**Tests obligatorios**

- `sequence()` == `golden.json` estado por estado (bits y dec).
- Periodo: aplicar `step` 16 veces desde 0 regresa a 0, y ninguna repetición antes.
- Cada estado del ciclo difiere del anterior en exactamente 1 bit (propiedad Johnson).
- `splitDecimal` y `segmentsFor` reproducen `golden.json.display` y los patrones.
- Estados inválidos (ej. `0b01010101`): `stepIndex` = null y `step` sigue siendo determinista.
- Cada red de `hardware.json` existe y ningún nodo se repite.

**Checklist**

- [x] Todos los tests pasan
- [x] Cobertura `core/` ≥ 95 %
- [x] Sin dependencias de React en `core/`

---

## Fase 2 — Motor de simulación + controles (roles: Core + UX)

**`sim/clock.ts`:** reloj con `requestAnimationFrame`, frecuencia 0.25–8 Hz. Emite flancos; no usa `setInterval`.
**`sim/useSimulation.ts`:** expone

```ts
{
  (state,
    tick,
    running,
    hz,
    rst,
    history,
    phase /* 0..1 dentro del ciclo actual, para animar */,
    play(),
    pause(),
    toggle(),
    stepOnce(),
    reset(),
    setHz(n),
    jumpTo(stepIndex),
    injectState(s));
}
```

- `reset()` equivale a `reiniciar()` del sketch A (botón en D11 o comando `r`); queda registrado en history como `rst=0` en ese tick.
- `injectState` es solo para el modo "explorar estados inválidos" (Fase 6).

**Barra de controles (`ui/ControlBar`)**

- Play/Pausa, Paso, Reset, deslizador de frecuencia con valor en Hz (mono).
- Lectura en vivo: `PASO 07 / 16`, `Q7…Q0 01111111`, `DEC 127`, `ENTRADA = NOT Q7 → 1`.
- Atajos: `Espacio` play/pausa, `→` paso, `R` reset, `+`/`-` velocidad, `T` tema, `1`–`4` cambiar vista principal. Mostrar ayuda de atajos con `?`.

**Checklist**

- [x] Velocidad estable (sin deriva) al cambiar de pestaña y volver
- [x] Paso funciona en pausa; Reset vuelve a 0 y aparece en history
- [x] Todos los controles operables con teclado y con foco visible

---

## Fase 3 — Display + tabla de estados (rol: Visual Engineer)

**`views/DisplayPanel`**

- 3 dígitos SVG con segmentos hexagonales reales (geometría tipo display 0.56"), DP visible pero siempre apagado.
- Segmento encendido = `--signal` con un leve halo (`filter: drop-shadow` de 0 4px `--signal-soft`); apagado = `--seg-off`.
- Transición de encendido 120 ms.
- Debajo de cada dígito: `CENT`, `DEC`, `UNID` y el pin del Arduino B que lo activa (`D11`, `D12`, `D13`).
- Toggle "ver multiplexado": ralentiza visualmente y enciende un dígito a la vez (como el hardware real), mostrando qué `digN` está activo.

**Tabla de estados**

- 16 filas: `PASO | Q7 … Q0 (8 celdas) | DEC`. Bits en 1 con fondo `--signal-soft` y texto `--signal`.
- Fila actual resaltada; la tabla hace scroll suave para mantenerla visible.
- Clic en una fila → `jumpTo(paso)`.

**Checklist**

- [x] Los 16 valores del display coinciden con `golden.json`
- [x] Ceros a la izquierda apagados (ej. " 7", " 63")
- [x] Clic en fila salta al estado correcto

---

## Fase 4 — Circuito lógico (rol: Visual Engineer)

**`views/LogicView`**

- 8 flip-flops D en fila (`FF0`…`FF7`), cada uno con pines D, Q, CLK (triángulo de flanco) y RST (con burbuja).
- Línea de reloj común abajo; línea de RST común.
- Compuerta NOT (símbolo IEEE, triángulo + burbuja) en el lazo de `Q7` de regreso a `D0`. El lazo es una ruta ortogonal limpia por arriba.
- Encerrar los 8 FF y el NOT en un rectángulo punteado `ARDUINO A · registro en software`. A la salida de cada FF, una flecha al pin físico (`D2`…`D9`) que sale hacia el bus.
- En cada flanco:
  1. El pulso de CLK recorre la línea de reloj (180 ms).
  2. Cada bit se dibuja como un token circular dentro de su FF que se desliza al siguiente (260 ms).
  3. El valor nuevo entra a FF0 desde el NOT, que muestra su entrada y salida.
- Cables en HIGH = `--signal`, LOW = `--ink-2`.
- Hover en un FF: tooltip con `Qn`, valor actual, pin de salida en Arduino A y pin de entrada en Arduino B (`A.D5 → B.A3`, desde `hardware.json`).

**Checklist**

- [x] El token que sale de Q7 se invierte en el NOT y entra a FF0
- [x] Animación respeta `prefers-reduced-motion`
- [x] Mapeo FF ↔ pines A/B coincide con `hardware.json`

---

## Fase 5 — Circuito físico + carta de tiempos (rol: Visual Engineer)

**`views/CircuitView`** (esquema tipo diagrama de conexiones, NO foto de protoboard)

- Bloques: `ARDUINO A`, `ARDUINO B`, 3 displays `DS1`–`DS3`, 7 resistencias de 1 kΩ, y opcionales punteados (8 LEDs de bits, LED de CLK, botón RST en D11).
- Cada Arduino como placa Uno simplificada con sus headers digitales y analógicos y etiquetas de pin. Los pines usados se resaltan; el resto queda tenue.
- Bus de 8 bits A→B como 8 líneas paralelas etiquetadas `Q0`…`Q7`, más la línea `GND` común.
- Displays con su pinout de 10 pines (`7 a`, `6 b`…). Los cátodos (pin 3) van directo a `B.D11/D12/D13`.
- Cables generados **solo** desde `hardware.json.redes`, ruteo ortogonal con codos redondeados de 4 px.
- Color por nivel (`netLevel`). Las redes `VCC`/`GND` en gris fijo con etiqueta en vez de cable largo.
- Animación: en cada flanco, un pulso viaja por la red `CLK`; los cables `Qn` cambian de color con transición.
- Hover en una red: se resalta toda la red y aparece tooltip `RED Q3 · ARD_A.D5 → ARD_B.A3 · nivel 1`.
- Zoom (rueda / pinch) y pan (arrastrar), con botón "ajustar".

**`views/TimingView`**

- Filas: `CLK`, `RST̅`, `Q0` … `Q7` (y opcional `ENTRADA = NOT Q7`).
- Ondas cuadradas con transiciones verticales nítidas, ventana de 32 ciclos desde `history`, eje X en número de ciclo.
- Línea de cursor en el ciclo actual; hover muestra una línea vertical y los 10 valores en ese instante.
- Rejilla de ciclo con líneas punteadas `--grid`.
- Botón **Exportar SVG** y **Exportar PNG** (para pegar en el reporte de la práctica).

**Checklist**

- [x] Todas las redes de `hardware.json` se dibujan; ninguna inventada
- [x] En la carta de tiempos se ve el patrón de llenado/vaciado, Q7 con periodo de 16 ciclos
- [x] Exportar SVG/PNG produce archivos correctos

---

## Fase 6 — Layout, pulido y extras (roles: UX + Visual)

**Layout desktop (≥1200 px):**

```
┌────────────────── ControlBar ──────────────────┐
│ [Circuito] [Lógica]            │  DisplayPanel  │
│   vista principal (tabs)       │  Tabla estados │
├────────────────────────────────┴────────────────┤
│                 TimingView                       │
└──────────────────────────────────────────────────┘
```

Tablet: display arriba, vista principal, timing abajo. Móvil (390 px): todo apilado, la carta de tiempos con scroll horizontal.

**Panel "Teoría" (colapsable):** 4–6 párrafos cortos: qué es un Johnson, por qué 2N estados, diferencia con contador en anillo, decodificación con compuertas de 2 entradas, uso como divisor de frecuencia (Q7 = f/16).

**Extras**

- Modo **comparar con anillo** (sin NOT): misma vista lógica, muestra por qué sin inversión desde 0 se queda atorado.
- Modo **estados inválidos**: clic en los bits de la LogicView para forzar un estado (ej. `01010101`) y mostrar que entra en otro ciclo de 16 que no es el Johnson.
- Indicador `f_out = f_clk / 16` en vivo junto a Q7.

**Checklist**

- [x] Sin scroll horizontal accidental en 390 / 1024 / 1440 px
- [x] Modo oscuro completo (ningún color fijo fuera de tokens)
- [x] Lighthouse: Accesibilidad ≥ 95, Performance ≥ 90

---

## Fase 7 — QA final y entrega (rol: QA)

- `npm run lint && npm run test:cov && npm run build` sin warnings.
- Revisión manual: los 16 estados en las 4 vistas a la vez coinciden con `golden.json`.
- Verificar que Reset aparece como pulso bajo en `RST̅` en la carta de tiempos.
- `README.md` con: cómo correr, capturas de las 4 vistas, explicación corta, y relación con los sketches de `arduino/`.
- Build estático en `dist/`, listo para Vercel.
- `docs/reportes/fase-7.md` con el resumen final.

**Checklist**

- [x] Todo verde
- [x] README con capturas
- [x] `dist/` generado
