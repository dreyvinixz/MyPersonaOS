# Dependency and supply-chain security

## Threat model
A dependency may be compromised without a published CVE. Audit/signatures only
cover known vulnerabilities and registry authenticity; they cannot establish
that the package maintainer or published code is trustworthy.

## Controls
1. Dependabot raises PRs for npm and GitHub Actions on the default branch.
   Routine updates wait seven days (majors 14). **Security fixes are not
   delayed** by this setting. There is **no auto-merge**.
2. Each PR receives Dependency Review (fails on new moderate+ advisories),
   CodeQL scanning, CI checks and human code/dependency review.
3. `npm ci --ignore-scripts` in CI/release; project `.npmrc` also disables
   lifecycle install scripts by default in developer and deployment installs.
4. `npm run security:lock` enforces npm lockfile version 3, exactly matching
   manifest declarations, official HTTPS registry URLs, and SHA-512 digests. Embedded modules marked
   `inBundle` are permitted **only** for the optional Tailwind WASM package,
   where the integrity-verified parent tarball covers their bytes.
5. `npm audit --omit=dev --audit-level=moderate` blocks runtime advisories.
   Full-tree audit keeps the single, narrowly reviewed `braces` dev-only exception (ESLint build tools)
   only while necessary, expiring no later than 2026-11-19.
6. `npm audit signatures` validates registry signatures for packages that
   provide them. Inspect the exact packages with attestations; not all packages
   publish provenance attestations.
7. No secrets in git. The existing tracked secret scanner runs on CI.

## Owner setup after merging to default branch
GitHub Settings → Security and quality → Advanced Security: enable
**Dependency graph**, **Dependabot alerts**, **Dependabot security updates**,
and **Code scanning** (where available).
Configure rulesets / branch protection to require pull requests, CI,
Dependency Review, CodeQL, and at least one human review before merging.
Do not give Dependabot or other bots unconditional auto-merge permission.

## Review checklist for any added npm package
Check exact package name against publisher's official docs, ownership and
maintainer history, time since release, README/source and git changelog,
lockfile diff/new transitive packages, scripts/binaries/network access,
license, provenance, advisories and whether an existing dependency already
solves the need. Keep new dependencies minimal.
