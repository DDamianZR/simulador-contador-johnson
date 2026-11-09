/*
  Práctica 5 - Contador Johnson de 8 bits (solo Arduinos)
  ARDUINO A: implementa el registro de desplazamiento de 8 bits en software
             (8 flip-flops D + retroalimentación invertida) y saca cada bit por un pin.

  Salidas (bus de 8 bits hacia Arduino B, y opcionalmente a LEDs):
    D2=Q0  D3=Q1  D4=Q2  D5=Q3  D6=Q4  D7=Q5  D8=Q6  D9=Q7
    D10 = CLK (pulso visible en cada desplazamiento, opcional para LED/osciloscopio)
  Entrada opcional:
    D11 = botón/DIP de RESET a GND (usa pull-up interno; si no conectas nada, no pasa nada)

  Monitor Serie (9600 baud) - comandos:
    p = pausa / continuar    s = un paso (en pausa)    r = reinicio
    + = más rápido           - = más lento
*/

const uint8_t N_BITS = 8;
const uint8_t N_ESTADOS = 2 * N_BITS;                    // Johnson: 2N estados

const uint8_t qPins[N_BITS] = {2, 3, 4, 5, 6, 7, 8, 9}; // Q0..Q7
const uint8_t PIN_CLK   = 10;
const uint8_t PIN_RESET = 11;

bool ff[N_BITS];                 // los 8 flip-flops D del registro

unsigned long periodoMs = 1000;  // 1 Hz por defecto
unsigned long ultimoPaso = 0;
bool pausado = false;
uint8_t paso = 0;                // 0..15
bool resetAnterior = HIGH;

uint8_t valorRegistro() {
  uint8_t v = 0;
  for (uint8_t i = 0; i < N_BITS; i++) if (ff[i]) v |= (uint8_t)(1 << i);
  return v;
}

void escribirSalidas() {
  for (uint8_t i = 0; i < N_BITS; i++) digitalWrite(qPins[i], ff[i] ? HIGH : LOW);
}

void imprimirEstado() {
  Serial.print(F("Paso "));
  if (paso < 10) Serial.print(' ');
  Serial.print(paso);
  Serial.print(F(" | Q7..Q0 = "));
  for (int8_t i = N_BITS - 1; i >= 0; i--) Serial.print(ff[i] ? '1' : '0');
  Serial.print(F(" | dec = "));
  Serial.println(valorRegistro());
}

void reiniciar() {                       // equivalente al CLR del registro
  for (uint8_t i = 0; i < N_BITS; i++) ff[i] = false;
  paso = 0;
  escribirSalidas();
  imprimirEstado();
}

void flancoReloj() {
  // Entrada serial = NOT(último flip-flop): esta es la retroalimentación Johnson
  bool entrada = !ff[N_BITS - 1];

  // Desplazamiento: cada flip-flop toma el valor del anterior (de Q7 hacia Q0)
  for (int8_t i = N_BITS - 1; i > 0; i--) ff[i] = ff[i - 1];
  ff[0] = entrada;

  escribirSalidas();

  digitalWrite(PIN_CLK, HIGH);           // pulso de reloj visible
  delay(20);
  digitalWrite(PIN_CLK, LOW);

  paso = (paso + 1) % N_ESTADOS;
  imprimirEstado();
}

void leerComandos() {
  while (Serial.available()) {
    char c = Serial.read();
    switch (c) {
      case 'p':
        pausado = !pausado;
        ultimoPaso = millis();           // evita "ponerse al corriente" de golpe al reanudar
        Serial.println(pausado ? F("[pausa]") : F("[corriendo]"));
        break;
      case 's': if (pausado) flancoReloj(); break;
      case 'r': reiniciar(); ultimoPaso = millis(); break;
      case '+': if (periodoMs > 100) periodoMs /= 2; Serial.print(F("periodo ms = ")); Serial.println(periodoMs); break;
      case '-': if (periodoMs < 4000) periodoMs *= 2; Serial.print(F("periodo ms = ")); Serial.println(periodoMs); break;
      default: break;
    }
  }
}

void leerBotonReset() {
  bool ahora = digitalRead(PIN_RESET);
  if (resetAnterior == HIGH && ahora == LOW) {   // flanco de bajada = botón presionado
    delay(20);                                    // antirrebote
    if (digitalRead(PIN_RESET) == LOW) { reiniciar(); ultimoPaso = millis(); }
  }
  resetAnterior = ahora;
}

void setup() {
  for (uint8_t i = 0; i < N_BITS; i++) pinMode(qPins[i], OUTPUT);
  pinMode(PIN_CLK, OUTPUT);
  digitalWrite(PIN_CLK, LOW);
  pinMode(PIN_RESET, INPUT_PULLUP);

  Serial.begin(9600);
  Serial.println(F("Contador Johnson 8 bits - Arduino A"));
  reiniciar();
  ultimoPaso = millis();
}

void loop() {
  leerComandos();
  leerBotonReset();
  if (!pausado && millis() - ultimoPaso >= periodoMs) {
    ultimoPaso += periodoMs;
    flancoReloj();
  }
}
