export interface Reading {
  _id: string
  deviceId: string
  temperature: number
  humidity: number
  timestamp: string
}

export type HistoricalData = Array<{
  _id: string
  temperature: number
  humidity: number
  timestamp: string
}>

export interface User {
  _id: string
  username: string
  email: string
  role: "admin" | "user"
  createdAt: string
}

export interface LcdConfig {
  _id: string
  userId: string
  mode: 0 | 1 | 2 // 0 = temp/humidity, 1 = IP address, 2 = custom message
  message: string
  backlight: boolean
  createdAt: string
  updatedAt: string
}
