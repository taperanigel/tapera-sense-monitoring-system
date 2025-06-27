"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Plus, Trash2, Edit, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchSmsAlerts, createSmsAlert, updateSmsAlert, deleteSmsAlert } from "@/lib/api"
import type { SmsAlert } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SmsAlerts() {
  const [alerts, setAlerts] = useState<SmsAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentAlert, setCurrentAlert] = useState<SmsAlert | null>(null)

  // Form state
  const [phoneNumber, setPhoneNumber] = useState("")
  const [temperatureMin, setTemperatureMin] = useState<string>("")
  const [temperatureMax, setTemperatureMax] = useState<string>("")
  const [humidityMin, setHumidityMin] = useState<string>("")
  const [humidityMax, setHumidityMax] = useState<string>("")
  const [cooldownPeriod, setCooldownPeriod] = useState("3600")

  const { toast } = useToast()

  // Fetch SMS alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true)
        const data = await fetchSmsAlerts()
        setAlerts(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch SMS alerts:", err)
        setError("Failed to load SMS alerts. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load SMS alerts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  // Handle form submission for adding a new alert
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const alertData = {
        phoneNumber,
        temperatureMin: temperatureMin ? Number.parseFloat(temperatureMin) : null,
        temperatureMax: temperatureMax ? Number.parseFloat(temperatureMax) : null,
        humidityMin: humidityMin ? Number.parseFloat(humidityMin) : null,
        humidityMax: humidityMax ? Number.parseFloat(humidityMax) : null,
        cooldownPeriod: Number.parseInt(cooldownPeriod),
      }

      const newAlert = await createSmsAlert(alertData)
      setAlerts([...alerts, newAlert])

      toast({
        title: "Success",
        description: "SMS alert created successfully",
      })

      // Reset form
      setPhoneNumber("")
      setTemperatureMin("")
      setTemperatureMax("")
      setHumidityMin("")
      setHumidityMax("")
      setCooldownPeriod("3600")

      // Close dialog
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Failed to create SMS alert:", err)
      toast({
        title: "Error",
        description: "Failed to create SMS alert",
        variant: "destructive",
      })
    }
  }

  // Handle form submission for editing an alert
  const handleEditAlert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentAlert) return

    try {
      const alertData = {
        phoneNumber,
        temperatureMin: temperatureMin ? Number.parseFloat(temperatureMin) : null,
        temperatureMax: temperatureMax ? Number.parseFloat(temperatureMax) : null,
        humidityMin: humidityMin ? Number.parseFloat(humidityMin) : null,
        humidityMax: humidityMax ? Number.parseFloat(humidityMax) : null,
        cooldownPeriod: Number.parseInt(cooldownPeriod),
      }

      const updatedAlert = await updateSmsAlert(currentAlert._id, alertData)

      setAlerts(alerts.map((alert) => (alert._id === updatedAlert._id ? updatedAlert : alert)))

      toast({
        title: "Success",
        description: "SMS alert updated successfully",
      })

      // Close dialog
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error("Failed to update SMS alert:", err)
      toast({
        title: "Error",
        description: "Failed to update SMS alert",
        variant: "destructive",
      })
    }
  }

  // Handle alert deletion
  const handleDeleteAlert = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SMS alert?")) return

    try {
      await deleteSmsAlert(id)
      setAlerts(alerts.filter((alert) => alert._id !== id))

      toast({
        title: "Success",
        description: "SMS alert deleted successfully",
      })
    } catch (err) {
      console.error("Failed to delete SMS alert:", err)
      toast({
        title: "Error",
        description: "Failed to delete SMS alert",
        variant: "destructive",
      })
    }
  }

  // Handle toggling alert enabled state
  const handleToggleEnabled = async (alert: SmsAlert) => {
    try {
      const updatedAlert = await updateSmsAlert(alert._id, {
        enabled: !alert.enabled,
      })

      setAlerts(alerts.map((a) => (a._id === updatedAlert._id ? updatedAlert : a)))

      toast({
        title: "Success",
        description: `SMS alert ${updatedAlert.enabled ? "enabled" : "disabled"} successfully`,
      })
    } catch (err) {
      console.error("Failed to update SMS alert:", err)
      toast({
        title: "Error",
        description: "Failed to update SMS alert status",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (alert: SmsAlert) => {
    setCurrentAlert(alert)
    setPhoneNumber(alert.phoneNumber)
    setTemperatureMin(alert.temperatureMin !== null ? alert.temperatureMin.toString() : "")
    setTemperatureMax(alert.temperatureMax !== null ? alert.temperatureMax.toString() : "")
    setHumidityMin(alert.humidityMin !== null ? alert.humidityMin.toString() : "")
    setHumidityMax(alert.humidityMax !== null ? alert.humidityMax.toString() : "")
    setCooldownPeriod(alert.cooldownPeriod.toString())
    setIsEditDialogOpen(true)
  }

  // Format cooldown period for display
  const formatCooldown = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
    return `${Math.floor(seconds / 3600)} hours`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>SMS Alerts</CardTitle>
          <CardDescription>Configure SMS notifications for sensor readings</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SMS Alert</DialogTitle>
              <DialogDescription>Create a new SMS alert for temperature or humidity thresholds</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAlert}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="temperatureMin">Min Temperature (°C)</Label>
                    <Input
                      id="temperatureMin"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={temperatureMin}
                      onChange={(e) => setTemperatureMin(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="temperatureMax">Max Temperature (°C)</Label>
                    <Input
                      id="temperatureMax"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={temperatureMax}
                      onChange={(e) => setTemperatureMax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="humidityMin">Min Humidity (%)</Label>
                    <Input
                      id="humidityMin"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={humidityMin}
                      onChange={(e) => setHumidityMin(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="humidityMax">Max Humidity (%)</Label>
                    <Input
                      id="humidityMax"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={humidityMax}
                      onChange={(e) => setHumidityMax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cooldownPeriod">Cooldown Period (seconds)</Label>
                  <Input
                    id="cooldownPeriod"
                    type="number"
                    min="60"
                    value={cooldownPeriod}
                    onChange={(e) => setCooldownPeriod(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum time between alerts (3600 = 1 hour)</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Alert</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit SMS Alert</DialogTitle>
              <DialogDescription>Update SMS alert settings</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditAlert}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                  <Input
                    id="edit-phoneNumber"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-temperatureMin">Min Temperature (°C)</Label>
                    <Input
                      id="edit-temperatureMin"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={temperatureMin}
                      onChange={(e) => setTemperatureMin(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-temperatureMax">Max Temperature (°C)</Label>
                    <Input
                      id="edit-temperatureMax"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={temperatureMax}
                      onChange={(e) => setTemperatureMax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-humidityMin">Min Humidity (%)</Label>
                    <Input
                      id="edit-humidityMin"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={humidityMin}
                      onChange={(e) => setHumidityMin(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-humidityMax">Max Humidity (%)</Label>
                    <Input
                      id="edit-humidityMax"
                      type="number"
                      step="0.1"
                      placeholder="Optional"
                      value={humidityMax}
                      onChange={(e) => setHumidityMax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-cooldownPeriod">Cooldown Period (seconds)</Label>
                  <Input
                    id="edit-cooldownPeriod"
                    type="number"
                    min="60"
                    value={cooldownPeriod}
                    onChange={(e) => setCooldownPeriod(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Alert</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No SMS alerts configured</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create an alert to receive SMS notifications when sensor readings exceed thresholds
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Temperature Range</TableHead>
                <TableHead>Humidity Range</TableHead>
                <TableHead>Cooldown</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert._id}>
                  <TableCell>{alert.phoneNumber}</TableCell>
                  <TableCell>
                    {alert.temperatureMin !== null && alert.temperatureMax !== null
                      ? `${alert.temperatureMin}°C - ${alert.temperatureMax}°C`
                      : alert.temperatureMin !== null
                        ? `> ${alert.temperatureMin}°C`
                        : alert.temperatureMax !== null
                          ? `< ${alert.temperatureMax}°C`
                          : "Not set"}
                  </TableCell>
                  <TableCell>
                    {alert.humidityMin !== null && alert.humidityMax !== null
                      ? `${alert.humidityMin}% - ${alert.humidityMax}%`
                      : alert.humidityMin !== null
                        ? `> ${alert.humidityMin}%`
                        : alert.humidityMax !== null
                          ? `< ${alert.humidityMax}%`
                          : "Not set"}
                  </TableCell>
                  <TableCell>{formatCooldown(alert.cooldownPeriod)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={alert.enabled} onCheckedChange={() => handleToggleEnabled(alert)} />
                      <span className={alert.enabled ? "text-green-500" : "text-muted-foreground"}>
                        {alert.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(alert)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert._id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
