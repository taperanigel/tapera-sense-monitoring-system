"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import type { HistoricalData } from "@/lib/types"
import { useMediaQuery } from "@/hooks/use-media-query"

interface HistoricalChartProps {
  data: HistoricalData
  timeframe: "24h" | "7d" | "30d"
}

export default function HistoricalChart({ data, timeframe }: HistoricalChartProps) {
  const { theme } = useTheme()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Format the data for the chart
    const formattedData = data.map((item) => {
      let formattedTime
      const timestamp = new Date(item.timestamp)

      if (timeframe === "24h") {
        formattedTime = timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: !isMobile, // Use 24h format on mobile to save space
        })
      } else if (timeframe === "7d") {
        formattedTime = isMobile
          ? timestamp.toLocaleDateString([], { month: "numeric", day: "numeric" })
          : timestamp.toLocaleDateString([], { month: "short", day: "numeric", hour: "numeric" })
      } else {
        formattedTime = timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
      }

      return {
        time: formattedTime,
        temperature: item.temperature,
        humidity: item.humidity,
      }
    })

    setChartData(formattedData)
  }, [data, timeframe, isMobile])

  // Determine colors based on theme
  const temperatureColor = theme === "dark" ? "#ff7c43" : "#ff4500"
  const humidityColor = theme === "dark" ? "#1e88e5" : "#0066cc"
  const gridColor = theme === "dark" ? "#333" : "#ddd"
  const textColor = theme === "dark" ? "#fff" : "#333"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="time"
          tick={{ fill: textColor, fontSize: isMobile ? 10 : 12 }}
          interval={isMobile ? "preserveStartEnd" : 0}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={[0, 50]}
          tick={{ fill: textColor }}
          label={{
            value: "°C",
            angle: -90,
            position: "insideLeft",
            fill: textColor,
            fontSize: isMobile ? 10 : 12,
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: textColor }}
          label={{
            value: "%",
            angle: 90,
            position: "insideRight",
            fill: textColor,
            fontSize: isMobile ? 10 : 12,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            borderColor: theme === "dark" ? "#555" : "#ddd",
            color: textColor,
          }}
        />
        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperature"
          stroke={temperatureColor}
          name="Temperature (°C)"
          dot={!isMobile}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="humidity"
          stroke={humidityColor}
          name="Humidity (%)"
          dot={!isMobile}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
