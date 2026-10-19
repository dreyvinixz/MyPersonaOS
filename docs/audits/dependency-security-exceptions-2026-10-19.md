# Temporary development dependency advisory exceptions (2026-10-19)

The [PR #22 CI logs](https://github.com/dreyvinixz/MyPersonaOS/pull/22)
initially reported 15 vulnerabilities (2 moderate, 12 high, 1 critical). This
is **not** a waiver for vulnerable production packages. The updated CI audits
production dependencies with `npm audit --omit=dev --audit-level=moderate` and
must continue to fail if any moderate-or-higher production vulnerability occurs.

The full-tree audit also remains required, with a narrowly scoped and
time-limited check in `scripts/audit-dev-dependencies.mjs`. Only the following
root advisories are allowed, *and only while the production audit passes*:

| Package | Advisory | Context |
| --- | --- | --- |
| `braces` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Tailwind 3/ESLint build-time glob dependencies. As reviewed on 2026-10-19, no patched compatible release was available. Inputs are source-controlled glob patterns, not untrusted user-provided patterns. |
| `postcss-selector-parser` | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | Tailwind 3 build-time CSS selector parser. Patched major 7.1.6 changes the major used by Tailwind 3. Source CSS is repository-controlled rather than attacker-supplied. |

Derived npm advisories caused exclusively by those two packages are permitted.
**Any different advisory, unexpected root, runtime audit failure, missing audit
output or expiry fails the CI.** There is no blanket `--force` or disabled audit.

This is *not* a claim of zero vulnerabilities: it is a documented production vs.
trusted development-toolchain distinction. The exception expires **2026-11-19**
and must be reassessed or eliminated (e.g., safe Tailwind migration) before then.
Do not extend it without new reachability analysis. Version updates must be
reflected in `package-lock.json` and tested with clean `npm ci`, tests, lint,
typecheck, build and `npm audit signatures`.
