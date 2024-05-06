// // #include <ESP32_Supabase.h>
// #include <LiquidCrystal_I2C.h>
// #include <DHT.h>
// #include <WiFi.h>
// #include <Arduino_JSON.h>
// #include <assert.h>
// #include <NTPClient.h>
// #include <WiFiUdp.h>

// #define BOARD "ESP-32"
// #define MQPIN 34
// #define DHTPIN 4
// #define LAMPPIN 26
// #define FANPIN 25
// #define BUZZERPIN 23

// #define SUPABASE_URL "https://oxmfbobxmqldgthethlz.supabase.co"
// #define SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWZib2J4bXFsZGd0aGV0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjQ1NDksImV4cCI6MjAyMzY0MDU0OX0.pTDI9CsiN8wthOWhHjM1dONrRP_Hd7BcbwfKgeKGhtU"

// #define WIFI_SSID "Vivo Y21c"
// #define WIFI_PASSWORD "12346789"

// // Supabase db;
// LiquidCrystal_I2C lcd(0x27, 16, 2);
// DHT dht(DHTPIN, 22);
// // WiFiUDP ntpUDP;
// // NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600 * 7, 60000); // GMT +7

// float suhu;
// float kelembaban;
// float persentaseKadarGas;
// bool pengujian;
// float kadarGasVoltase;
// // JSONVar dataPengujian;

// void setup(){
//   pinMode(MQPIN, INPUT);
//   pinMode(LAMPPIN, OUTPUT);
//   pinMode(FANPIN, OUTPUT);
//   pinMode(BUZZERPIN, OUTPUT);

//   digitalWrite(LAMPPIN, HIGH);
//   digitalWrite(FANPIN, HIGH);

//   Serial.begin(115200);

//   // inisialisasi LCD
//   lcd.init();
//   lcd.backlight();

//   lcd.setCursor(0, 0);
//   lcd.print("Memuat..........");

//   // inisialisasi DHT22
//   dht.begin();

//   // inisialisasi WiFi
//   // Serial.print("Menghubungkan ke WiFi");
//   // WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//   delay(20000);

//   // menampilkan gagal terhubung ke jaringan pada LCD
//   // if (WiFi.status() != WL_CONNECTED) {
//   //   lcd.setCursor(0, 0);
//   //   lcd.print("Gagal terhubung");
//   //   lcd.setCursor(0, 1);
//   //   lcd.print("ke jaringan!");
//   // }
  
//   // inisialisasi waktu
//   // timeClient.begin();

//   // inisialisasi supabase
//   // db.begin(SUPABASE_URL, SUPABASE_ANON_KEY);

//   // getDataPengujian();
// }

// void loop(){
//   // timeClient.update();

//   // mendapatkan nilai kadar gas
//   float kadarGas = getKadarGas();
//   kadarGasVoltase = kadarGas / 4095.0 * 3.3;
//   persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
  
//   // menampilkan kadar gas pada LCD
//   lcd.clear();
//   lcd.setCursor(0, 0);
//   lcd.print("G : ");
//   lcd.print(kadarGas);
//   lcd.setCursor(0,1);
//   lcd.print("PG : ");
//   lcd.print(persentaseKadarGas, 1);
//   lcd.print(" %");

//   delay(2000);

//   // membaca nilai suhu dan kelembaban
//   suhu = dht.readTemperature();
//   kelembaban = dht.readHumidity();

//   // menampilkan suhu dan kelembaban pada LCD
//   lcd.clear();
//   lcd.setCursor(0, 0);
//   lcd.print("S : ");
//   lcd.print(suhu, 1);
//   lcd.print(" C");
//   lcd.setCursor(0, 1);
//   lcd.print("K : ");
//   lcd.print(kelembaban, 1);
//   lcd.print(" %");

//   // menyalakan lampu jika suhu di bawah 30
//   if (suhu <= 30) {
//     digitalWrite(LAMPPIN, LOW);
//   } else {
//     digitalWrite(LAMPPIN, HIGH);
//   }

//   // menyalakan kipas jika suhu di atas 40
//   if (suhu >= 40) {
//     digitalWrite(FANPIN, LOW);
//   } else {
//     digitalWrite(FANPIN, HIGH);
//   }

//   // menentukan data masuk ke pengujian atau tidak berdasarkan jarak jam
//   // long unsigned epochTimeNow = timeClient.getEpochTime();

//   // if (dataPengujian.length() > 0) {
//   //   JSONVar dataPengujianTerakhir = dataPengujian[dataPengujian.length() - 1];
//   //   int created_time = dataPengujianTerakhir["created_time"];

//   //   int epochTimeDiff = epochTimeNow - created_time;
//   //   int jam = epochTimeDiff / 3600; // 1 jam = 3600 detik;

//   //   if (jam >= 6) {
//   //     pengujian = true;
//   //   } else {
//   //     pengujian = false;
//   //   }
//   // }

//   getDebugging();

//   // insertKondisiTapai();
//   // cekKematangan();

//   delay(2000);
//   lcd.clear();
// }

