# Skill: Quality & Delivery

## Trigger

Use for implementation completion, refactors, dependencies, lint/type/build failures, release readiness, or any task that changes code.

## Goal

Ship small, understandable changes with honest validation and minimal accidental complexity.

## Workflow

1. Inspect scope and existing conventions before editing.
2. Keep unrelated changes out of the task.
3. Prefer the existing dependency set.
4. If adding a dependency, document why the platform/standard library is insufficient.
5. Run the narrowest useful checks first, then broader checks when available.
6. Distinguish code failure from environment/tooling failure.
7. Review the diff for accidental secrets, debug code, dead code, or unrelated formatting churn.
8. Update state/handoff docs when the work changes durable context.

## Preferred validation ladder

Use what exists in the repository; do not invent scripts.

Typical order:

1. focused unit/component test;
2. TypeScript/typecheck;
3. lint;
4. build;
5. relevant manual flow;
6. deployment/CI where in scope.

## Reporting format

Prefer explicit statements such as:

```text
npm run lint  -> passed
npm run build -> not run: dependency registry unavailable
mobile flow   -> not manually tested
```

Avoid vague statements like “should work” or “fully tested.”

## Guardrails

- Never weaken security/type checks just to make validation green without explaining the tradeoff.
- Do not hide failing checks.
- Do not refactor unrelated areas during a focused feature unless necessary.
- Keep temporary mocks clearly labeled.

## Definition of done

- [ ] requested behavior implemented;
- [ ] diff reviewed;
- [ ] relevant checks attempted;
- [ ] blockers documented precisely;
- [ ] no secrets committed;
- [ ] next agent can understand remaining risk.
