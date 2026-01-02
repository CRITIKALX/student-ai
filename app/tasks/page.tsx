import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { TasksManager } from "@/components/tasks-manager"
import { DailyPlanView } from "@/components/daily-plan-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Using simple div-based tabs since Tabs component may not exist

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">Manage your tasks and daily plans powered by backend1 AI agent</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <TasksManager />
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Daily Plan</h2>
            <DailyPlanView />
          </div>
        </div>
      </div>
    </div>
  )
}

