#include <ESP32_Supabase.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
// #include <Arduino_JSON.h>
// #include <assert.h>

#define BOARD "ESP-32"
#define MQPIN 34
#define DHTPIN 4
#define LAMPPIN 26
#define FANPIN 25

#define SUPABASE_URL "https://oxmfbobxmqldgthethlz.supabase.co"
#define SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWZib2J4bXFsZGd0aGV0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjQ1NDksImV4cCI6MjAyMzY0MDU0OX0.pTDI9CsiN8wthOWhHjM1dONrRP_Hd7BcbwfKgeKGhtU"

#define WIFI_SSID "Vivo Y21c"
#define WIFI_PASSWORD "12346789"

Supabase db;
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, 22);

float suhu;
float kelembaban;
float persentaseKadarGas;

void setup(){
  pinMode(MQPIN, INPUT);
  pinMode(LAMPPIN, OUTPUT);
  pinMode(FANPIN, OUTPUT);

  digitalWrite(LAMPPIN, HIGH);
  digitalWrite(FANPIN, HIGH);

  Serial.begin(115200);

  // inisialisasi LCD
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Memuat..........");

  // inisialisasi DHT22
  dht.begin();

  // inisialisasi WiFi
  Serial.print("Menghubungkan ke WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(100);
    Serial.print(".");
  }
  Serial.println("Berhasil Terhubung!");

  // inisialisasi supabase
  db.begin(SUPABASE_URL, SUPABASE_ANON_KEY);

  delay(20000);
}

void loop(){
  float kadarGas = getKadarGas();
  float kadarGasVoltase = kadarGas / 4095.0 * 3.3;
  persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("G : ");
  lcd.print(kadarGas);
  lcd.setCursor(0,1);
  lcd.print("PG : ");
  lcd.print(persentaseKadarGas, 1);
  lcd.print(" %");

  delay(2000);

  suhu = dht.readTemperature();
  kelembaban = dht.readHumidity();

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

  // insertKondisiTapai();

  delay(2000);
  lcd.clear();
}

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
  float persentase = 0.2043 * pow(voltase, 2) + 0.0611 * voltase - 0.0249;
  float hasil = constrain(persentase * 100, 0, 100);

  return hasil;
}

// void insertKondisiTapai() {
//   req["suhu"] = suhu;
//   req["kelembaban"] = kelembaban;
//   req["kadar_gas"] = persentaseKadarGas;
//   req["pengujian"] = false;

//   String json = JSON.stringify(req);
//   db.insert("kondisi_tapai", json, false);
// }