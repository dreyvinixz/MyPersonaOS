# Architecture & System Design

This document details the system architecture, data flow, tech stack, and technical roadmap for **MyPersonaOS**.

---

## 1. System Overview

MyPersonaOS is structured as a single-user, mobile-responsive Progressive Web App (PWA) built with Next.js (App Router).

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (PWA UI)                    │
│   Next.js 15 (App Router) + React 19 + Tailwind CSS v4      │
├─────────────────────────────────────────────────────────────┤
│  Today Dashboard │ Inbox │ Projects │ Content │ English Lab │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│     Phase 1: Local State  │         │   Phase 2: Supabase Sync  │
│ Browser localStorage / IDB │         │ PostgreSQL + RLS + Auth   │
└───────────────────────────┘         └───────────────────────────┘
```

---

## 2. Technical Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server-side rendering, React Server Components, fast route transitions |
| **Language** | TypeScript 5 | Strict type safety and clear domain model interfaces |
| **Styling** | Tailwind CSS v4 | Rapid, consistent utility-first styling with high visual polish |
| **State (V0.1)** | Client LocalStorage / Context | Zero-backend initial testing for immediate user feedback |
| **Backend (V0.2)** | Supabase (PostgreSQL) | User-owned cloud storage with Row Level Security (RLS) |
| **Mobile** | PWA (Service Workers) | Native-like mobile experience without app store overhead |
| **CI/CD** | GitHub Actions | Automated typechecking, building, and semantic releases |

---

## 3. Data Architecture & Evolution

### Phase V0.1 — Client-First State
- **Storage**: Browser `localStorage` with JSON serialization.
- **Goal**: Fast iteration of UI components, task state, quick capture, and English lab vocabulary without database overhead.

### Phase V0.2 — Private Cloud Sync
- **Database**: Supabase PostgreSQL.
- **Authentication**: Email / Magic Link single-tenant authentication.
- **Security**: Strict Row-Level Security (RLS) policies guaranteeing that only the authenticated owner can read/write data.

#### Key Entity Relationships (Planned Schema)
- `captures` (id, content, created_at, processed_at, tags)
- `projects` (id, title, status, description, color, target_date)
- `tasks` (id, project_id, title, status, is_today, priority)
- `content_items` (id, brand, title, stage, script_body, publish_date)
- `vocab_words` (id, term, definition, example, mastery_level, last_reviewed)

---

## 4. Security & Privacy Model

1. **Zero Secret Exposure**: No credentials or private keys committed to source code.
2. **User Data Ownership**: Source code is public under MIT; personal data remains strictly local or in user's personal Supabase project.
3. **Environment Isolation**: `.env.local` handles secrets locally and `.env.example` provides non-sensitive templates.

---

## 5. Development & Contribution Conventions

- **Directory Layout**:
  - `/src/app`: Next.js App Router routes & pages
  - `/src/components`: UI components organized by domain
  - `/src/lib`: Core utilities, types, and storage hooks
  - `/.agents`: AI Agent state, handoff notes, and skill definitions
  - `/docs`: Technical documentation
- **Quality Gates**: Every pull request must pass `npx tsc --noEmit` and `npm run build`.
