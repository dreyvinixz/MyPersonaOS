# Skill: Agent Handoff

## Trigger

Use when pausing unfinished work, encountering a blocker, ending a substantial implementation session, or transferring work to another AI/tool.

## Goal

Make continuation possible without relying on previous chat history.

## Inspect first

- `.agents/HANDOFF.md`
- `.agents/STATE.md`
- current git diff/status or PR changes
- validation output from the current task

## Workflow

1. State the original mission in one or two sentences.
2. Mark status precisely: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `READY_FOR_REVIEW`, or `DONE`.
3. List actual changed files and behaviors.
4. Record decisions that constrain continuation.
5. List validation that really ran with exact outcomes.
6. Separate known issues from speculative future improvements.
7. Give exactly one best next action before the longer remaining-task list.
8. Update `.agents/STATE.md` if durable project context changed.
9. Write/update the active handoff under `.agents/handoffs/` when useful.

## Guardrails

- Do not paste chain-of-thought or hidden reasoning.
- Do not include credentials or sensitive personal data.
- Do not mark planned functionality as implemented.
- Do not bury a blocker inside a long narrative.

## Definition of done

- [ ] next agent can identify current state in under two minutes;
- [ ] files/changes are concrete;
- [ ] validation status is truthful;
- [ ] blocker and next action are explicit;
- [ ] durable decisions are reflected in `STATE.md`.
