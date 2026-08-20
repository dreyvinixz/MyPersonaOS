# Abyssal Command & Oceanic Gamification

> Status: `PLANNED / POST-V0.3`
>
> Direction approved: 2026-08-19
>
> Implementation started: **no**

## Product vision

Transform MyPersonaOS into a sci-fi deep-ocean personal operating system where
daily discipline and completed work advance an exploration journey. Tasks become
underwater expedition missions; focus sessions become dives; progress earns XP,
Aqua Credits (AC), depth, ranks, companions, and visual upgrades.

The experience may draw high-level inspiration from underwater exploration,
tactical submarine interfaces, cozy focus sessions, and collection games, while
using original visual, audio, naming, and interaction assets.

This epic extends the existing product north star — **What deserves attention
today?** — rather than replacing it. Gamification must reinforce useful action,
not add a second dashboard or make core productivity depend on rewards.

## Scheduling decision

Abyssal Command is an approved **post-V0.3 epic**. It must not displace the
current `V03-TP-01` release gate or any remaining V0.3 exit criterion.

Entry conditions:

1. V0.3 core workflows are complete and validated.
2. Tasks, Projects, Today, Main Focus, Local Mode, Cloud Mode, offline outbox,
   and Realtime have stable behavior.
3. The date-only data decision in `V03-DATA-01` is complete.
4. Runtime validation from `SEC-11` covers any new persisted gamification data
   before that data is trusted or synchronized.
5. A transactional, idempotent reward design has been reviewed for Local and
   Cloud modes.

## Core loop

`Choose mission → focus/dive → complete work → receive reward → explore deeper → unlock customization`

The loop must preserve these rules:

- completing real work is always the source of progress;
- core Tasks/Projects/Today features remain usable without gamification;
- rewards are deterministic, auditable, and safe to retry;
- cosmetic purchases never affect data ownership, privacy, or access;
- audio, animation, and focus-integrity features remain optional.

## Mission classification and provisional rewards

Mission difficulty is a dedicated field and must not be inferred from task
priority. Priority represents urgency/importance; difficulty represents effort
and reward.

| Mission class | Typical use | XP | AC | Depth |
|---|---|---:|---:|---:|
| `shallow` / Coastal | Quick captures, Inbox, short checklists | 100 | 25 | 10 m |
| `midwater` / Twilight | Project work, study, 30–60 minute tasks | 250 | 75 | 25 m |
| `abyssal` / Trench | Major deliveries and project milestones | 500 | 200 | 50 m |
| Main Focus / Deep Sea Core | Deliberately selected primary outcome | 1,000 | 500 | 100 m |

Main Focus is a reward modifier tied to the deliberate Today workflow, not a
fourth task difficulty. The final rules must define whether its reward replaces
or supplements the mission's base reward.

## Levels, depth zones, and ranks

The provisional next-level curve is:

```text
1000 × level^1.35
```

Before implementation, the engine specification must define whether this value
is an incremental requirement or a cumulative threshold, and must fix the
rounding rule. Level, rank, zone, and next-level progress should be derived from
canonical XP/depth rather than independently mutable fields.

| Levels | Diver rank | Exploration zone |
|---:|---|---|
| 1–5 | Surface Snorkeler | Surface / Solar Zone |
| 6–15 | Reef Scout | Epipelagic, 0–200 m |
| 16–25 | Twilight Diver | Mesopelagic, 200–1,000 m |
| 26–39 | Abyssal Explorer | Bathypelagic, 1,000–4,000 m |
| 40–50 | Hadal Leviathan | Abyssal/Hadal, 4,000–6,000+ m |

The display name `Hadal Leviathan Master` remains a copy option, but the domain
must choose one canonical identifier/name before types are added.

## Canonical data direction

The proposed `PlayerProfile` is a useful product view, but not every displayed
field should be persisted. The durable model should favor canonical facts:

- total XP;
- current AC balance;
- maximum depth reached;
- completed mission count and streak facts;
- purchased item IDs;
- equipped submarine, pet, HUD skin, and optional audio profile;
- an idempotent reward/purchase event ledger or equivalent deduplication key.

Derived values include level, rank, next-level XP, zone, catalog unlock
eligibility, and item display state. Catalog entries should remain immutable
definitions; ownership/equipment belongs to player state.

