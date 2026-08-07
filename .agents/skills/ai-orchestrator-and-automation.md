# Skill: AI Orchestrator & Automation

## Trigger

Use when implementing AI assistance, daily planning recommendations, smart task prioritization, calendar integration, weekly reviews, or automated summaries.

## Goal

Provide intelligent assistance that reduces planning friction and suggests priority focus items without making the app dependent on external AI services for basic usability.

## Inspect first

- `.agents/STATE.md`
- `src/lib/` utilities and service integrations
- Current AI and API environment configurations

## Workflow

1. Design core features to function offline or without AI first (deterministic heuristics).
2. Add AI assistance as an optional enhancement layer (e.g., auto-categorizing Inbox items, generating daily focus summaries).
3. Ensure AI prompts use structured JSON output formats with strict type schemas.
4. Keep user in control: AI suggests actions (e.g. "Add to Today?"), user approves or modifies.
5. Provide clear loading and fallback states if AI services are unavailable or rate-limited.

## Guardrails

- Never block basic app navigation or task completion on AI API calls.
- Never leak private user data, tasks, or API keys in AI prompts.
- Keep prompt tokens minimal and context focused.

## Definition of done

- [ ] Core feature works even when AI API is disabled;
- [ ] AI outputs conform strictly to TypeScript type interfaces;
- [ ] Graceful fallback occurs on network error or rate limit;
- [ ] User privacy and security are fully preserved.

## Common failure modes

- Making basic task creation or viewing dependent on an LLM API call.
- Over-promising AI capabilities before core task/capture persistence is rock-solid.
