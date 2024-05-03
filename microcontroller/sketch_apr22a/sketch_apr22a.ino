#include <ESP32_Supabase.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <Arduino_JSON.h>
#include <assert.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

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
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600 * 7, 60000); // GMT +7

float suhu;
float kelembaban;
float persentaseKadarGas;
bool pengujian;
JSONVar dataPengujian;

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

  delay(20000);

  // menampilkan gagal terhubung ke jaringan pada LCD
  if (WiFi.status() != WL_CONNECTED) {
    lcd.setCursor(0, 0);
    lcd.print("Gagal terhubung");
    lcd.setCursor(0, 1);
    lcd.print("ke jaringan!");
  }
  
  // inisialisasi waktu
  timeClient.begin();

  // inisialisasi supabase
  db.begin(SUPABASE_URL, SUPABASE_ANON_KEY);

  getDataPengujian();
}

void loop(){
  timeClient.update();

  // mendapatkan nilai kadar gas
  float kadarGas = getKadarGas();
  float kadarGasVoltase = kadarGas / 4095.0 * 3.3;
  persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
  
  // menampilkan kadar gas pada LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("G : ");
  lcd.print(kadarGas);
  lcd.setCursor(0,1);
  lcd.print("PG : ");
  lcd.print(persentaseKadarGas, 1);
  lcd.print(" %");

  delay(2000);

  // membaca nilai suhu dan kelembaban
  suhu = dht.readTemperature();
  kelembaban = dht.readHumidity();

  // menampilkan suhu dan kelembaban pada LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("S : ");
  lcd.print(suhu, 1);
  lcd.print(" C");
  lcd.setCursor(0, 1);
  lcd.print("K : ");
  lcd.print(kelembaban, 1);
  lcd.print(" %");

  // menyalakan lampu jika suhu di bawah 30
  if (suhu <= 30) {
    digitalWrite(LAMPPIN, LOW);
  } else {
    digitalWrite(LAMPPIN, HIGH);
  }

  // menyalakan kipas jika suhu di atas 40
  if (suhu >= 40) {
    digitalWrite(FANPIN, LOW);
  } else {
    digitalWrite(FANPIN, HIGH);
  }

  // menentukan data masuk ke pengujian atau tidak berdasarkan jarak jam
  long unsigned epochTimeNow = timeClient.getEpochTime();

  if (dataPengujian.length() > 0) {
    JSONVar dataPengujianTerakhir = dataPengujian[dataPengujian.length() - 1];
    int created_time = dataPengujianTerakhir["created_time"];

    int epochTimeDiff = epochTimeNow - created_time;
    int jam = epochTimeDiff / 3600; // 1 jam = 3600 detik;

    if (jam >= 6) {
      pengujian = true;
    } else {
      pengujian = false;
    }
  }

  // debugging menampilkan data pada serial
  Serial.println("Voltase Kadar Gas : " + String(kadarGasVoltase));
  Serial.println("Persentase Kadar Gas : " + String(persentaseKadarGas) + " %");
  Serial.println("Suhu : " + String(suhu) + " C");
  Serial.println("Kelembaban : " + String(kelembaban) + " %");

  insertKondisiTapai();

  delay(2000);
  lcd.clear();
}

// mendapatkana nilai rata-rata kadar gas dari 100 data sampel yang diambil
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

// konversi tegangan ke persen berdasarkan rumus yang telah ditentukan
float getPersentaseKadarGas(float voltase) {
  float persentase = 0.2043 * pow(voltase, 2) + 0.0611 * voltase - 0.0249;
  float hasil = constrain(persentase * 100, 0, 100);

  return hasil;
}

// menyimpan kondisi tapai pada database
void insertKondisiTapai() {
  // JSONVar req;

  // req["suhu"] = (float) suhu;
  // req["kelembaban"] = (float) kelembaban;
  // req["kadar_gas"] = (float) persentaseKadarGas;
  // req["pengujian"] = (bool) pengujian;
  // req["created_time"] = (int) timeClient.getEpochTime();

  // String json = JSON.stringify(req);
  // db.insert("kondisi_tapai", json, false);
  
  // if (pengujian == true) {
  //   getDataPengujian();
  // }
}

// mengambil data pengujian
void getDataPengujian() {
  String json = db.from("kondisi_tapai").select("*").eq("pengujian", "TRUE").order("created_at", "asc", true).doSelect();
  dataPengujian = JSON.parse(json);
}