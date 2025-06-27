#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <SoftwareSerial.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker settings
const char* mqtt_server = "YOUR_MQTT_SERVER_IP";
const int mqtt_port = 1883;
const char* mqtt_user = "YOUR_MQTT_USERNAME";
const char* mqtt_password = "YOUR_MQTT_PASSWORD";
const char* mqtt_client_id = "esp8266_dht22_sensor";
const char* mqtt_topic_readings = "sensors/dht22/readings";
const char* mqtt_topic_sms = "sensors/dht22/sms";

// DHT22 sensor settings
#define DHTPIN 2      // GPIO2 (D4 on NodeMCU)
#define DHTTYPE DHT22 // DHT22 sensor

// SIM800L module settings
#define SIM800L_RX 4  // D2 on NodeMCU
#define SIM800L_TX 0  // D3 on NodeMCU
SoftwareSerial sim800l(SIM800L_RX, SIM800L_TX);

// Update interval in milliseconds (30 seconds)
const long interval = 30000;
unsigned long previousMillis = 0;

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Initialize WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// SMS queue
#define MAX_SMS_QUEUE 5
struct SMS {
  String phoneNumber;
  String message;
  bool active;
};
SMS smsQueue[MAX_SMS_QUEUE];
int smsQueueIndex = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("DHT22 + ESP8266 MQTT Temperature & Humidity Monitor with SMS");
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize SIM800L
  sim800l.begin(9600);
  delay(1000);
  initGSM();
  
  // Connect to WiFi
  setup_wifi();
  
  // Configure MQTT connection
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Initialize SMS queue
  for (int i = 0; i < MAX_SMS_QUEUE; i++) {
    smsQueue[i].active = false;
  }
}

void initGSM() {
  Serial.println("Initializing GSM module...");
  sim800l.println("AT");
  delay(1000);
  sim800l.println("AT+CMGF=1"); // Set SMS text mode
  delay(1000);
  sim800l.println("AT+CNMI=1,2,0,0,0"); // Notify when new SMS received
  delay(1000);
  Serial.println("GSM module initialized");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
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
  
  // Handle SMS commands
  if (String(topic) == mqtt_topic_sms) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      String phoneNumber = doc["phoneNumber"].as<String>();
      String smsMessage = doc["message"].as<String>();
      
      if (phoneNumber.length() > 0 && smsMessage.length() > 0) {
        queueSMS(phoneNumber, smsMessage);
      }
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
      // Subscribe to SMS topic
      client.subscribe(mqtt_topic_sms);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void queueSMS(String phoneNumber, String message) {
  // Find an empty slot in the queue
  int slot = -1;
  for (int i = 0; i < MAX_SMS_QUEUE; i++) {
    if (!smsQueue[i].active) {
      slot = i;
      break;
    }
  }
  
  // If no empty slot, use the next one (circular buffer)
  if (slot == -1) {
    slot = smsQueueIndex;
    smsQueueIndex = (smsQueueIndex + 1) % MAX_SMS_QUEUE;
  }
  
  // Queue the SMS
  smsQueue[slot].phoneNumber = phoneNumber;
  smsQueue[slot].message = message;
  smsQueue[slot].active = true;
  
  Serial.print("SMS queued for ");
  Serial.println(phoneNumber);
}

void sendSMS(String phoneNumber, String message) {
  Serial.println("Sending SMS...");
  sim800l.println("AT+CMGF=1"); // Set SMS text mode
  delay(500);
  
  sim800l.print("AT+CMGS=\"");
  sim800l.print(phoneNumber);
  sim800l.println("\"");
  delay(500);
  
  sim800l.print(message);
  delay(500);
  sim800l.write(26); // End SMS with Ctrl+Z
  delay(1000);
  
  Serial.print("SMS sent to ");
  Serial.println(phoneNumber);
}

void processSMSQueue() {
  for (int i = 0; i < MAX_SMS_QUEUE; i++) {
    if (smsQueue[i].active) {
      sendSMS(smsQueue[i].phoneNumber, smsQueue[i].message);
      smsQueue[i].active = false;
      delay(3000); // Wait between sending SMS
      break; // Process one SMS at a time
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Process SMS queue
  processSMSQueue();

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
    if (client.publish(mqtt_topic_readings, buffer, n)) {
      Serial.println("Data published to MQTT successfully");
    } else {
      Serial.println("Failed to publish data to MQTT");
    }
  }
  
  // Check for incoming data from SIM800L
  while (sim800l.available()) {
    Serial.write(sim800l.read());
  }
}
