# Skill: Tasks & Projects System

## Trigger

Use when creating or modifying task lists, project hierarchies, status states, priority rules, deadlines, progress indicators, or goal mappings.

## Goal

Maintain a clear, goal-aligned task hierarchy (`Goals → Projects → Tasks → Today`) that helps the user execute priority work without feeling overwhelmed.

## Inspect first

- `.agents/STATE.md`
- `src/app/projects/` and `src/app/tasks/` routes
- Existing task and project data interfaces/types

## Workflow

1. Ensure every task belongs to a explicit status (`todo`, `in_progress`, `done`, `archived`).
2. Maintain `is_today` flag to explicitly pull priority tasks into the Today Dashboard.
3. Keep project views focused on active outcomes and next actionable steps.
4. Provide progress tracking (percentage completed, remaining tasks) per project.
5. Provide easy task reordering and priority toggles without full page reloads.

## Guardrails

- Avoid overly nested subtask hierarchies (limit to 2 levels: Project → Task).
- Do not let completed tasks clutter active views; auto-archive or collapse done tasks.
- Keep task models explicit for future Supabase PostgreSQL migration.

## Definition of done

- [ ] Task status changes update UI instantly;
- [ ] Today toggle cleanly adds/removes tasks from Today dashboard;
- [ ] Projects accurately reflect completion percentage;
- [ ] Data models validate cleanly via TypeScript.

## Common failure modes

- Over-engineering project management with complex Gantt charts or Jira-like workflows.
- Disconnecting projects from daily action on the Today Dashboard.
