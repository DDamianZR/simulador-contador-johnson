# Simulador Educativo · Contador Johnson de 8 Bits (Práctica 5)

App web interactiva y de alta fidelidad que simula el contador Johnson de 8 bits implementado físicamente en la **Práctica 5** con **solo 2 placas Arduino Uno**, 3 displays de 7 segmentos **F5101AH** (cátodo común) y 7 resistencias limitadoras de $1\text{ k}\Omega$.

El diseño sigue una estética **Scientific / Minimal** (estilo datasheet/laboratorio) implementado en **Vite + React 18 + TypeScript (strict) + CSS puro con variables y SVG**.

---

## 1. Arquitectura del Hardware y Correspondencia con los Sketches

El simulador replica con exactitud los códigos `.ino` del laboratorio:

```
┌───────────────────────────┐         Bus de 8 bits (Q0..Q7)         ┌───────────────────────────┐
│        ARDUINO A          │ ─────────────────────────────────────> │        ARDUINO B          │
│ (Contador en Software)    │   D2..D9 (A)  ──>  A0..A5, D9, D10 (B) │ (Decodificación + Mux)    │
│                           │                                        │                           │
│ • 8 flip-flops D          │          GND Común                     │ • 7 segmentos: D2..D8     │
│ • Entrada: NOT(Q7) -> D0  │ ─────────────────────────────────────> │ • Cátodos: D11, D12, D13  │
│ • Pulso CLK: D10          │                                        │ • Multiplexado ~110 Hz    │
│ • Reset: D11              │                                        │ • Sin transistores        │
└───────────────────────────┘                                        └─────────────┬─────────────┘
                                                                                   │
                                                                         ┌─────────┴─────────┐
                                                                         │ 3× Displays 7-seg │
                                                                         │ F5101AH (Cát. C.) │
                                                                         └───────────────────┘
```

1. **`arduino/ArduinoA_Contador_Johnson/`:**
   - Implementa los 8 flip-flops D (`ff[0..7]`) en la memoria del microcontrolador.
   - Aplica la retroalimentación Johnson canónica: `entrada = !ff[7]`, desplazando `ff[i] = ff[i-1]` y `ff[0] = entrada`.
   - Emite el estado por los pines digitales `D2` (Q0) a `D9` (Q7) hacia el bus paralelo.
   - Genera un pulso visible de reloj en `D10` (CLK) y lee el botón de reinicio con pull-up en `D11`.
2. **`arduino/ArduinoB_Display_3digitos/`:**
   - Lee el bus paralelo a través de `A0..A5` (Q0..Q5) y `D9..D10` (Q6..Q7).
   - Descompone el valor decimal (0–255) en centenas, decenas y unidades con supresión de ceros a la izquierda.
   - Multiplexa por software los 3 displays conectando los cátodos directamente a sus pines digitales `D11`, `D12` y `D13` (activo en nivel `LOW`, absorbiendo la corriente limitada a ~3 mA por segmento mediante las resistencias de $1\text{ k}\Omega$ en `D2..D8`).

---

## 2. Vistas del Simulador

La aplicación organiza la experimentación en 4 vistas sincronizadas por un único reloj de simulación (`rAF`):

1. **Circuito Físico (`CircuitView`):**
   - Esquema técnico de conexiones generado estrictamente desde `docs/hardware.json`.
   - Visualización de ambas placas Arduino Uno, el bus de 8 líneas, las 7 resistencias y los 3 displays con su numeración física de terminales (pines 1 a 10).
   - Cables interactivos con color dinámico según nivel lógico (`--signal` en HIGH, `--ink-2` en LOW) e inspección en tooltip.
   - Herramientas de Pan (arrastrar), Zoom (rueda del ratón) y botón "Ajustar vista".
2. **Circuito Lógico (`LogicView`):**
   - Representación esquemática de los 8 flip-flops D en cascada con compuerta inversora NOT IEEE en el lazo superior de regreso ($Q_7 \to D_0$).
   - Token circular que ilustra el avance y almacenamiento de cada bit en cada flanco.
   - Mapeo de pines Arduino visible al pasar el cursor o hacer clic para forzar estados de prueba.
3. **Carta de Tiempos (`TimingView`):**
   - Diagrama digital de ondas cuadradas para `CLK`, `RST̅`, `Q0..Q7` y `ENTRADA (!Q7)` con ventana de 32 ciclos.
   - Cursor de inspección instantánea por flanco.
   - Botones para **Exportar SVG** y **Exportar PNG** a resolución 2x para reportes de laboratorio.
4. **Display y Tabla de Estados (`DisplayPanel`):**
   - 3 dígitos de 7 segmentos SVG con geometría hexagonal precisa (tipo display 0.56").
   - Modo "Ver multiplexado" para observar la persistencia visual al ralentizar la activación individual de cátodos.
   - Tabla interactiva de los 16 pasos; clic en cualquier fila para saltar inmediatamente a ese estado (`jumpTo`).

---

## 3. Atajos de Teclado y Controles

|            Atajo            | Acción                                                             |
| :-------------------------: | :----------------------------------------------------------------- |
|     <kbd>Espacio</kbd>      | Iniciar / Pausar simulación                                        |
|        <kbd>→</kbd>         | Avanzar exactamente un flanco de reloj (en pausa)                  |
|        <kbd>R</kbd>         | Reiniciar contador a 0 (equiv. comando `r` / botón D11)            |
| <kbd>+</kbd> / <kbd>-</kbd> | Aumentar / Disminuir frecuencia del reloj (0.25 a 8.00 Hz)         |
|        <kbd>T</kbd>         | Alternar tema Claro / Oscuro                                       |
| <kbd>1</kbd> – <kbd>2</kbd> | Cambiar esquema principal (1: Circuito Físico, 2: Circuito Lógico) |
|        <kbd>?</kbd>         | Mostrar / Ocultar panel de ayuda de atajos                         |

---

## 4. Instalación y Ejecución Local

Requisitos: Node.js 18+ y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Ejecutar suite de pruebas unitarias
npm test

# 4. Comprobar cobertura de pruebas
npm run test:cov

# 5. Ejecutar análisis estático (Linter)
npm run lint

# 6. Formatear código con Prettier
npm run format

# 7. Compilar para producción (genera carpeta dist/)
npm run build
```

---

## 5. Verificación de Conformidad (`golden.json`)

El núcleo lógico en `src/core/` valida formalmente:

- Coincidencia bit a bit y decimal en los 16 estados contra `docs/golden.json`.
- Periodo exacto de 16 estados sin estados espurios partiendo de 0.
- Variación de exactamente 1 bit por flanco (distancia Hamming unitaria).
- Supresión de ceros no significativos idéntica a la rutina de multiplexado real.
