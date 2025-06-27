"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StatusIndicatorProps {
  isConnected: boolean
  lastUpdated: Date | null
}

export default function StatusIndicator({ isConnected, lastUpdated }: StatusIndicatorProps) {
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never"

    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`
    } else {
      return lastUpdated.toLocaleTimeString()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      <span className="text-sm text-muted-foreground">Last updated: {formatLastUpdated()}</span>
    </div>
  )
}
