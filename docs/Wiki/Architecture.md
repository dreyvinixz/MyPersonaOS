# System Architecture & Technical Design

This page outlines the technical architecture, data model, technology stack, and engineering principles of **MyPersonaOS**.

---

## 🏛️ Architecture Overview

MyPersonaOS is structured as a client-first, PWA-ready Next.js 16 application using the React 19 App Router architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                   User Interface (PWA UI)                   │
│   Next.js 16 (App Router) + React 19 + Tailwind CSS v3      │
├─────────────────────────────────────────────────────────────┤
│  Today Dashboard │ Inbox │ Projects │ Content │ English Lab │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│     Phase 1: Local State  │         │   Phase 2: Supabase Sync  │
│  usePersonaState (Local)  │         │ PostgreSQL + RLS + Auth   │
└───────────────────────────┘         └───────────────────────────┘
```

---

## ⚙️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-side rendering, React Server Components, client navigation |
| **Language** | TypeScript 5 | Strict static typing across domain models |
| **Styling** | Tailwind CSS v3 | Custom dark mode palette (`--bg: #09090E`, `--accent: #7B68EE`) |
| **Icons** | Lucide React | Modern, lightweight UI iconography |
| **State (V0.1)** | Client LocalStorage | Zero-latency local storage with custom window event dispatching |
| **Backend (V0.2)** | Supabase (PostgreSQL) | User-owned cloud database with Row Level Security (RLS) |
| **CI/CD** | GitHub Actions | Automated typechecking, building, failure diagnostics, and releases |

---

## 💾 Domain Data Models (`src/types/index.ts`)

### Task
```typescript
export interface Task {
  id: string;
  title: string;
  status: "pending" | "done" | "in-progress";
  priority?: "high" | "medium" | "low";
  isToday?: boolean;
  dueDate?: string;
  projectId?: string;
  createdAt: string;
}
```

### Project
```typescript
export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number; // 0 - 100%
  deadline?: string;
  tasks: Task[];
  createdAt: string;
}
```

### Content Piece
```typescript
export interface ContentPiece {
  id: string;
  title: string;
  brand: "codetoday" | "personal" | "quantbase";
  stage: "idea" | "research" | "script" | "recording" | "editing" | "thumbnail" | "scheduled" | "published";
  platforms?: string[];
  notes?: string;
  createdAt: string;
}
```

### English Word
```typescript
export interface EnglishWord {
  id: string;
  term: string;
  definition: string;
  example?: string;
  masteryLevel: number; // 1 to 5
  lastReviewedAt?: string;
  createdAt: string;
}
```

---

## 🔒 Security & Open Source Principles

1. **No Secret Leaks**: Secrets and local configurations are excluded via `.gitignore`.
2. **User Ownership**: Source code is public under MIT; user data remains local or secured behind private Supabase RLS.
3. **AI Pair Programming Rules**: AI agents operating on this repository must read [AGENTS.md](AGENTS.md) and [.agents/ONBOARDING.md](.agents/ONBOARDING.md).
