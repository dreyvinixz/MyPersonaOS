# Skill: PWA & Mobile

## Trigger

Use for responsive behavior, installability, manifest, service worker, offline behavior, notifications, mobile navigation, or home-screen app experience.

## Goal

Keep MyPersonaOS usable as one web-first product on desktop and phone before introducing a separate native codebase.

## Workflow

1. Verify the primary flow on narrow mobile layouts first.
2. Keep touch targets and capture actions easy to reach.
3. Add/maintain valid app manifest metadata and icons when available.
4. Introduce service-worker/offline behavior deliberately; do not cache private/stale data blindly.
5. Test installation behavior on supported devices when possible.
6. Treat online persistence and offline capability as separate concerns.
7. Only recommend a native wrapper/app when a real native requirement appears.

## Mobile priorities

Phone use is especially important for:

- quick capture;
- checking Today;
- completing tasks;
- adding content ideas;
- logging English study.

Complex planning/editing can remain more comfortable on desktop as long as core mobile workflows are not blocked.

## Guardrails

- Never expose cached private data carelessly on shared devices.
- Do not make the app unusable when installability features fail.
- Avoid a second React Native/native implementation without a concrete requirement.
- Push notifications should be purposeful and opt-in, not attention spam.

## Definition of done

- [ ] primary flow works at phone width;
- [ ] touch interaction is practical;
- [ ] PWA metadata is valid when installability is in scope;
- [ ] private/offline caching behavior is understood;
- [ ] desktop behavior remains intact.
