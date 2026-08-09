# MyPersonaOS Roadmap

> Last updated: 2026-08-09
>
> Product north star: **What deserves attention today?**

This is the canonical view of completed work, the active release gate, and the
next product slices. Checkboxes mean verified outcomes, not merely code that
exists on a branch.

## Status legend

| Status | Meaning |
|---|---|
| `DONE` | Implemented and validated for the milestone |
| `IN VALIDATION` | Implemented, but release-gate validation is incomplete |
| `PLANNED` | Approved direction; implementation has not started |
| `LATER` | Intentionally deferred until the foundations are reliable |

## Milestone overview

| Milestone | Status | Outcome |
|---|---|---|
| V0.1 — Personal Foundation | `DONE` | Today, Quick Capture, Inbox, initial domain pages, local persistence, and Oil Slick UI |
| V0.2 — Private Persistence | `IN VALIDATION` | Supabase Auth/PostgreSQL/RLS, offline outbox, migration, and multi-device Realtime |
| V0.3 — Core Workflows | `PLANNED` | Complete Tasks/Projects, content production, and English-learning vertical slices |
| V0.4 — Daily-Use PWA | `PLANNED` | Installable mobile experience, stronger offline shell, deployment, and operational polish |
| V0.5 — Personal Orchestrator | `LATER` | Calendar, weekly review, analytics, automation, and optional AI assistance |

## Active release gate — V0.2

Branch: `agent/supabase-persistence`

Current status: `LOCAL_RELEASE_CHECKS_PASSED_CLOUD_VALIDATION_PENDING`

### Engineering complete

- [x] Private Supabase authentication shell with Local Mode fallback.
- [x] PostgreSQL schema, UUID IDs, constraints, indexes, and `updated_at` triggers.
- [x] Row Level Security for every personal table.
- [x] Hardened atomic V0.1 local snapshot import.
- [x] Shared `PersonaProvider` with Local and Supabase repositories.
- [x] Durable diff-based outbox for offline create, update, and delete operations.
- [x] Debounced Realtime refresh including deletes and Main Focus.
- [x] Explicit sync states: initializing, local, syncing, synced, offline, and error.
- [x] Next.js 16.3 security upgrade and `proxy.ts` auth boundary migration.
- [x] ESLint 9 flat configuration and strict React Hooks rules.
- [x] Clean dependency audit, TypeScript check, lint, and production build.

### Remaining release blockers

Follow the detailed procedure in
[`docs/v0.2-supabase-validation.md`](docs/v0.2-supabase-validation.md).

| ID | Task | Status | Acceptance evidence |
|---|---|---|---|
| V02-01 | Create/configure a private Supabase test project | `PENDING` | Public signup disabled; owner and temporary test user available |
| V02-02 | Apply both V0.2 migrations | `PENDING` | Schema, policies, triggers, RPC grants, indexes, and Realtime publication inspected |
| V02-03 | Prove A/B-user RLS isolation | `PENDING` | Cross-user select/insert/update/delete attempts are rejected |
| V02-04 | Test a real V0.1 browser snapshot migration | `PENDING` | UUID conversion preserves relationships, Main Focus, platforms, and migration version |
| V02-05 | Test offline outbox across reload/reconnect | `PENDING` | Create/update/delete survive reload and flush exactly once after reconnect |
| V02-06 | Test desktop ↔ mobile Realtime | `PENDING` | Capture, status, Main Focus, and delete changes converge on both devices |
| V02-07 | Verify login/logout and route privacy | `PENDING` | Private UI/data never renders for an unauthenticated Cloud Mode session |
| V02-08 | Validate the production Vercel deployment | `PENDING` | Environment, redirects, static assets, and mobile session work in production |
| V02-09 | Review and merge the feature branch | `BLOCKED` | All checks above pass and the owner approves the merge |
| V02-10 | Tag and document `v0.2.0` | `BLOCKED` | Merge completed, changelog updated, release workflow green |

### V0.2 exit criteria

V0.2 is releasable only when every `V02-*` validation item has evidence, the
configured-Supabase flows pass, and no personal data or credentials are present
in the repository.

## V0.3 — Core workflows

Work in small vertical slices, in this order:

1. **Tasks & Projects CRUD**
   - [ ] Create, edit, complete, reschedule, and delete tasks.
   - [ ] Create/edit projects and assign tasks without breaking owner boundaries.
   - [ ] Make project progress derive from real task completion where appropriate.
2. **Today planning loop**
   - [ ] Pull tasks into Today, select Main Focus, and close the day deliberately.
   - [ ] Preserve a useful Today experience offline and across devices.
3. **Content production system**
   - [ ] Model one master content idea with CodeToday, Personal, and Quant Base derivatives.
   - [ ] Move work through research, script, record, edit, thumbnail, schedule, publish, and analyze.
4. **English learning sessions**
   - [ ] Implement the Listen + Read → Retell → Review session loop.
   - [ ] Track vocabulary review, pronunciation work, and measurable progress.

## V0.4 — Daily-use PWA

- [ ] Complete installability assets and mobile install verification.
- [ ] Add an intentional offline application shell and cache strategy.
- [ ] Add safe update/reload behavior when a new app version is available.
- [ ] Add lightweight error recovery and empty/loading states across every domain.
- [ ] Establish production monitoring, backup, and recovery instructions.

## V0.5 — Personal orchestrator

- [ ] Calendar integration and time-aware Today planning.
- [ ] Weekly review across tasks, projects, content, and English.
- [ ] Personal analytics that lead to an action rather than dashboard volume.
- [ ] Automations with explicit user control and recoverable operations.
- [ ] Optional AI prioritization that never blocks basic app use.

## Explicitly out of scope for now

- Public signup or a multi-user SaaS product.
- A separate native mobile app before the PWA is proven insufficient.
- Collaborative field-level conflict resolution.
- AI orchestration before persistence and core workflows are reliable.

## Engineering loop

For each task: inspect the current state → choose one vertical slice → implement
the smallest complete behavior → run focused checks, typecheck, lint, audit, and
build as relevant → update this roadmap and `.agents/` handoff documents.
