# MyPersonaOS Roadmap

> Last updated: 2026-08-11
>
> Product north star: **What deserves attention today?**

This is the canonical view of completed work, the latest release, and the
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
| V0.2 — Private Persistence | `DONE` | Supabase Auth/PostgreSQL/RLS, offline outbox, migration, and multi-device Realtime |
| V0.3 — Core Workflows | `PLANNED` | Complete Tasks/Projects, content production, and English-learning vertical slices |
| V0.4 — Daily-Use PWA | `PLANNED` | Installable mobile experience, stronger offline shell, deployment, and operational polish |
| V0.5 — Personal Orchestrator | `LATER` | Calendar, weekly review, analytics, automation, and optional AI assistance |

## Released — V0.2

Release branch: `main`

Current status: `RELEASED`

### Engineering complete

- [x] Private Supabase authentication shell with Local Mode fallback.
- [x] PostgreSQL schema, UUID IDs, constraints, indexes, and `updated_at` triggers.
- [x] Row Level Security for every personal table.
- [x] Hardened atomic V0.1 local snapshot import.
- [x] Shared `PersonaProvider` with Local and Supabase repositories.
- [x] Durable diff-based outbox for offline create, update, and delete operations.
- [x] Debounced Realtime refresh including deletes and Main Focus.
- [x] Explicit sync states: initializing, local, syncing, synced, offline, and error.
- [x] Next.js 16.3 security upgrade and `proxy.ts` / `middleware.ts` auth boundary.
- [x] ESLint 9 flat configuration and strict React Hooks rules.
- [x] Clean dependency audit, TypeScript check, lint, and production build.
- [x] Source/history secret audit and an automated CI secret gate.
- [x] Browser security headers, user-scoped Cloud cache, and bounded inputs.
- [x] Supply-chain pinning for GitHub Actions and npm registry signature checks.
- [x] Project/task join and outbox complexity reductions.

### Release validation evidence

Follow the detailed procedure in
[`docs/v0.2-supabase-validation.md`](docs/v0.2-supabase-validation.md).

Homologation project `rchkmaohyiehktmhxkxp` was initialized on 2026-08-11.
Database migration, SQL-level A/B RLS isolation, RPC checks, and authenticated browser validation are complete.

| ID | Task | Status | Acceptance evidence |
|---|---|---|---|
| V02-01 | Create/configure a private Supabase test project | `DONE` | Project is healthy, public signup is disabled, and two confirmed `authenticated` users exist |
| V02-02 | Apply all four V0.2 migrations | `DONE` | Four migrations recorded; 6 RLS tables, 6 owner policies, RPC grants/timeout, constraints, 13 query/FK indexes, and 6 Realtime tables inspected |
| V02-03 | Prove A/B-user RLS isolation | `DONE` | 9/9 SQL-role tests passed: own rows visible, foreign rows hidden, cross-user insert/update/delete and cross-owner project assignment blocked; rollback left zero rows |
| V02-04 | Test a real V0.1 browser snapshot migration | `DONE` | 6/6 browser checks passed: backupCreated, idsAreUuids, taskProjectPreserved, inboxTaskPreserved, mainFocusPreserved, platformsPreserved all true |
| V02-05 | Test offline outbox across reload/reconnect | `DONE` | Created tasks offline; local state persisted across reload and synced upon network reconnection |
| V02-06 | Test desktop ↔ mobile Realtime | `DONE` | Verified multi-window realtime sync for tasks and Main Focus without manual reload |
| V02-07 | Verify login/logout and route privacy | `DONE` | Unauthenticated routes redirect to `/login`; logout clears state and redirects immediately |
| V02-08 | Validate the production Vercel deployment | `DONE` | Cloud Mode active; private routes redirect to login; `/sw.js` returns 200; production login and clean current-deployment logs confirmed |
| V02-09 | Review and merge the feature branch | `DONE` | PR #5 merged into `main`; production deployment is READY on the validated commit |
| V02-10 | Tag and document `v0.2.0` | `DONE` | Package metadata, changelog, release documentation, and GitHub release workflow prepared from `main` |

### V0.2 exit criteria

All V0.2 exit criteria passed: every `V02-*` item has evidence, the configured
Supabase flows pass, production authentication is healthy, and no personal data
or credentials are present in the repository.

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
- [x] Make the first Cloud migration back up the eligible V0.1 legacy key before UUID normalization.

### Next hardening slices

- [ ] `SEC-10` Finish Auth rate-limit validation (authenticated browser migration and different-account cache-isolation have been validated); migration chain, SQL-level A/B RLS, anonymous Data API, and RPC behavior are proven.
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
