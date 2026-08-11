# Welcome to the MyPersonaOS Wiki!

Welcome to the official documentation for **MyPersonaOS**, a personal-first, open-source life operating system designed for focus, instant capture, project execution, content creation, and continuous language learning.

---

## 📖 Table of Contents

1. [What is MyPersonaOS?](#-what-is-mypersonaos)
2. [Core Philosophy](#-core-philosophy)
3. [Feature Modules](#-feature-modules)
4. [Quick Start & Local Setup](#-quick-start--local-setup)
5. [Data Privacy & Supabase Sync](#-data-privacy--supabase-sync)
6. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🚀 What is MyPersonaOS?

MyPersonaOS brings together daily focus, idea capture, tasks, projects, content creation, and an evolving English-learning method into a single, unified web and PWA interface.

Instead of fragmenting your personal workflow across multiple generic productivity suites, MyPersonaOS centers everything around one core question:

> **"What deserves attention today?"**

---

## 💡 Core Philosophy

* **Today-First Focus**: The Today Dashboard is your command center. It filters out non-essential noise so you can execute what matters now.
* **Frictionless Capture**: Capture thoughts, links, voice notes, or images instantly into an Inbox without stopping to categorize upfront.
* **User-Owned Data**: Your life data belongs to you. In V0.1, data stays local in your browser (`localStorage`). In V0.2, data syncs privately via your personal Supabase instance with strict Row Level Security (RLS).
* **Open Source & Extensible**: Built openly under the MIT License so anyone can host, customize, or contribute to their personal life operating system.

---

## ⚙️ Feature Modules

MyPersonaOS includes 5 core integrated modules:

* **Today Dashboard**: Dynamic clock, non-negotiable main focus, today's task checklist, quick capture box, and module progress summaries.
* **Quick Capture & Inbox**: Instant input buffer supporting text, links, audio notes, and images.
* **Tasks & Projects**: Goal-aligned task hierarchy mapping `Goals → Projects → Tasks → Today`.
* **Content Studio**: Multi-brand content pipeline supporting **CodeToday** (programming), **Personal** (technology/philosophy), and **Quant Base** (institutional finance).
* **English Lab**: Language acquisition framework tracking active vocabulary and spaced-repetition mastery levels (1-5).

---

## 💿 Quick Start & Local Setup

Running MyPersonaOS locally takes less than 1 minute:

```bash
# 1. Clone repository
git clone https://github.com/dreyvinixz/MyPersonaOS.git
cd MyPersonaOS

# 2. Install dependencies
npm install

# 3. Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Data Privacy & Supabase Sync

* **V0.1 (Current)**: Data is stored locally in your browser using `localStorage` via the reactive `usePersonaState` hook.
* **V0.2 (In validation)**: Private single-tenant Supabase backend integration (PostgreSQL + RLS + Auth) for secure multi-device sync across desktop and phone.

---

## 🛠️ Troubleshooting & FAQ

* **How do I reset my local state?**
  * Open your browser Developer Tools (F12) → Application → Local Storage → Clear `mypersonaos_state_v1` and refresh the page.

* **Is my personal data sent to external servers?**
  * **No.** In V0.1, all data remains strictly inside your local browser storage. No analytics or tracking scripts are included.

* **Can I run MyPersonaOS on mobile?**
  * Yes! MyPersonaOS is built PWA-first and features a responsive mobile layout. You can add it to your phone's home screen.

---

*For technical architecture details, see the [Architecture Wiki Page](Architecture).*
