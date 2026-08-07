# MyPersonaOS Skills Bank

Skills are reusable project-specific operating procedures for AI agents. They capture *how this repository prefers recurring work to be done*.

## Selection protocol

Before starting implementation:

1. identify the task domain;
2. load the smallest relevant set of skills;
3. inspect the current code;
4. follow repository reality over stale documentation;
5. update or add a skill when a reusable procedure materially improves.

Do not blindly load every skill. Too much context can be as harmful as too little.

## Catalog

| Skill | Use when | File |
|---|---|---|
| Product & UI | Designing or changing user-facing flows | `ui-and-product.md` |
| Data & Supabase | Persistence, auth, schema, RLS, sync | `supabase-and-data.md` |
| Content System | CodeToday, Personal, Quant Base workflows | `content-system.md` |
| English System | English learning sessions/method/vocabulary | `english-system.md` |
| PWA & Mobile | Installability, responsive/mobile behavior, offline | `pwa-mobile.md` |
| Quality & Delivery | Validation, dependencies, refactors, completion | `quality-and-delivery.md` |
| Agent Handoff | Finishing/pausing work for another AI | `agent-handoff.md` |
| Quick Capture & Inbox | Zero-friction input buffer & task conversion | `quick-capture-and-inbox.md` |
| Tasks & Projects | Goal-aligned task hierarchy & project tracking | `tasks-and-projects-system.md` |
| AI Orchestrator | Smart planning recommendations & non-blocking AI | `ai-orchestrator-and-automation.md` |
| CI/CD & Releases | GitHub Actions, SemVer releases & changelogs | `ci-cd-and-release-management.md` |

Machine-readable metadata lives in `catalog.yaml`.

## What qualifies as a skill?

A skill should describe a repeated capability with:

- a clear trigger;
- preconditions/context to inspect;
- a preferred workflow;
- guardrails;
- definition of done;
- common failure modes when useful.

A one-off decision belongs in `STATE.md` or code comments, not as a skill.

## Adding a skill

1. Copy `TEMPLATE.md`.
2. Use a lowercase kebab-case filename.
3. Add it to this catalog and `catalog.yaml`.
4. Keep it project-specific and action-oriented.
5. Avoid embedding secrets, personal data, or chat-only context.

## Skill precedence

When instructions conflict, use this order:

1. explicit current user request;
2. repository safety/security constraints;
3. `AGENTS.md` and `.agents/STATE.md`;
4. task-specific skill;
5. general conventions.
