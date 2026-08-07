# Agent Handoff

Use this document as the canonical handoff format whenever work is unfinished, blocked, risky, or likely to be continued by another AI.

Do not overwrite durable project history with vague notes. A useful handoff should let the next agent resume without reading the previous conversation.

---

## Handoff Template

### Mission

What was the user trying to accomplish?

### Status

Choose one:

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `READY_FOR_REVIEW`
- `DONE`

### What changed

List concrete changes, preferably grouped by feature or file.

### Files touched

- `path/to/file` — why it changed

### Decisions made

Record decisions that constrain future work and explain why when useful.

### Validation performed

Include exact commands/checks that actually ran and their results.

Example:

```text
npm run lint   -> passed
npm run build  -> blocked: registry unavailable
```

### Known issues / risks

List anything that could break, remains unverified, contains temporary implementation, or requires migration.

### Next best action

Give the next agent one concrete starting point.

### Remaining tasks

- [ ] task
- [ ] task

### Context worth preserving

Include only information that would otherwise be lost and materially affects continuation.

---

## Handoff rules

1. Be factual; distinguish completed work from planned work.
2. Never claim a build/test passed unless it ran successfully.
3. Include blockers with enough detail to reproduce them.
4. Mention temporary mocks/localStorage/fake data explicitly.
5. If a decision should survive longer than this task, also update `.agents/STATE.md`.
6. If the same workflow is likely to recur, promote it into `.agents/skills/`.
7. Do not include secrets, tokens, private credentials, or sensitive personal data.

## Compact handoff example

```md
### Mission
Persist Quick Capture across desktop and mobile.

### Status
IN_PROGRESS

### What changed
- Added Supabase browser client.
- Added `captures` table migration.
- Inbox now reads persisted captures.

### Validation performed
- `npm run typecheck` -> passed
- manual mobile sync -> not tested

### Known issues / risks
- RLS policy only covers authenticated owner read/write; no delete policy yet.

### Next best action
Add delete/update policies and test two-device sync.
```
