#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define BOARD "ESP-32"
#define MQPIN 34
#define DHTPIN 4
#define LAMPPIN 26
#define FANPIN 25

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, 22);

float getKadarGas() {
  int total = 100;
  int valueTotal = 0;

  for (int i = 0; i < total; i++) {
    int value = analogRead(MQPIN);
    valueTotal = valueTotal + value;
  }

  float valueAvg = valueTotal / total;

  return valueAvg;
}

float getPersentaseKadarGas(float voltase) {
  float persentase = 0.2011 * pow(voltase, 2) + 0.0733 * voltase - 0.0363;
  float hasil = constrain(persentase * 100, 0, 100);

  return hasil;
}

void setup(){
  pinMode(MQPIN, INPUT);
  pinMode(LAMPPIN, OUTPUT);
  pinMode(FANPIN, OUTPUT);

  digitalWrite(LAMPPIN, HIGH);
  digitalWrite(FANPIN, HIGH);

  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Memuat..........");

  dht.begin();

  delay(20000);
}

void loop(){
  float kadarGas = getKadarGas();
  float kadarGasVoltase = kadarGas / 4095.0 * 3.3;
  float persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("G : ");
  lcd.print(kadarGas);
  lcd.setCursor(0,1);
  lcd.print("PG : ");
  lcd.print(persentaseKadarGas, 1);
  lcd.print(" %");

  delay(1500);

  float suhu = dht.readTemperature();
  float kelembaban = dht.readHumidity();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("S : ");
  lcd.print(suhu, 1);
  lcd.print(" C");
  lcd.setCursor(0, 1);
  lcd.print("K : ");
  lcd.print(kelembaban, 1);
  lcd.print(" %");

  if (suhu <= 30) {
    digitalWrite(LAMPPIN, LOW);
  } else {
    digitalWrite(LAMPPIN, HIGH);
  }

  if (suhu >= 40) {
    digitalWrite(FANPIN, LOW);
  } else {
    digitalWrite(FANPIN, HIGH);
  }

  Serial.println("Voltase Kadar Gas : " + String(kadarGasVoltase));
  Serial.println("Persentase Kadar Gas : " + String(persentaseKadarGas) + " %");
  Serial.println("Suhu : " + String(suhu) + " C");
  Serial.println("Kelembaban : " + String(kelembaban) + " %");

  delay(1500);
  lcd.clear();
}