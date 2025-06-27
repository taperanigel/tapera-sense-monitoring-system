import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WiringDiagram from "@/wiring-diagram"

export default function SetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Guide</CardTitle>
        <CardDescription>Follow these steps to set up your IoT monitoring system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hardware">
          <TabsList>
            <TabsTrigger value="hardware">Hardware Setup</TabsTrigger>
            <TabsTrigger value="esp8266">ESP8266 Code</TabsTrigger>
            <TabsTrigger value="server">Server Setup</TabsTrigger>
            <TabsTrigger value="frontend">Frontend Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="hardware">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Components Needed</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>ESP8266 NodeMCU</li>
                <li>DHT22 Temperature and Humidity Sensor</li>
                <li>10K Ohm Resistor</li>
                <li>Breadboard</li>
                <li>Jumper Wires</li>
              </ul>

              <h3 className="text-lg font-medium">Wiring Diagram</h3>
              <WiringDiagram />
            </div>
          </TabsContent>

          <TabsContent value="esp8266">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">ESP8266 Setup</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Install Arduino IDE from{" "}
                  <a
                    href="https://www.arduino.cc/en/software"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    arduino.cc
                  </a>
                </li>
                <li>
                  Add ESP8266 board support: In Arduino IDE, go to File > Preferences and add{" "}
                  <code>http://arduino.esp8266.com/stable/package_esp8266com_index.json</code> to Additional Boards
                  Manager URLs
                </li>
                <li>Install ESP8266 board: Go to Tools > Board > Boards Manager, search for ESP8266 and install</li>
                <li>
                  Install required libraries: Go to Sketch > Include Library > Manage Libraries and install:
                  <ul className="list-disc pl-5 mt-2">
                    <li>DHT sensor library by Adafruit</li>
                    <li>PubSubClient by Nick O'Leary</li>
                    <li>ArduinoJson by Benoit Blanchon</li>
                  </ul>
                </li>
                <li>Open the ESP8266 code provided in this project</li>
                <li>Update WiFi credentials and MQTT server settings</li>
                <li>Select your board (NodeMCU 1.0) and port in Tools menu</li>
                <li>Upload the code to your ESP8266</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="server">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Server Setup</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Install Node.js and npm from{" "}
                  <a
                    href="https://nodejs.org"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    nodejs.org
                  </a>
                </li>
                <li>
                  Install MongoDB from{" "}
                  <a
                    href="https://www.mongodb.com/try/download/community"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    mongodb.com
                  </a>
                </li>
                <li>
                  Install MQTT broker (Mosquitto):
                  <ul className="list-disc pl-5 mt-2">
                    <li>
                      Windows: Download from{" "}
                      <a
                        href="https://mosquitto.org/download/"
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        mosquitto.org
                      </a>
                    </li>
                    <li>
                      Linux: <code>sudo apt install mosquitto mosquitto-clients</code>
                    </li>
                    <li>
                      macOS: <code>brew install mosquitto</code>
                    </li>
                  </ul>
                </li>
                <li>Clone the project repository</li>
                <li>
                  Navigate to the server directory: <code>cd server</code>
                </li>
                <li>
                  Install dependencies: <code>npm install</code>
                </li>
                <li>
                  Configure environment variables in <code>.env</code> file
                </li>
                <li>
                  Start the server: <code>npm start</code>
                </li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="frontend">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Frontend Setup</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Navigate to the project root directory</li>
                <li>
                  Install dependencies: <code>npm install</code>
                </li>
                <li>
                  Configure environment variables in <code>.env.local</code> file
                </li>
                <li>
                  Start the development server: <code>npm run dev</code>
                </li>
                <li>
                  Open your browser and navigate to <code>http://localhost:3000</code>
                </li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
