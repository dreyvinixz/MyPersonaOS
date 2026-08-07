# MyPersonaOS

A personal operating system for focus, content creation, projects, and learning.

> Build your today. Why not today?

## Vision

MyPersonaOS is a private, personal-first system that brings together daily focus, idea capture, tasks, projects, content creation, and an evolving English-learning method.

## V0.1

The first version intentionally uses browser `localStorage` for quick capture and Today tasks so the product can be tested before introducing authentication and a database.

### Included

- Today dashboard
- Quick Capture + Inbox
- Today task progress
- Projects overview
- Content pipeline for CodeToday / Personal / Quant Base
- English Lab method
- Responsive desktop + mobile navigation
- PWA manifest + service worker starter

## Architecture direction

- Next.js + TypeScript + App Router
- Tailwind CSS
- Supabase (next milestone)
- Vercel deployment
- PWA first; native wrapper only if needed later

## Roadmap

### V0.2 — persistence
- Supabase project
- private authentication
- PostgreSQL schema
- Row Level Security
- sync across desktop and phone

### V0.3 — real workflows
- editable tasks/projects
- content items and stages
- English sessions and vocabulary
- daily planning

### V0.4 — orchestrator
- calendar integration
- prioritization engine
- AI-assisted capture and planning
- weekly review
