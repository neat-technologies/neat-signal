# 07 — Intervention engine and causal correctness

## Purpose

An intervention is **not** a message the system happened to send; it is an evidence-backed decision to influence a running agent, with an explicit authority model, expected target state, delivery method, and post-delivery verification.

## Decision pipeline

```text
new authorised LRI event/tool/requirement change
  -> normalize and persist permitted metadata; update ephemeral projection
  -> project agent state
  -> find relevant NEAT graph impacts
  -> generate candidate warning
  -> receive PAIE forecast or current lease conflict with expiry and evidence refs
  -> verify current worktree + context version
  -> assess severity, confidence, impact and duplication
  -> authorize under workspace policy
  -> choose verified control strategy for this active session
  -> recheck target turn/revision just before send
  -> dispatch through bounded fast control lane and record native receipt
  -> seek incorporation evidence and independently verify changed effect
  -> close, expire, retry safely, or escalate
```

## Risk classes

| Class | Example | Default mode |
|---|---|---|
| Informational | another agent changed an unrelated file | observe only |
| Low | a dependent API shape changed; narrow corrective note with graph evidence | suggest in alpha; Guard may allow auto-steer |
| Medium | agent's planned edit conflicts with authoritative code contract | human approve or scoped auto-steer after benchmark |
| High | cancelling a process, modifying permissions, overwriting work, reverting code | explicit human approval |
| Critical | executing destructive commands, credential changes, network exfiltration risk | denied without a separate privileged workflow |

## Policy inputs

Workspace opt-in mode, user role, agent-specific allowed actions, target session capabilities, contract validity, graph provenance, ambiguity, repeated attempts, sender trust, and a global rate budget.

For forecast-triggered decisions also check horizon, whether a pending action is directly observed, source reliability and lag, numeric calibration if valid, ownership lease freshness, runtime OTel coverage, graph/overlay revision, forecast TTL, target session/turn and predicted impact. PAIE proposes; this engine alone grants control authority.

| Trigger | Default | Stronger action requires |
|---|---|---|
| Weak near-future forecast | Observe | Independent supporting evidence |
| Fresh dependency collision forecast | Notify or wake owner | Current task lease and scoped dependency path |
| Possible destructive command in summary | Warn or request confirmation | A real pending command independently observed |
| Pending edit against protected contract | Propose steer/checkpoint | Verified hook, current scope and explicit policy |
| Independently verified urgent unsafe pending edit | Pause and request approval | User-authorised pre-action gate; bounded timeout |

Guard cannot be activated by model predictions alone. A forecast must never trigger process termination, unrelated worktree revert or privileged command. Even a direct pending request can only be paused at a hook that the runtime actually supports. Recheck lease, TTL, context, graph/worktree revision, human authority and capability immediately before dispatch. On failed revalidation, supersede the forecast and cancel the pending control request.

## Why timing matters

A mid-turn steering request is not an interrupt of the actual next generated token. Delivery happens at supported runtime boundaries. Recheck target session, `turn_id`, worktree revision, context version and capability probe immediately before a steer; if one changed, revalidate or return a precise stale/unsupported result. Never claim perfect timing or bounded steering latency without measured evidence. High-volume reasoning/output deltas must not block the bounded high-priority control lane.

## Action modes

- `steer_now`: deliver a scoped instruction during the active task at a verified native boundary.
- `interrupt_then_continue`: safely stop and resume/continue with updated context; record disruption and lost work, with explicit authority.
- `checkpoint_before_tool`: with user permission and a verified Signal-managed pre-tool hook, suspend a consequential pending action for graph/requirement revalidation. It does not stop hidden inference or an already running tool.
- `queue_next_turn`: durable fallback when same-task control is unsupported; never count it as a flagship correction.
- `observe_only`: record a warning or human-reviewable suggestion without dispatch.
- `abort`: fail closed when the claim or runtime target is stale/unverifiable.

Observe, Assist and Guard are workspace **authorization modes**, distinct from these per-session control strategies. Guard is not enabled until safety and utility have been measured.

## Preflight algorithm (illustrative pseudo-TypeScript)

