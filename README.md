# MyPersonaOS

[![CI Pipeline](https://github.com/dreyvinixz/MyPersonaOS/actions/workflows/ci.yml/badge.svg)](https://github.com/dreyvinixz/MyPersonaOS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](file:///d:/MyPersonaOS/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

A personal operating system for focus, content creation, projects, and learning.

> *Build your today. Why not today?*

---

## Documentation

Explore the project documentation in the **[docs/](docs/)** directory:

- 📖 **[About MyPersonaOS](docs/about.md)** — Product vision, core philosophy, and domain areas.
- 🏗️ **[Architecture & Design](docs/architecture.md)** — Tech stack, client state vs. Supabase backend, PWA & security model.
- 📜 **[Changelog & Releases](CHANGELOG.md)** — Release notes and versioning history.
- 🤝 **[Contributing Guidelines](CONTRIBUTING.md)** — Setup, PR process, and community standards.
- 🤖 **[AI Agent Rules (AGENTS.md)](AGENTS.md)** — Mandates and entry points for AI pair programming.

---

## Getting Started

### Quick Start (Local Development)

```bash
# Clone repository
git clone https://github.com/dreyvinixz/MyPersonaOS.git
cd MyPersonaOS

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## Current Version (V0.1 Bootstrap)

The initial version uses client-side state (`localStorage`) for fast capture and Today focus tasks so the UI and workflows can be iterated quickly before attaching cloud infrastructure.

### Features Included

- **Today Dashboard**: Primary focus hub for what deserves attention today
- **Quick Capture + Inbox**: Lightning-fast idea & task input
- **Projects & Tasks**: High-level overview and organization
- **Content Studio**: Content pipeline for CodeToday, Personal, and Quant Base
- **English Lab**: English-learning method & practice module
- **Mobile First / PWA**: Responsive layout with offline capabilities

---

## Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Persistence (Planned V0.2)**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Deployment**: Vercel & PWA
- **CI/CD**: GitHub Actions (`ci.yml` & `release.yml`)

---

## Roadmap

- [x] **V0.1 — Bootstrap**: Client-side state, UI foundation, Open Source setup, CI/CD & Documentation
- [ ] **V0.2 — Persistence**: Supabase integration, private auth, PostgreSQL, RLS, cross-device sync
- [ ] **V0.3 — Workflows**: Interactive task management, content stages, English vocabulary sessions
- [ ] **V0.4 — Orchestrator**: Calendar integration, AI prioritization, weekly reviews

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
