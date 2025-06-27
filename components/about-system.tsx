import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AboutSystem() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About TiNoq Sense</CardTitle>
        <CardDescription>IoT Temperature & Humidity Monitoring System</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="software">Software</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium">TiNoq Sense</h3>
              <p className="mt-2">
                TiNoq Sense is a comprehensive IoT solution for monitoring temperature and humidity in real-time. The
                system combines hardware sensors with a powerful web dashboard to provide accurate environmental
                monitoring for homes, offices, server rooms, greenhouses, or any space where climate control is
                important.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">System Architecture</h3>
              <p className="mt-2">The system consists of three main components:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Sensor Node:</strong> ESP8266 microcontroller with DHT22 temperature/humidity sensor and I2C
                  LCD display
                </li>
                <li>
                  <strong>Backend Server:</strong> Node.js server with MongoDB database and MQTT broker
                </li>
                <li>
                  <strong>Web Dashboard:</strong> Next.js frontend with real-time updates and data visualization
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">Version Information</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm">System Version:</div>
                <div className="text-sm font-medium">1.0.0</div>
                <div className="text-sm">Firmware Version:</div>
                <div className="text-sm font-medium">1.0.0</div>
                <div className="text-sm">Backend Version:</div>
                <div className="text-sm font-medium">1.0.0</div>
                <div className="text-sm">Frontend Version:</div>
                <div className="text-sm font-medium">1.0.0</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium">Key Features</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Real-time temperature and humidity monitoring</li>
                <li>Historical data tracking with customizable time ranges</li>
                <li>Interactive data visualization with charts and gauges</li>
                <li>LCD display for on-device readings</li>
                <li>Customizable LCD display modes and messages</li>
                <li>User management with role-based access control</li>
                <li>Report generation (daily, weekly, monthly, yearly)</li>
                <li>Responsive web interface for desktop and mobile devices</li>
                <li>WebSocket-based real-time updates</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium">Hardware Components</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Microcontroller:</strong> ESP8266 NodeMCU
                  <ul className="list-disc pl-5 mt-1">
                    <li>80MHz Tensilica Xtensa LX106 processor</li>
                    <li>4MB flash memory</li>
                    <li>Built-in Wi-Fi (802.11 b/g/n)</li>
                    <li>GPIO pins for sensor and display connections</li>
                  </ul>
                </li>
                <li className="mt-2">
                  <strong>Sensor:</strong> DHT22 Temperature and Humidity Sensor
                  <ul className="list-disc pl-5 mt-1">
                    <li>Temperature range: -40°C to 80°C (±0.5°C accuracy)</li>
                    <li>Humidity range: 0-100% RH (±2% accuracy)</li>
                    <li>Sampling rate: 0.5 Hz (once every 2 seconds)</li>
                  </ul>
                </li>
                <li className="mt-2">
                  <strong>Display:</strong> 16x2 or 20x4 I2C LCD Display
                  <ul className="list-disc pl-5 mt-1">
                    <li>16 columns x 2 rows or 20 columns x 4 rows character display</li>
                    <li>I2C interface for simplified wiring</li>
                    <li>Backlight for better visibility</li>
                    <li>Adjustable contrast</li>
                  </ul>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="software" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium">Software Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-medium">Firmware</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Arduino framework</li>
                    <li>ESP8266WiFi library</li>
                    <li>PubSubClient (MQTT)</li>
                    <li>ArduinoJson</li>
                    <li>DHT sensor library</li>
                    <li>LiquidCrystal_I2C</li>
                    <li>Wire (I2C)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Backend</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Node.js</li>
                    <li>Express.js</li>
                    <li>MongoDB (with Mongoose)</li>
                    <li>MQTT.js</li>
                    <li>Socket.io</li>
                    <li>JSON Web Tokens (JWT)</li>
                    <li>bcrypt (password hashing)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Frontend</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Next.js</li>
                    <li>React</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                    <li>shadcn/ui components</li>
                    <li>Recharts (data visualization)</li>
                    <li>Socket.io client</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
