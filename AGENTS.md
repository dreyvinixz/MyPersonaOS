# MyPersonaOS — AI Agent Entry Point

This repository is designed to be safely worked on by humans and AI agents.

## Mandatory read order

Before making changes, read:

1. `.agents/ONBOARDING.md`
2. `.agents/STATE.md`
3. `.agents/HANDOFF.md`
4. `.agents/skills/README.md`
5. Any skill relevant to the task in `.agents/skills/`

## Core rule

MyPersonaOS is a **personal-first life operating system** centered on one question:

> What deserves attention today?

Prefer simple, useful workflows over feature volume. Do not turn the app into a generic productivity suite.

## Project priorities

1. Today dashboard
2. Fast capture / Inbox
3. Tasks and Projects
4. Content system for CodeToday, Personal, and Quant Base
5. English learning system
6. Private cross-device persistence
7. Orchestration and AI assistance only after the foundations are reliable

## Working rules

- Keep changes small and reviewable.
- Preserve existing product intent unless the task explicitly changes it.
- Never commit secrets, tokens, `.env` values, private user data, or credentials.
- Prefer TypeScript and existing project conventions.
- Do not add dependencies without a concrete benefit.
- Do not claim tests/builds passed unless they were actually run.
- If validation is blocked by the environment, document the exact blocker.
- Do not silently delete or rewrite unrelated work.
- Update `.agents/STATE.md` when architecture, milestones, or important decisions change.
- Leave a handoff using `.agents/HANDOFF.md` whenever work is incomplete or another agent may continue it.

## Definition of done

A change is done when:

- the requested behavior is implemented;
- relevant validation has been attempted;
- known limitations are documented;
- project state/handoff docs are updated when materially affected;
- the next agent can understand what happened without reconstructing the session.
