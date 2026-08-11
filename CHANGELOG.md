# Changelog

All notable changes to **MyPersonaOS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

_No unreleased changes yet._

---

## [0.2.0] - 2026-08-11

### Added
- Private Supabase authentication with PostgreSQL persistence, Row Level Security, and Realtime synchronization.
- Durable diff-based outbox for offline create, update, and delete operations.
- UUID-safe V0.1 browser snapshot migration with rollback-safe atomic import.
- Minimal production Service Worker registration without caching private dynamic data.
- GitHub Actions CI/CD workflows (`ci.yml` and `release.yml`).
- Documentation suite, canonical roadmap, and AI-agent handoff workflow.

### Changed
- Upgraded to Next.js 16.3 and React 19 with the `proxy.ts` authentication boundary.
- Isolated Cloud browser cache by authenticated user and removed hardcoded demo data from new profiles.
- Filtered expected unauthenticated session-missing events from error-level production logs.
- Pinned GitHub Actions by full commit SHA and validated release tags before shell use.

### Security
- Verified two-user RLS isolation across all six personal tables.
- Added CSP and browser security headers, bounded inputs, authenticated-only import RPC, secret scanning, and dependency signature checks.
- Confirmed public signup is disabled and no private shell content renders before session resolution.

### Performance
- Reduced project/task assembly from `O(P×T)` to `O(P+T)`.
- Reduced outbox storage processing from `O(M²)` to `O(M)`.
- Added composite query indexes and the missing `tasks.project_id` foreign-key index.

### Validation
- TypeScript, ESLint, security scan, dependency audit/signatures, and Next.js production build passed.
- Vercel production deployment, private-route redirects, `/sw.js`, production login, Supabase persistence, offline reconnect, and multi-window Realtime were validated.

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
