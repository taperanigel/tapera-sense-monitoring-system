"use client"

import { useState, useEffect } from "react"
import { Droplets } from "lucide-react"

interface HumidityGaugeProps {
  value: number
}

export default function HumidityGauge({ value }: HumidityGaugeProps) {
  const [color, setColor] = useState("text-blue-500")

  useEffect(() => {
    if (value < 30) {
      setColor("text-yellow-500")
    } else if (value < 60) {
      setColor("text-green-500")
    } else {
      setColor("text-blue-500")
    }
  }, [value])

  // Calculate the percentage for the gauge (assuming range 0-100%)
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="10"
            strokeDasharray={`${Math.PI * 90 * 0.75} ${Math.PI * 90 * 0.25}`}
            strokeDashoffset={Math.PI * 90 * 0.125}
            transform="rotate(-90 50 50)"
            className="dark:stroke-gray-700"
          />
          {/* Foreground circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${(Math.PI * 90 * 0.75 * percentage) / 100} ${Math.PI * 90 - (Math.PI * 90 * 0.75 * percentage) / 100}`}
            strokeDashoffset={Math.PI * 90 * 0.125}
            transform="rotate(-90 50 50)"
            className={color}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Droplets className={`w-8 h-8 ${color}`} />
          <div className="text-3xl font-bold mt-2">{value.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}
