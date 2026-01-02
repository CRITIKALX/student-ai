# Backend1 & FrontendJo Integration Guide

This document describes how `backend1` (Flask API) and `frontendjo` (Next.js frontend) are integrated.

## Architecture

```
FrontendJo (Next.js) → Next.js API Routes → Backend1 (Flask)
```

The frontend communicates with backend1 through Next.js API routes that act as a proxy layer. This provides:
- Better security (backend URL not exposed to client)
- CORS handling
- Request/response transformation if needed

## Setup

### 1. Environment Variables

Create a `.env.local` file in `student/FrontendJo/`:

```env
# Backend1 API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Supabase Configuration (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/protected
```

### 2. Start Backend1

Navigate to `backend1/backend/` and start the Flask server:

```bash
cd backend1/backend
python app.py
```

The backend will run on `http://localhost:5000` by default.

### 3. Start FrontendJo

Navigate to `student/FrontendJo/` and start the Next.js dev server:

```bash
cd student/FrontendJo
npm run dev
```

The frontend will run on `http://localhost:3000` by default.

## API Endpoints

### Tasks

- `GET /api/backend/tasks` - Get all tasks
- `POST /api/backend/tasks` - Create a new task
- `PATCH /api/backend/tasks/[id]` - Update task status

### Progress

- `POST /api/backend/progress` - Log progress for a task

### Daily Plans

- `GET /api/backend/plan/[date]` - Get daily plan for a date
- `POST /api/backend/plan/[date]` - Save daily plan for a date

### Agent Endpoints

- `POST /api/backend/agent/plan/[date]` - Generate plan using agent
- `GET /api/backend/actions` - Get agent actions log

### Health Check

- `GET /api/backend/health` - Check backend connectivity

## Usage in Components

Use the `backendAPI` client from `@/lib/backend-api`:

```typescript
import { backendAPI } from "@/lib/backend-api"

// Get all tasks
const tasks = await backendAPI.getTasks()

// Create a task
const newTask = await backendAPI.createTask({
  title: "Study Calculus",
  type: "exam_topic",
  due_date: "2025-01-15",
  estimated_minutes: 120,
  priority: 5
})

// Update task status
await backendAPI.updateTaskStatus(taskId, "done")

// Get daily plan
const plan = await backendAPI.getDailyPlan("2025-01-10")

// Generate plan using agent
const generatedPlan = await backendAPI.generatePlan("2025-01-10")
```

## Data Model Mapping

### Backend1 Task Model
```typescript
{
  task_id: string
  title: string
  type: string  // "exam_topic", "assignment", etc.
  due_date: string  // "YYYY-MM-DD"
  estimated_minutes: number
  priority: number  // 1-5
  status: "todo" | "doing" | "done" | "skipped"
}
```

### FrontendJo Data Models
The frontend currently uses Supabase for:
- Topics (maps to backend1 tasks with type="exam_topic")
- Exams
- Assignments (maps to backend1 tasks with type="assignment")
- Study Sessions

## Migration Strategy

1. **Phase 1**: Both systems run in parallel
   - Frontend uses Supabase for existing features
   - New features use backend1 API

2. **Phase 2**: Gradual migration
   - Migrate topics → backend1 tasks
   - Migrate assignments → backend1 tasks
   - Keep Supabase for exams and study sessions (or migrate later)

3. **Phase 3**: Full integration
   - All academic data flows through backend1
   - Supabase only used for authentication

## Troubleshooting

### Backend not reachable
- Check that backend1 is running on port 5000
- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check CORS settings in `backend1/backend/app.py`

### CORS errors
The backend1 Flask app has CORS enabled for all origins. If you encounter CORS issues:
1. Check `backend1/backend/app.py` CORS configuration
2. Ensure the backend is running
3. Check browser console for specific error messages

### API route errors
- Check Next.js server logs for detailed error messages
- Verify the backend1 endpoint is responding: `curl http://localhost:5000/health`
- Check network tab in browser DevTools for request/response details

