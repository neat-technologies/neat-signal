# 01 — Product definition

## Positioning

**NEAT Signal: verified mid-task correction backed by code truth.**

NEAT answers, "What is this software and how does it behave?" Signal adds, "What is each coding agent doing to it, what knowledge is becoming outdated, and when is an intervention justified?"

## The problem

A modern developer may use several long-running agents simultaneously. The agents often have separate context windows, checkouts, tasks, and tools. Ordinary asynchronous chat does not ensure that a correction reaches the relevant agent *while it can still change course*. Messages can arrive after their assumptions expire; peers may observe changed code but not connect that change to the running plan of another agent.

The defining problem is an active Agent B continuing a long task under an outdated assumption while Agents A or C can already see evidence of the mistake. Signal should consume the **authorised live stream actually exposed by B's runtime**, use NEAT and current worktree context to test relevance, deliver an authorised correction at the earliest supported boundary, and verify B changes course before the task ends. Detection-to-incorporation time, not message send time, is the central latency measure.

## Primary users

- **Solo power user:** 2–5 concurrent coding agents in a single repository.
- **Small engineering team:** multi-agent work across one or more services, with shared architectural rules.
- **NEAT user:** already values grounded codebase context; wants coordinated, not isolated, agent work.

## Jobs to be done

1. Know which agent is doing what now, without reading several terminal panes.
2. Send a correction to a working agent and know whether it was accepted, queued, rejected, or applied.
3. Avoid messages based on old files, decisions, or requirements.
4. Catch conflicts before incompatible code is generated or merged.
5. Understand why an automated intervention occurred using traceable NEAT evidence.
6. Prevent an agent from escalating privileges or hijacking a peer's task.

## Essential user stories

**US-1 — Presence:** Given three agents, I can see who is active, current task/turn, workspace, active files, last observed event, and steering capability.

**US-2 — Prompt routing:** When I send a message from Agent A to B, I receive a durable message ID and a *truthful* status: stored, routed, accepted by runtime, observed incorporated, or failed.

**US-3 — Mid-task correction:** When the target runtime supports it, Signal delivers a correction during an active turn; otherwise it queues or interrupts according to explicit policy.

**US-4 — Automatic relevance:** A changed exported API influences agents working on dependent code; unrelated agents do not receive noise.

**US-5 — Staleness:** A correction tied to revision X is not sent as if current after its target is on revision Y without revalidation.

**US-6 — Override:** A human can disable automatic steering, review an intervention, revoke agent permissions, and inspect an audit record.

**US-7 — Provider honesty:** The UI explains which capabilities are supported, verified experimentally, unavailable, or degraded for each active session.

**US-8 — Live correction:** During a long-running task, an authorised observer detects a stale assumption from available output, tool activity or provider-exposed reasoning, then sees whether B incorporates a scoped correction before completion. Native active-turn steer is preferred where verified; interrupt-and-continue, an approved pre-tool checkpoint, next-turn queue and observe-only are reported as distinct outcomes.

**US-9 — Predictive warning:** Before B issues an edit request, a fresh, source-labelled forecast indicates B may change an API contract that A owns. I can see the predicted action, evidence, uncertainty, affected dependency and time remaining; a weak forecast only informs me.

**US-10 — Reactive owner wakeup:** A can register a short-lived advisory lease on files or a contract. When B's observed pending edit or well-grounded forecast may conflict, Signal wakes A with a concise evidence digest if the risk warrants it. An idle A consumes no standing model budget; if A cannot resume, Signal reports a bounded fallback.

Candidate situations include an emitted plan to remove an API field still used by another service, a pending tool edit to a dependency another agent just changed, a requirement superseded during a long task, and a dirty worktree newer than NEAT's analysed revision. In each case, observed text or tool intent is only a signal; the current diff and graph scope must support the conflict, and a later action/test must verify the correction. [The state and NEAT chapter](06-AGENT-STATE-AND-NEAT.md#reasoning-aware-examples-to-test) separates observation, inference, control and verification for each case.

## Proposed product modes

- **Observe (default):** events and impact warnings; no automatic steering.
- **Assist:** suggests corrections; human approval to send.
- **Guard:** automatically sends low-risk, narrowly scoped corrections under configured budgets; disruptive actions require approval.

Mode should be configurable per workspace/session; starting mode is always Observe until user enables more.

## Why existing NEAT matters

NEAT has static `EXTRACTED`, runtime `OBSERVED`, computed `INFERRED`, and aging `STALE` graph relationships documented in its main repository. Signal can tie an agent's work to a file node and explain cross-agent effects through dependency evidence rather than keyword matching alone. Where observed telemetry does not cover an active branch, the UI must not claim it does.

## Differentiation hypotheses to prove

- Graph-grounded steering yields fewer incompatible changes than message broadcast alone.
- Delivery at safe control boundaries is faster than only notifying agents after task completion.
- Causally scoped messages prevent some incorrect or late interventions.
- A native NEAT add-on increases graph queries and helps retain developers using multiple agents.

All are hypotheses until controlled measurements support them.

Predictive value is the **lead time before the targeted observable action**, the share of risky actions caught before execution, and fewer verified incompatibilities per completed task at acceptable wakeup, interruption, latency and token costs. Compare PAIE against rules-only coordination on matched tasks; do not infer value from forecast volume.

## Success criteria for a private alpha

- A demonstrable two-agent contract-change intervention, with video/log replay.
- Provenance shown for every automatic warning.
- No silently dropped high-priority instruction under injected crashes.
- No false claims of private reasoning access or guaranteed steering.
- No automatic risky actions without explicit authority.
- Experimental improvement versus uncoordinated baseline; report the magnitude and confidence without inventing it.
- A reproducible **Live Thought-to-Steer** run shows incorporation before the overall task ends on at least one genuinely supported runtime, with a separate changed-action check and a next-turn-queue control.
- A tested per-runtime capability matrix distinguishes exposed reasoning traces, summaries, visible output, tool and usage events, live steer, interrupt, resume and attachment. Unverified cells stay unverified.

## Explicitly out of scope

General employee chat; non-coding workflow orchestration; obtaining provider-hidden model thoughts; perfect intent inference; self-modifying security rules; unattended privileged shell commands.

PAIE does not predict exact future tokens, treat a provider summary as hidden thought, or grant automatic control from model confidence. A predicted conflict is not an observed edit. The immediate pending-tool horizon records an actual request at a supported boundary; the near-future task horizon remains an uncertain forecast. Ownership leases are advisory and never override the user's instruction.

Reasoning traces expressly returned by an authorised provider or open-weight runtime are research inputs, not private hidden chain-of-thought. A trace, a summary, visible output, token counts and inferred intent are different signals. None alone proves the agent's next action, and Signal cannot inject guidance into an inaccessible mid-token computation.
