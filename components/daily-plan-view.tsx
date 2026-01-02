"use client"

import { useState, useEffect } from "react"
import { backendAPI, type DailyPlan } from "@/lib/backend-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, Zap } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export function DailyPlanView() {
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [selectedDate])

  const loadPlan = async () => {
    try {
      setIsLoading(true)
      const data = await backendAPI.getDailyPlan(selectedDate)
      setPlan(data)
    } catch (error) {
      console.error("Error loading plan:", error)
      // If plan doesn't exist, set empty plan
      setPlan({ date: selectedDate, items: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true)
      const generatedPlan = await backendAPI.generatePlan(selectedDate)
      setPlan(generatedPlan)
      toast.success("Plan generated successfully!")
    } catch (error) {
      console.error("Error generating plan:", error)
      toast.error("Failed to generate plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const totalMinutes = plan?.items.reduce((sum, item) => sum + item.duration_minutes, 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Daily Plan</h2>
          <p className="text-sm text-muted-foreground">AI-generated study schedule</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="date" className="text-sm">Date:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={handleGeneratePlan} disabled={isGenerating}>
            <Zap className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Plan"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading plan...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {totalHours > 0 && `${totalHours}h `}
                {remainingMinutes > 0 && `${remainingMinutes}m`}
                {totalMinutes === 0 && "No plan yet"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {plan && plan.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground mb-4">No plan for this date</p>
                <Button onClick={handleGeneratePlan} variant="outline" disabled={isGenerating}>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Plan with AI
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {plan?.items.map((item, index) => (
                  <div
                    key={`${item.task_id}-${index}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.note}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {item.duration_minutes} min
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

