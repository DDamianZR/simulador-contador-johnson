# AGENTS.md — Simulador Contador Johnson 8 bits

Este repositorio es una app web educativa que simula, de forma **fiel al hardware real**, el contador Johnson de 8 bits de la Práctica 5 (**solo 2 Arduino Uno** + 3 displays F5101AH cátodo común + resistencias). No hay registros 74HC, transistores ni capacitores: el Arduino A implementa los 8 flip-flops D en software y saca los bits por un bus de 8 cables al Arduino B, que multiplexa los displays con los cátodos directo a sus pines.

Lee este archivo completo antes de tocar código. Luego lee `PLAN_MAESTRO.md` y trabaja **una fase a la vez**.

---

## Fuentes de verdad (no inventar nada fuera de ellas)

1. `arduino/ArduinoA_Contador_Johnson/*.ino` y `arduino/ArduinoB_Display_3digitos/*.ino` — **lógica real del circuito. NO modificar nunca.**
2. `docs/hardware.json` — netlist: cada pin, cada conexión, cada componente. El diagrama de circuito se dibuja SOLO a partir de este archivo.
3. `docs/golden.json` — secuencia esperada de 16 estados. Los tests deben coincidir byte por byte.

Si algo no está en estas fuentes, **pregunta en el reporte de fase** en vez de suponer.

---

## Stack (fijo, no cambiar)

- Vite + React 18 + TypeScript (strict) + Vitest
- Estilos: CSS plano con variables (`src/styles/tokens.css`). **Sin** Tailwind, sin librerías de UI, sin librerías de gráficas.
- Todo lo visual es **SVG** hecho a mano.
- Animación: transiciones CSS + `requestAnimationFrame`. Sin framer-motion.
- Fuentes: `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono` (npm, offline).
- Gestor: npm.

## Arquitectura (respetar los límites)

```
src/
  core/            ← lógica pura, sin React, 100% testeada
    johnson.ts     ← step(), reset(), estados, invariantes
    sevenSeg.ts    ← patrones idénticos a NUMEROS[] del sketch B, split decimal, blanking
    netlist.ts     ← tipos + carga de docs/hardware.json, nivel lógico de cada red
    history.ts     ← buffer circular para la carta de tiempos
  sim/
    useSimulation.ts  ← único hook de estado (play/pause/step/reset/velocidad)
    clock.ts          ← reloj con rAF, sin setInterval
  views/
    CircuitView/      ← esquema físico (2 Arduinos, bus de 8 bits, displays, resistencias)
    LogicView/        ← 8 flip-flops D + NOT en lazo
    TimingView/       ← carta de tiempos CLK, RST̅, Q0..Q7
    DisplayPanel/     ← 3 dígitos 7-seg + tabla de estados
  ui/              ← controles, tooltips, atajos de teclado, tabs
  styles/tokens.css
```

Reglas:

- `core/` no importa nada de `views/`, `ui/` ni React.
- Las vistas **leen** el estado del hook; nunca calculan la lógica Johnson por su cuenta.
- Un solo reloj de simulación. Las vistas se sincronizan con `tick` (contador de flancos).

---

## Agentes (roles)

Trabaja como el rol indicado por la fase. Al terminar cada fase, el rol **QA** revisa antes de pasar a la siguiente.

### 1. Core Engineer

Dueño de `src/core/` y sus tests. Traduce **exactamente** la lógica de los `.ino` a TypeScript:

- Estado = `uint8` (bit 0 = `ff[0]` = pin D2 de Arduino A … bit 7 = `ff[7]` = pin D9).
- `step(s) = ((s << 1) | (((s >> 7) & 1) ^ 1)) & 0xFF` (entrada serial = NOT Q7).
- `reset() = 0`.
- Display: centenas/decenas/unidades con ceros a la izquierda apagados, patrones `0x3F,0x06,0x5B,0x4F,0x66,0x6D,0x7D,0x07,0x7F,0x6F` (bit0=a … bit6=g).
  Criterio: `npm test` verde, cobertura de `core/` ≥ 95 %.

