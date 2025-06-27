import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LcdSetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>I2C LCD Setup Guide</CardTitle>
        <CardDescription>How to set up the I2C LCD display with your ESP8266</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hardware">
          <TabsList>
            <TabsTrigger value="hardware">Hardware Setup</TabsTrigger>
            <TabsTrigger value="software">Software Setup</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="hardware">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Components Needed</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>16x2 or 20x4 LCD Display with I2C adapter</li>
                <li>ESP8266 NodeMCU</li>
                <li>Jumper Wires</li>
                <li>Breadboard</li>
              </ul>

              <h3 className="text-lg font-medium">Wiring Diagram</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`
  ESP8266 NodeMCU     I2C LCD Module
  +-----------+       +-----------+
  |           |       |           |
  |       3V3 +-------+ VCC       |
  |           |       |           |
  |       GND +-------+ GND       |
  |           |       |           |
  |        D1 +-------+ SCL       |
  |           |       |           |
  |        D2 +-------+ SDA       |
  |           |       |           |
  +-----------+       +-----------+

  Notes:
  - D1 corresponds to GPIO5 on the ESP8266
  - D2 corresponds to GPIO4 on the ESP8266
  - Some I2C LCD modules may have different pin labels:
    - VCC might be labeled as VDD
    - SCL might be labeled as SCK or CLK
    - SDA might be labeled as DATA
                  `}
                </pre>
              </div>

              <h3 className="text-lg font-medium">About I2C LCD Displays</h3>
              <p>
                I2C LCD displays consist of a standard character LCD (usually 16x2 or 20x4 characters) with an I2C
                adapter backpack. The I2C adapter reduces the number of pins needed to connect to the microcontroller
                from 6+ pins to just 4 pins (VCC, GND, SDA, SCL).
              </p>
              <p className="mt-2">
                Most I2C LCD modules use the PCF8574 I2C port expander chip, which has a default I2C address of 0x27,
                but some modules may use 0x3F or other addresses.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="software">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Software Setup</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Install the required libraries in Arduino IDE:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Wire (included with Arduino)</li>
                    <li>LiquidCrystal_I2C by Frank de Brabander</li>
                  </ul>
                </li>
                <li>Upload the provided ESP8266 firmware code to your device</li>
                <li>
                  If your LCD doesn't work with the default address (0x27), you may need to find the correct address:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Use the I2C Scanner sketch to find the correct address</li>
                    <li>Common addresses are 0x27, 0x3F, 0x20, and 0x38</li>
                  </ul>
                </li>
              </ol>

              <h3 className="text-lg font-medium">I2C Scanner Code</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-2">
                <pre className="text-sm overflow-x-auto">
                  {`
  #include <Wire.h>
  
  void setup() {
    Wire.begin(4, 5); // SDA, SCL for ESP8266
    Serial.begin(115200);
    Serial.println("\\nI2C Scanner");
  }
  
  void loop() {
    byte error, address;
    int nDevices;
  
    Serial.println("Scanning...");
  
    nDevices = 0;
    for(address = 1; address < 127; address++) {
      Wire.beginTransmission(address);
      error = Wire.endTransmission();
  
      if (error == 0) {
        Serial.print("I2C device found at address 0x");
        if (address < 16) {
          Serial.print("0");
        }
        Serial.print(address, HEX);
        Serial.println("  !");
  
        nDevices++;
      }
      else if (error == 4) {
        Serial.print("Unknown error at address 0x");
        if (address < 16) {
          Serial.print("0");
        }
        Serial.println(address, HEX);
      }    
    }
    
    if (nDevices == 0) {
      Serial.println("No I2C devices found\\n");
    } else {
      Serial.println("Done.\\n");
    }
    
    delay(5000); // Wait 5 seconds before scanning again
  }
                  `}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Common Issues</h3>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">LCD not displaying anything</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check power connections (VCC and GND)</li>
                    <li>Verify I2C address is correct (use I2C scanner)</li>
                    <li>Adjust contrast using the potentiometer on the I2C adapter</li>
                    <li>Ensure the backlight is enabled in the code</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Garbled or incorrect characters</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check I2C connections (SDA and SCL)</li>
                    <li>Verify the LCD initialization parameters (columns and rows)</li>
                    <li>Try a different I2C speed (Wire.setClock())</li>
                    <li>Check for interference or long wire lengths</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">I2C device not found</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Run the I2C scanner to find the correct address</li>
                    <li>Check all connections</li>
                    <li>Try different SDA/SCL pins (update in code)</li>
                    <li>Some I2C adapters may need pull-up resistors (4.7kΩ) on SDA/SCL lines</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Backlight issues</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check if backlight is enabled in code (lcd.backlight())</li>
                    <li>Some I2C adapters have a jumper to enable/disable backlight</li>
                    <li>Verify VCC voltage is sufficient (3.3V may be too low for some displays)</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-4">Adjusting Contrast</h3>
              <p>
                Most I2C LCD adapters have a small potentiometer (blue or yellow box with a screw) that controls the
                contrast. If your display is powered but shows nothing or just black boxes, try adjusting this
                potentiometer with a small screwdriver.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
