# 10 — Implementation plan, task breakdown and acceptance gates

## Build strategy

Ship the smallest actual end-to-end system before adding another provider or a visually rich interface. **Nothing is marked complete unless executable tests prove it in the current checkout.** The P0 question is whether an authorised observer can detect a relevant issue from the best *available* live stream and verify a correction changes the active agent's work **before its task ends**. The phases are sequencing, not calendar promises; reliable next-turn messaging alone does not complete the flagship goal.

## Phase 0 — Audit & design decisions

**Deliverables:** inventory NEAT existing API/types/contracts, selected storage, runtime SDK feasibility, a per-version/per-session capability matrix with executable probe evidence, initial threat model and ADR. Every untested cell is `UNVERIFIED`.

Tasks:
- Inspect `CLAUDE.md`, `docs/contracts.md`, `packages/types`, NEAT API routes, graph query tests and CLI command routing.
- Prototype launching one Codex session and receiving real lifecycle/usage events.
- Prototype steering a live turn and recording accurate receipt semantics.
- Probe provider-exposed reasoning traces, summaries, visible output, tool events and usage cadence separately for an OpenAI-based agent, a Claude-based agent, an optional open-weight runner and a generic IDE/CLI adapter. Record version, date, native event IDs, gaps, consent boundary and fallback; do not claim private reasoning access.
- Test native active-turn steer, interrupt-and-continue, managed pre-tool checkpoint feasibility, next-turn queue and observe-only separately. Prove whether a correction changes an active run, not merely whether an API accepts it.
- Prototype NEAT dependency query for two files in a fixture repository.
- Record unknowns explicitly; do not fill gaps with guesses.

**Gate:** one reproducible authorised provider event stream plus one reproducible NEAT impact query, a versioned capability matrix, and a controlled live-steer/interrupt feasibility result. No hidden assumptions. Record an ADR for any checkout/interface contradiction.

### P0 research milestone — Live Thought-to-Steer

In an owned fixture repository, start a long, multi-step coding task. Capture only the reasoning trace/summary, visible output, tool and usage events the runtime actually exposes. While the task is still running, a second authorised agent changes a relevant requirement; use current NEAT graph/worktree evidence where available to detect stale assumptions. Deliver the correction through the strongest verified mode, record native acceptance, then verify the receiving agent changes its subsequent implementation **before overall task completion**. Repeat with a next-turn-queue control and an output/tool-only observation arm. Add provider-exposed summary and trace arms only where real interfaces supply them; mark impossible cells unsupported rather than simulating them.

**Gate:** one genuinely supported runtime reproducibly demonstrates same-task incorporation and an independent changed-action/test check; unavailable reasoning, usage and steering have truthful fallback semantics. An interrupted run has no untracked destructive subprocess activity. Publish latency and token-overhead results, including negative findings. This research proof precedes any flagship-complete claim or Guard rollout.

## Phase 1 — Greenfield transport and registry

Build session identity, heartbeats, capability probe store, SQLite WAL journal, immutable event envelope, idempotent messages, delivery state transitions, SSE replay and basic CLI. Add the Live Reasoning Interface (LRI): source-labelled authorised deltas, ephemeral projection, gap/backpressure handling, opt-in content access and metadata-only default persistence, sharing the existing envelope and IDs.

Test: disconnect/reconnect, restart replay, duplicate message, TTL expiry, ordered-per-session stream, source ID preservation, summary/trace/output separation, dropped-event counters, content revocation, stale session and cross-workspace denial.

**Gate:** durable two-agent messaging, with accurate delivery state, independent of any model.

## Phase 2 — Adapter and control API

Build the first selected adapter with session lifecycle, LRI event normalisation, honest token accounting, native steer/interrupt where proven, target-turn race handling and capability reporting. Add a separate bounded fast control lane, send-time scope checks, exact outcome states and generic observe-only/verified-queue fallback. Introduce manual steering CLI. Codex is the first candidate, subject to Phase 0 probe evidence.

