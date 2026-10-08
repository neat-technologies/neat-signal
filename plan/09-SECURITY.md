# 09 — Security, privacy and trust boundaries

This is essential infrastructure for a system where one AI agent can influence another. Default posture: **observe-only, localhost-only, least-privilege**.

## Threats

- A compromised low-trust agent instructs a privileged agent to exfiltrate secrets.
- Tool output or repository text embeds prompt-injection instructions designed to steer other agents.
- A session impersonates another agent or forges events.
- A stale message arrives after requirements or worktree changed.
- Readable reasoning or tool output contains credentials, API keys or private user data.
- One adapter ignores cancellation and leaves background processes running.
- An attacker subscribes to project event streams across workspace boundary.
- Circular instructions cause repeated token spend or destructive edits.
- A high-volume reasoning/output stream starves the urgent control lane or leaks sensitive text through replay, logs or an inferred digest.
- A forged “thinking” or tool-intent delta attempts to become an authoritative instruction or a false checkpoint.

## Mandatory controls

### Auth and authorization

1. Each session has an authenticated identity with scoped capability grants.
2. Separate permission to **observe**, **message**, **propose**, **steer**, **interrupt**, and **approve high-risk action**.
3. Deny cross-workspace routing by default, even if agent names coincide.
4. Tool output, model text, file content and agent self-reports are untrusted data, not authoritative instructions.
5. A low-trust agent cannot create system/developer role messages or change workspace policy.
6. Capture the human's explicit consent before Guard mode or sending external agent instructions.
7. Treat LRI subscriptions as a separate grant: observation of metadata does not authorise reasoning/output text. Bind grants to workspace, session, content class and expiry; revoke them when the session or user changes.
8. Provide an operator kill switch that immediately disables automatic dispatch and content capture, invalidates outstanding control requests where possible, and records the decision. It cannot retroactively undo already-launched tools or edits.

### Data protection

- Capture metadata and file hashes by default, not raw prompts or full tool outputs.
- Secrets detection/redaction before durable write and before forwarding to peers.
- Per-workspace retention period and user deletion/export capability.
- Encrypt sensitive persistent content at rest when storing it is enabled.
- Local API authentication even on localhost; avoid accidental LAN binding.
- External telemetry/export disabled unless user configures it.
- Reasoning summaries and generated thinking traces: opt-in, provider-compliant, strongly access-controlled; never attempt to decrypt opaque private model state.
- Full authorised visible-stream capture is time-bounded and off by default. Prefer redacted, ephemeral in-memory projections; persist only minimum timing/source/gap metadata and aggregates unless a separate scoped retention grant exists.
- Redact before subscription fan-out as well as durable write. Rate-limit and bound text deltas, record dropped counts, and prevent control-channel starvation. Derived intent digests inherit source sensitivity and deletion rules.
- Do not capture or forward provider-exposed reasoning where provider terms, runtime configuration or user permission forbid it; encrypted/opaque reasoning state remains inaccessible.

### Injection prevention

- Steering text is wrapped as authenticated, provenance-labelled *peer input*, never escalated to system/developer instruction.
- Runtime adapters must not blindly paste untrusted tool output into a higher-priority channel.
- Only controller-generated, templated correction messages can be auto-sent in Guard mode; free-form agent messages need explicit policy.
- Provide clear record of source agent, source artifacts, evidence and required authority.
- Reasoning traces, summaries, output, tool-intent events and inferred digests are untrusted evidence. They may help identify a risk but cannot by themselves grant authority, override a human instruction or prove a future action.
- A pre-tool checkpoint is only for Signal-managed agents with a verified safe hook and explicit user permission; independently owned sessions cannot be paused by assumption.

### Reliability

- Turn and worktree precondition checks before any steer.
- TTLs, replay protection and idempotency for every command.
- Rate limits and quotas for instructions and automated inference.
- Per-adapter concurrency limits and control of subprocess ownership.
- Fail closed when graph evidence/scope cannot be validated.
- Automatic actions never override explicit human veto.
- Fast control requests use a bounded priority lane but still require short TTL, idempotency, active-turn/worktree/context revalidation and an append-only audit record before dispatch.
- Interrupting the agent does not guarantee termination of child processes or rollback of filesystem changes; report and reconcile residual activity.

## Risk-tiered execution

`notify` is low risk. `steer` changes another agent's work and requires explicit policy. `interrupt` may disrupt processes and requires stronger permission. Shell termination, filesystem revert, secret access or network action remain outside autonomous Signal V0.

## Logging and audit

Security-relevant records: who requested, who/what authorized, which target and turn, version precondition, content hash or securely stored text ref, transport result, agent acknowledgement, verification method and denial reason. Logs must be tamper-evident enough to diagnose disputes (append-only journaling with snapshot integrity checks in V0; stronger signing in later versions).

## Validation checklist

- [ ] Cross-project data leakage impossible in integration test.
- [ ] Agent-supplied impersonation text is never promoted to privileged role.
- [ ] Plaintext credential fixtures are redacted before persistence.
- [ ] Forged events are rejected.
- [ ] Expired/stale turn steering rejected at send time.
- [ ] User can disable automatic intervention instantly.
- [ ] No high-risk action through default Guard policy.
- [ ] Local-only deployment does not leak listener onto LAN.
- [ ] Content subscriptions deny cross-workspace and cross-session reads; revocation removes ephemeral text and blocks new deltas.
- [ ] Prompt injection inside a provider-exposed trace or tool result cannot promote itself into a higher-priority steer.
- [ ] Stream flood and gap tests preserve control-lane responsiveness and report dropped counts.
- [ ] Kill switch prevents later automatic dispatch; already-running tools remain visible and are not falsely reported cancelled.
