#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials
const char* ssid = "Tynoe Tapera";
const char* password = "Muteme3132@";

// MQTT Broker settings
const char* mqtt_server = "172.20.10.5";
const int mqtt_port = 1883;
const char* mqtt_user = "taperat";
const char* mqtt_password = "taperat3132";
const char* mqtt_client_id = "esp8266_dht22_sensor";
const char* mqtt_topic = "sensors/dht22/readings";
const char* mqtt_topic_lcd = "sensors/dht22/lcd";

// DHT22 sensor settings
#define DHTPIN 2      // GPIO2 (D4 on NodeMCU)
#define DHTTYPE DHT22 // DHT22 sensor

// I2C LCD settings
LiquidCrystal_I2C lcd(0x27, 16, 2); // LCD address 0x27, 16x2

// Button settings
#define BUTTON_PIN 0 // GPIO0 (D3)
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

// Timers
const long interval = 30000;
unsigned long previousMillis = 0;

const long lcdInterval = 2000;
unsigned long previousLcdMillis = 0;

// Display mode
int displayMode = 0;
String customMessage = "";

// DHT and MQTT
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Serial.println("DHT22 + ESP8266 MQTT Temperature & Humidity Monitor with LCD");

  Wire.begin(4, 5); // SDA = D2, SCL = D1
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");

  dht.begin();

  pinMode(BUTTON_PIN, INPUT_PULLUP); // Enable internal pull-up

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("IP Address:");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP().toString());
  delay(3000);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting to");
  lcd.setCursor(0, 1);
  lcd.print(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(15, 1);
    static int dots = 0;
    dots = (dots + 1) % 4;
    for (int i = 0; i < dots; i++) {
      lcd.print(".");
    }
    lcd.print("   ");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi connected!");
  delay(1000);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  if (String(topic) == mqtt_topic_lcd) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (!error) {
      if (doc.containsKey("mode")) {
        displayMode = doc["mode"];
      }

      if (doc.containsKey("message")) {
        customMessage = doc["message"].as<String>();
        if (displayMode == 2) {
          lcd.clear();
          lcd.setCursor(0, 0);

          int pipePos = customMessage.indexOf('|');
          if (pipePos > -1) {
            String line1 = customMessage.substring(0, pipePos);
            String line2 = customMessage.substring(pipePos + 1);
            lcd.print(line1);
            lcd.setCursor(0, 1);
            lcd.print(line2);
          } else {
            lcd.print(customMessage);
          }
        }
      }

      if (doc.containsKey("backlight")) {
        bool backlight = doc["backlight"];
        if (backlight) {
          lcd.backlight();
        } else {
          lcd.noBacklight();
        }
      }
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connecting MQTT");

    if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
      lcd.setCursor(0, 1);
      lcd.print("Connected!");
      client.subscribe(mqtt_topic_lcd);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      lcd.setCursor(0, 1);
      lcd.print("Failed! Retry...");
      delay(5000);
    }
  }
}

void updateLCD(float temperature, float humidity) {
  switch (displayMode) {
    case 0:
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Temp: ");
      lcd.print(temperature, 1);
      lcd.print((char)223);
      lcd.print("C");

      lcd.setCursor(0, 1);
      lcd.print("Humidity: ");
      lcd.print(humidity, 1);
      lcd.print("%");
      break;

    case 1:
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("IP Address:");
      lcd.setCursor(0, 1);
      lcd.print(WiFi.localIP().toString());
      break;

    case 2:
      // Custom message shown on arrival
      break;
  }
}

void checkButton() {
  bool reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastButtonState == HIGH) {
      // Button pressed, toggle display mode
      displayMode = (displayMode + 1) % 3;
      lcd.clear();
      Serial.print("Display mode changed to ");
      Serial.println(displayMode);
    }
  }

  lastButtonState = reading;
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  checkButton();

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Sensor Error!");
      return;
    }

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" °C, Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    StaticJsonDocument<200> doc;
    doc["device_id"] = mqtt_client_id;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["timestamp"] = millis();

    char buffer[256];
    size_t n = serializeJson(doc, buffer);

    if (client.publish(mqtt_topic, buffer, n)) {
      Serial.println("Data published to MQTT successfully");
    } else {
      Serial.println("Failed to publish data to MQTT");
    }

    updateLCD(temperature, humidity);
  }

  if (displayMode == 0 && currentMillis - previousLcdMillis >= lcdInterval) {
    previousLcdMillis = currentMillis;

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (!isnan(humidity) && !isnan(temperature)) {
      updateLCD(temperature, humidity);
    }
  }
}