**Gate:** a real supported turn incorporates a correction during the same overall task and independently changes a subsequent action in a deterministic fixture; native receipt is logged separately. If the selected runtime cannot do this, report the limitation and use a verified interrupt-and-continue route or narrow the product claim. Unsupported sessions degrade truthfully.

## Phase 3 — State mirror and NEAT dependency bridge

Materialize agent state, file activity, context version, worktree scope, NEAT resolved-node bridge, dependency path evidence and first contract-change detector. Add replayable conflict findings and a simple terminal view.

**Gate:** two running agents in different worktrees; contract change causes a *supported* impact finding with exact dependency evidence; irrelevant agents remain unaffected.

## Phase 4 — Controlled interventions

Implement intervention policy, Observe/Assist/Guard modes, approval flow, dedupe, version/turn preflight, adapter delivery and distinct `runtime_accepted`, `incorporated_by_agent` and `effect_verified` states. Add an optional, explicitly authorised pre-tool checkpoint only for Signal-managed sessions with a verified safe hook. Default Observe.

**Gate:** intervention is delivered only to matching active turn and current scope; no `incorporated_by_agent` without same-task evidence or `effect_verified` without independent evidence; queue-only delivery never counts as mid-task success; negative tests pass.

## Phase 5 — Claude adapter and dashboard

Implement ACP integration after confirming live steering handshake in the runtime version; alternate interrupt/redirect adapter where explicitly supported. Add dashboard agent timeline, dependency impact, action controls and audit replay.

**Gate:** honest capability matrix for each live adapter; Claude integration tested rather than assumed. UI reports `queue_next_turn`, `runtime_accepted`, `incorporated_by_agent` and `effect_verified` distinctly, with absent evidence shown as unknown.

## Phase 6 — Measurement and go/no-go

Run matched experiment baseline vs Signal on small multi-agent coding tasks. Record correct completion, conflicts, time to detection/incorporation/verified effect, tokens after detection where metering permits, false interventions, unnecessary interruptions, overhead and developer satisfaction. Report all results including negative findings. Enable Guard only after evidence of safety and utility.

## Suggested issues (new work)

| ID | Issue | Depends on |
|---|---|---|
| S-001 | Audit NEAT public contracts + create ADR | — |
| S-002 | Signal Zod identity/event/message schemas | S-001 |
| S-003 | SQLite journal + migrations + replay | S-002 |
| S-004 | Session leases/capability registry | S-002 |
| S-005 | SSE subscriptions and cursor resume | S-003 |
| S-006 | Durable mailbox and delivery state machine | S-003, S-004 |
| S-007 | Codex adapter and conformance tests | S-004, S-005 |
| S-008 | Generic queue-only adapter | S-004, S-006 |
| S-009 | Agent State Mirror | S-003, S-007 |
| S-010 | NEAT impact-query adapter | S-001 |
| S-011 | Scoped contract-change detection | S-009, S-010 |
| S-012 | Intervention policy/approval + send preflight | S-006, S-011 |
| S-013 | Safe manual mid-turn steer | S-007, S-012 |
| S-014 | Outcome verifier and audit replay | S-009, S-012 |
| S-015 | ACP Claude adapter | S-007 adapter contract |
| S-016 | Dashboard and DX | S-005, S-011, S-014 |
| S-017 | Controlled benchmark suite | S-013, S-014 |
| S-018 (P0) | Runtime-version capability probes and evidence matrix | S-001 |
| S-019 (P0) | LRI source-labelled deltas, ephemeral projection and gap/backpressure tests | S-002, S-018 |
| S-020 (P0) | Fast steering lane, active-turn preflight and exact receipts | S-006, S-007, S-018 |
| S-021 (P0) | Content consent, redaction, stream isolation and operator kill switch | S-019, S-020 |
| S-022 (P0) | Controlled Live Thought-to-Steer research fixture, minimal NEAT query prototype and feasibility report | S-001, S-018 |
| S-023 | Integrated `t0`–`t7` telemetry, incorporation/effect verifier and repeatable fixture | S-014, S-019, S-020, S-021, S-022 |

