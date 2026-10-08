# 04 — Protocol and data contracts

All schemas below are **proposed V0 contracts** to be implemented and validated using Zod in TypeScript. JSON examples are illustrative. Treat wire protocol names as NEAT Signal's own namespace.

## Identity and causal scope

- `workspace_id`: access boundary (local repository/project context).
- `agent_id`: durable logical role or runner identity.
- `session_id`: concrete provider runtime process/session.
- `turn_id`: active unit of agent work, may be `null` while idle.
- `stream_epoch`: increases when a session is restarted or reattached.
- `repo_id`: repository identity.
- `worktree_id`: checkout identity; **not** interchangeable with branch name.
- `base_commit`: commit hash the agent started from.
- `working_revision`: monotonically changing marker for local edits; cannot assume Git SHA exists for uncommitted state.
- `context_version`: canonical hash of task requirements, relevant contracts and graph reference used in making a recommendation.

## EventEnvelope v1

```json
{
  "schema_version": 1,
  "event_id": "evt_01",
  "workspace_id": "ws_local",
  "agent_id": "builder",
  "session_id": "sess_42",
  "turn_id": "turn_8",
  "stream_epoch": 1,
  "seq": 42,
  "occurred_at": "2026-10-08T09:30:12.000Z",
  "received_at": "2026-10-08T09:30:12.090Z",
  "type": "agent.tool.started",
  "source": "provider_event",
  "sensitivity": "metadata",
  "repo_scope": {
    "repo_id": "repo_1",
    "worktree_id": "wt_b",
    "base_commit": "0123456789abcdef0123456789abcdef01234567",
    "working_revision": 7
  },
  "parent_event_ids": ["evt_00"],
  "data": {"tool_name": "edit_file", "paths": ["src/auth/client.ts"]}
}
```

Minimum event types:

| Type | Key fields | Durability |
|---|---|---|
| `agent.presence` | current status, lease expiry | Snapshot + optional telemetry |
| `agent.turn.started`, `.ended` | turn and status | Durable |
| `agent.tool.started`, `.ended` | tool name, paths, status, duration | Durable, metadata-only default |
| `agent.file.changed` | path, revision, diff hash | Durable |
| `agent.plan.reported` | opt-in brief structured plan | Durable with retention policy |
| `agent.reasoning.summary` | explicitly provider-exposed summary | Opt-in and redacted |
| `agent.reasoning.trace` | explicitly provider-exposed trace | Disabled by default |
| `agent.assistant.output.delta` | visible assistant text delta | Ephemeral by default |
| `agent.tool.intent` | provider-exposed pending tool action | Ephemeral; never assumed to be a safe checkpoint |
| `agent.stream.gap` | source discontinuity, dropped count, replay limit | Durable metadata |
| `agent.usage.updated` | measured tokens, model identifier, source | Durable aggregated |
| `signal.message.*` | lifecycle transitions | Durable |
| `signal.intervention.*` | reason, policy decision and result | Durable |

**Do not fabricate** missing counters, raw thoughts, plan text or token pricing. `source` must distinguish provider, tool, agent self-report and inference. Track `confidence` for inferred state.

The eventual Zod schema should allow `occurred_at: string | null` for a source with no native timestamp while keeping `received_at` required. The JSON above illustrates a source that did provide one.

### Live observation data within EventEnvelope v1

LRI emits the **same** `EventEnvelope` with the same `event_id`, `session_id`, `turn_id`, `stream_epoch`, `seq`, `occurred_at` and `received_at`; there is no second bus or independent Signal event ID. Its versioned `data` shape adds:

```ts
// Proposed EventEnvelope.data for agent.*.delta / tool / usage / gap events.
type LiveObservationData = {
  native_source: string;
  source_event_id: string | null;
  native_item_id?: string;
  native_sequence?: number;
  content_kind:
    | 'provider_reasoning_trace'
    | 'provider_reasoning_summary'
    | 'assistant_output'
    | 'tool_intent'
    | 'tool_start'
    | 'tool_result'
    | 'usage_update'
    | 'stream_gap'
    | 'inferred_intent';
  visibility: 'observed' | 'inferred';
  text_delta?: string; // Opt-in; omitted when unavailable or unauthorised.
  content_retention: 'ephemeral' | 'redacted_persisted' | 'none';
  source_evidence: string[];
  dropped_count?: number;
  data_quality: 'current' | 'delayed' | 'gap' | 'unavailable';
};
```

`occurred_at` is source time only when supplied; otherwise it is unknown, not copied from receive time. `seq` is Signal's per-session order and `native_sequence` retains provider order when exposed. Persist an envelope with redacted metadata and content reference only under an explicit retention policy; otherwise keep text in a short-lived LRI projection and journal only gap/aggregate metadata. Provider-exposed trace, provider summary, assistant output and inferred intent are different classes; usage counts carry no content.

### Active-session observation capability

Probe each session, not just its provider. For each of `reasoning_content`, `reasoning_summary_stream`, `visible_output_deltas`, `usage_update_granularity`, `tool_event_granularity`, `live_steer`, `interrupt`, `resume`, and `attach_to_existing`, record `verified | unsupported | unverified`, runtime and adapter versions, test date, evidence reference, and any fallback. `unverified` must not be displayed as `unsupported`; a provider-wide claim must not override a weaker active-session probe.

