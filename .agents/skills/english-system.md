# Skill: English System

## Trigger

Use for English study sessions, vocabulary, pronunciation, comprehension, reading/listening workflows, review scheduling, or method experiments.

## Goal

Support the owner's evolving English-learning method while recording enough evidence to improve the method over time.

## Current method direction

`Listen + Read → Read Aloud → Pronunciation → Comprehension → Vocabulary → Retell → Review`

This is a working hypothesis, not an immutable curriculum.

## Model direction

Keep these concepts distinguishable:

- `StudySession` — one actual practice session;
- `Source` — book/audio/video/article being studied;
- `Step` — activity performed in the session;
- `VocabularyItem` — word/phrase worth learning;
- `Review` — later retrieval/repetition;
- `MethodVersion` — the procedure currently being tested.

## Workflow

1. Make starting today's session easy.
2. Record source and elapsed/estimated study time when useful.
3. Track completed steps without forcing every session to use all steps.
4. Capture unknown vocabulary or pronunciation quickly during study.
5. Prefer recall/retelling evidence over vanity streaks.
6. Allow the method itself to evolve and preserve version history.
7. Add spaced repetition only when the vocabulary workflow is already useful.

## Guardrails

- Do not turn the module into a generic language-learning app prematurely.
- Do not hard-code one textbook or source as the entire model.
- Do not require translation for every word by design.
- Metrics should help learning decisions, not become the purpose of studying.

## Definition of done

- [ ] today's study flow is easy to start and finish;
- [ ] sessions can be associated with a source;
- [ ] method steps are flexible;
- [ ] useful vocabulary can be captured;
- [ ] method changes can be represented without destroying history.
