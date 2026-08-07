# AI Onboarding

Use this checklist before changing MyPersonaOS.

## 1. Understand the product

MyPersonaOS is a private personal operating system for one user. It should unify:

- daily focus;
- quick capture and Inbox;
- tasks and projects;
- content creation for **CodeToday**, **Personal**, and **Quant Base**;
- a personal English-learning method;
- later: calendar, analytics, automation, and AI orchestration.

The product is intentionally centered on **Today**. The system should help decide and execute what matters now, rather than become a warehouse of dashboards.

## 2. Current technical direction

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Supabase planned for PostgreSQL, Auth, Storage, and cross-device persistence
- Vercel planned for deployment
- PWA-first mobile strategy

Never assume planned infrastructure already exists. Confirm it in the repository.

## 3. Read current state

Read `.agents/STATE.md` before choosing an implementation strategy.

Then inspect the files relevant to the task. Repository documents describe intent; code is the source of truth for what exists today.

## 4. Choose skills

Read `.agents/skills/README.md`, then load only the skills needed for the current task.

Examples:

- new dashboard UI → `ui-and-product.md`
- data/auth/database → `supabase-and-data.md`
- Content Studio → `content-system.md`
- English module → `english-system.md`
- mobile/installability → `pwa-mobile.md`
- validation/refactor → `quality-and-delivery.md`

## 5. Protect boundaries

Do not:

- commit API keys or credentials;
- expose private personal data;
- add public signup unless explicitly requested;
- introduce a new framework when the existing stack solves the problem;
- build AI orchestration before core data/workflows are reliable;
- optimize for hypothetical multi-user SaaS requirements unless requested.

## 6. Work in vertical slices

Prefer a small end-to-end improvement over many disconnected scaffolds.

Good example:

`Capture idea → persist it → show it in Inbox → allow completion/organization`

Less useful example:

`Create 12 empty modules with no working workflow.`

## 7. Validate honestly

Before reporting completion:

- run the relevant typecheck/lint/build/tests when available;
- manually reason through the changed flow;
- report failures or environmental blockers explicitly;
- never write “validated” when a command was not actually run.

## 8. Leave the repository understandable

If the task changes architecture, product direction, milestones, or creates unfinished work:

1. update `.agents/STATE.md`;
2. write a handoff using `.agents/HANDOFF.md`;
3. add or improve a skill if the procedure will be reused.

A new agent should be able to continue without access to the previous chat.
