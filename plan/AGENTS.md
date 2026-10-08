# Instructions for coding agents building NEAT Signal

**This file is authoritative for this proposed product.** Read the other Markdown files before creating implementation code, beginning with `README.md`.

## Mission

Build **NEAT Signal** as a first-party, optional NEAT component. From scratch, implement the Live Reasoning Interface (LRI), session registry, event collection/streaming, durable communication, fast steering path, state projection and intervention features specified here. The flagship outcome is an authorised observer detecting a relevant issue from the best available live stream and **verifying correction during the same ongoing task**. NEAT already provides a documented code/runtime graph and query surfaces; integrate the real inspected API rather than recreating or assuming it.

## Never hallucinate implementation or vendor behaviour

- These Markdown documents are **specifications**, not proof any Signal code exists.
- Inspect the checkout's source, tests, repository instructions and actual runtime versions before coding.
- Do not copy an existing agent-mesh project, infer features from another project's website, or rely on unsupported capabilities.
- Use **official NEAT repository source**, actual installed runtime implementations and official provider docs as verification inputs.
- When a documented feature is not testable or absent, write `UNKNOWN` or `UNSUPPORTED`, open an issue, and use an explicit fallback; do not invent behavior.
- Never assert access to model-hidden private chain-of-thought. Do not pretend a reasoning summary is raw reasoning.
- Never equate `runtime_accepted`, an agent's “OK”, `incorporated_by_agent`, and independently `effect_verified`.
- Never silently substitute `queue_next_turn` for verified active-turn steering or count an after-task correction as the flagship use case.
- Treat provider-exposed trace, provider summary, visible output, tool activity, usage counts and inferred intent as different signals. Counts contain no thought text; hidden private reasoning is inaccessible when the provider does not transmit it.
- Never describe a forecast as the agent's hidden thought or an observed edit. A verified pending pre-tool request and a near-future probabilistic forecast are different horizons.
- Application OTel traces describe instrumented application behaviour, not coding-agent thoughts, token text or file edits. Instrument agent runtimes and file/tool boundaries separately.

## Product invariants

1. Signal is a **new** NEAT module; maintain compatibility with existing NEAT core, MCP, REST and dashboard.
2. No Signal required for ordinary NEAT graph usage.
3. Per-session capabilities are probed, with accurate degradation.
4. Messages use IDs, idempotency keys, expiration, target turn and repository/worktree context preconditions.
5. Cross-agent intervention requires authorization; Observe is default.
6. The communication journal is durable and replayable; at-least-once events are deduplicated.
7. Graph facts and agent intent inferences are separate evidence types.
8. Human preferences override automated peer messages; untrusted content cannot become system-level instructions.
9. All secrets/prompt data are minimized and redacted by default.
10. The UI never lies about supported steering or an intervention outcome.
11. Live observation and intervention capabilities are probed per active session and runtime version with `verified | unsupported | unverified`, date and evidence. Unknown is not support.
12. LRI text capture is explicit opt-in, permission-scoped, redacted and ephemeral by default; bulk deltas cannot starve the bounded fast control lane.
13. The control path checks human priority, authority, TTL, idempotency, target turn, worktree/context revision and capability again at dispatch. Observe is default; managed pre-tool checkpoints require user permission and a verified hook.
14. A native receipt is not proof of changed behaviour; independent later action/test evidence is required for `effect_verified`.
15. PAIE is a separate proposed module that emits candidates through the existing `EventEnvelope` journal. Only the Intervention Engine authorises control; model predictions alone cannot enable Guard, block a tool or wake an owner without current policy and lease checks.
16. Keep intent confidence, NEAT edge provenance/coverage and impact severity separate. `INFERRED`, `STALE`, `FRONTIER` or a stale worktree graph cannot alone justify high-risk control. Mark untested capability `UNVERIFIED`.
17. Ownership leases are advisory, short-lived and scoped to a task/repository/worktree; human instructions always win. Do not claim a wakeup or correction worked until later observable evidence verifies it.

