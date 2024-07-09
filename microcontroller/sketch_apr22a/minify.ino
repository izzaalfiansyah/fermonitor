// #include <LiquidCrystal_I2C.h>
// #include <DHT.h>
// #include <ESP32_Supabase.h>
// #include <WiFi.h>
// #include <WiFiUdp.h>
// #include <Arduino_JSON.h>
// #include <assert.h>
// #include <NTPClient.h>
// #include <Callmebot_ESP32.h>
// #include <ESPAsyncWebServer.h>
// #include <DNSServer.h>
// #include <AsyncTCP.h>
// #include "LittleFS.h"
// #define BOARD "ESP-32"
// #define MQPIN 34
// #define DHTPIN 2
// #define LAMPPIN 26
// #define FANPIN 25
// #define BUZZERPIN 23
// #define SUPABASE_URL "https://oxmfbobxmqldgthethlz.supabase.co"
// #define SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWZib2J4bXFsZGd0aGV0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjQ1NDksImV4cCI6MjAyMzY0MDU0OX0.pTDI9CsiN8wthOWhHjM1dONrRP_Hd7BcbwfKgeKGhtU"
// LiquidCrystal_I2C lcd(0x27, 16, 2);
// DHT dht(DHTPIN, 22);
// Supabase db;
// WiFiUDP ntpUDP;
// NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600 * 7, 60000);
// AsyncWebServer server(80);
// DNSServer dns;
// String WIFI_SSID;
// String WIFI_PASS;
// const char *ssidPath = "/ssid.txt";
// const char *passPath = "/pass.txt";
// float suhu;
// float kelembaban;
// float persentaseKadarGas;
// bool pengujian = true;
// float kadarGasVoltase;
// String status = "Menunggu";
// JSONVar dataPengujian;
// JSONVar dataPengujianDebug;
// JSONVar dataPengujianAwal;
// JSONVar pengaturan;
// unsigned long tickOld = 0;
// unsigned long tickNow = 0;
// int tickDiffSecond;
// int tickCount;
// int insertDuration = 1;
// int hourPeriod = 0;
// const char index_html[] PROGMEM = R"rawliteral(<!DOCTYPE html><html> <head> <title>Fermonitor Wi-Fi Manager</title> <meta name="viewport" content="width=device-width, initial-scale=1" /> <style> * {
//  padding: 0;
//  margin: 0;
//  box-sizing: border-box;
//  }
//  .content {
//  height: 100vh;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  background: dodgerblue;
//  padding: 20px;
//  }
//  .card {
//  background: white;
//  border: 1px solid gray;
//  padding: 40px 20px;
//  border-radius: 10px;
//  max-width: 450px;
//  }
//  .header {
//  text-align: center;
//  margin-bottom: 20px;
//  }
//  input {
//  width: 100%;
//  height: 40px;
//  margin-bottom: 10px;
//  margin-top: 5px;
//  padding-left: 10px;
//  padding-right: 10px;
//  border: 1px solid lightgray;
//  border-radius: 3px;
//  }
//  button {
//  height: 40px;
//  width: 100%;
//  margin-top: 20px;
//  border: transparent;
//  color: white;
//  background-color: dodgerblue;
//  border-radius: 5px;
//  cursor: pointer;
//  }
//  </style> </head> <body> <div class="content"> <div class="card"> <div class="header"> <h1>WiFi Manager</h1> </div> <div> <form action="/" method="POST"> <p> <label for="ssid">SSID</label> <input type="text" id="ssid" name="ssid" /> <label for="pass">Password</label> <input type="text" id="pass" name="pass" /> <button type="submit">SIMPAN</button> </p> </form> </div> </div> </div> </body></html>)rawliteral";
// void initLittleFS() {
//   if (!LittleFS.begin(true)) {
//     Serial.println("An error has occurred while mounting LittleFS");
//   }
//   Serial.println("LittleFS mounted successfully");
// }
// String readFile(const char *path) {
//   File file = LittleFS.open(path);
//   if (!file || file.isDirectory()) {
//     return String();
//   }
//   String fileContent;
//   while (file.available()) {
//     fileContent = file.readStringUntil('\n');
//     break;
//   }
//   return fileContent;
// }
// void writeFile(const char *path, const char *message) {
//   File file = LittleFS.open(path, FILE_WRITE);
//   if (file.print(message)) {
//     Serial.println("- file written");
//   } else {
//     Serial.println("- write failed");
//   }
// }
// void generateServer() {
//   WiFi.softAP("Fermonitor V1", NULL);
//   IPAddress IP = WiFi.softAPIP();
//   server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
//     request->send(200, "text/html", index_html);
//   });
//   server.on("/debug", HTTP_GET, [](AsyncWebServerRequest *request) {
//     request->send(200, "application/json", JSON.stringify(dataPengujianDebug));
//   });
//   server.on("/", HTTP_POST, [](AsyncWebServerRequest *request) {
//     int params = request->params();
//     for (int i = 0;
//          i < params;
//          i++) {
//       AsyncWebParameter *p = request->getParam(i);
//       if (p->isPost()) {
//         if (p->name() == "ssid") {
//           WIFI_SSID = p->value().c_str();
//           writeFile(ssidPath, WIFI_SSID.c_str());
//         }
//         if (p->name() == "pass") {
//           WIFI_PASS = p->value().c_str();
//           writeFile(passPath, WIFI_PASS.c_str());
//         }
//       }
//     }
//     request->send(200, "text/plain", "Berhasil. Pengaturan WiFi berhasil di simpan, sistem akan melakukan restart.");
//     delay(3000);
//     ESP.restart();
//   });
//   server.begin();
// }
// class CaptiveRequestHandler : public AsyncWebHandler {
// public:
//   CaptiveRequestHandler() {
//   }
//   virtual ~CaptiveRequestHandler() {
//   }
//   bool canHandle(AsyncWebServerRequest *request) {
//     return true;
//   }
//   void handleRequest(AsyncWebServerRequest *request) {
//     request->send(200, "text/html", index_html);
//   }
// };
// void setup() {
//   status = "Menunggu";
//   pinMode(MQPIN, INPUT);
//   pinMode(LAMPPIN, OUTPUT);
//   pinMode(FANPIN, OUTPUT);
//   pinMode(BUZZERPIN, OUTPUT);
//   digitalWrite(LAMPPIN, HIGH);
//   digitalWrite(FANPIN, HIGH);
//   digitalWrite(BUZZERPIN, LOW);
//   Serial.begin(115200);
//   initLittleFS();
//   WIFI_SSID = readFile(ssidPath);
//   WIFI_PASS = readFile(passPath);
//   Serial.println(WIFI_SSID);
//   Serial.println(WIFI_PASS);
//   lcd.init();
//   lcd.backlight();
//   lcd.clear();
//   dht.begin();
//   WiFi.begin(WIFI_SSID, WIFI_PASS);
//   int i = 0;
//   int duration = 20;
//   Serial.println("Memuat.......");
//   while (i < duration) {
//     int loading = i / ((float)duration) * 100;
//     Serial.println("Memuat: " + String(loading) + "%");
//     lcd.setCursor(0, 0);
//     lcd.print("Memuat : " + String(loading) + "%");
//     delay(1000);
//     i += 1;
//   }
//   generateServer();
//   if (WiFi.status() == WL_CONNECTED) {
//     timeClient.begin();
//     db.begin(SUPABASE_URL, SUPABASE_ANON_KEY);
//     getDataPengujian();
//   }
//   dns.start(53, "*", WiFi.softAPIP());
//   server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
// }
// void loop() {
//   dns.processNextRequest();
//   tickNow = millis();
//   tickDiffSecond = (tickNow - tickOld) / 1000;
//   if (WiFi.status() == WL_CONNECTED) {
//     getPengaturan();
//     timeClient.update();
//     bool running = (bool)pengaturan[0]["running"];
//     if (running) {
//       runFermentasi();
//     } else {
//       digitalWrite(LAMPPIN, HIGH);
//       digitalWrite(FANPIN, HIGH);
//       digitalWrite(BUZZERPIN, LOW);
//       status = "Menunggu";
//       Serial.println("Mesin Siap!");
//       int cursorPositions[][2] = {
//         { 0, 0 }, { 7, 0 }, { 0, 1 }, { 7, 1 }
//       };
//       for (int i = 0;
//            i < 4;
//            i++) {
//         float order = i + 1;
//         if (tickDiffSecond == (order / 4.0 * 4)) {
//           lcd.clear();
//           lcd.setCursor(cursorPositions[i][0], cursorPositions[i][1]);
//           lcd.print("Aku siap!");
//         }
//       }
//     }
//   } else {
//     Serial.println("Gagal terhubung ke " + WIFI_SSID);
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Gagal terhubung");
//     lcd.setCursor(0, 1);
//     lcd.print("ke " + WIFI_SSID + "!");
//   }
//   if (tickDiffSecond >= 4) {
//     tickOld = tickNow;
//   }
//   delay(500);
// }
// void runFermentasi() {
//   float kadarGas = getKadarGas();
//   kadarGasVoltase = kadarGas / 4095.0 * 3.3;
//   persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
//   suhu = dht.readTemperature();
//   kelembaban = dht.readHumidity();
//   if (isnan(suhu)) {
//     suhu = 0;
//   }
//   if (isnan(kelembaban)) {
//     kelembaban = 0;
//   }
//   if (tickDiffSecond == 1) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("G : ");
//     lcd.print(persentaseKadarGas, 1);
//     lcd.print(" %");
//     lcd.setCursor(0, 1);
//     lcd.print("H : ");
//     lcd.print(status);
//   } else if (tickDiffSecond == 3) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("S : ");
//     lcd.print(suhu, 1);
//     lcd.print(" C");
//     lcd.setCursor(0, 1);
//     lcd.print("K : ");
//     lcd.print(kelembaban, 1);
//     lcd.print(" %");
//   }
//   if (suhu != 25.5 && kelembaban != 25.5) {
//     bool otomatis = (bool)pengaturan[0]["auto"];
//     int suhuMin = (int)pengaturan[0]["suhu_min"];
//     int suhuMax = (int)pengaturan[0]["suhu_max"];
//     bool buzzerOn = (bool)pengaturan[0]["buzzer_on"];
//     int buzzerTimer = (int)pengaturan[0]["buzzer_timer"];
//     if (otomatis) {
//       if (suhu <= suhuMin) {
//         digitalWrite(LAMPPIN, LOW);
//       } else {
//         digitalWrite(LAMPPIN, HIGH);
//       }
//       if (suhu >= suhuMax) {
//         digitalWrite(FANPIN, LOW);
//       } else {
//         digitalWrite(FANPIN, HIGH);
//       }
//     } else {
//       bool lampOn = (bool)pengaturan[0]["lamp_on"];
//       bool fanOn = (bool)pengaturan[0]["fan_on"];
//       digitalWrite(LAMPPIN, lampOn ? LOW : HIGH);
//       digitalWrite(FANPIN, fanOn ? LOW : HIGH);
//     }
//     digitalWrite(BUZZERPIN, buzzerOn ? HIGH : LOW);
//     if (buzzerOn) {
//       if (tickCount > 0) {
//         tickCount -= 1;
//         if (tickCount == 0) {
//           JSONVar req;
//           req["buzzer_on"] = false;
//           String json = JSON.stringify(req);
//           db.from("pengaturan").eq("id", "1").doUpdate(json);
//         }
//       } else {
//         tickCount = buzzerTimer;
//       }
//     } else {
//       tickCount = 0;
//     }
//     if (tickDiffSecond >= 4) {
//       long unsigned epochTimeNow = timeClient.getEpochTime();
//       getDataPengujian();
//       if (dataPengujian.length() > 0) {
//         JSONVar dataPengujianTerakhir = dataPengujian[dataPengujian.length() - 1];
//         int created_time = dataPengujianTerakhir["created_time"];
//         int epochTimeDiff = epochTimeNow - created_time;
//         int jam = epochTimeDiff / 3600;
//         if (jam >= insertDuration) {
//           pengujian = true;
//         } else {
//           pengujian = false;
//         }
//       } else {
//         pengujian = true;
//       }
//       getDebugging();
//       if (dataPengujian.length() > 0) {
//         String dataHistoriJson = db.from("histori_fermentasi").select("*").order("created_at", "desc", true).limit(1).doSelect();
//         JSONVar dataHistori = JSON.parse(dataHistoriJson);
//         int waktuAkhirHistori = dataHistori[0]["waktu_akhir"];
//         int waktuAwal = dataPengujianAwal["created_time"];
//         if (waktuAwal <= waktuAkhirHistori) {
//           bool historiTerakhirBerhasil = (bool)dataHistori[0]["berhasil"];
//           if (historiTerakhirBerhasil) {
//             status = "Matang";
//           } else {
//             status = "Gagal";
//           }
//         } else {
//           status = "Menunggu";
//           cekKematangan();
//         }
//         Serial.println("Status : " + status);
//       }
//       insertKondisiTapai();
//     }
//   }
// }
// void getDebugging() {
//   Serial.println("Voltase Kadar Gas : " + String(kadarGasVoltase));
//   Serial.println("Persentase Kadar Gas : " + String(persentaseKadarGas) + " %");
//   Serial.println("Suhu : " + String(suhu) + " C");
//   Serial.println("Kelembaban : " + String(kelembaban) + " %");
//   int lamaJam = tickDiffSecond / 3600;
//   JSONVar req;
//   req["kadar_gas"] = persentaseKadarGas;
//   req["suhu"] = suhu;
//   req["kelembaban"] = kelembaban;
//   req["jam_ke"] = hourPeriod;
//   if (dataPengujianDebug.length() <= 0) {
//     dataPengujianDebug[0] = req;
//     hourPeriod += insertDuration;
//   }
//   if (lamaJam >= insertDuration) {
//     hourPeriod += insertDuration;
//     dataPengujianDebug[dataPengujianDebug.length()] = req;
//   }
// }
// float getKadarGas() {
//   int total = 100;
//   int valueTotal = 0;
//   for (int i = 0;
//        i < total;
//        i++) {
//     int value = analogRead(MQPIN);
//     valueTotal = valueTotal + value;
//   }
//   float valueAvg = valueTotal / total;
//   return valueAvg;
// }
// float getPersentaseKadarGas(float voltase) {
//   float persentase = 0.2043 * pow(voltase, 2.0) + 0.0611 * voltase - 0.0249;
//   float hasil = constrain(persentase * 100, 0, 100);
//   return hasil;
// }
// void getPengaturan() {
//   String dataJson = db.from("pengaturan").select("*").limit(1).doSelect();
//   JSONVar data = JSON.parse(dataJson);
//   pengaturan = data;
// }
// void callUser(bool matang = true) {
//   String web_url = pengaturan[0]["web_url"];
//   String text;
//   if (matang == true) {
//     text = "Fermentasi tapai berhasil dan sudah matang. ";
//   } else {
//     text = "Fermentasi tapai gagal. ";
//   }
//   text = text + "Lihat selengkapnya di " + web_url + ".";
//   Callmebot.telegramCall(pengaturan[0]["telepon"], text, "id-ID-Standard-B");
//   Serial.println(Callmebot.debug());
//   sendEmail(text);
// }
// void sendEmail(String text) {
// }
// void insertKondisiTapai() {
//   JSONVar req;
//   req["suhu"] = (float)suhu;
//   req["kelembaban"] = (float)kelembaban;
//   req["kadar_gas"] = (float)persentaseKadarGas;
//   req["created_time"] = (int)timeClient.getEpochTime();
//   String json = JSON.stringify(req);
//   db.from("realtime_data").eq("id", "1").doUpdate(json);
//   if (pengujian == true) {
//     db.insert("kondisi_tapai", json, false);
//     getDataPengujian();
//     cekKegagalan();
//   }
// }
// int getLamaJamFermentasi() {
//   int epochTimeAwal = (int)dataPengujianAwal["created_time"];
//   int epochTimeSekarang = timeClient.getEpochTime();
//   int epochTimeDiff = epochTimeSekarang - epochTimeAwal;
//   int lamaJam = epochTimeDiff / 3600;
//   return lamaJam;
// }
// void insertHistory(bool berhasil = true) {
//   JSONVar dataAwal = dataPengujian[0];
//   JSONVar dataAkhir = dataPengujian[dataPengujian.length() - 1];
//   JSONVar req;
//   req["berhasil"] = berhasil;
//   req["waktu_awal"] = (int)dataAwal["created_time"];
//   req["waktu_akhir"] = (int)dataAkhir["created_time"];
//   String json = JSON.stringify(req);
//   JSONVar reqSet;
//   reqSet["buzzer_on"] = true;
//   String jsonReqSet = JSON.stringify(reqSet);
//   db.insert("histori_fermentasi", json, false);
//   db.from("pengaturan").eq("id", "1").doUpdate(jsonReqSet);
//   callUser(berhasil);
//   pengujian = true;
// }
// void cekKematangan() {
//   int lamaJam = getLamaJamFermentasi();
//   if (dataPengujian.length() > 0) {
//     if ((persentaseKadarGas >= 5.28 || lamaJam >= 72) && status == "Menunggu") {
//       status = "Matang";
//       pengujian = true;
//       insertKondisiTapai();
//       insertHistory(true);
//     }
//   }
// }
// void cekKegagalan() {
//   int lamaJam = getLamaJamFermentasi();
//   float regresiKadarGas = -0.000006 * pow(lamaJam, 2.0) + 0.0013 * lamaJam + 0.002;
//   regresiKadarGas = regresiKadarGas * 100;
//   float nilaiPertiga = regresiKadarGas / 3.0;
//   if (lamaJam >= 18) {
//     if ((persentaseKadarGas < (regresiKadarGas - nilaiPertiga)) && status == "Menunggu") {
//       status = "Gagal";
//       pengujian = true;
//       insertKondisiTapai();
//       insertHistory(false);
//     }
//   }
// }
// void getDataPengujian() {
//   String json = db.from("kondisi_tapai").select("*").order("created_time", "asc", true).doSelect();
//   dataPengujian = JSON.parse(json);
//   dataPengujianAwal = dataPengujian[0];
// }
