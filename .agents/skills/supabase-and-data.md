# Skill: Supabase & Data

## Trigger

Use for database schema, persistence, authentication, Row Level Security, migrations, storage, sync, or replacing temporary local state.

## Goal

Provide private, explicit, cross-device persistence without overengineering a multi-user SaaS.

## Inspect first

- `.agents/STATE.md`
- current domain types/state
- existing Supabase client/migrations if present
- environment-variable conventions

## Workflow

1. Model the real domain object and lifecycle before writing SQL.
2. Prefer migrations/schema-as-code over manual dashboard-only changes.
3. Use stable IDs and timestamps where appropriate.
4. Associate private records with the authenticated owner when user-scoped data exists.
5. Add RLS before considering personal tables production-ready.
6. Keep server-only credentials server-side; expose only keys designed for browser use.
7. Handle loading, empty, error, and optimistic states deliberately.
8. Plan migration from temporary `localStorage`/mock data instead of silently discarding it.

## Data principles

- Personal-first does not mean security can be skipped.
- Avoid storing derived data when it can be safely computed cheaply.
- Model Content, English, Projects, and Today as explicit domains instead of one generic JSON blob.
- Prefer schema evolution that can be migrated incrementally.

## Security guardrails

- Never commit `.env` files containing secrets.
- Never expose service-role keys to the browser.
- RLS policies should be least-privilege.
- Public signup remains disabled/unimplemented unless explicitly requested.

## Definition of done

- [ ] schema matches the domain flow;
- [ ] migrations are reproducible;
- [ ] private tables have appropriate RLS;
- [ ] secrets stay outside source control;
- [ ] error/loading states are handled;
- [ ] type/build checks attempted;
- [ ] cross-device behavior tested when possible.
