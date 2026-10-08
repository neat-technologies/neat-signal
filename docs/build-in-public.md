# Building NEAT Signal in public

**Status: specification only.** NEAT Signal has no implementation yet (see [`README.md`](../README.md)). This document describes how we publish the work as it happens and the rules that bind every post. It does not claim any Signal capability works.

The thesis the public story sits under (2026-10-08): *agents are weak at investigation and reasoning and strong at writing code given the right context; NEAT supplies the context so the agent does what it's good at.* Signal extends that across several agents, mid-task. Core (#1342) and the landing hero (landing #34) carry the same line.

Tracked in Notion: https://app.notion.com/p/3f3a76ba9b6581e5a0facc494ec32b7e

## 1. What we publish, and when

We publish the reasoning and the evidence, not a highlight reel. Build-in-public here means the spec, the probes, and the benchmark runs — including the ones that fail — are visible as they land.

| What | When | Where | Honesty note |
|---|---|---|---|
| The spec itself (`plan/`) | On repo-public flip (gate, §4) | Public repo | Labelled "specification only"; proposed surfaces marked proposed |
| S-018 runtime capability matrix ([#1](https://github.com/neat-technologies/neat-signal/issues/1)) | As each runtime is probed | Repo file + devlog | `unsupported`/`unverified` cells stay visible; an untested cell is `unverified`, never `unsupported` |
| S-022 Live Thought-to-Steer runs ([#2](https://github.com/neat-technologies/neat-signal/issues/2)), **including failures** | Per run, as they complete | Repo logs + devlog + video | A receipt or an agent "OK" is not incorporation; queue-only is not mid-task success |
| Benchmark arms + results (main design + A/B/C/D intent benchmark) | When a round completes | Devlog + repo | Report medians/p95, trial counts, missing data, negative results; no cherry-picked demo |
| Two-agent contract-change demo (`token_id`→`session_id`) | When it reproduces on a verified runtime | Video + devlog | Show the control run; don't assert baseline always fails or Signal always wins |
| A demo per shipped feature (purpose-built frontend + short video) | As each feature ships | Demo UI + video + devlog | Real, reproducible behaviour only; a mockup is labelled a mockup, never shown as working |

Default: if a number hasn't been measured under a matched control, it doesn't get posted. If a capability isn't verified for a named runtime+version, we say "designed to," not "does."

## 2. Cadence and channels

Signal content rides the existing NEAT build-in-public cadence (bi-weekly; Deniz + Sinan post; the fleet feeds material — see the GTM TODO board). Signal is a content stream into that rhythm, not a separate schedule.

- **Public issue tracker** — the S-xxx issues are the backlog, in the open. Progress is legible from the issues and their linked evidence.
- **Devlog posts** (neat.is blog + Dev.to) — one per meaningful milestone: a probed runtime, a Live Thought-to-Steer run (pass or fail), a benchmark round. The artifact, not the aspiration.
- **X / LinkedIn threads** — the milestone in short form, linking the devlog. Founders' voice.
- **A demo per feature** — every feature we ship gets a polished, purpose-built demo frontend (Jed) plus a short video, so each build-in-public drop is something you can *see*, not just read. The flagship is the two-agent contract-change scenario, with the control run shown. Demos show real, reproducible behaviour — a mockup is labelled a mockup; no staged success.

Each post needs one concrete, true thing from the repo behind it. No cadence-filler.

## 3. Honesty rules that bind every post

Verbatim from [`plan/11-VALIDATION-AND-GTM.md`](../plan/11-VALIDATION-AND-GTM.md) — "Source/claim rules for external messaging." These are not guidelines; a post that breaks one doesn't ship.

- Say **"designed to"** until implemented and demonstrated.
- Say **"supported for [specific runtime/version/configuration]"** only after passing conformance tests.
- **Never** say "reads the agent's private thoughts"; describe available outputs and state inference.
- **Never** claim guaranteed speedup or savings before evidence.
- Publish NEAT adoption/retention effects, extra metered cost and task-quality effects only as **measured hypotheses**; no validated cost-savings claim follows from faster message delivery alone.
- Keep named competitors and speculative equivalence claims out.

Two product-specific lines that follow from the spec and hold in public too:

- Signal observes only what a runtime actually exposes and the user authorises; it cannot read hidden chain-of-thought and cannot guarantee mid-token intervention ([`README.md`](../README.md), [`plan/01-PRODUCT.md`](../plan/01-PRODUCT.md)).
- A PAIE forecast is not an observed edit; `runtime_accepted` ≠ `incorporated_by_agent` ≠ `effect_verified`. Public claims use the verified state, not the hopeful one.

## 4. Going public — gate and checklist

The repo is private today. Making it public is **Deniz's call** (gate). Before the flip:

- [ ] **License** — add `Apache-2.0`, matching NEAT Core (repo currently has none).
- [ ] **Strip anything private** — confirm no internal-only notes, partner names, credentials, or unreleased core detail in `plan/` or history.
- [ ] **`CONTRIBUTING.md`** — how outside contributors engage; spec-only status stated.
- [ ] **Issue templates** — bug / capability-probe / benchmark-run, so external runs come in comparable.
- [ ] **README framing** — "specification only" stays loud on the public landing of the repo.

The public flip is not a launch. It's the spec becoming legible. The launch moments (Show HN, etc.) wait for a reproducible Live Thought-to-Steer result on a verified runtime (go/no-go in `plan/11`).

## 5. How this feeds the funnel

Per NEAT's model: **software is free (FOSS + self-host); revenue is hosted/managed.** Signal is an optional NEAT extension (`@neat.is/signal`), and the free local-first mode is the funnel, not a paywall. The hypotheses we test in public (all unproven, per `plan/11`):

- A **new acquisition reason** — people searching for multi-agent coordination discover NEAT through Signal.
- **Recurring graph usage** — each relevant change triggers legitimate dependency/policy queries.
- **Retention** — a coordinated group of agents is harder to abandon than the context layer under it.
- **Expansion path** — shared state, policy, audit, hosted coordination (Team/hosted tier).

**The design-partner ask is the point of building in public.** Go/no-go in `plan/11` needs **at least five design partners who actually run concurrent agents** on interdependent work. Build-in-public is how we find and convert them: the public S-022 runs and the two-agent demo are the artifact that earns the intro; the ask in every thread is "running 2+ agents on one codebase? we want you in the alpha." Willingness-to-pay stays separately unproven; no price before customer interviews.

## What's needed, from whom

- **Deniz** — repo-public decision (gate); license choice (Apache-2.0); design-partner intros (≥5 concurrent-agent users).
- **Sinan** — spec ownership; publish S-018 / S-022 results (incl. failures) as they land.
- **Landing** — Signal hero (landing #34); a Signal page on neat.is.
- **Jed** — a polished, purpose-built demo frontend for each feature as it ships, so every build-in-public drop ships with a demo.
- **GTM** — devlog posts, X/LinkedIn threads, the demo video per drop; run the cadence.