## RoutedMessage v1

```json
{
  "message_id": "msg_01",
  "idempotency_key": "client123:counter42",
  "workspace_id": "ws_local",
  "from_agent_id": "planner",
  "to_agent_id": "builder",
  "target_session_id": "sess_42",
  "target_turn_id": "turn_8",
  "created_at": "2026-10-08T09:30:13.000Z",
  "expires_at": "2026-10-08T09:30:43.000Z",
  "priority": "high",
  "kind": "correction",
  "body": "Auth response now uses session_id, not token_id. Update the client binding.",
  "preconditions": {
    "repo_id": "repo_1",
    "worktree_id": "wt_b",
    "context_version": "sha256:example",
    "expected_turn_id": "turn_8"
  },
  "evidence_event_ids": ["evt_00", "evt_01"],
  "allowed_modes": ["steer_now", "queue_next_turn"],
  "requires_human_approval": false
}
```

Message `body` is untrusted agent-provided content unless authenticated and policy-authorized. Limit size, redact secrets, and annotate source/authority to target runtime. Impersonation of system/developer messages is forbidden.

## Message lifecycle

```text
created -> validated -> stored -> routed -> runtime_accepted -> [agent_acknowledged]
                    |          |              |
                    |          +-> rejected/unsupported/outcome_unknown
                    +-> expired/superseded/unauthorized
```

Messaging remains durable even when live steering is impossible. Its receipt and an agent's “OK” do not prove incorporation. A separate intervention lifecycle below records that stronger claim; all transitions are immutable journal events, not overwritten facts.

## InterventionDecision v1

```json
{
  "intervention_id": "int_01",
  "rule_id": "contract-version-divergence",
  "target_session_id": "sess_42",
  "action": "steer_now",
  "severity": "medium",
  "confidence": 0.92,
  "evidence": [{"kind": "neat_dependency", "ref": "graph:edge:123", "scope": "wt_b"}],
  "requested_at": "2026-10-08T09:30:15.000Z",
  "approval": "auto_low_risk",
  "cooldown_key": "sess_42:contract-version-divergence:sha256:example"
}
```

Thresholds and numeric confidence are *internal heuristics* to be calibrated. `confidence` is not a guarantee of correctness and must not be conflated with NEAT's graph confidence.

### Fast control request and outcome

An intervention references the `RoutedMessage` ID (if there is a message) and the same `EventEnvelope` IDs for evidence. Its control request adds `strategy` (`steer_now | interrupt_then_continue | checkpoint_before_tool | queue_next_turn | observe_only`), active `session_id` and `turn_id`, expected `repo_scope` and `context_version`, authority/approval reference, short expiry, idempotency key, and source capability-probe reference. Recheck session, turn and worktree revision immediately before dispatch. The bounded fast lane prioritises this request over bulky deltas but cannot skip validation or audit.

Control outcome states are `requested`, `authorised`, `dispatched`, `runtime_accepted`, `incorporated_by_agent`, `effect_verified`, `unsupported`, `stale`, `interrupted`, `expired`, and `outcome_unknown`. `runtime_accepted` is a transport/runtime receipt only. `incorporated_by_agent` requires evidence from the same ongoing task that the correction entered its decision context; `effect_verified` requires an independent later action, diff, test or explicit runtime-state check. Record evidence IDs and verification method for both. A queued next-turn delivery never masquerades as same-task incorporation.

Record optional timestamps `t0` source generation, `t1` LRI receive, `t2` conflict recognition, `t3` authorisation, `t4` runtime submission, `t5` native acknowledgement, `t6` first incorporation evidence, and `t7` first independently verified changed effect. Keep source time null when absent and compare `t1 - t0` only with comparable clocks. Unknown `t6`/`t7` remain null; no fabricated latency or token-by-token estimate.

## Version and priority rules

1. For an active-turn steer, require expected session and turn match at send-time; an approved pre-tool checkpoint additionally requires a verified, Signal-managed hook for that pending action.
2. If expected worktree/context version differs, revalidate; reject if revalidation cannot be done.
3. TTL is checked at storage and immediately before every retry.
4. Explicit user control outranks agents; workspace policy outranks agent suggestions.
5. Multiple compatible corrections can be coalesced; incompatible corrections escalate to human arbitration.
6. Duplicate `idempotency_key` returns original operation status, not a second injection.

## Subscriber cursor

Clients subscribe with `workspace_id`, optional `session_ids` and last seen `(stream_epoch, seq)`. Server replays journal entries up to the live watermark before switching to live stream. Authorization is checked per event. Backpressure: bounded buffers, gap notifications, forced cursor replay; never silently drop durable steering outcomes.

## Retention

Metadata by default; token summaries and event labels retained by configurable policy. Prompt bodies, tool payloads, detailed reasoning and private paths require explicit data capture settings and access controls. Raw reasoning, when offered by an open model, remains opt-in.

Full authorised visible-stream capture is optional and time-bounded. Without it, LRI may keep a redacted ephemeral projection while persisting only source labels, timing, gaps, counts and aggregate usage. Deletion, consent revocation and subscriber authorization apply to text and derived digests alike.
