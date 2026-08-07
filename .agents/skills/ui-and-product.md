# Skill: Product & UI

## Trigger

Use for dashboards, pages, components, navigation, interaction flows, information hierarchy, or Today behavior.

## Goal

Create interfaces that reduce cognitive load and help the owner move from intention to action quickly.

## Inspect first

- `.agents/STATE.md`
- `src/app/` and relevant components/styles
- existing responsive patterns

## Workflow

1. Identify the user's immediate job-to-be-done.
2. Decide what belongs on `Today` versus a deeper module.
3. Design the smallest end-to-end interaction that solves the job.
4. Reuse existing visual/components patterns before creating new abstractions.
5. Ensure desktop and phone layouts remain usable.
6. Add empty/loading/error states when data is involved.
7. Validate keyboard/touch usability for primary interactions.

## Product rules

- `Today` is a command center, not an analytics dump.
- Quick Capture must remain low-friction.
- Progressive disclosure is preferred over showing every control at once.
- A completed action should have obvious feedback.
- Prefer useful defaults over configuration screens.
- Avoid gamification that distracts from execution.

## Definition of done

- [ ] primary user action is obvious;
- [ ] flow works conceptually from start to finish;
- [ ] responsive behavior is considered;
- [ ] accessibility basics are preserved;
- [ ] no unnecessary dependency was introduced;
- [ ] relevant validation was attempted.

## Common failure modes

- Building a visually impressive dashboard that does not help decide what to do.
- Adding many empty modules instead of one working flow.
- Treating mobile as a scaled-down desktop instead of a capture/execution surface.