// void getDebugging() {
//   Serial.println("Voltase Kadar Gas : " + String(kadarGasVoltase));
//   Serial.println("Persentase Kadar Gas : " + String(persentaseKadarGas) + " %");
//   Serial.println("Suhu : " + String(suhu) + " C");
//   Serial.println("Kelembaban : " + String(kelembaban) + " %");
// }

// // mendapatkana nilai rata-rata kadar gas dari 100 data sampel yang diambil
// float getKadarGas() {
//   int total = 100;
//   int valueTotal = 0;

//   for (int i = 0; i < total; i++) {
//     int value = analogRead(MQPIN);
//     valueTotal = valueTotal + value;
//   }

//   float valueAvg = valueTotal / total;

//   return valueAvg;
// }

// // konversi tegangan ke persen berdasarkan rumus yang telah ditentukan
// float getPersentaseKadarGas(float voltase) {
//   float persentase = 0.2043 * pow(voltase, 2) + 0.0611 * voltase - 0.0249;
//   float hasil = constrain(persentase * 100, 0, 100);

//   return hasil;
// }

// // // menyimpan kondisi tapai pada database
// // void insertKondisiTapai() {
// //   JSONVar req;

// //   req["suhu"] = (float) suhu;
// //   req["kelembaban"] = (float) kelembaban;
// //   req["kadar_gas"] = (float) persentaseKadarGas;
// //   req["pengujian"] = (bool) pengujian;
// //   req["created_time"] = (int) timeClient.getEpochTime();

// //   String json = JSON.stringify(req);
// //   db.insert("kondisi_tapai", json, false);
  
// //   if (pengujian == true) {
// //     getDataPengujian();
// //   }
// // }

// // // melakukan cek kematangan
// // void cekKematangan() {
// //   String dataHistori = db.from("histori_fermentasi").select("*").order("created_at", "desc", true).limit(1).doSelect();
// //   JSONVar dataHistoriTerakhir = JSON.parse(dataHistori)[0];

// //   if (dataHistoriTerakhir["selesai"] == false) {
// //     digitalWrite(BUZZERPIN, HIGH);
// //   } else {
// //     digitalWrite(BUZZERPIN, LOW);

// //     if (persentaseKadarGas >= 5.3 && kelembaban >= 93) {
// //       String dataAWalJson = db.from("kondisi_tapai").select("*").order("created_at", "asc", true).limit(1).doSelect();
// //       String dataAkhirJson = db.from("kondisi_tapai").select("*").order("created_at", "desc", true).limit(1).doSelect();

// //       JSONVar dataAwal = JSON.parse(dataAwalJson);
// //       JSONVar dataAkhir = JSON.parse(dataAkhirJson);

// //       JSONVar req;
// //       req["berhasil"] = true;
// //       req["waktu_awal"] = dataAwal[0]["created_time"];
// //       req["waktu_akhir"] = dataAkhir[0]["created_time"]

// //       String json = JSON.stringify(req);

// //       db.insert("histori_fermentasi", json, false);
// //     }
// //   }
// // }

// // // mengambil data pengujian
// // void getDataPengujian() {
// //   String json = db.from("kondisi_tapai").select("*").eq("pengujian", "TRUE").order("created_at", "asc", true).doSelect();
// //   dataPengujian = JSON.parse(json);
// // }

/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/telegram-control-esp32-esp8266-nodemcu-outputs/
  
  Project created using Brian Lough's Universal Telegram Bot Library: https://github.com/witnessmenow/Universal-Arduino-Telegram-Bot
  Example based on the Universal Arduino Telegram Bot Library: https://github.com/witnessmenow/Universal-Arduino-Telegram-Bot/blob/master/examples/ESP8266/FlashLED/FlashLED.ino
*/

#include <WiFi.h>
#include <Callmebot_ESP32.h>

#define WEB_URL "http://localhost:5173";

const char* ssid = "Vivo Y21c";
const char* password = "12346789";

// Note :
// username : @username or phonenumber (Indonesia +62, Example: "+62897461238")
// You need to authorize CallMeBot to contact you using this link : https://api2.callmebot.com/txt/login.php. 
// Or alternatively, you can start the bot sending /start to @CallMeBot_txtbot.
String username = "+6281231921351";
String text = "Hello from ESP32";

void setup() {
	Serial.begin(115200);

	WiFi.begin(ssid, password);
	Serial.println("Connecting");
	while(WiFi.status() != WL_CONNECTED) {
		delay(500);
		Serial.print(".");
	}
	Serial.println("");
	Serial.print("Connected to WiFi network with IP Address: ");
	Serial.println(WiFi.localIP());

	// Telegram Call
  String text;
  if (true) {
    text = "Fermentasi tapai berhasil dan sudah matang.";
  } else {
    text = "Fermentasi tapai gagal."; 
  }

  text = text + " Lihat selengkapnya di " + WEB_URL + ".";
	Callmebot.telegramCall(username, text);
	Serial.println(Callmebot.debug());
}

void loop() {
	
}