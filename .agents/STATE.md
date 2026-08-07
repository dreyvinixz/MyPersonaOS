# MyPersonaOS — Current State

> Durable project snapshot for humans and AI agents. Update this file when product direction, architecture, milestones, or major constraints materially change.

## Product identity

**Name:** MyPersonaOS

**Purpose:** a private personal operating system that helps its owner capture ideas, decide what matters today, execute projects, create content, and learn consistently.

**Core principle:** the app should reduce cognitive load and make action easier. `Today` is the primary surface.

## Product domains

### Today

Daily command center:

- main focus;
- tasks for today;
- progress;
- quick capture;
- summaries of active areas.

### Inbox

Fast, low-friction capture. Organization can happen later.

### Tasks & Projects

Hierarchy direction:

`Goals → Projects → Tasks → Today`

### Content

Three identities are currently planned:

- **CodeToday** — programming/building/learning content; English-first.
- **Personal** — technology, science, career, ideas, motivation, and personal topics.
- **Quant Base** — institutional/professional content.

Content should be modeled around a **master content idea** that can produce platform-specific derivatives rather than treating every social post as unrelated work.

Pipeline direction:

`Idea → Research → Script → Record → Edit → Thumbnail → Schedule → Published → Analyze`

### English

A personal learning system whose method evolves through use.

Initial learning loop direction:

`Listen + Read → Read Aloud → Pronunciation → Comprehension → Vocabulary → Retell → Review`

The method should be versionable and measurable over time.

## Technical direction

Current foundation:

- Next.js
- TypeScript
- App Router
- Tailwind CSS

Planned infrastructure:

- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- Supabase Storage when needed
- Vercel deployment
- PWA-first mobile experience

## Privacy/security direction

The product is personal-only for now.

- No public signup by default.
- Data should be private to the owner.
- Never commit secrets.
- Any Supabase tables containing personal data must use appropriate RLS before being considered production-ready.

## Current implementation status

### Exists

- repository initialized;
- initial `Today` dashboard foundation;
- visual foundation for CodeToday / Personal / Quant Base / English areas;
- AI collaboration documentation under `.agents/`.

### Not yet reliable/complete

- Quick Capture persistence;
- Inbox workflow;
- editable task system;
- projects CRUD;
- Content Studio workflow;
- English learning persistence;
- authentication;
- Supabase database;
- cross-device sync;
- PWA installability/offline behavior;
- production deployment;
- orchestrator/AI layer.

## Current milestone

### V0.1 — usable personal foundation

Goal: make the system useful enough to open every day.

Priority order:

1. functional Quick Capture;
2. Inbox;
3. Today tasks;
4. Projects;
5. Content Studio;
6. English Lab;
7. PWA shell;
8. private persistence and sync.

## Current Git workflow

Bootstrap work is being developed on:

`agent/bootstrap-v0.1`

against:

`main`

A draft PR exists for the bootstrap. Agents must inspect the repository/PR before assuming this is still current.

## Known validation constraint

During initial bootstrap, the execution environment available to one agent could not perform a complete npm install/build because its internal npm registry lacked standard packages. This is an environment-specific historical blocker, **not evidence that the project builds or fails elsewhere**.

Future agents should retry normal validation in their own environment.

## Open-Source & Community Directives

- **Open-Source License**: Distributed under the MIT License (`LICENSE`).
- **Public Code, Private Data**: App source code is public and open source; user data remains local or secured via private Supabase RLS policies.
- **Environment & Secrets Guardrails**: Secrets and local environment configs (`.env.local`) are excluded by `.gitignore`. Template provided in `.env.example`.
- **Contributor Guidelines**: Open-source contributors and AI agents follow guidelines detailed in `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `AGENTS.md`.

## Architectural guardrails

- Build working vertical slices before advanced orchestration.
- Prefer one web/PWA codebase before introducing a separate native mobile app.
- Avoid premature multi-user/SaaS architecture.
- Keep domain models explicit enough to migrate from temporary local state to PostgreSQL.
- AI should assist decisions and organization; it should not become a dependency for basic app usability.

