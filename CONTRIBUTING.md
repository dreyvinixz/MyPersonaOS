# Contributing to MyPersonaOS

Thank you for your interest in contributing to MyPersonaOS! MyPersonaOS is an open-source personal life operating system designed for focus, capture, projects, content creation, and language learning.

This project is developed collaboratively by human developers and AI agents using an explicit agent workflow (`AGENTS.md` and `.agents/`).

---

## 1. Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** / **pnpm** / **yarn**
- **Git**

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/dreyvinixz/MyPersonaOS.git
   cd MyPersonaOS
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start local development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. AI Agent Workflows

If you are using AI agents (such as Antigravity, Claude, Copilot Workspace, etc.) to contribute to this repository:

1. **Mandatory Read Order**: Ensure the AI reads [AGENTS.md](file:///d:/MyPersonaOS/AGENTS.md), [.agents/ONBOARDING.md](file:///d:/MyPersonaOS/.agents/ONBOARDING.md), and [.agents/STATE.md](file:///d:/MyPersonaOS/.agents/STATE.md) before making changes.
2. **State & Handoff Updates**: Always update [.agents/STATE.md](file:///d:/MyPersonaOS/.agents/STATE.md) when architecture or milestones change, and provide a handoff note using [.agents/HANDOFF.md](file:///d:/MyPersonaOS/.agents/HANDOFF.md).

---

## 3. Security & Secrets Policy

- **NEVER** commit API keys, database credentials, authentication secrets, or private personal data.
- Environment variables must be placed in `.env.local` (which is ignored by Git).
- Verify `.gitignore` before submitting any PR.

---

## 4. Pull Request Checklist

Before submitting a Pull Request, please ensure:

- [ ] Code follows existing TypeScript and Next.js project patterns.
- [ ] `npm run lint` or relevant checks pass without errors.
- [ ] No secret credentials or personal data are included.
- [ ] Commits have clear, descriptive messages (e.g., `feat: add capture keyboard shortcut` or `fix: inbox state persistence`).
- [ ] `AGENTS.md` rules and `.agents/STATE.md` are respected.

---

## 5. Community & Conduct

Please review our [Code of Conduct](file:///d:/MyPersonaOS/CODE_OF_CONDUCT.md) before interacting with the repository or submitting pull requests.

## License

By contributing to MyPersonaOS, you agree that your contributions will be licensed under the project's [MIT License](file:///d:/MyPersonaOS/LICENSE).
