import React, { useState } from 'react';

export const TheoryPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theory-panel-container">
      <div className="theory-header" onClick={() => setIsOpen((prev) => !prev)}>
        <div className="theory-header-title">
          <span className="label-datasheet">
            FUNDAMENTOS TEÓRICOS · CONTADOR JOHNSON 8 BITS
          </span>
          <span className="theory-toggle-hint mono">
            {isOpen ? '[-] COLAPSAR' : '[+] EXPANDIR TEORÍA'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="theory-content">
          <div className="theory-section">
            <h3 className="theory-subtitle mono">1. Principio de Operación</h3>
            <p>
              El contador Johnson (o de anillo modificado /{' '}
              <em>twisted ring counter</em>) es un registro de desplazamiento
              síncrono donde la salida invertida del último biestable (NOT Q7)
              se conecta a la entrada de datos del primer biestable (D0).
            </p>
          </div>

          <div className="theory-section">
            <h3 className="theory-subtitle mono">
              2. Capacidad de Estados (2N)
            </h3>
            <p>
              Para un registro de N bits, el contador Johnson genera exactamente
              2N estados únicos. Con N=8 flip-flops, produce 16 estados (pasos 0
              a 15). Partiendo de 00000000 (dec 0), el registro se llena
              progresivamente de unos desde Q0 hasta Q7 durante los primeros 8
              flancos (alcanzando 255), y en los 8 flancos siguientes se vacía
              secuencialmente con ceros, retornando de forma cíclica a 0.
            </p>
          </div>

          <div className="theory-section">
            <h3 className="theory-subtitle mono">
              3. Comparación con el Contador en Anillo
            </h3>
            <p>
              Un contador en anillo convencional conecta directamente Q7 a D0
              sin compuerta inversora, ofreciendo solo N estados (8 en lugar de
              16) y exigiendo precargar obligatoriamente un bit en alto (ej.
              00000001). Si un anillo arranca en 00000000, se queda atorado
              indefinidamente en cero. El contador Johnson duplica la resolución
              a 2N estados y autoarranca desde el reposo total (00000000)
              gracias a la inversión lógica.
            </p>
          </div>

          <div className="theory-section">
            <h3 className="theory-subtitle mono">
              4. Decodificación con Compuertas de 2 Entradas
            </h3>
            <p>
              Entre cada par de estados adyacentes cambia exactamente un solo
              bit (distancia Hamming = 1). Debido a esta propiedad libre de
              transiciones simultáneas, cualquiera de los 16 estados puede
              decodificarse de manera completa y libre de pulsos espurios (
              <em>glitches</em>) utilizando una compuerta AND de sólo 2 entradas
              (por ejemplo, el paso 0 se detecta mediante NOT Q7 AND NOT Q0, y
              el paso 8 con Q7 AND Q0).
            </p>
          </div>

          <div className="theory-section">
            <h3 className="theory-subtitle mono">
              5. Divisor de Frecuencia Simétrico
            </h3>
            <p>
              Cada salida individual Qn genera una onda cuadrada periódica con
              ciclo de trabajo exacto del 50 % y frecuencia f_out = f_clk / 16.
              Esto permite emplear el contador como un divisor de frecuencia
              digital exacto y simétrico para temporizadores y buses de
              sincronización.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
