# Changelog

All notable changes to **MyPersonaOS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- GitHub Actions CI/CD workflows (`ci.yml` and `release.yml`).
- Documentation suite under `docs/` (`about.md`, `architecture.md`, `index.md`).
- Open-source preparation files (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.env.example`).
- AI Agent guidance (`AGENTS.md` and `.agents/` workflows).
- Security/performance audit with secret scanning, dependency signature checks, browser security headers, bounded database inputs, and a documented code graph.

### Changed
- Isolated Cloud browser cache by authenticated user and removed hardcoded demo data from new profiles.
- Reduced project/task assembly from `O(P×T)` to `O(P+T)` and outbox storage work from `O(M²)` to `O(M)`.
- Split the large Inbox row/actions/dialog UI into reusable typed components.
- Pinned GitHub Actions by full commit SHA and validated release tags before shell use.

---

## [0.1.0] - 2026-08-07

### Added
- Initial project scaffolding with Next.js 15 App Router, TypeScript, and Tailwind CSS v4.
- Today Dashboard foundation with `localStorage` state management.
- Quick Capture & Inbox views.
- Projects & Tasks overview module.
- Content Studio layout (CodeToday, Personal, Quant Base).
- English Lab learning framework module.
- PWA setup & responsive navigation.
