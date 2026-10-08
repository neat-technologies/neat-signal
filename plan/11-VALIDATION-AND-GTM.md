# 11 — Product validation, market thesis and effect on NEAT

## Position in the NEAT product line

- **NEAT Core:** verified source/runtime graph and architectural intelligence.
- **NEAT Signal:** live coordination and safe intervention for simultaneously executing AI coding agents, powered by that graph.

The product should be installable as an optional NEAT extension. Its value is strongest in teams running more than one agent on interdependent work, not in every single-agent coding session.

## Buyer and distribution hypothesis

**Initial adopter:** technically sophisticated solo developer or small startup with 2–5 concurrently working coding agents who already suffer merge/contract mismatches, duplicated work, or late messages.

**Later buyer:** engineering teams with an established NEAT footprint who need policy, reproducibility, audit and coordination across code and runtime changes.

**Entry channel:** documentation, reproducible GitHub demo, developer community, open local-first mode, and NEAT's existing developer onboarding. No claim about market size is made without buyer interviews.

## Why this could help NEAT

1. **A new acquisition reason:** developers searching for multi-agent coordination could discover NEAT through Signal.
2. **More recurring graph usage:** each relevant change can trigger legitimate dependency/policy queries; graph evidence becomes visible in the developer's live workflow.
3. **Improved retention hypothesis:** a coordinated group of agents may make it harder to abandon the underlying context layer.
4. **Expansion path:** teams may pay for shared state, policy enforcement, central audit and hosted coordination.
5. **Differentiated story:** NEAT evolves from "agents can query grounded context" to "grounded context influences agent execution at decision time."

These are plausible mechanisms, **not demonstrated commercial effects**. Signal could also distract engineering resources, complicate NEAT's core product, or create liability if automatic steering is unsafe.

## Packaging hypotheses to test (not commitments)

- Free/local: observe-only, limited concurrent sessions, replay and manual sending.
- Pro: richer adapters, automation rules, historical comparisons, higher session limits.
- Team/hosted: shared workspaces, policy governance, audit, access controls, longer retention.
- Keep NEAT Core separately valuable: do not require Signal for basic graph functions.

Pricing is unvalidated; do not insert arbitrary subscription prices into the pitch without customer interviews and cost model.

## Most important competitive distinction

A messaging layer may deliver a correction. Signal must demonstrate it can *detect the problem from available live evidence, determine who needs the correction, explain why from NEAT source/runtime truth, act at a supported boundary before the task ends, and independently verify whether it took effect*. Provider-exposed reasoning may improve detection time, but private hidden thinking is neither required nor accessible.

## Benchmark design

**Experimental unit:** a coding task requiring coordination among two or three agents, each assigned separate worktrees. Use matched prompts, same model/runtime versions, same task definition and equivalent total token budgets. Counterbalance ordering and repeat random seeds where supported.

**Arms:**

- Control: ordinary agents with user-managed communication.
- Messaging-only: Signal message transport with automatic relevance/steering disabled.
- NEAT-informed Observe: conflict detection shown, no automatic intervention.
- NEAT-informed Assist/Guard: approved or low-risk automatic intervention.
- Live-stream ablation: output/tool events only versus provider-exposed summary deltas and eligible provider-exposed trace deltas, where real runtimes supply them. Impossible cells are reported as unsupported.
- Delivery control: active-turn steer or interrupt-and-continue where verified versus next-turn queue, with equal task and authority conditions.

**Primary metrics:** proportion of tasks passing independent integration tests; successful correction before the overall task ends; detection-to-incorporation (`t6 - t2`); detection-to-independently-verified effect (`t7 - t2`); coordination failures and API mismatches.

**Secondary metrics:** source-to-observer lag (`t1 - t0` only with comparable clocks), recognition (`t2 - t1`) and dispatch (`t4 - t2`) latency, wasted/reworked lines or patches, time-to-valid completion, total tokens and associated cost (using actual metering), extra tokens/cost after detection but before incorporation when scoped usage exists, false-positive alerts, unnecessary interrupts, unsafe interventions, developer trust, product overhead, NEAT graph-query usage and new-user activation. Report medians/p95, missing samples, min/max where meaningful, and same-task versus after-task delivery separately; treat NEAT adoption as a separately measured product hypothesis.

**Critical measurement discipline:** blind code review where possible, no cherry-picked demos, log all trials. Token usage not exposed by a provider is missing data, not zero cost. Do not measure "time saved" without a matched control.

### Live Thought-to-Steer proof

Run an owned, long multi-step agent task while a second authorised actor changes a relevant requirement. Capture only the live reasoning/output/tool/usage events the selected runtime actually exposes; ground the conflict in NEAT graph evidence and current worktree revisions where available. Submit a correction during that same task, record the native receipt, then inspect later code, tools and tests for incorporation and changed effect **before completion**. Repeat with a next-turn queue control and preserve negative runs. A trace-only result from an open-weight runner cannot establish parity with a commercial provider.

Use fixtures for four conflict types: a proposed API-field removal with a verified consumer, a pending edit to a recently changed dependency, a superseded requirement mid-task, and a dirty worktree whose NEAT graph revision is stale. For each trial, log the directly observed delta/tool/diff, the inferred intent separately, the exact NEAT revision and dependency evidence (or `unsupported_scope`), the authorised control strategy, and the later independent diff/test/tool result. A short reasoning statement without later action is a possible false positive, not a success.

No benchmark may count `runtime_accepted`, an agent's “OK”, or a queue-only delivery as verified incorporation. Do not infer token-by-token waste from end-of-turn aggregates or promise a millisecond SLA before measurement.

## Go/no-go criteria (initial decision rule, adjustable by evidence)

Proceed beyond private alpha only when:

1. The full workflow works reproducibly in at least one provider runtime.
2. Wrong-target or stale-turn interventions are absent in the prelaunch test suite.
3. There is a measurable improvement in at least one primary metric without unacceptable regressions in safety or task correctness.
4. At least five design partners who actually use concurrent agents provide qualitative feedback; willingness-to-pay remains separately unproven.
5. Maintaining Signal does not consume so much capacity that NEAT's core commitments suffer.
6. The Live Thought-to-Steer fixture is reproducible for at least one genuinely supported runtime, with independently verified same-task changed action; otherwise narrow the flagship claim to the verified fallback.

Pause or narrow scope if graph queries are regularly inaccurate for worktrees, adapters frequently lose session control, or automated intervention creates more errors than it prevents.

## Source/claim rules for external messaging

- Say "designed to" until implemented and demonstrated.
- Say "supported for [specific runtime/version/configuration]" only after passing conformance tests.
- Never say "reads the agent's private thoughts"; describe available outputs and state inference.
- Never claim guaranteed speedup or savings before evidence.
- Publish NEAT adoption/retention effects, extra metered cost and task-quality effects only as measured hypotheses; no validated cost-savings claim follows from faster message delivery alone.
- Keep named competitors and speculative equivalence claims out of implementation instructions.

## Proposed short pitch

> NEAT Signal is the live coordination layer for teams of AI coding agents. It uses NEAT's code and runtime graph to identify when an agent's work is becoming incompatible with another's and helps deliver scoped corrections while that work is still in progress—with evidence, permission checks and honest delivery status.
