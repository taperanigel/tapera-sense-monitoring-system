"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Calendar, BarChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateReport } from "@/lib/api"

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateReport = async () => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      })
      return
    }

    if (reportType !== "daily" && !endDate) {
      toast({
        title: "Error",
        description: "Please select an end date",
        variant: "destructive",
      })
      return
    }

    if (endDate && startDate && endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const reportData = await generateReport({
        type: reportType,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
      })

      // Create a blob from the report data
      const blob = new Blob([reportData], { type: "text/plain" })

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a link element
      const link = document.createElement("a")
      link.href = url

      // Set the filename based on report type and date
      const dateStr = startDate.toISOString().split("T")[0]
      link.download = `tinoq_sense_${reportType}_report_${dateStr}.txt`

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Report generated successfully",
      })
    } catch (error) {
      console.error("Failed to generate report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
        <CardDescription>Generate and download reports of sensor data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard">
          <TabsList>
            <TabsTrigger value="standard">Standard Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Date Range</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label>Report Type</Label>
              <RadioGroup
                value={reportType}
                onValueChange={(value) => setReportType(value as "daily" | "weekly" | "monthly" | "yearly")}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-accent">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex items-center cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Daily Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-accent">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex items-center cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Weekly Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-accent">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex items-center cursor-pointer">
                    <BarChart className="mr-2 h-4 w-4" />
                    Monthly Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-accent">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly" className="flex items-center cursor-pointer">
                    <BarChart className="mr-2 h-4 w-4" />
                    Yearly Report
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Report Date</Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="start-date">Date</Label>
                  <DatePicker id="start-date" date={startDate} onSelect={setStartDate} />
                </div>
              </div>
            </div>

            <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>Generating Report...</>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label>Date Range</Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="custom-start-date">Start Date</Label>
                  <DatePicker id="custom-start-date" date={startDate} onSelect={setStartDate} />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="custom-end-date">End Date</Label>
                  <DatePicker id="custom-end-date" date={endDate} onSelect={setEndDate} />
                </div>
              </div>
            </div>

            <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>Generating Report...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Custom Report
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-2">About Reports</h3>
          <p className="text-sm text-muted-foreground">Reports are generated as text files and include:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
            <li>Temperature and humidity statistics (min, max, average)</li>
            <li>Hourly, daily, or monthly readings depending on report type</li>
            <li>System status information</li>
            <li>Date and time of readings</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Reports are saved to the project folder and can be downloaded directly to your device.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
