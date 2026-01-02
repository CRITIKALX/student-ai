"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { backendAPI, type Task } from "@/lib/backend-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [taskType, setTaskType] = useState("exam_topic")
  const [dueDate, setDueDate] = useState("")
  const [estimatedMinutes, setEstimatedMinutes] = useState("60")
  const [priority, setPriority] = useState("3")
  const router = useRouter()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await backendAPI.getTasks()
      setTasks(data)
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast.error("Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newTask = await backendAPI.createTask({
        title,
        type: taskType,
        due_date: dueDate,
        estimated_minutes: parseInt(estimatedMinutes),
        priority: parseInt(priority),
      })

      setTasks([...tasks, newTask])
      setIsOpen(false)
      setTitle("")
      setTaskType("exam_topic")
      setDueDate("")
      setEstimatedMinutes("60")
      setPriority("3")
      toast.success("Task added successfully")
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : currentStatus === "todo" ? "doing" : "done"
    try {
      await backendAPI.updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map((t) => (t.task_id === taskId ? { ...t, status: newStatus as Task["status"] } : t)))
      toast.success(`Task marked as ${newStatus}`)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    // Note: Backend1 doesn't have delete endpoint, but we can mark as skipped
    try {
      await backendAPI.updateTaskStatus(taskId, "skipped")
      setTasks(tasks.filter((t) => t.task_id !== taskId))
      toast.success("Task removed")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to remove task")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case "doing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "destructive"
    if (priority >= 3) return "secondary"
    return "outline"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tasks (Backend1)</h2>
          <p className="text-sm text-muted-foreground">Managed by your AI academic agent</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddTask}>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a task that will be managed by the AI agent.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Study Calculus Chapter 7"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Task Type</Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam_topic">Exam Topic</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minutes">Estimated Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="15"
                    step="15"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority (1-5)</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          {p} - {p === 1 ? "Low" : p === 5 ? "Critical" : "Medium"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No tasks yet. Create your first task to get started!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.task_id} className={task.status === "done" ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateStatus(task.task_id, task.status)}
                    >
                      {getStatusIcon(task.status)}
                    </Button>
                    <div className="flex-1">
                      <div className={`font-semibold ${task.status === "done" ? "line-through" : ""}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{task.type.replace("_", " ")}</span>
                        <span>•</span>
                        <span>Due: {format(new Date(task.due_date), "PPP")}</span>
                        <span>•</span>
                        <span>{task.estimated_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                      Priority {task.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {task.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteTask(task.task_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