### 2. Visual Engineer

Dueño de `views/`. Dibuja SVG preciso:

- **CircuitView:** los 2 Arduino Uno con sus headers y pines reales, el bus de 8 bits entre ellos, los 3 displays F5101AH con su pinout, las 7 resistencias de segmento y los extras opcionales (LEDs, botón de reset) dibujados con trazo punteado. Cables generados desde `hardware.json`; color según nivel lógico. Dentro del bloque de Arduino A se dibuja el registro interno (8 celdas + NOT) para que se vea que el contador vive en software.
- **LogicView:** 8 flip-flops D en fila, línea de reloj común, compuerta NOT de Q7 a D0, cada bit como "token" que se desliza al siguiente FF en cada flanco.
- **TimingView:** ondas cuadradas digitales (CLK, RST̅, Q0..Q7), ventana de 32 ciclos, cursor del instante actual.
- **DisplayPanel:** dígitos con los 7 segmentos geométricos reales.

### 3. UX Engineer

Dueño de `ui/`, layout, tokens y animaciones. Estilo **Scientific / Minimal** (ver "Lenguaje visual"). Accesibilidad, atajos, responsive, modo oscuro.

### 4. QA / Reviewer

No escribe features. En cada fase:

- Corre `npm run lint`, `npm test`, `npm run build`. Todo debe pasar sin warnings.
- Compara cada vista contra `golden.json` y `hardware.json`.
- Llena el checklist de la fase en `PLAN_MAESTRO.md` y escribe `docs/reportes/fase-N.md` con: qué se hizo, qué se verificó, qué queda pendiente.
- Si algo falla, regresa al rol responsable. No se avanza de fase con fallas.

---

## Lenguaje visual — Scientific / Minimal

- Look de hoja de laboratorio / datasheet: fondo papel, cuadrícula sutil, líneas finas (1–1.5 px), mucho espacio en blanco.
- **Un solo color de acento**, reservado para "señal en HIGH". Todo lo demás en escala de grises.
- Tokens (claro / oscuro):
  - `--paper` #F6F5F1 / #0E0F11
  - `--ink` #16181B / #E7E5E0
  - `--ink-2` #5B5F66 / #9BA0A8 (texto secundario, señal LOW)
  - `--grid` #E3E1DA / #1C1F23
  - `--line` #C9C6BD / #2C3036
  - `--signal` #E2522B / #FF6A3D (HIGH)
  - `--signal-soft` rgba del acento al 14 %
  - `--seg-off` #E9E6DF / #1A1C20 (segmento apagado)
- Tipografía: IBM Plex Sans para UI; **IBM Plex Mono** para números, bits, etiquetas de pines y ejes. `font-variant-numeric: tabular-nums` siempre en números.
- Etiquetas tipo datasheet: mayúsculas pequeñas, `letter-spacing: .06em`, 11–12 px.
- Movimiento: 180–320 ms, `cubic-bezier(.2,.8,.2,1)`. Nada rebota. Respetar `prefers-reduced-motion` (sin desplazamientos, solo cambio de color).
- Sin sombras pesadas, sin gradientes, sin glassmorphism, sin emojis.

## Calidad

- TypeScript `strict`, sin `any`.
- ESLint + Prettier.
- Sin errores en consola.
- Funciona a 1440 px, 1024 px y 390 px de ancho.
- Contraste AA en texto. Todo control accesible por teclado con foco visible.

## Prohibido

- Modificar los `.ino`, `hardware.json` o `golden.json`.
- Dibujar o mencionar componentes que no existen en `hardware.json` (74HC194, transistores, capacitores, decodificadores).
- Calcular la secuencia en una vista (solo `core/`).
- `setInterval` para el reloj de simulación.
- Agregar dependencias fuera del stack sin justificarlo en el reporte de fase.
- Marcar una fase como terminada si algún comando de QA falla.
