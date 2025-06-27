#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker settings
const char* mqtt_server = "YOUR_MQTT_SERVER_IP";
const int mqtt_port = 1883;
const char* mqtt_user = "YOUR_MQTT_USERNAME";
const char* mqtt_password = "YOUR_MQTT_PASSWORD";
const char* mqtt_client_id = "esp8266_dht22_sensor";
const char* mqtt_topic = "sensors/dht22/readings";
const char* mqtt_topic_lcd = "sensors/dht22/lcd";

// DHT22 sensor settings
#define DHTPIN 2      // GPIO2 (D4 on NodeMCU)
#define DHTTYPE DHT22 // DHT22 sensor

// I2C LCD settings
// Default I2C pins on ESP8266: SDA = GPIO4 (D2), SCL = GPIO5 (D1)
LiquidCrystal_I2C lcd(0x27, 16, 2); // Set the LCD address to 0x27 for a 16 chars and 2 line display
// Note: If 0x27 doesn't work, try 0x3F or scan the I2C bus

// Update interval in milliseconds (30 seconds)
const long interval = 30000;
unsigned long previousMillis = 0;

// LCD update interval (2 seconds)
const long lcdInterval = 2000;
unsigned long previousLcdMillis = 0;

// Display mode (0 = temp/humidity, 1 = IP address, 2 = custom message)
int displayMode = 0;
String customMessage = "";

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Initialize WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Serial.println("DHT22 + ESP8266 MQTT Temperature & Humidity Monitor with LCD");
  
  // Initialize I2C LCD
  Wire.begin(4, 5); // SDA, SCL
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  setup_wifi();
  
  // Configure MQTT connection
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Display IP address on LCD
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
  
  // Handle LCD commands
  if (String(topic) == mqtt_topic_lcd) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      if (doc.containsKey("mode")) {
        displayMode = doc["mode"];
      }
      
      if (doc.containsKey("message")) {
        customMessage = doc["message"].as<String>();
        // Immediately update LCD with custom message
        if (displayMode == 2) {
          lcd.clear();
          lcd.setCursor(0, 0);
          
          // If message contains a pipe character, split into two lines
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
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connecting MQTT");
    
    // Attempt to connect
    if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
      lcd.setCursor(0, 1);
      lcd.print("Connected!");
      
      // Subscribe to LCD topic
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
    case 0: // Temperature and humidity
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Temp: ");
      lcd.print(temperature, 1);
      lcd.print((char)223); // Degree symbol
      lcd.print("C");
      
      lcd.setCursor(0, 1);
      lcd.print("Humidity: ");
      lcd.print(humidity, 1);
      lcd.print("%");
      break;
      
    case 1: // IP address
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("IP Address:");
      lcd.setCursor(0, 1);
      lcd.print(WiFi.localIP().toString());
      break;
      
    case 2: // Custom message already handled in callback
      // Do nothing here as it's handled when the message arrives
      break;
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();
  
  // Check if it's time to read sensor and publish data
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    // Read temperature and humidity
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    // Check if any reads failed
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Sensor Error!");
      return;
    }

    // Print readings to serial monitor
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" °C, Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    // Create JSON document
    StaticJsonDocument<200> doc;
    doc["device_id"] = mqtt_client_id;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["timestamp"] = millis();

    // Serialize JSON to string
    char buffer[256];
    size_t n = serializeJson(doc, buffer);

    // Publish to MQTT topic
    if (client.publish(mqtt_topic, buffer, n)) {
      Serial.println("Data published to MQTT successfully");
    } else {
      Serial.println("Failed to publish data to MQTT");
    }
    
    // Update LCD with new readings
    updateLCD(temperature, humidity);
  }
  
  // Update LCD periodically if in mode 0 (temp/humidity)
  if (displayMode == 0 && currentMillis - previousLcdMillis >= lcdInterval) {
    previousLcdMillis = currentMillis;
    
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    if (!isnan(humidity) && !isnan(temperature)) {
      updateLCD(temperature, humidity);
    }
  }
}
