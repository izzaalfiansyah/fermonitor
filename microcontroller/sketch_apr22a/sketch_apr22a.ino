#include <LiquidCrystal_I2C.h>
#include <MQUnifiedsensor.h>
#include <DHT.h>

#define BOARD "ESP-32"
#define MQPIN 36
#define DHTPIN 4
#define LAMPPIN 26
#define FANPIN 25

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, 22);

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
  lcd.print("Memuat....");

  dht.begin();

  delay(5000);
}

void loop(){
  int kadarGas = analogRead(MQPIN);
  int kadarGasPersen = map(kadarGas, 250, 1023, 0, 100);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kadar Gas : ");
  lcd.setCursor(0,1);
  lcd.print(String(kadarGas));

  float suhu = dht.readTemperature();

  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Suhu : ");
  lcd.setCursor(0, 1);
  lcd.print(String(suhu) + " C");

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

  float kelembaban = dht.readHumidity();

  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kelembaban : ");
  lcd.setCursor(0, 1);
  lcd.print(String(kelembaban) + " %");

  Serial.println("Kadar Gas : " + String(kadarGas));
  Serial.println("Persen Kadar Gas : " + String(kadarGasPersen) + " %");
  Serial.println("Suhu : " + String(suhu) + " C");
  Serial.println("Kelembaban : " + String(kelembaban) + " %");

  delay(2000);
  lcd.clear();
}