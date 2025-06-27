export default function WiringDiagram() {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">ESP8266 + DHT22 Wiring Diagram</h2>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <pre className="text-sm overflow-x-auto">
          {`
  ESP8266 NodeMCU     DHT22 Sensor
  +-----------+       +-----------+
  |           |       |           |
  |       3V3 +-------+ VCC       |
  |           |       |           |
  |        D4 +-------+ DATA      |
  |           |       |           |
  |       GND +-------+ GND       |
  |           |       |           |
  +-----------+       +-----------+

  Notes:
  - Connect a 10K resistor between VCC and DATA pins
  - Make sure to use 3.3V for VCC, not 5V
  - D4 corresponds to GPIO2 on the ESP8266
          `}
        </pre>
      </div>
    </div>
  )
}
