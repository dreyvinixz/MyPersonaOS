# MyPersonaOS — Current State

> Durable project snapshot for humans and AI agents. Update this file when product direction, architecture, milestones, or major constraints materially change.

## Product identity

**Name:** MyPersonaOS  
**Purpose:** a private personal operating system that helps its owner capture ideas, decide what matters today, execute projects, create content, and learn consistently.  
**Core principle:** reduce cognitive load and make action easier. `Today` is the primary surface.

## Product domains

- **Today** — main focus, today's tasks, progress, quick capture, module summaries.
- **Inbox** — low-friction capture first; organization later.
- **Tasks & Projects** — direction: `Goals → Projects → Tasks → Today`.
- **Content** — CodeToday, Personal, Quant Base; master-content-first pipeline.
- **English** — evolving personal learning method and vocabulary loop.

Content pipeline direction:

`Idea → Research → Script → Record → Edit → Thumbnail → Schedule → Published → Analyze`

English loop direction:

`Listen + Read → Read Aloud → Pronunciation → Comprehension → Vocabulary → Retell → Review`

## Technical foundation

- Next.js 15 + App Router
- React 19
- TypeScript
- Tailwind CSS
- Oil Slick visual system
- Supabase PostgreSQL/Auth/RLS/Realtime in V0.2 branch
- PWA-first direction; Vercel deployment planned

## V0.2 persistence architecture

```text
UI
 │
 ▼
PersonaProvider (single shared state)
 │
 ├───────────────┐
 ▼               ▼
LocalRepository  SupabaseRepository
 │               │
localStorage     PostgreSQL + RLS
 │               │
 └── Outbox ─────┘
                 │
              Realtime
```

### Local Mode

If Supabase environment variables are absent, the app uses `LocalRepository` only and remains fully usable without authentication.

### Cloud Mode

If Supabase is configured:

- unauthenticated app routes are protected;
- `/login` is isolated from application chrome;
- auth uses Supabase cookie-based SSR support;
- `PersonaProvider` is the single shared client state;
- mutations are saved optimistically to the local cache and represented as durable outbox operations;
- the outbox performs diff-based cloud upserts/deletes;
- failed operations remain queued;
- Realtime triggers a debounced authoritative cloud refresh after pending local operations are flushed.

## V0.2 migration behavior

First Cloud Mode initialization:

1. keep a browser backup of the pre-migration V0.1 snapshot;
2. normalize legacy IDs such as `1`, `p1`, `i1` to UUIDs while preserving relationships;
3. call the atomic `import_local_snapshot(jsonb)` RPC;
4. if Cloud already contains user data, Cloud is the base source of truth;
5. if migration fails, preserve local state and do **not** fetch an empty/partial cloud snapshot over it;
6. set `migration_version = 1` only after the transaction's explicit migration/cloud-wins path completes.

## Database/security state

V0.2 migrations:

- `supabase/migrations/20260807000000_v0_2_schema.sql`
- `supabase/migrations/20260807001000_v0_2_hardening.sql`

Implemented:

- UUID primary keys;
- automatic `updated_at` triggers;
- domain check constraints;
- `content_pieces.platforms text[]`;
- explicit Inbox statuses and conversion lineage;
- RLS on all personal tables;
- profile policy based on `auth.uid() = id`;
- domain policies based on `auth.uid() = user_id`;
- hardened `SECURITY DEFINER` migration RPC with empty `search_path` and restricted EXECUTE grants;
- task → project same-owner enforcement trigger;
- common `user_id` / status indexes;
- Realtime publication includes `user_profiles` and all synchronized domain tables.

## Current implementation status

### Exists

- repository/open-source guardrails and `.agents/` skills/handoff system;
- Today command center;
- Global Quick Capture (`Ctrl/Cmd+K`) and mobile trigger;
- Inbox conversion/archive/delete flow;
- Tasks/Projects/Content/English initial domain pages;
- Oil Slick design system;
- private Auth UI + middleware;
- shared PersonaProvider;
- LocalRepository + SupabaseRepository;
- durable diff-based cloud outbox including deletes;
- legacy V0.1 → V0.2 UUID-safe migration;
- centralized debounced Realtime synchronization;
- sync UI states: `initializing`, `local`, `syncing`, `synced`, `offline`, `error`;
- GitHub Actions typecheck/build workflow;
- detailed V0.2 release validation checklist at `docs/v0.2-supabase-validation.md`.

### Not yet proven / still requires release validation

- fresh typecheck/build on the **post-audit** head;
- migrations applied against a real clean Supabase test project;
- RLS A/B-user isolation test;
- real V0.1 browser snapshot migration test;
- real offline → reload → reconnect outbox test;
- PC ↔ mobile Realtime verification including DELETE and Main Focus;
- production Vercel deployment.

### Outside V0.2 scope

- encrypted browser cache/outbox at rest;
- collaborative/field-level conflict resolution (V0.2 is last-write-wins);
- public multi-user/SaaS behavior;
- advanced PWA offline asset caching;
- AI orchestrator API integration.

## Privacy/security direction

The product is personal/single-owner for now.

- Public sign-up must be disabled in Supabase Authentication settings.
- Source code and user data are separate: repository is public, data remains local/private cloud.
- Never commit secrets or `.env.local`.
- RLS is mandatory for personal tables.
- Cloud app content must not render before authenticated session resolution.
- Browser cache is currently trusted-device storage and is not encrypted at rest.

## Current milestone

### V0.2 — Supabase Persistence, RLS & Private Multi-Device Sync

**Engineering status:** `REVIEW_FIXES_APPLIED_VALIDATION_PENDING`

The release-gate audit found and directly corrected data-loss, synchronization, deletion, migration, Realtime, and auth-shell issues. Do not merge/tag V0.2 until the final validation checklist passes.

## Current Git workflow

Active feature branch:

`agent/supabase-persistence`

Base:

`main`

No pull request should be opened until the owner explicitly requests it.

## Architectural guardrails

- Build working vertical slices before advanced orchestration.
- Keep exactly one shared Persona state provider in the client app.
- Never report `Cloud synced` when a Supabase operation returned an error.
- Never overwrite local state with cloud after a failed first migration.
- Persist cloud mutations before attempting network delivery.
- Prefer diff-based synchronization over full-state rewrites.
- Keep database migrations and RLS in Git as the schema source of truth.
- Prefer one web/PWA codebase before native mobile.
- Avoid premature SaaS complexity.
- AI may assist decisions/organization but must not be required for basic app usability.
