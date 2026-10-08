# NEAT Signal

**Status:** Proposed product / implementation specification. **No implementation is implied by this document.**  
**Parent product:** NEAT (`neat.is`)  
**Proposed package:** `@neat.is/signal`  
**Proposed CLI surface:** `neat signal` (subject to existing CLI review)  
**Proposed development branch:** `feat/neat-signal`  
**Spec date:** 2026-10-08

> **One sentence:** NEAT Signal is a codebase-aware control plane designed to observe authorised live agent execution signals and verify that a relevant correction changes an agent's course before its ongoing task ends.

## The product

Three coding agents can work on the same codebase simultaneously, but their context can diverge. A message from Agent A may reach Agent B after it has already implemented an incompatible change. Agent C may know an important constraint but have no way to intervene until B finishes. NEAT Signal aims to close that loop using live event capture, durable coordination state, NEAT's code/runtime graph, and provider-specific steering controls. The primary measure is time from conflict detection to **actual incorporation**, followed by independently verified changed action. A stored or accepted message alone does not meet the primary use case.

This is **not** a chat app and **not** a system for extracting hidden model reasoning. Signal should investigate provider-exposed reasoning traces and summaries as early intent signals, while keeping them separate from visible output, tool events, token counts and inferred intent. It can capture only what a runtime actually transmits and the user authorises; a summary is not a raw trace, and token counts reveal no token content.

## Ground truth: existing vs proposed

The publicly documented NEAT repository describes a graph built from static source extraction and OpenTelemetry telemetry, with provenance-tagged relationships and MCP/HTTP query surfaces. **The implementation team must inspect the actual checked-out code and tests before treating any documented surface as working.** Everything in this pack concerning messaging, presence, agent execution observation, state mirroring, steering, coordination, and Signal UI is **NEW WORK** unless discovered and verified in the checkout.

## What is being built from scratch

| Component | Responsibility | New work? |
|---|---|---|
| Agent session registry | Identify and track agent sessions, turns, worktrees, owners, and capabilities | Yes |
| Live Reasoning Interface (LRI) + event normalizer | Capture authorised live deltas, tool activity, usage and gaps without conflating their sources | Yes |
| Durable event journal | Replayable, ordered-per-session state with at-least-once delivery | Yes |
| Communication router + fast steering path | Durable messages plus a separately bounded control lane for active-turn actions | Yes |
| Live stream | Publish relevant changes to agents and dashboard subscribers | Yes |
| Provider adapters | Launch/attach where supported; probe actual capabilities; steer/interrupt | Yes |
| Agent State Mirror | Evidence-backed view of each running agent's current work | Yes |
| Predictive Agent Intent Engine (PAIE) | Forecast next observable actions, ground impact and score outcomes without granting control authority | Yes |
| Task Ownership Leases | Advisory file, symbol, contract and subgraph ownership with reactive owner wakeup | Yes |
| NEAT impact bridge | Resolve files/contracts/dependencies against the NEAT graph | Yes (integrates existing NEAT) |
| Intervention engine | Evaluate conflicts, policy, authority, and safe delivery timing | Yes |
| Control dashboard | Show activity, conflicts, delivery states, decisions and overrides | Yes |
| Security and audit layer | Isolation, redaction, approvals, access scopes, replay protection | Yes |

## Read in order

1. [01-PRODUCT.md](01-PRODUCT.md) — user needs, use cases, scope and product strategy.
2. [02-EXISTING-NEAT-BOUNDARY.md](02-EXISTING-NEAT-BOUNDARY.md) — source-of-truth contracts and integration constraints.
3. [03-ARCHITECTURE.md](03-ARCHITECTURE.md) — services, storage, delivery and failure model.
4. [04-PROTOCOL.md](04-PROTOCOL.md) — event, message, intervention and acknowledgement schemas.
5. [05-AGENT-ADAPTERS.md](05-AGENT-ADAPTERS.md) — concrete runtime adapter behaviour and feasibility gates.
6. [06-AGENT-STATE-AND-NEAT.md](06-AGENT-STATE-AND-NEAT.md) — the execution graph and code graph linkage.
7. [07-INTERVENTION-ENGINE.md](07-INTERVENTION-ENGINE.md) — intervention lifecycle and safety policy.
8. [08-API-CLI-UI.md](08-API-CLI-UI.md) — developer experience and proposed interfaces.
9. [09-SECURITY.md](09-SECURITY.md) — threat model and non-negotiable security defaults.
10. [10-IMPLEMENTATION-PLAN.md](10-IMPLEMENTATION-PLAN.md) — staged tasks and acceptance tests.
11. [11-VALIDATION-AND-GTM.md](11-VALIDATION-AND-GTM.md) — evaluation, pricing hypotheses and impact on NEAT.
12. [AGENTS.md](AGENTS.md) — authoritative rules for AI coding agents working on this project.

## First end-to-end demonstration

Agent A changes a backend interface. Agent B is concurrently building frontend code against the prior contract. Signal identifies the affected dependency through NEAT, verifies that B is operating on outdated contract context, sends a scoped correction into B's active turn if supported, records the native receipt separately, and confirms B's next observable implementation matches the new contract **before the task ends**. A control run without Signal shows whether correction latency and rework actually improve.

The P0 **Live Thought-to-Steer** experiment repeats this in a controlled, long-running task. It compares available output/tool streams, provider-exposed summaries or traces where supported, active-turn steering, interrupt-and-continue, and next-turn queueing. It must show incorporation before task completion for at least one verified runtime; unsupported cells stay visibly unsupported.

The separate **Agent Intent Prediction Benchmark** compares deterministic owner checks, authorised live-stream forecasts, and NEAT source/runtime grounding on matched tasks. Its pending-tool and near-future horizons stay distinct; a forecast never proves an edit occurred. See [validation](11-VALIDATION-AND-GTM.md#agent-intent-prediction-benchmark).

## Non-goals for V0

- Reading inaccessible private chain-of-thought or decrypting provider reasoning state.
- Arbitrarily changing a model's computation mid-token.
- Treating a next-turn queue, a runtime receipt, or an agent saying “OK” as proof of mid-task correction.
- Claiming every coding agent supports hot steering.
- Replacing existing NEAT static analysis, OTel ingest, or graph database without a measured need.
- Fully autonomous execution of high-risk operations.
- Distributed enterprise clustering before a local end-to-end flow works.

## Source discipline

Only official NEAT repository and official runtime API documentation are inputs to the proposed integration contracts; **documentation is not proof of an implemented feature**. Links and verification steps are in [02-EXISTING-NEAT-BOUNDARY.md](02-EXISTING-NEAT-BOUNDARY.md) and [05-AGENT-ADAPTERS.md](05-AGENT-ADAPTERS.md). No third-party orchestration source code is required or assumed.
