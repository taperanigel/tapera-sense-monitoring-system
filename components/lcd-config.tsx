"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Monitor, MessageSquare, Wifi } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchLcdConfig, updateLcdConfig } from "@/lib/api"
import type { LcdConfig } from "@/lib/types"

export default function LcdConfiguration() {
  const [config, setConfig] = useState<LcdConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<0 | 1 | 2>(0)
  const [message, setMessage] = useState("")
  const [backlight, setBacklight] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  // Fetch LCD configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const data = await fetchLcdConfig()
        setConfig(data)
        setMode(data.mode)
        setMessage(data.message)
        setBacklight(data.backlight)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch LCD configuration:", err)
        setError("Failed to load LCD configuration. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load LCD configuration",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const configData = {
        mode,
        message,
        backlight,
      }

      const updatedConfig = await updateLcdConfig(configData)
      setConfig(updatedConfig)

      toast({
        title: "Success",
        description: "LCD configuration updated successfully",
      })
    } catch (err) {
      console.error("Failed to update LCD configuration:", err)
      toast({
        title: "Error",
        description: "Failed to update LCD configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LCD Display Configuration</CardTitle>
        <CardDescription>Configure what appears on the LCD display</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Display Mode</Label>
              <RadioGroup
                value={mode.toString()}
                onValueChange={(value) => setMode(Number.parseInt(value) as 0 | 1 | 2)}
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                  <RadioGroupItem value="0" id="mode-0" />
                  <Label htmlFor="mode-0" className="flex items-center cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" />
                    Temperature & Humidity
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                  <RadioGroupItem value="1" id="mode-1" />
                  <Label htmlFor="mode-1" className="flex items-center cursor-pointer">
                    <Wifi className="mr-2 h-4 w-4" />
                    IP Address
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                  <RadioGroupItem value="2" id="mode-2" />
                  <Label htmlFor="mode-2" className="flex items-center cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Custom Message
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {mode === 2 && (
              <div className="space-y-2">
                <Label htmlFor="message">Custom Message</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your custom message"
                  maxLength={32}
                />
                <p className="text-xs text-muted-foreground">
                  Use | character to split text into two lines. Max 32 characters total.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="backlight" checked={backlight} onCheckedChange={setBacklight} />
              <Label htmlFor="backlight">LCD Backlight</Label>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Updating..." : "Update LCD Display"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