## Required first actions

1. Read root `CLAUDE.md`, `CONTRIBUTING.md`, `docs/contracts.md`, `docs/architecture.md` and `docs/api-reference.md` in the **actual** NEAT checkout, if present.
2. Confirm package layout, build commands, tests and existing CLI parsing; record findings in an ADR.
3. Inspect NEAT graph query APIs and node/provenance semantics; write a minimal typed NEAT bridge test.
4. Inspect selected OpenAI, Claude and optional open-weight/generic runtime versions; record a capability matrix and probe authorised reasoning-summary/trace, visible output, tool/usage events, attachment, live steer, interrupt and resume. Mark every untested cell `UNVERIFIED` and state its fallback.
5. Run the P0 **Live Thought-to-Steer** fixture: detect stale assumptions while a long task is active, attempt the strongest verified authorised strategy, and separately verify incorporation and changed action before task completion. Compare a next-turn-queue control; preserve failed results.
6. Probe pre-tool request/pause, owner wakeup/session resume, dirty-worktree graph overlay and source-attributed application OTel coverage before PAIE control claims. Run the Agent Intent Prediction Benchmark against a deterministic rules-only arm; preserve false alarms and negative results.
7. Implement the smallest honest end-to-end workflow, starting in Observe mode, only after the audit/probe decisions.

## Engineering practices

- New shared types: Zod schema + inferred TypeScript types + compatibility tests.
- Add forecast, lease, expiry/supersession and outcome schemas to the existing envelope with migration/replay tests; do not create a competing bus.
- Append-only audit and explicit migration strategy for persisted schema changes.
- No source-file or secret-content logging by default.
- Focus first on deterministic conflict detection, not language-model hallucinated plans.
- Test a real pre-edit owner wakeup, an early forecast, a scoped NEAT join, a timely correction and incremental value over rules-only coordination before predictive-performance claims.
- Disallow automatic high-risk or destructive actions.
- Provider-adapter errors must be typed and surfaced to callers.
- Use fixture worktrees for stale-branch and contract-change integration tests.
- Add replay/restart and concurrency tests before optimising for distributed deployment.
- Keep LRI observations inside the existing versioned `EventEnvelope` and journal identity; preserve native event IDs and stream gaps without creating a second bus.
- Measure `t0`–`t7` where observable, especially detection-to-incorporation and detection-to-verified-effect. Do not invent token-by-token usage or a guaranteed latency SLA.
- Do not assert safe attachment to an independently running IDE/CLI agent without a supported API and executable probe. Prefer owned sessions or an explicit user-installed integration.
- If an upstream interface seems different from this spec, document the deviation with test evidence rather than quietly adapting the marketing promise.

## Build order

`Phase 0 NEAT audit + runtime/pre-tool capability probes + Live Thought-to-Steer research -> shared schemas -> session registry -> journal and LRI -> durable messaging + fast control lane -> first verified adapter -> NEAT bridge and worktree overlay -> state mirror and ownership leases -> deterministic conflict detector and owner wakeup -> PAIE near-future forecasting -> approved same-task steering -> independent outcome verification -> matched prediction benchmark -> dashboard/second provider -> evidence-gated Guard.`

## Completion reporting

At the end of each implementation session, report:

- **Implemented:** paths changed and tests passed.
- **Verified upstream:** exact API/runtime version and evidence.
- **Still proposed:** every feature in docs not yet implemented.
- **Blocked/unsupported:** runtime limitations with honest fallback.
- **Security:** what new privileges/data flows were introduced and how they are gated.
- **Flagship evidence:** whether a correction was incorporated and independently verified before the ongoing task ended; if only queued or unverified, say so explicitly.

Do not describe the whole product as implemented until the acceptance gates in `10-IMPLEMENTATION-PLAN.md` have actually passed.
