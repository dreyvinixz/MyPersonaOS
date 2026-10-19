# Reviewed development dependency advisory exception (2026-10-19)

The [PR #22 CI logs](https://github.com/dreyvinixz/MyPersonaOS/pull/22)
initially reported 15 vulnerabilities (2 moderate, 12 high, 1 critical). This
is **not** a waiver for vulnerable production packages. The updated CI audits
production dependencies with `npm audit --omit=dev --audit-level=moderate` and
must continue to fail if any moderate-or-higher production vulnerability occurs.

The full-tree audit also remains required, with a narrowly scoped and
time-limited check in `scripts/audit-dev-dependencies.mjs`. Only the following
root advisory is allowed, *and only while the production audit passes*:

| Package | Advisory | Context |
| --- | --- | --- |
| `braces` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | ESLint's `@next/eslint-plugin-next → fast-glob → micromatch → braces` development-time file matching. As reviewed on 2026-10-19, the remaining affected toolchain did not have a supported patched upgrade. Inputs are repository-controlled file patterns, not public input. |

Derived npm advisories caused exclusively by this one root package are permitted.
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

## Tailwind CSS 4 migration — 2026-10-19 (verification pending)

The feature branch is migrating from Tailwind 3 to Tailwind 4 (postcss plugin,
CSS-first entrypoint and no obsolete JavaScript config). The new dependency tree
must pass a fresh audit. If the two older exceptions no longer appear, remove
the exception script from CI rather than indefinitely retaining a waiver.

Supply-chain protections are additive: blocked install scripts, lockfile source
verification, npm registry signatures, Dependabot review PRs, GitHub Dependency
Review, CodeQL, and no automatic merging. A green audit does not imply a
mathematical guarantee against malicious npm packages.

## Verified Tailwind CSS 4 dependency tree

The previous paragraphs preserve the prior (Tailwind 3) audit evidence. On
2026-10-19, the repository was upgraded to **Tailwind CSS 4.3.3** and
`@tailwindcss/postcss@4.3.3`, removing the Tailwind 3 toolchain and
`autoprefixer` / direct `postcss` root dev dependencies. The old
`postcss-selector-parser` exception is **removed** from the active policy.

[GitHub Actions migration run](https://github.com/dreyvinixz/MyPersonaOS/actions/runs/39320868344)
passed:
- `npm ci --ignore-scripts` with blocked dependency lifecycle scripts;
- `npm run security:lock`: **453** packages with official registry origin and
  SHA-512 integrity (except parent-verified bundled Tailwind WASM modules);
- `npm audit --omit=dev --audit-level=moderate`: **0** production advisories;
- `npm audit signatures`: **375** registry signatures and **94** attestations;
- 6/6 domain tests; ESLint; TypeScript; secret scan; and Next.js 16.4.2 build;
- compiler presence of `.rounded-xl`, `.bg-transparent` and `.oil-hero`
  CSS selectors.

**Residual risk:** 5 full-tree high-severity findings (one root advisory,
`braces`, and its transitive dependents in `eslint-config-next`). This remains
a **development-only** exception with review deadline **2026-11-19**; any
other new advisory fails the check. A clean runtime audit does not guarantee
absence of malicious packages or supply-chain compromise.
