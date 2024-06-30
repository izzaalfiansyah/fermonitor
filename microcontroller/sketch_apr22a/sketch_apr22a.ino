#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ESP32_Supabase.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <Arduino_JSON.h>
#include <assert.h>
#include <NTPClient.h>
#include <Callmebot_ESP32.h>
// #include <ESP_Mail_Client.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <AsyncTCP.h>
#include "LittleFS.h"

#define BOARD "ESP-32"
#define MQPIN 34
#define DHTPIN 2
#define LAMPPIN 26
#define FANPIN 25
#define BUZZERPIN 23

#define SUPABASE_URL "https://oxmfbobxmqldgthethlz.supabase.co"
#define SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWZib2J4bXFsZGd0aGV0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjQ1NDksImV4cCI6MjAyMzY0MDU0OX0.pTDI9CsiN8wthOWhHjM1dONrRP_Hd7BcbwfKgeKGhtU"

// #define WIFI_SSID "Vivo Y21c"
// #define WIFI_PASS "12346789"

// #define SMTP_HOST "sandbox.smtp.mailtrap.io"
// #define SMTP_PORT 2525
// #define AUTHOR_EMAIL "16d58b0c89cba1"
// #define AUTHOR_PASSWORD "f077a3dc3e2f84"

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, 22);
Supabase db;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600 * 7, 60000); // GMT +7
// SMTPSession smtp;
AsyncWebServer server(80);
DNSServer dns;

String WIFI_SSID;
String WIFI_PASS;

const char* ssidPath = "/ssid.txt";
const char* passPath = "/pass.txt";

float suhu;
float kelembaban;
float persentaseKadarGas;
bool pengujian = true;
float kadarGasVoltase;
String status = "Menunggu";
JSONVar dataPengujian;
JSONVar pengaturan;

const char index_html[] PROGMEM = R"rawliteral(<!DOCTYPE html>
<html>
  <head>
    <title>Fermonitor Wi-Fi Manager</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
      .content {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dodgerblue;
        padding: 20px;
      }
      .card {
        background: white;
        border: 1px solid gray;
        padding: 40px 20px;
        border-radius: 10px;
        max-width: 450px;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      input {
        width: 100%;
        height: 40px;
        margin-bottom: 10px;
        margin-top: 5px;
        padding-left: 10px;
        padding-right: 10px;
        border: 1px solid lightgray;
        border-radius: 3px;
      }
      button {
        height: 40px;
        width: 100%;
        margin-top: 20px;
        border: transparent;
        color: white;
        background-color: dodgerblue;
        border-radius: 5px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <div class="card">
        <div class="header">
          <h1>WiFi Manager</h1>
        </div>
        <div>
          <form action="/" method="POST">
            <p>
              <label for="ssid">SSID</label>
              <input type="text" id="ssid" name="ssid" />
              <label for="pass">Password</label>
              <input type="text" id="pass" name="pass" />
              <button type="submit">SIMPAN</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  </body>
</html>)rawliteral";

// void smtpCallback(SMTP_Status status);

void initLittleFS() {
  if (!LittleFS.begin(true)) {
    Serial.println("An error has occurred while mounting LittleFS");
  }
  Serial.println("LittleFS mounted successfully");
}

String readFile(const char * path){
  File file = LittleFS.open(path);
  if(!file || file.isDirectory()){
    return String();
  }

  String fileContent;
  while(file.available()){
    fileContent = file.readStringUntil('\n');
    break;     
  }
  return fileContent;
}

void writeFile(const char * path, const char * message){
  File file = LittleFS.open(path, FILE_WRITE);
  
  if(file.print(message)){
    Serial.println("- file written");
  } else {
    Serial.println("- write failed");
  }
}

void generateServer() {
  WiFi.softAP("Fermonitor V1", NULL);
  IPAddress IP = WiFi.softAPIP();
  
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/html", index_html);
  });

  server.on("/", HTTP_POST, [](AsyncWebServerRequest *request) {
    int params = request->params();
    for(int i = 0; i < params; i++){
      AsyncWebParameter* p = request->getParam(i);
      if(p->isPost()){
        if (p->name() == "ssid") {
          WIFI_SSID = p->value().c_str();
          writeFile(ssidPath, WIFI_SSID.c_str());
        }
        if (p->name() == "pass") {
          WIFI_PASS = p->value().c_str();
          writeFile(passPath, WIFI_PASS.c_str());
        }
      }
    }
    request->send(200, "text/plain", "Berhasil. Pengaturan WiFi berhasil di simpan, sistem akan melakukan restart.");
    
    delay(3000);
    ESP.restart();
  });

  server.begin();
}

