# Skill: CI/CD & Release Management

## Trigger

Use when updating GitHub Actions workflows, managing version tags, writing release notes, updating CHANGELOG.md, or troubleshooting CI build pipelines.

## Goal

Maintain clean, automated continuous integration and release workflows to guarantee project stability and semantic versioning for open-source releases.

## Inspect first

- `.github/workflows/` (`ci.yml`, `release.yml`)
- `CHANGELOG.md`
- `package.json` version field

## Workflow

1. Ensure all pull requests and pushes pass `npx tsc --noEmit` and `npm run build`.
2. Follow Semantic Versioning (`MAJOR.MINOR.PATCH`) for releases.
3. Update `CHANGELOG.md` under `[Unreleased]` during feature development.
4. When releasing a version:
   - Move `[Unreleased]` items into new version section `[X.Y.Z] - YYYY-MM-DD`.
   - Update version in `package.json`.
   - Create Git tag `vX.Y.Z`.
   - Push tag to trigger `.github/workflows/release.yml`.

## Guardrails

- Never bypass failing CI tests or force-push broken builds to `main`.
- Ensure release notes do not contain internal credentials, private data, or unverified claims.

## Definition of done

- [ ] `ci.yml` passes cleanly on target branch;
- [ ] `CHANGELOG.md` reflects all notable changes accurately;
- [ ] Version numbers match across `package.json`, `CHANGELOG.md`, and Git tag;
- [ ] GitHub release generates successfully.

## Common failure modes

- Tagging releases without verifying `npm run build` first.
- Forgetting to update `CHANGELOG.md` before publishing a tag.
