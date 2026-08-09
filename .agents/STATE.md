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

- Next.js 16.3 + App Router + Turbopack production build
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
- `supabase/migrations/20260809000000_security_performance_hardening.sql`

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
- Realtime publication includes `user_profiles` and all synchronized domain tables;
- bounded personal-data fields and a 15-second atomic-import statement timeout;
- composite owner/newest-first indexes matching all full-state list queries.

## Security/performance audit state

The 2026-08-09 source/history audit found no high-confidence committed secret,
raw SQL injection path, dangerous HTML sink, circular dependency, or known npm
vulnerability. The audit branch adds:

- a CI/release tracked-file secret scanner and npm registry signature verification;
- full-SHA GitHub Action pinning and release input validation;
- browser CSP/security headers and disabled Next.js technology disclosure;
- authenticated-user-scoped Cloud browser cache with privacy gating;
- empty new-profile state instead of hardcoded personal/demo seeds;
- UI/PostgreSQL input bounds and import RPC timeout;
- `O(P+T)` Project↔Task assembly and `O(M)` outbox storage processing;
- initial large-component decomposition beginning with Inbox.

Detailed evidence and residual risks are recorded in
`docs/audits/security-performance-audit-2026-08-09.md`.

## Current implementation status

### Exists

- repository/open-source guardrails and `.agents/` skills/handoff system;
- Today command center;
- Global Quick Capture (`Ctrl/Cmd+K`) and mobile trigger;
- Inbox conversion/archive/delete flow;
- Tasks/Projects/Content/English initial domain pages;
- Oil Slick design system;
- private Auth UI + Next.js `proxy.ts` auth boundary;
- shared PersonaProvider;
- LocalRepository + SupabaseRepository;
- durable diff-based cloud outbox including deletes;
- legacy V0.1 → V0.2 UUID-safe migration;
- centralized debounced Realtime synchronization;
- sync UI states: `initializing`, `local`, `syncing`, `synced`, `offline`, `error`;
- GitHub Actions typecheck/build workflow;
- ESLint 9 flat configuration with Next.js and strict React Hooks rules;
- dependency security baseline at zero known `npm audit` vulnerabilities as of 2026-08-09;
- detailed V0.2 release validation checklist at `docs/v0.2-supabase-validation.md`;
- canonical milestone/task tracking in `ROADMAP.md`.

### Local release checks — 2026-08-09

- `npm ci --cache /tmp/...` — passed;
- `npm audit --audit-level=moderate` — passed, zero known vulnerabilities;
- `npx tsc --noEmit` — passed;
- `npm run lint` — passed;
- `npm run build` — passed on Next.js 16.3.0, 9/9 static pages generated.

### Not yet proven / still requires release validation

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
- Cloud cache keys are scoped to the authenticated user; the legacy generic snapshot
  can be claimed by only one user ID and private content stays gated during scope changes.

## Current milestone

### V0.2 — Supabase Persistence, RLS & Private Multi-Device Sync

**Engineering status:** `LOCAL_RELEASE_CHECKS_PASSED_CLOUD_VALIDATION_PENDING`

The release-gate audit found and directly corrected data-loss, synchronization, deletion, migration, Realtime, auth-shell, lint, React lifecycle, and dependency-security issues. Local automated checks now pass. Do not merge/tag V0.2 until the configured-Supabase validation checklist passes.

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