class CaptiveRequestHandler : public AsyncWebHandler {
public:
  CaptiveRequestHandler() {}
  virtual ~CaptiveRequestHandler() {}

  bool canHandle(AsyncWebServerRequest *request){
    //request->addInterestingHeader("ANY");
    return true;
  }

  void handleRequest(AsyncWebServerRequest *request) {
    request->send(200, "text/html", index_html);
  }
};

void setup(){
  status = "Menunggu";

  pinMode(MQPIN, INPUT);
  pinMode(LAMPPIN, OUTPUT);
  pinMode(FANPIN, OUTPUT);
  pinMode(BUZZERPIN, OUTPUT);

  digitalWrite(LAMPPIN, HIGH);
  digitalWrite(FANPIN, HIGH);
  digitalWrite(BUZZERPIN, LOW);

  Serial.begin(115200);

  // inisialisasi filesystem
  initLittleFS();

  WIFI_SSID = readFile(ssidPath);
  WIFI_PASS = readFile(passPath);

  Serial.println(WIFI_SSID);
  Serial.println(WIFI_PASS);

  // inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();

  // inisialisasi DHT22
  dht.begin();

  // inisialisasi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int i = 0;
  int duration = 20;

  Serial.println("Memuat.......");

  while (i < duration) {
    int loading = i / ((float) duration) * 100;

    Serial.println("Memuat: " + String(loading) + "%");

    lcd.setCursor(0, 0);
    // lcd.print("SSID      : " + String(WIFI_SSID));
    // lcd.setCursor(0, 1);
    lcd.print("Memuat    : " + String(loading) + "%");

    delay(1000);
    i += 1;
  }

  // inisialisasi web server wifi manager
  generateServer();

  if (WiFi.status() == WL_CONNECTED) {
    // inisialisasi mail client
    // MailClient.networkReconnect(true);
    // smtp.debug(0);
    // smtp.callback(smtpCallback);
    
    // inisialisasi waktu
    timeClient.begin();

    // inisialisasi supabase
    db.begin(SUPABASE_URL, SUPABASE_ANON_KEY);

    getDataPengujian();

  }

  // inisialisasi dns server
  dns.start(53, "*", WiFi.softAPIP());
  server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
}

void loop(){
  dns.processNextRequest();

  if (WiFi.status() == WL_CONNECTED) {
    getPengaturan();
    timeClient.update();

    // mengambil data status mesin
    bool running = (bool) pengaturan[0]["running"];

    if (running) {
      runFermentasi();
    } else {
      digitalWrite(LAMPPIN, HIGH);
      digitalWrite(FANPIN, HIGH);
      digitalWrite(BUZZERPIN, LOW);
      status = "Menunggu";

      Serial.println("Mesin Siap!");

      // menampilkan aku siap jika alat belum dirunning
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Aku siap!");
      delay(1000);

      lcd.clear();
      lcd.setCursor(7, 0);
      lcd.print("Aku siap!");
      delay(1000);

      lcd.clear();
      lcd.setCursor(0, 1);
      lcd.print("Aku siap!");
      delay(1000);

      lcd.clear();
      lcd.setCursor(7, 1);
      lcd.print("Aku siap!");
      delay(1000);
    }
  } else {
    Serial.println("Gagal terhubung ke " + WIFI_SSID);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Gagal terhubung");
    lcd.setCursor(0, 1);
    lcd.print("ke " + WIFI_SSID + "!");

    delay(1000);
  }
}

