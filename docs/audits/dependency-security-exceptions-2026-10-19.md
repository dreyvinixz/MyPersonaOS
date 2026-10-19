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

## Remediation evidence — 2026-10-19

The initial CI run [39317737360](https://github.com/dreyvinixz/MyPersonaOS/actions/runs/39317737360) reported **15 findings (2 moderate, 12 high, 1 critical)** and stopped at `npm audit` before testing.

A one-time secure dependency refresh was executed on a GitHub-hosted Node 24 runner in [run 39319351966](https://github.com/dreyvinixz/MyPersonaOS/actions/runs/39319351966). Its validated commit is [`a3d1701`](https://github.com/dreyvinixz/MyPersonaOS/commit/a3d1701f9ee33432f91cba28a68e41df4ddbdc08). It:

- Updated `next` and `eslint-config-next` to **16.4.2** and installed compatible transitive fixes using npm without the breaking `--force` option.
- Regenerated and committed `package-lock.json` along with `package.json`.
- Passed `npm ci`, `npm audit --omit=dev --audit-level=moderate` (**0 production vulnerabilities**), audited registry signatures (**403 signed packages, 89 attestations**), and the scoped full-tree development advisories check.
- Passed **6/6** unit tests, ESLint, TypeScript, tracked-file secret scan and Next.js production build (**9/9** generated static pages).
- Removed its own temporary repair workflow after successfully pushing the checked changes.

**Residual full-tree audit:** 9 findings (7 high, 2 moderate), all transitively attributable to the two documented **development-only** root advisories. They do not disappear from `npm audit`; the check allows them only with the runtime audit passing and the exception valid. Reevaluate no later than **2026-11-19**. The standard PR/push CI must still independently pass after this commit; the one-time repair workflow is not a substitute for ordinary CI or Cloud/Offline/Realtime validation.
