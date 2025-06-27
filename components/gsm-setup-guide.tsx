import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GsmSetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GSM Module Setup Guide</CardTitle>
        <CardDescription>How to set up the SIM800L GSM module with your ESP8266</CardDescription>
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
                <li>SIM800L GSM/GPRS Module</li>
                <li>SIM Card (with SMS capability)</li>
                <li>3.7V-4.2V Power Supply (LiPo battery or voltage regulator)</li>
                <li>1000μF Capacitor</li>
                <li>Jumper Wires</li>
              </ul>

              <h3 className="text-lg font-medium">Wiring Diagram</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`
  ESP8266 NodeMCU     SIM800L Module
  +-----------+       +-----------+
  |           |       |           |
  |       3V3 +---+   | VCC       |
  |           |   |   |           |
  |           |   +---+ RST       |
  |           |       |           |
  |        D2 +-------+ RX        |
  |           |       |           |
  |        D3 +-------+ TX        |
  |           |       |           |
  |       GND +-------+ GND       |
  |           |       |           |
  +-----------+       +-----------+

  Notes:
  - The SIM800L typically requires 3.7V-4.2V. Use a voltage regulator if needed.
  - Connect a 1000μF capacitor between VCC and GND to handle power spikes.
  - D2 (GPIO4) connects to RX of SIM800L
  - D3 (GPIO0) connects to TX of SIM800L
                  `}
                </pre>
              </div>

              <h3 className="text-lg font-medium">Power Supply Considerations</h3>
              <p>
                The SIM800L module requires a stable power supply capable of handling current spikes up to 2A during
                transmission. The ESP8266's 3.3V output is not sufficient. Consider these options:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use a 3.7V LiPo battery (recommended)</li>
                <li>Use a dedicated 4.2V power supply</li>
                <li>Use a voltage regulator (like LM2596) to convert from a higher voltage</li>
              </ul>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ Always add a large capacitor (1000μF or more) between VCC and GND to handle current spikes.
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
                    <li>SoftwareSerial (included with Arduino)</li>
                  </ul>
                </li>
                <li>Upload the provided ESP8266 firmware code to your device</li>
                <li>
                  Make sure your SIM card:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Has SMS capability</li>
                    <li>Has sufficient credit for sending SMS</li>
                    <li>Has PIN code disabled</li>
                  </ul>
                </li>
                <li>
                  Configure the server settings to enable SMS alerts:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Set up alert thresholds in the web interface</li>
                    <li>Add phone numbers with country code (e.g., +1 for US)</li>
                  </ul>
                </li>
              </ol>

              <h3 className="text-lg font-medium">Testing the GSM Module</h3>
              <p>You can test the GSM module directly using AT commands through the Serial Monitor:</p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-2">
                <pre className="text-sm overflow-x-auto">
                  {`
  AT                    // Check if module is responsive
  AT+CPIN?              // Check if SIM card is ready
  AT+CSQ                // Check signal quality (0-31, higher is better)
  AT+COPS?              // Check network operator
  AT+CMGF=1             // Set SMS text mode
  AT+CMGS="+1234567890" // Send SMS (replace with actual number)
  > Hello World!        // Type message, end with Ctrl+Z (ASCII 26)
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
                  <h4 className="font-medium">Module not responding</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check power supply (should be 3.7V-4.2V)</li>
                    <li>Ensure capacitor is properly connected</li>
                    <li>Verify TX/RX connections (they should be crossed: ESP TX → SIM RX)</li>
                    <li>Press the reset button on the SIM800L module</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Network registration failed</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check if SIM card is properly inserted</li>
                    <li>Ensure SIM card is activated and has credit</li>
                    <li>Check if PIN code is disabled</li>
                    <li>Try moving the module to an area with better signal</li>
                    <li>Check antenna connection</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">SMS not sending</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Verify the phone number format (include country code with + prefix)</li>
                    <li>Check if SIM card has sufficient credit</li>
                    <li>Ensure network signal is strong enough</li>
                    <li>Check if the carrier supports the SMS service</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Power issues</h4>
                  <ul className="list-disc pl-5 mt-1">
                    <li>SIM800L needs 3.7V-4.2V and can draw up to 2A during transmission</li>
                    <li>ESP8266's 3.3V output is not sufficient</li>
                    <li>Use a separate power supply for the SIM800L module</li>
                    <li>Add a large capacitor (1000μF or more) to handle current spikes</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-4">LED Status Indicators</h3>
              <p>The SIM800L module has an onboard LED that indicates its status:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>
                  <strong>Fast blinking (once every second):</strong> Network searching
                </li>
                <li>
                  <strong>Slow blinking (once every 3 seconds):</strong> Network registered, ready
                </li>
                <li>
                  <strong>Very slow blinking (once every 5+ seconds):</strong> GPRS connected
                </li>
                <li>
                  <strong>Solid ON:</strong> Call in progress
                </li>
                <li>
                  <strong>OFF:</strong> Module powered off or in sleep mode
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
