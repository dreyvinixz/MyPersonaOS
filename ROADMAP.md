# MyPersonaOS Roadmap

> Last updated: 2026-08-11
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

Branch: `agent/security-performance-audit`

Current status: `CLOUD_MODE_SMOKE_AND_RPC_VALIDATED_BROWSER_MIGRATION_PENDING`

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
- [x] Source/history secret audit and an automated CI secret gate.
- [x] Browser security headers, user-scoped Cloud cache, and bounded inputs.
- [x] Supply-chain pinning for GitHub Actions and npm registry signature checks.
- [x] Project/task join and outbox complexity reductions.

### Remaining release blockers

Follow the detailed procedure in
[`docs/v0.2-supabase-validation.md`](docs/v0.2-supabase-validation.md).

Homologation project `rchkmaohyiehktmhxkxp` was initialized on 2026-08-11.
The database migration/schema inspection and SQL-level A/B RLS isolation test are
complete; public signup is disabled, Cloud Mode smoke/RPC checks pass, and authenticated browser evidence remains pending.

Cloud Mode local smoke on 2026-08-11 passed with an ignored `.env.local`:
TypeScript, lint, production build (9/9 pages), unauthenticated redirect/login-shell
privacy, security headers, anonymous Data API RLS, and rollback-safe RPC migration.
No key was committed or recorded in project documentation.

| ID | Task | Status | Acceptance evidence |
|---|---|---|---|
| V02-01 | Create/configure a private Supabase test project | `DONE` | Project is healthy, public signup is disabled, and two confirmed `authenticated` users exist |
| V02-02 | Apply all four V0.2 migrations | `DONE` | Four migrations recorded; 6 RLS tables, 6 owner policies, RPC grants/timeout, constraints, 13 query/FK indexes, and 6 Realtime tables inspected |
| V02-03 | Prove A/B-user RLS isolation | `DONE` | 9/9 SQL-role tests passed: own rows visible, foreign rows hidden, cross-user insert/update/delete and cross-owner project assignment blocked; rollback left zero rows |
| V02-04 | Test a real V0.1 browser snapshot migration | `IN PROGRESS` | RPC migration passed 6/6 for initial import, idempotency, relationships, Main Focus, platforms, and account isolation; real legacy-ID browser normalization/login remains |
| V02-05 | Test offline outbox across reload/reconnect | `PENDING` | Create/update/delete survive reload and flush exactly once after reconnect |
| V02-06 | Test desktop ↔ mobile Realtime | `PENDING` | Capture, status, Main Focus, and delete changes converge on both devices |
| V02-07 | Verify login/logout and route privacy | `IN PROGRESS` | Unauthenticated `/` redirects `307` to `/login`; login returns `200` without private shell and with security headers; authenticated login/logout remains |
| V02-08 | Validate the production Vercel deployment | `PENDING` | Environment, redirects, static assets, and mobile session work in production |
| V02-09 | Review and merge the feature branch | `BLOCKED` | All checks above pass and the owner approves the merge |
| V02-10 | Tag and document `v0.2.0` | `BLOCKED` | Merge completed, changelog updated, release workflow green |

### V0.2 exit criteria

V0.2 is releasable only when every `V02-*` validation item has evidence, the
configured-Supabase flows pass, and no personal data or credentials are present
in the repository.

## Engineering health — security and performance

Audit report:
[`docs/audits/security-performance-audit-2026-08-09.md`](docs/audits/security-performance-audit-2026-08-09.md)

Audit branch: `agent/security-performance-audit`

### Completed in the first hardening pass

- [x] Scan the current tree and 109-commit history for high-confidence secrets.
- [x] Remove hardcoded demo/personal seed content from new profiles.
- [x] Scope Cloud cache by authenticated user and gate rendering until scope matches.
- [x] Add CSP, anti-clickjacking, MIME, referrer, permissions, HSTS, and disclosure headers.
- [x] Add UI/database size limits and an import RPC timeout.
- [x] Pin GitHub Actions by full SHA and close release input shell injection.
- [x] Reduce Project↔Task assembly from `O(P×T)` to `O(P+T)`.
- [x] Reduce outbox storage work from `O(M²)` to `O(M)`.
- [x] Remove Inbox cyclomatic-complexity warnings and split row/dialog concerns.

### Next hardening slices

- [ ] `SEC-10` Finish authenticated browser migration, Auth rate-limit, and different-account cache-isolation validation; migration chain, SQL-level A/B RLS, anonymous Data API, and RPC behavior are proven.
- [ ] `SEC-11` Add runtime schema validation for versioned LocalStorage snapshots/outbox entries.
- [ ] `SEC-12` Evaluate encrypted-at-rest browser persistence for untrusted/shared devices.
- [ ] `SEC-13` Replace CSP inline allowances with nonces/hashes if the production Next.js path supports it cleanly.
- [ ] `PERF-01` Split `PersonaProvider` into tested initialization, persistence, and Realtime services.
- [ ] `PERF-02` Replace full-state Realtime refresh with changed-domain/row reconciliation.
- [ ] `PERF-03` Add pagination/incremental Cloud reads before datasets exceed personal-scale assumptions.
- [ ] `PERF-04` Continue component decomposition for Global Quick Capture, Login, Sidebar, and Today Tasks.
- [ ] `PERF-05` Establish repeatable browser performance budgets and regression benchmarks.

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