```ts
async function attemptIntervention(candidate: Candidate): Promise<Outcome> {
  const target = await sessions.load(candidate.targetSessionId);
  if (!target || target.status !== 'active') return reject('target_not_active');
  if (!policy.canIntervene(candidate, target)) return reject('not_authorized');
  if (candidate.expiresAt <= clock.now()) return reject('expired');
  if (await cooldown.seen(candidate.dedupeKey)) return reject('duplicate_or_rate_limited');

  const scope = await repository.actualScope(target.workspace);
  if (!scopeMatches(candidate.expectedScope, scope)) return reject('stale_repo_scope');
  if (candidate.targetTurnId !== target.currentTurnId) return reject('stale_turn');

  const evidence = await findings.revalidate(candidate, scope);
  if (!evidence.proven || evidence.contradicted) return suggestOrReject(evidence);
  // A forecast may still be shown in Observe/Assist; this branch is only for control.

  const mode = policy.chooseSupportedMode(candidate, target.capabilities);
  if (!mode) return reject('no_authorized_capability');
  if ((mode === 'interrupt_then_continue' || mode === 'checkpoint_before_tool') &&
      !candidate.humanApprovalId) {
    return reject('human_approval_required');
  }

  // Persist intent; recheck turn, revision, capability and TTL at dispatch.
  const request = await journal.createDispatch(candidate, mode);
  const receipt = await adapters.forSession(target).dispatch(request);
  await journal.recordReceipt(request.id, receipt);
  return receiptToOutcome(receipt); // Not proof of incorporation.
}
```

The actual send path must make the final preflight and dispatch a race-aware operation. If the turn ends between checks, return `stale` or use only an explicitly permitted queue fallback. Never silently convert a live-steer request into a later prompt. Cancelling a turn does not necessarily stop subprocesses already launched or undo edits; the adapter reports those limits and reconciles process state.

## Arbitration between agents

Two agents may send incompatible requests to the same worker. Resolve in this order:

1. Human-authorized workspace policy and original user's current instruction.
2. Verified code/contract constraints relevant to the affected worktree.
3. Explicit task owner/maintainer authority, when delegated.
4. Other peer suggestions. Conflicting peers without authority trigger a human decision.

Do not implement "majority vote of agents" as a substitute for evidence or user authority. No instruction may impersonate a higher role.

## Storm protection

- Per session, per rule, per context hash cooldown.
- Aggregate duplicate warnings into one intervention candidate.
- Maximum automatic steering messages per turn and per time window.
- Suppress unchanged evidence after rejection.
- Exponential retry only for transport failures; no repeating a successfully accepted steer by default.
- Deduplicate forecasts across repeated summaries/tool hints; cap owner wakeups per lease/context and prevent reciprocal agent wakeup loops.

## Outcome verification

Journaled control states:

- `requested`, `authorised`, `dispatched`: distinct local decision and send stages.
- `transport_failed`: runtime never accepted it.
- `runtime_accepted`: API confirms intake, effect unknown.
- `incorporated_by_agent`: evidence from the same active task shows the correction entered the agent's work; an “OK” reply alone does not qualify.
- `effect_verified`: subsequent independent code/tool/test/runtime evidence matches the specified correction.
- `rejected_by_agent`: agent refused or disagreed; preserve explanation.
- `unsupported`, `stale`, `interrupted`, `expired`, `outcome_unknown`: preserve the exact reason and fallback, if any.

Automatic claims of prevented errors require a controlled baseline or clearly observed aborted edit, not simply the fact that a steer was sent.

Link each forecast to its intervention ID and observed later action. Mark confirmed, disconfirmed or unknown against observable labels, preserve false alarms and late forecasts, and feed calibration without rewriting the original prediction. A sent wakeup is not `runtime_accepted`; a receipt is not `agent_acknowledged`; acknowledgment is not `observed_applied`; and observed application is not `effect_verified`. Use the existing receipt/audit lifecycle for these distinct facts.

Timestamp `t0` source event when comparable, `t1` LRI receipt, `t2` conflict recognition, `t3` authorisation, `t4` submission, `t5` runtime receipt, `t6` first incorporation evidence and `t7` first independently verified effect. Report `t6 - t2` and `t7 - t2` as primary metrics; leave them unknown when evidence is absent. Also record recognition/dispatch lag, retries, disruption and correctly scoped token usage without inventing a millisecond SLA.

## Critical tests

- Two conflicting corrections in reverse arrival order.
- Already-finished turn at dispatch time.
- File changed after graph query, before injection.
- Tool is still running after agent turn interrupted.
- One target offline and reconnecting, TTL expired.
- Intervention based on `INFERRED` edge only.
- Low-confidence intent inference contradicts direct file evidence.
- Malicious agent asks controller to promote itself to system role.
- Native receipt without changed subsequent action must not become `effect_verified`.
- Queue-only fallback must not count as a mid-task correction.
- Pre-tool hook absent or an already-running child process must not be represented as paused.