The Cloud design must make mission rewards and AC purchases atomic. Replayed
outbox operations, duplicate Realtime events, reloads, and concurrent devices
must not grant the same reward twice or spend the same AC twice. Reopening and
re-completing a task must follow an explicit anti-farming policy.

Candidate source locations, subject to implementation-time review:

```text
src/types/gamification.ts
src/lib/gamification/engine.ts
src/lib/gamification/items-catalog.ts
src/lib/gamification/sounds.ts
src/components/aquatic/
```

No file or schema listed above exists merely because it appears in this plan.

## Unlockable catalog direction

### Mini-submarines

| Item | Requirement | Cost |
|---|---:|---:|
| Mantis-7 Scout | Starter | 0 AC |
| Nautilus Deep-Probe | Level 10 | 1,500 AC |
| Abyssal Titan Mk-IV | Level 25 | 5,000 AC |
| Leviathan Dreadnought | Level 40 | 10,000 AC |

### Bioluminescent companions

| Item | Behavior | Cost |
|---|---|---:|
| Helix-Lumina | Slow bioluminescent snail at the habitat edge | 500 AC |
| Cephalo-Bio | Neon mini-cephalopod reacting to mission completion | 2,000 AC |
| Manta-Ether | Holographic ray appearing during sustained focus | 4,000 AC |

### HUD skins

- Abyssal Cyan — default deep-blue/cyan frosted HUD.
- Neon Coral Reef — electric pink, orange, and purple.
- Bioluminescent Emerald — bio-electric deep-sea green.
- Hadal Black & Gold — prestige skin for level 30+.

### Optional audio

- sonar ping for Quick Capture;
- bubble burst/neon feedback for mission completion;
- subtle deep-ocean ambient sound for focus sessions.

All audio starts opt-in, exposes an immediate mute control, and must not be
required to understand state changes.

## Focus dive

The Oxygen Focus Timer represents a 25- or 50-minute dive with an O₂/battery
gauge. A completed uninterrupted session may receive a `1.5× AC` focus bonus.

The implementation must define interruption and recovery semantics. Browser tab
visibility alone is not a reliable proof of attention, so it should not become a
punitive or security-sensitive condition. Pausing, accessibility tools, mobile
backgrounding, and recoverable reloads need explicit behavior.

## Planned implementation phases

### Phase 0 — Rules, persistence, and safety

- finalize XP threshold and rounding semantics;
- finalize Main Focus stacking and anti-farming rules;
- design idempotent reward and atomic purchase transactions;
- define Local/Cloud/outbox/Realtime convergence;
- extend `SEC-11` runtime validation and migration/versioning rules;
- establish animation, CPU, battery, and accessibility budgets.

### Phase 1 — Pure engine and catalog

- add gamification types after the model review;
- implement pure XP, rank, depth, reward, and AC calculations;
- implement the immutable base catalog;
- add focused unit tests without introducing an unnecessary test dependency.

### Phase 2 — Diver HUD and mission presentation

- add the abyssal background with reduced-motion behavior;
- add Diver Profile HUD, XP, rank, depth, and AC presentation;
- add mission difficulty/reward presentation to Tasks;
- keep the core task interaction readable without animation.

### Phase 3 — Deep Vault and habitat

- implement safe purchase/equip flows;
- add companion habitat and original visual assets;
- add HUD skin selection and persisted equipment state.

### Phase 4 — Oxygen timer and audio

- implement recoverable 25/50 minute focus dives;
- add optional synthesized sonar/bubble feedback;
- verify accessibility, background-tab behavior, and performance budgets.

## Release acceptance gates

- reward calculations pass deterministic boundary tests;
- the same mission completion cannot reward twice after retries or reconnects;
- AC balance cannot become negative and purchases are idempotent;
- Local and Cloud state converge after offline reload/reconnect;
- two devices converge through Realtime without duplicate rewards;
- corrupt or future-version snapshots/outbox entries fail safely under `SEC-11`;
- reduced motion and audio-off modes preserve complete functionality;
- visual effects meet an explicit browser/mobile performance budget;
- no copyrighted game asset, trademarked UI copy, or copied sound is shipped.

## Explicit non-goals for the first slice

- competitive leaderboards or public profiles;
- paid currency, real-money purchases, or tradable items;
- multiplayer/social comparison;
- gamification that blocks task completion or offline use;
- a broad visual rewrite before the reward engine and sync semantics are proven.
