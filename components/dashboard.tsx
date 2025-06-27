"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TemperatureGauge from "@/components/temperature-gauge"
import HumidityGauge from "@/components/humidity-gauge"
import HistoricalChart from "@/components/historical-chart"
import StatusIndicator from "@/components/status-indicator"
import LcdConfiguration from "@/components/lcd-config"
import UserManagement from "@/components/user-management"
import AboutSystem from "@/components/about-system"
import ReportGenerator from "@/components/report-generator"
import { io } from "socket.io-client"
import { fetchLatestReading, fetchHistoricalData, logout } from "@/lib/api"
import type { Reading, HistoricalData, User } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Monitor, Home, Settings, BarChart, Users, Info, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

// Socket.io connection
let socket: any

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [latestReading, setLatestReading] = useState<Reading | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const { toast } = useToast()

  useEffect(() => {
    // Initialize socket connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    socket = io(apiUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
      withCredentials: true,
    })

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const reading = await fetchLatestReading()
        setLatestReading(reading)
        setLastUpdated(new Date(reading.timestamp))

        const historical = await fetchHistoricalData(timeframe)
        setHistoricalData(historical)

        setIsConnected(true)
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        setIsConnected(false)
        toast({
          title: "Connection Error",
          description: "Failed to fetch sensor data. Please check your connection.",
          variant: "destructive",
        })
      }
    }

    fetchInitialData()

    // Set up Socket.io for real-time updates
    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
      setIsConnected(true)
      toast({
        title: "Connected",
        description: "Successfully connected to the sensor network.",
        duration: 3000,
      })
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
      setIsConnected(false)
      toast({
        title: "Disconnected",
        description: "Lost connection to the sensor network.",
        variant: "destructive",
      })
    })

    socket.on("newReading", (reading: Reading) => {
      console.log("New reading received:", reading)
      setLatestReading(reading)
      setLastUpdated(new Date(reading.timestamp))
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("newReading")
      socket.disconnect()
    }
  }, [])

  // Fetch historical data when timeframe changes
  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const historical = await fetchHistoricalData(timeframe)
        setHistoricalData(historical)
      } catch (error) {
        console.error("Failed to fetch historical data:", error)
        toast({
          title: "Data Error",
          description: "Failed to fetch historical data.",
          variant: "destructive",
        })
      }
    }

    fetchHistorical()
  }, [timeframe])

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as "24h" | "7d" | "30d")
  }

  const handleLogout = async () => {
    try {
      await logout()
      onLogout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar className="hidden md:block w-64 border-r">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">TiNoq Sense</h1>
            <p className="text-sm text-muted-foreground">IoT Monitoring System</p>
          </div>

          <div className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>

              <Button
                variant={activeTab === "historical" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("historical")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Historical Data
              </Button>

              <Button
                variant={activeTab === "lcd" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("lcd")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                LCD Display
              </Button>

              <Button
                variant={activeTab === "reports" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("reports")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>

              {user.role === "admin" && (
                <Button
                  variant={activeTab === "users" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              )}

              <Button
                variant={activeTab === "about" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("about")}
              >
                <Info className="mr-2 h-4 w-4" />
                About
              </Button>

              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Sidebar>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">TiNoq Sense</h1>
        <div className="flex items-center gap-2">
          <StatusIndicator isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t">
        <div className="grid grid-cols-5 gap-1 p-1">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="flex flex-col items-center justify-center h-16 rounded-md"
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>

          <Button
            variant={activeTab === "historical" ? "secondary" : "ghost"}
            className="flex flex-col items-center justify-center h-16 rounded-md"
            onClick={() => setActiveTab("historical")}
          >
            <BarChart className="h-5 w-5" />
            <span className="text-xs mt-1">History</span>
          </Button>

          <Button
            variant={activeTab === "lcd" ? "secondary" : "ghost"}
            className="flex flex-col items-center justify-center h-16 rounded-md"
            onClick={() => setActiveTab("lcd")}
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs mt-1">LCD</span>
          </Button>

          <Button
            variant={activeTab === "reports" ? "secondary" : "ghost"}
            className="flex flex-col items-center justify-center h-16 rounded-md"
            onClick={() => setActiveTab("reports")}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Reports</span>
          </Button>

          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="flex flex-col items-center justify-center h-16 rounded-md"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">More</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "historical" && "Historical Data"}
            {activeTab === "lcd" && "LCD Display"}
            {activeTab === "reports" && "Report Generator"}
            {activeTab === "users" && "User Management"}
            {activeTab === "about" && "About TiNoq Sense"}
            {activeTab === "settings" && "Settings"}
          </h2>
          <StatusIndicator isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Temperature</CardTitle>
                  <CardDescription>Current temperature reading from DHT22 sensor</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                  <TemperatureGauge value={latestReading?.temperature || 0} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Humidity</CardTitle>
                  <CardDescription>Current humidity reading from DHT22 sensor</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                  <HumidityGauge value={latestReading?.humidity || 0} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-4">
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Temperature and humidity trends over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <HistoricalChart data={historicalData} timeframe="24h" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Historical Data Tab */}
        {activeTab === "historical" && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>Temperature and humidity trends over time</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="24h" onValueChange={handleTimeframeChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="24h">24 Hours</TabsTrigger>
                  <TabsTrigger value="7d">7 Days</TabsTrigger>
                  <TabsTrigger value="30d">30 Days</TabsTrigger>
                </TabsList>
                <TabsContent value="24h">
                  <div className="h-[300px] md:h-[400px] mt-4">
                    <HistoricalChart data={historicalData} timeframe="24h" />
                  </div>
                </TabsContent>
                <TabsContent value="7d">
                  <div className="h-[300px] md:h-[400px] mt-4">
                    <HistoricalChart data={historicalData} timeframe="7d" />
                  </div>
                </TabsContent>
                <TabsContent value="30d">
                  <div className="h-[300px] md:h-[400px] mt-4">
                    <HistoricalChart data={historicalData} timeframe="30d" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* LCD Display Tab */}
        {activeTab === "lcd" && <LcdConfiguration />}

        {/* Reports Tab */}
        {activeTab === "reports" && <ReportGenerator />}

        {/* User Management Tab */}
        {activeTab === "users" && user.role === "admin" && <UserManagement />}

        {/* About Tab */}
        {activeTab === "about" && <AboutSystem />}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Mobile-only admin links */}
            {user.role === "admin" && (
              <div className="md:hidden space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>

                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("about")}>
                  <Info className="mr-2 h-4 w-4" />
                  About System
                </Button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
