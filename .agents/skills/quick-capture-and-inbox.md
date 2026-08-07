# Skill: Quick Capture & Inbox

## Trigger

Use when working on fast capture UI, global keyboard shortcuts, Inbox processing, voice notes, tag parsing, or converting raw captures into tasks/content/projects.

## Goal

Provide a zero-friction input buffer where the owner can capture any thought instantly without stopping to organize or categorize it upfront.

## Inspect first

- `.agents/STATE.md`
- `src/components/` and `src/app/` capture components
- localStorage schema or Supabase `captures` table structure

## Workflow

1. Keep input focused on speed: auto-focus input, minimal required fields, single keystroke submission.
2. Store raw captures immediately with timestamp and status (`unprocessed`).
3. Support inline parsing for tags (e.g. `#today`, `#project`, `@content`).
4. Provide a dedicated Inbox view where unprocessed items can be converted, assigned to Projects, or marked Done.
5. Provide single-click promote action from Inbox item to Today task or Content idea.

## Guardrails

- Never block capture on network latency or validation requirements.
- Store captures locally first if offline or network is unreliable.
- Do not force required dropdowns or categorization during capture.

## Definition of done

- [ ] Capture opens and submits in under 2 seconds;
- [ ] Captured item immediately appears in Inbox;
- [ ] Item can be converted to Today task or marked Done;
- [ ] Keyboard navigation and mobile touch interactions work smoothly.

## Common failure modes

- Adding required form fields (e.g. priority, project, due date) to the quick capture popup.
- Losing captured items if the browser closes before saving.
