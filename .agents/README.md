# `.agents/` — AI Collaboration Workspace

This directory is the shared operating context for any AI working on MyPersonaOS.

Its purpose is to reduce repeated explanation, prevent context loss, and make handoffs between different agents predictable.

## Structure

- `ONBOARDING.md` — how a new agent gets oriented before changing code.
- `STATE.md` — current product and engineering snapshot.
- `HANDOFF.md` — canonical format for transferring unfinished work and decisions.
- `skills/` — reusable project-specific capabilities and procedures.

## How agents should use this directory

### At the start of a task

1. Read the root `AGENTS.md`.
2. Follow `ONBOARDING.md`.
3. Read `STATE.md`.
4. Select the smallest relevant set of skills.
5. Inspect the actual code before making assumptions.

### During work

- Keep scope aligned with the user's request.
- Record durable architectural/product decisions in `STATE.md` when they materially change the project.
- If a recurring procedure emerges, capture it as a skill instead of leaving it only in chat history.

### At the end of work

- Validate what can actually be validated.
- Update state when necessary.
- Leave a handoff if work is incomplete, risky, or likely to be continued by another agent.

## Design principle

Chat history is temporary. Repository context is durable.

Anything another agent must know to safely continue the project should live here or in the codebase, not only in a conversation.
