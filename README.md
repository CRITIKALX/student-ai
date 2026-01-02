# FrontendJo - Academic Management System

This is a [Next.js](https://nextjs.org) project for academic task and study management, integrated with **backend1** (Flask API) as the primary backend.

## Architecture

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: Flask API (backend1) - Primary backend for tasks, plans, and progress
- **Auth**: Supabase - User authentication
- **Database**: Supabase (for user data) + SQLite (backend1 for tasks)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- Supabase account (for authentication)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/protected
   ```

3. **Start backend1** (in a separate terminal):
   ```bash
   cd ../../backend1/backend
   python app.py
   ```
   Backend runs on `http://localhost:5000`

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Integration with Backend1

This frontend is integrated with **backend1** as its primary backend. See [INTEGRATION.md](./INTEGRATION.md) for detailed integration documentation.

### Quick Usage

```typescript
import { backendAPI } from "@/lib/backend-api"

// Get tasks
const tasks = await backendAPI.getTasks()

// Create task
await backendAPI.createTask({
  title: "Study for exam",
  type: "exam_topic",
  due_date: "2025-01-15",
  estimated_minutes: 120,
  priority: 5
})

// Get daily plan
const plan = await backendAPI.getDailyPlan("2025-01-10")
```

## Project Structure

```
FrontendJo/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── backend/       # Backend1 proxy routes
│   │   └── generate-timetable/
│   ├── auth/              # Authentication pages
│   ├── assignments/       # Assignments page
│   ├── topics/            # Topics page
│   └── timetable/        # Timetable page
├── components/            # React components
├── lib/                   # Utilities
│   ├── backend-api.ts     # Backend1 API client
│   ├── client.ts          # Supabase client
│   └── server.ts          # Supabase server client
└── INTEGRATION.md         # Integration documentation
```

## Features

- ✅ User authentication (Supabase)
- ✅ Task management (backend1)
- ✅ Daily planning (backend1)
- ✅ Progress tracking (backend1)
- ✅ Agent-powered plan generation (backend1)
- ✅ Topics management (Supabase)
- ✅ Assignments tracking (Supabase)
- ✅ Timetable generation

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Backend1 Integration Guide](./INTEGRATION.md) - detailed integration documentation

## Deploy

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to:
1. Set environment variables in Vercel dashboard
2. Deploy backend1 separately (or use Vercel serverless functions)
3. Update `NEXT_PUBLIC_BACKEND_URL` to point to deployed backend