void runFermentasi() {
  // mendapatkan nilai kadar gas
  float kadarGas = getKadarGas();
  kadarGasVoltase = kadarGas / 4095.0 * 3.3;
  persentaseKadarGas = getPersentaseKadarGas(kadarGasVoltase);
  
  // menampilkan kadar gas pada LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("G : ");
  lcd.print(persentaseKadarGas, 1);
  lcd.print(" %");
  lcd.setCursor(0,1);
  lcd.print("H : ");
  lcd.print(status);

  delay(2000);

  // membaca nilai suhu dan kelembaban
  suhu = dht.readTemperature();
  kelembaban = dht.readHumidity();

  if (suhu != 25.5 && kelembaban != 25.5) {
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

    bool otomatis = (bool) pengaturan[0]["auto"];
    int suhuMin = (int) pengaturan[0]["suhu_min"];
    int suhuMax = (int) pengaturan[0]["suhu_max"];

    // pilihan user menghidupkan kontrol otomatis atau manual
    if (otomatis) {
      // menyalakan lampu jika suhu di bawah suhu minimal
      if (suhu <= suhuMin) {
        digitalWrite(LAMPPIN, LOW);
      } else {
        digitalWrite(LAMPPIN, HIGH);
      }

      // menyalakan kipas jika suhu di atas suhu maximal
      if (suhu >= suhuMax) {
        digitalWrite(FANPIN, LOW);
      } else {
        digitalWrite(FANPIN, HIGH);
      }
    } else {
      bool lampOn = (bool) pengaturan[0]["lamp_on"];
      bool fanOn = (bool) pengaturan[0]["fan_on"];

      digitalWrite(LAMPPIN, lampOn ? LOW : HIGH);
      digitalWrite(FANPIN, fanOn ? LOW : HIGH);
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

    getDebugging();

    String dataHistoriJson = db.from("histori_fermentasi").select("*").order("created_at", "desc", true).limit(1).doSelect();
    JSONVar dataHistori = JSON.parse(dataHistoriJson);
    bool statusHistoriTerakhir = dataHistori[0]["selesai"];

    if (statusHistoriTerakhir == false) {
      digitalWrite(BUZZERPIN, HIGH);

      bool historiTerakhirBerhasil = (bool) dataHistori[0]["berhasil"];

      if (historiTerakhirBerhasil) {
        status = "Matang";
      } else {
        status = "Gagal";
      }
    } else {
      digitalWrite(BUZZERPIN, LOW);
      insertKondisiTapai();
      cekKematangan();
    }

    delay(2000);
    lcd.clear();
  }
}

void getDebugging() {
  Serial.println("Voltase Kadar Gas : " + String(kadarGasVoltase));
  Serial.println("Persentase Kadar Gas : " + String(persentaseKadarGas) + " %");
  Serial.println("Suhu : " + String(suhu) + " C");
  Serial.println("Kelembaban : " + String(kelembaban) + " %");
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
  float persentase = 0.0448 * voltase - 0.0058;
  float hasil = constrain(persentase * 100, 0, 100);

  // float persentase = 0.2043 * pow(voltase, 2.0) + 0.0611 * voltase - 0.0249;
  // float hasil = constrain(persentase * 100, 0, 100);

  return hasil;
}

void getPengaturan() {
  String dataJson = db.from("pengaturan").select("*").limit(1).doSelect();
  JSONVar data = JSON.parse(dataJson);
  pengaturan = data;
}

void callUser(bool matang = true) {
  String web_url = pengaturan[0]["web_url"];

  String text;
  if (matang == true) {
    text = "Fermentasi tapai berhasil dan sudah matang. ";
  } else {
    text = "Fermentasi tapai gagal. ";
  }

  text = text + "Lihat selengkapnya di " + web_url + ".";

  Callmebot.telegramCall(pengaturan[0]["telepon"], text, "id-ID-Standard-B");
  Serial.println(Callmebot.debug());
  sendEmail(text);
}

void sendEmail(String text) {
  // Session_Config config;
  // config.server.host_name = SMTP_HOST;
  // config.server.port = SMTP_PORT;
  // config.login.email = AUTHOR_EMAIL;
  // config.login.password = AUTHOR_PASSWORD;
  // config.login.user_domain = "";
  // config.time.ntp_server = F("pool.ntp.org,time.nist.gov");
  // config.time.gmt_offset = 7;
  // config.time.day_light_offset = 0;

  // SMTP_Message message;
  // String emailRecipient = pengaturan[0]["email"];
  // message.sender.name = F("Fermonitor");
  // message.sender.email = "fermonitor@official.com";
  // message.subject = "Status Fermentasi Tapai";
  // message.addRecipient(emailRecipient, emailRecipient);

  // message.text.content = text.c_str();
  // message.text.charSet = "us-ascii";
  // message.text.transfer_encoding = Content_Transfer_Encoding::enc_7bit;

  // message.priority = esp_mail_smtp_priority::esp_mail_smtp_priority_low;
  // message.response.notify = esp_mail_smtp_notify_success | esp_mail_smtp_notify_failure | esp_mail_smtp_notify_delay;

  // if (!smtp.connect(&config)){
  //   ESP_MAIL_PRINTF("Connection error, Status Code: %d, Error Code: %d, Reason: %s", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
  //   return;
  // }

  // if (!smtp.isLoggedIn()){
  //   Serial.println("Gagal login akun email");
  // }

  // else{
  //   if (smtp.isAuthenticated()) {
  //     Serial.println("Berhasil login email");
  //   } else {
  //     Serial.println("Terhubung ke email tanpa otorisasi");
  //   }
  // }


  // if (!MailClient.sendMail(&smtp, &message)) {
  //   ESP_MAIL_PRINTF("Error, Status Code: %d, Error Code: %d, Reason: %s", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
  // }
}

// void smtpCallback(SMTP_Status status){
//   // hapus memory email jika berhasil terkirim
//   if (status.success()){
//     smtp.sendingResult.clear();
//   }
// }

// menyimpan kondisi tapai pada database
void insertKondisiTapai() {
  JSONVar req;

  req["suhu"] = (float) suhu;
  req["kelembaban"] = (float) kelembaban;
  req["kadar_gas"] = (float) persentaseKadarGas;
  // req["pengujian"] = (bool) pengujian;
  req["created_time"] = (int) timeClient.getEpochTime();

  String json = JSON.stringify(req);
  db.from("realtime_data").eq("id", "1").doUpdate(json);
  // db.insert("kondisi_tapai", json, false);
  
  if (pengujian == true) {
    db.insert("kondisi_tapai", json, false);
    getDataPengujian();
    cekKegagalan();
  }
}

int getLamaJamFermentasi() {
  JSONVar dataPengujianAwal = dataPengujian[0];
  int epochTimeAwal = (int) dataPengujianAwal["created_time"];
  int epochTimeSekarang = timeClient.getEpochTime();

  int epochTimeDiff = epochTimeSekarang - epochTimeAwal;
  int lamaJam = epochTimeDiff / 3600;

  return lamaJam;
}

void insertHistory(bool berhasil = true) {
    String dataAwalJson = db.from("kondisi_tapai").select("*").order("created_time", "asc", true).limit(1).doSelect();
    String dataAkhirJson = db.from("kondisi_tapai").select("*").order("created_time", "desc", true).limit(1).doSelect();

    JSONVar dataAwal = JSON.parse(dataAwalJson);
    JSONVar dataAkhir = JSON.parse(dataAkhirJson);

    JSONVar req;
    req["berhasil"] = berhasil;
    req["waktu_awal"] = (int) dataAwal[0]["created_time"];
    req["waktu_akhir"] = (int) dataAkhir[0]["created_time"];

    String json = JSON.stringify(req);

    db.insert("histori_fermentasi", json, false);
    callUser(berhasil);

    pengujian = true;
}

// melakukan cek kematangan
void cekKematangan() {
  int lamaJam = getLamaJamFermentasi();

  // jika sudah lebih dari 24 jam
  // if (lamaJam > 24) {

  if (dataPengujian.length() > 0) {
    if (persentaseKadarGas >= 5.28 || lamaJam >= 72) {
      status = "Matang";
      pengujian = true;
      insertKondisiTapai();
      insertHistory(true);
    }
  }
}

// mengecek kegagalan
void cekKegagalan() {
  int lamaJam = getLamaJamFermentasi();

  // = -0,000006 * (x * x) + (0,0013 * x) + 0,002;
  float regresiKadarGas = -0.000006 * pow(lamaJam, 2.0) + 0.0013 * lamaJam + 0.002;
  regresiKadarGas = regresiKadarGas * 100;
  float nilaiPertiga = regresiKadarGas / 3.0;

  if (lamaJam > 12) {
    // jika kadar gas tidak naik secara signifikan
    // if (persentaseKadarGas > (regresiKadarGas + nilaiPertiga) || persentaseKadarGas < (regresiKadarGas - nilaiPertiga)) {
    if (persentaseKadarGas < (regresiKadarGas - nilaiPertiga)) {
      status = "Gagal";
      insertHistory(false);
    }
  }
}

// mengambil data pengujian
void getDataPengujian() {
  String json = db.from("kondisi_tapai").select("*").order("created_time", "asc", true).doSelect();
  // String json = db.from("kondisi_tapai").select("*").eq("pengujian", "TRUE").order("created_time", "asc", true).doSelect();
  dataPengujian = JSON.parse(json);
}