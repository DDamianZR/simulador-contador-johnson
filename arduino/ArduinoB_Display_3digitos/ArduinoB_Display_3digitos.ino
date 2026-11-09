/*
  Práctica 5 - Contador Johnson de 8 bits (solo Arduinos)
  ARDUINO B: lee el bus de 8 bits del Arduino A y muestra el valor decimal (0-255)
             en 3 displays F5101AH (cátodo común) multiplexados, sin transistores.

  Conexiones:
    Segmentos (los 3 displays en paralelo, UNA resistencia de 1 kΩ por línea):
      D2=a  D3=b  D4=c  D5=d  D6=e  D7=f  D8=g
    Bus desde Arduino A:
      A0=Q0 (A.D2)  A1=Q1 (A.D3)  A2=Q2 (A.D4)  A3=Q3 (A.D5)
      A4=Q4 (A.D6)  A5=Q5 (A.D7)  D9=Q6 (A.D8)  D10=Q7 (A.D9)
    Cátodos de cada display (directo, sin transistor):
      D11 = centenas   D12 = decenas   D13 = unidades
    GND de A y GND de B unidos.

  Corriente: con 1 kΩ cada segmento toma ~3 mA; un dígito con 8 encendido = ~21 mA
  hacia el pin del cátodo, dentro del límite del ATmega328P. No bajes de 1 kΩ.
*/

// true = ignora el bus y cuenta 0..255 solo (para probar los displays)
const bool MODO_PRUEBA = false;

const uint8_t T_DIGITO_MS = 3;             // ~3 ms por dígito = ~110 Hz de refresco

const uint8_t segPins[7] = {2, 3, 4, 5, 6, 7, 8};                 // a b c d e f g
const uint8_t qPins[8]   = {A0, A1, A2, A3, A4, A5, 9, 10};       // Q0..Q7
const uint8_t digPins[3] = {11, 12, 13};                          // cent, dec, unid

// Patrón por dígito, bit 0 = a ... bit 6 = g (1 = encendido, cátodo común)
const uint8_t NUMEROS[10] = {
  0x3F, // 0: a b c d e f
  0x06, // 1: b c
  0x5B, // 2: a b d e g
  0x4F, // 3: a b c d g
  0x66, // 4: b c f g
  0x6D, // 5: a c d f g
  0x7D, // 6: a c d e f g
  0x07, // 7: a b c
  0x7F, // 8: todos
  0x6F  // 9: a b c d f g
};
const uint8_t APAGADO = 0x00;

uint8_t valorMostrado = 0;
unsigned long tPrueba = 0;

uint8_t leerCrudo() {
  uint8_t v = 0;
  for (uint8_t i = 0; i < 8; i++) {
    if (digitalRead(qPins[i])) v |= (uint8_t)(1 << i);
  }
  return v;
}

// Lee dos veces; solo acepta si coinciden (A escribe los 8 pines uno por uno)
void actualizarValor() {
  uint8_t a = leerCrudo();
  delayMicroseconds(200);
  uint8_t b = leerCrudo();
  if (a == b) valorMostrado = a;
}

void escribirSegmentos(uint8_t patron) {
  for (uint8_t s = 0; s < 7; s++) {
    digitalWrite(segPins[s], (patron >> s) & 1);   // ánodo del segmento: HIGH = encendido
  }
}

void activarDigito(uint8_t d, bool on) {
  digitalWrite(digPins[d], on ? LOW : HIGH);       // cátodo a LOW = dígito encendido
}

void setup() {
  for (uint8_t i = 0; i < 3; i++) { pinMode(digPins[i], OUTPUT); activarDigito(i, false); }
  for (uint8_t i = 0; i < 7; i++) { pinMode(segPins[i], OUTPUT); digitalWrite(segPins[i], LOW); }
  for (uint8_t i = 0; i < 8; i++) pinMode(qPins[i], INPUT);
}

void loop() {
  if (MODO_PRUEBA) {
    if (millis() - tPrueba >= 200) { tPrueba = millis(); valorMostrado++; }
  } else {
    actualizarValor();
  }

  uint8_t v = valorMostrado;
  uint8_t c = v / 100, d = (v / 10) % 10, u = v % 10;

  uint8_t patrones[3] = {
    (c == 0)           ? APAGADO : NUMEROS[c],     // sin ceros a la izquierda
    (c == 0 && d == 0) ? APAGADO : NUMEROS[d],
    NUMEROS[u]
  };

  for (uint8_t i = 0; i < 3; i++) {
    escribirSegmentos(patrones[i]);   // segmentos primero, con todos los dígitos apagados
    activarDigito(i, true);
    delay(T_DIGITO_MS);
    activarDigito(i, false);
  }
}
