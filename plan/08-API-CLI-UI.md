# 08 — API, CLI and developer-facing UI (proposals)

Everything here is a **to-build interface**, not an existing NEAT route/command. Namespace and final names require checking for conflicts in the checked-out repo.

## Local-first commands

```text
neat signal start [--project .]              # Start Signal daemon in Observe mode
neat signal status                          # Sessions, capabilities, latest activity
neat signal agents                          # List discovered/owned sessions
neat signal attach --provider codex ...     # Only if supported by selected adapter
neat signal send --to builder --text '...'   # Durable, scoped message; return ID
neat signal steer --session sess_42 ...      # Explicit targeted steer; capability checked
neat signal capabilities --session sess_42   # Probe status, version, date and evidence
neat signal observe --session sess_42 --follow # Authorised live deltas; opt-in text
neat signal control --session sess_42 --strategy steer_now|interrupt_then_continue|checkpoint_before_tool|queue_next_turn|observe_only
neat signal conflicts                       # Evidence-backed current conflicts
neat signal events --follow                  # Tail authorized/redacted event stream
neat signal replay --session sess_42         # Reconstruct execution timeline
neat signal mode observe|assist|guard        # Requires explicit user permission
```

Commands should support `--json` and stable nonzero error codes for unsupported runtime capability, unauthorized action, stale target, unreachable daemon and invalid scope.

`send` returns durable messaging status. `control` returns a control request ID and separate `requested`, `runtime_accepted`, `incorporated_by_agent` and `effect_verified` states where evidence exists. A queue-only result is labelled `queue_next_turn`, never “steered”. Exposing text from a provider stream requires explicit opt-in and observe permission; unsupported content returns a capability status, not an empty “thought” pane.

## HTTP API (localhost first)

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/signal/v1/sessions` | Register a Signal-managed session |
| `GET` | `/signal/v1/sessions` | Query states and probed capabilities |
| `GET` | `/signal/v1/sessions/:id` | Agent State Mirror with freshness/evidence |
| `GET` | `/signal/v1/events?cursor=...` | Replay authorized events |
| `GET` | `/signal/v1/events/stream` | SSE live event stream with cursors |
| `GET` | `/signal/v1/sessions/:id/capabilities` | Active-session, versioned probe evidence for observation and controls |
| `GET` | `/signal/v1/sessions/:id/observations/stream` | Permission-scoped LRI deltas and gap/quality metadata |
| `POST` | `/signal/v1/messages` | Persist routed message and return immutable ID |
| `GET` | `/signal/v1/messages/:id` | Delivery lifecycle and evidence |
| `GET` | `/signal/v1/findings` | Conflict/relevance findings |
| `POST` | `/signal/v1/interventions` | Create intervention request (authorisation required) |
| `POST` | `/signal/v1/interventions/:id/approve` | Human approval |
| `GET` | `/signal/v1/interventions/:id` | Decision, delivery and verification |
| `POST` | `/signal/v1/control` | Fast, scoped control request after policy preflight |
| `GET` | `/signal/v1/control/:id` | Native receipt, incorporation/effect evidence and timing |
| `POST` | `/signal/v1/policy` | User-authorized config change |

All write routes accept `Idempotency-Key` and authenticated identities. Mutations validate workspace and target session ownership. `POST /control` also requires active turn, worktree/context preconditions, short TTL, strategy-specific authority and send-time revalidation. Explicit per-session capability errors use a stable machine-readable code. The observations stream uses the same `EventEnvelope` IDs and permission checks as the journal; optional text deltas may be ephemeral and non-replayable, signalled by gaps rather than invented history.

## Signal dashboard

### Page: Mission Control

Three columns: live agents (task, session, last event, tokens if measurable), conflicts/warnings (severity, affected dependency, provenance), and intervention queue (action, preconditions, authorisation). Show *unknown* when metrics are absent; never equate idle with disconnected. A per-session badge distinguishes verified native steer, interrupt-and-continue, managed checkpoint, queue-only and observe-only from unverified capabilities.

### Page: Agent detail

Timeline of tool events, changed files, summaries when available, prompts/messages where user opted in, token usage, active turn and terminal controls. Label each stream item `provider-exposed trace`, `provider summary`, `visible output`, `tool event`, `usage count` or `inferred intent`; show source, freshness and stream gaps. Expose reasoning text only with explicit opt-in and proof the provider emitted it. Token counts never render as text content.

### Page: Dependency impact

NEAT graph path from changed API/file to recipient agent's active file; show worktree scope, graph revision, edge provenance and confidence. UI distinguishes `EXTRACTED`, `OBSERVED`, `INFERRED` and `STALE`.

### Page: Replay and audit

Reconstruct exactly which evidence caused the intervention, what was sent, who authorised it, provider receipt, same-task incorporation evidence, independently verified effect, and `t0`–`t7` timestamps where known. Show median/p95 detection-to-incorporation and detection-to-effect only for measured samples, with unknowns and interrupted work reported separately.

## User-level experience

A notification should read:

> Agent B may be using an outdated authentication contract. Signal observed an edit by Agent A to `src/server/auth.ts`; NEAT identifies a dependency path to B's current file. **Suggested correction**. [Review evidence] [Send] [Dismiss]

Not:

> Signal read Agent B's thoughts and fixed the problem.

## Minimal noninteractive flow

1. `neat` running for project, or supported read-only graph endpoint configured.
2. `neat signal start` starts local service.
3. Launch two Signal-managed agents; adapter capability probes displayed.
4. Simulate API contract change; Signal detects impacted ongoing work.
5. User approves a steering instruction; receive accurate status and audit trail.
6. Compare before/after outcomes against a control run.

## UX acceptance

No clickable action can claim it steered a session where current adapter only queues messages. Every action shows requested, accepted and verified states separately.

The interface must never imply all agent thoughts are visible or that a pre-tool checkpoint can halt provider-hidden inference. An `unsupported` or `unverified` badge links to the probe version/date/evidence and available fallback. Operator kill switch and content-capture revocation are always reachable.
