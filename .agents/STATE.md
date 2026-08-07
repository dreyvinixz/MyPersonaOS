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

### Exists

- repository initialized;
- `Today` command center (Main Focus, DateClock, Today Tasks, Quick Capture, ModuleSummaries);
- Global Quick Capture modal (`Ctrl+K` / `Cmd+K`) and interactive Inbox processing (convert to Task/Project, archive, filter bar);
- Oil Slick design system, Plus Jakarta Sans & JetBrains Mono typography, high text contrast;
- **Supabase V0.2 Foundation**:
  - PostgreSQL schema migration (`supabase/migrations/20260807000000_v0_2_schema.sql`) with automatic `updated_at` triggers and check constraints;
  - Row Level Security (RLS) policies on all tables enforcing strict `auth.uid() = user_id` isolation;
  - Private cookie-based SSR authentication (`@supabase/ssr`, `/login`, `middleware.ts`, `AuthProvider`);
  - Modular repository architecture (`LocalRepository`, `SupabaseRepository`, `PersonaStore`);
  - Idempotent local-to-cloud atomic RPC migration (`import_local_snapshot`);
  - Supabase Realtime channel subscription (`subscribeToPersonaRealtime`) for multi-device sync (PC ↔ Mobile);
  - UI `SyncStatus` indicator badge (`initializing`, `local`, `syncing`, `synced`, `offline`, `error`).
- AI collaboration documentation under `.agents/` and skills bank;
- open-source files (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.env.example`);
- GitHub Actions CI/CD workflows (`ci.yml`, `release.yml`) with automated diagnostic log capture and artifact upload on build failure;
- Python CI monitoring CLI script (`scripts/ci_watch.py` / `npm run ci:watch`);
- documentation suite under `docs/` (`about.md`, `architecture.md`, `README.md`), GitHub Wiki pages (`docs/Wiki/`), and `CHANGELOG.md`.

### Not yet reliable/complete

- full PWA offline service worker caching;
- production Vercel deployment;
- AI orchestrator API integration.

## Current milestone

### V0.2 — Supabase Persistence, RLS & Private Multi-Device Sync

Goal: transform MyPersonaOS into a private, multi-device cloud-synchronized system (PC ↔ Mobile).

Completed items:

1. PostgreSQL V0.2 Schema & RLS policies;
2. Refactored `InboxItemStatus` enum (`pending` | `archived` | `converted`) & UUID primary keys;
3. Private cookie-based authentication (`/login`);
4. Modular `PersonaStore` & repository abstraction;
5. Idempotent atomic local-to-cloud RPC migration;
6. Realtime multi-device synchronization;
7. Visual `SyncStatus` indicator in Sidebar.

## Current Git workflow

Active feature development is on:

`agent/supabase-persistence`

against:

`main`

(Previous feature branches `agent/quick-capture-inbox` and `agent/oil-slick-theme` have been merged into `main`).


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