Schedule S-018/S-022 before adapter claims, S-019/S-020/S-021 before automatic intervention, and S-023 before dashboard polish, second-provider expansion or Guard. S-022 may use a controlled prototype without claiming the production LRI/control path exists. Existing IDs are retained for traceability; their dependencies must be updated when issues are actually filed.

### Acceptance for the new work items

- **S-018 — adapter probes:** each of the nine observation/control fields carries status, exact version, test date, native evidence and fallback for at least one controlled session; untested providers remain `UNVERIFIED`.
- **S-019 — LRI:** a real authorised stream preserves native IDs/order and source labels; redacted ephemeral projection, resubscription gap, dropped-count and backpressure tests pass without starving control.
- **S-020 — fast steering:** a target-turn race, stale worktree, expired TTL, duplicate request and incompatible peer instructions fail or arbitrate correctly; native receipt is never reported as effect.
- **S-021 — security:** cross-workspace/content denial, consent revocation, prompt-injection resistance, short retention and operator kill-switch tests pass; already-running tool limits are visible.
- **S-022 — research fixture:** a controlled long task records real available stream classes and a correction before completion, compares queue-only delivery, and reports unsupported cells and negative outcomes honestly.
- **S-023 — integrated proof:** the production pipeline records `t0`–`t7` where observable, verifies same-task incorporation plus an independent changed action, and reports median/p95 detection-to-incorporation/effect without inventing token precision.

## Open technical unknowns to resolve in Phase 0

- Does any selected commercial runtime expose more than a reasoning summary, and at what event cadence? Inspect an exact version and a real stream; otherwise retain `UNVERIFIED` or record `UNSUPPORTED` with probe evidence.
- Does a native control request change an active run's later action before task completion, or only queue a new turn? Test receipt and independent effect separately.
- Can the chosen runtime safely pause before a consequential tool action, and can an independently running session be attached through a supported interface? If not, use owned sessions or a queue/observe fallback.
- Can the actual NEAT query surface identify the correct dependency at a dirty worktree revision? If not, label an approximation and propose a bridge/overlay ADR before automatic intervention.
- Which token and source timestamps are actually exposed and clock-comparable? Report unknown overhead rather than invented precision.

## Definition of done for every issue

- Runtime-facing claims tested against installed version.
- Typechecked, linted and existing NEAT tests unaffected.
- Protocol field/schema version documented; migration if persisted.
- Unit and integration tests for happy path, stale state and unauthorized input.
- All decisions have meaningful errors, no silent fallback.
- Security impact reviewed; audit event exists for any control action.
- Runtime observation and steering claims have per-session version/date/evidence; queue fallback is not labelled active-turn steer.
- For control work, receipt, incorporation and independently verified effect have separate assertions and `t0`–`t7` timestamps where observable.
- New docs distinguish shipped from proposed.

## Demo scenario: contract divergence

Fixture repository includes `server/auth.ts` exporting a typed response and `client/auth.ts` consuming it. In worktree A, Agent A changes `token_id` to `session_id`; Agent B is working on the dependent client against old contract. Without NEAT Signal: B can continue based on old API until it notices later. With Signal in Assist mode: NEAT graph evidence surfaces change; user approves; adapter injects scoped steer; B adapts and successful tests verify result. If the provider cannot accept live steer, message status explicitly says queued rather than faking success.

**Important:** Use independent worktree fixtures and repeat trials; do not assert the baseline will always fail or that Signal will always win.

The demo must additionally run while B is still active, compare a verified same-task strategy with queue-next-turn, and report whether the correction was incorporated before completion. If NEAT's analysed revision does not match a dirty worktree, label the graph approximation and require refresh or human review rather than claiming a verified dependency.
