/**
 * Backend1 API Client
 * Handles all communication with the Flask backend via Next.js API routes
 */

const API_BASE = "/api/backend"

export interface Task {
  task_id: string
  title: string
  type: string
  due_date: string
  estimated_minutes: number
  priority: number
  status: "todo" | "doing" | "done" | "skipped"
}

export interface DailyPlanItem {
  task_id: string
  title: string
  duration_minutes: number
  note: string
}

export interface DailyPlan {
  date: string
  items: DailyPlanItem[]
}

export interface ProgressLog {
  task_id: string
  status: string
  minutes_spent: number
  reason?: string
}

export interface AgentAction {
  action_type: string
  rationale: string
  diff: string
  timestamp: string
}

class BackendAPI {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Health check
  async healthCheck(): Promise<{ status: string; time: string }> {
    return this.request("/health")
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return this.request("/tasks")
  }

  async createTask(data: {
    title: string
    type?: string
    due_date: string
    estimated_minutes?: number
    priority?: number
  }): Promise<Task> {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTaskStatus(taskId: string, status: string): Promise<{ ok: boolean; task_id: string; status: string }> {
    return this.request(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  // Progress
  async logProgress(data: ProgressLog): Promise<{ ok: boolean; replanned: boolean; new_plan?: DailyPlanItem[] }> {
    return this.request("/progress", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Daily Plans
  async getDailyPlan(date: string): Promise<DailyPlan> {
    return this.request(`/plan/${date}`)
  }

  async saveDailyPlan(date: string, items: DailyPlanItem[]): Promise<{ ok: boolean; date: string; count: number }> {
    return this.request(`/plan/${date}`, {
      method: "POST",
      body: JSON.stringify({ items }),
    })
  }

  // Agent endpoints
  async generatePlan(date: string): Promise<DailyPlan> {
    return this.request(`/agent/plan/${date}`, {
      method: "POST",
    })
  }

  async agentDecide(data: { date?: string; [key: string]: any }): Promise<DailyPlan> {
    return this.request("/agent/decide", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAgentActions(): Promise<AgentAction[]> {
    return this.request("/actions")
  }
}

export const backendAPI = new BackendAPI()

