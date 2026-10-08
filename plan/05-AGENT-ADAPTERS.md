# 05 — Agent runtimes and adapter plan

## First principle

Each provider has different notions of a session, turn, stream, cancellation, message injection and reasoning visibility. Build a **capability-discovered adapter contract**. The product must not promise a feature merely because an SDK, article, or repository README mentions it.

```ts
type SteeringMode =
  | 'steer_now'
  | 'interrupt_then_continue'
  | 'checkpoint_before_tool'
  | 'queue_next_turn'
  | 'observe_only';
type ReasoningVisibility = 'none' | 'summary' | 'provider_exposed_trace';

type CapabilityFinding = {
  status: 'verified' | 'unsupported' | 'unverified';
  runtimeVersion: string | null;
  testedAt: string | null;
  evidenceRef: string | null;
  fallback: string;
};

type AdapterCapabilities = {
  adapterVersion: string;
  provider: string;
  observedRuntimeVersion: string | null;
  launch: boolean;
  attachToExisting: boolean;
  events: Array<'lifecycle' | 'tools' | 'files' | 'usage' | 'output'>;
  reasoning: ReasoningVisibility;
  steering: SteeringMode[];
  canInterrupt: boolean;
  canResume: boolean;
  capabilityEvidence: 'handshake' | 'runtime_probe' | 'static_only';
  findings: Record<
    'reasoning_content' | 'reasoning_summary_stream' | 'visible_output_deltas' |
    'usage_update_granularity' | 'tool_event_granularity' | 'live_steer' |
    'interrupt' | 'resume' | 'attach_to_existing' | 'pre_tool_request' |
    'pre_tool_pause' | 'owner_wakeup' | 'session_resume',
    CapabilityFinding
  >;
};

interface SignalAgentAdapter {
  probe(): Promise<AdapterCapabilities>;
  startOrAttach(options: SessionOptions): Promise<SessionHandle>;
  observe(handle: SessionHandle, onEvent: (event: AdapterEvent) => void): Promise<void>;
  steer(handle: SessionHandle, input: TrustedSteerRequest): Promise<SteerReceipt>;
  interrupt(handle: SessionHandle, reason: string): Promise<InterruptReceipt>;
  stop(handle: SessionHandle): Promise<void>;
}
```

`probe()` must interrogate the actual installed runtime and active session wherever feasible. Unsupported operations yield explicit typed errors; never silently switch modes.

The booleans and mode lists above are **effective verified capabilities only**. An `unverified` finding does not set a boolean to true or enable an action; the `findings` record preserves the uncertainty and evidence separately.

## P0 live-stream and steering feasibility matrix

**Planning status:** No runtime experiment was performed for this documentation change. Every cell below is **UNVERIFIED**, with runtime version, test date and executable evidence **not yet recorded**. Official API documentation and installed binaries are leads for a probe, not proof that an active session supplies the capability. Publish a new matrix for every tested runtime version/configuration; each cell must carry `verified | unsupported | unverified`, version, test date, evidence and fallback.

| Runtime category | reasoning_content | reasoning_summary_stream | visible_output_deltas | usage_update_granularity | tool_event_granularity | live_steer | interrupt | resume | attach_to_existing |
|---|---|---|---|---|---|---|---|---|---|
| OpenAI-based coding agent | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Claude-based coding agent | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Open-weight reasoning runner | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Generic IDE/CLI agent | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |

Fallback while unverified: use only explicitly authorised Observe or durable next-turn queue where a live probe proves that queue path; otherwise report `observe_only`. Do not treat a visible “Thinking” panel, token counts or API marketing text as evidence of reasoning content or mid-task steering.

**PAIE probe extension:** for the same exact runtime build, separately test pre-tool request visibility (paths/patch/command and timestamp), ability to pause *before* tool execution, file-change confirmation, wakeup of an idle owned session, and resume of that exact session/turn. All are **UNVERIFIED** in this documentation update; the current runtime matrix above does not establish them. Record `verified | unsupported | unverified`, version, test date, native event/receipt IDs, latency and fallback per cell. A provider summary or a tool-start event cannot be relabelled as a pre-tool interception point.

For each category, run a controlled long task and capture native event IDs, timestamps, stream ordering and loss, then submit a correction before completion and inspect subsequent actions. Compare five distinct strategies: native active-response steer, interrupt-and-continue, an authorised Signal-managed pre-tool checkpoint, next-turn queue, and observe-only. A tool hook is not a way to edit hidden inference. Repeat after a target-turn race and after a dropped stream; publish negative results.

## Adapter 1: Codex (first steering feasibility candidate)

**Official API references:**
- https://github.com/openai/codex/blob/main/sdk/python/docs/api-reference.md
- https://github.com/openai/codex/tree/main/codex-rs/app-server

Implementation tasks:

1. Launch an explicitly owned session through supported SDK/App Server process lifecycle.
2. Subscribe to turn start/end, tool item and usage events; normalize without losing native IDs.
3. Discover supported version and steering semantics through runtime probe/integration test.
4. If the selected installed version exposes a supported steering operation, test active-turn additional input with a target-turn precondition; otherwise record `UNSUPPORTED` or `UNVERIFIED` and the fallback.
5. Handle interrupt completion separately from command acceptance; verify background processes are not automatically assumed stopped.
6. Test turn-race where the target completes between route decision and injection; choose safe fallback only when allowed by the message.
7. On the exact installed OpenAI client/runtime, test reasoning-summary deltas, visible output deltas, usage cadence and tool events separately. Inspect whether any reasoning **content** is actually transmitted; counts or a UI panel are not content. Verify native active-turn steer by changed subsequent action, not by a request receipt.

**Caveat:** Attaching to an already running arbitrary desktop-owned session is a separate feasibility gate; don't claim it works without proof.

## Adapter 2: Claude (second target)

**Official/reference interface:** https://github.com/agentclientprotocol/claude-agent-acp/blob/main/examples/steering.ts  
**Managed session event API:** https://platform.claude.com/docs/en/managed-agents/events-and-streaming

Implementation tasks:

1. Test the Agent Client Protocol adapter's `_meta.steering` handshake and `_session/steering` while a turn is active.
2. Verify response outcomes (`injected`, `startedNewTurn`, `promptRequired`) and report their actual semantics.
3. Support a distinct Managed Agents implementation that uses event-driven interrupt/redirect if configured, not falsely treating it as seamless steering.
4. Observe tool boundaries and exposed outputs without claiming full hidden reasoning access.
5. Do not claim ordinary Claude Code CLI sessions support active steering without a live probe. Show `queue_next_turn` only if that queue integration is verified; otherwise `observe_only` or `unverified`.
6. Probe whether the chosen authorised interface emits `thinking` content, a summary, visible output, or no reasoning stream. Test active-turn steering, interrupt-and-continue and queueing independently; record the exact runtime version and native receipt semantics.

**Caveat:** ACP adapter and managed session behaviour may differ from Claude Code's ordinary terminal workflow; running an ACP session is not equivalent to attaching to an arbitrary one. The default queue assumption is a conservative design fallback, not a verified claim about every CLI version.

## Adapter 3: Optional open-weight reasoning-runner research

Select an inference runtime that **expressly returns** generated reasoning trace text under its licence and configured API. With opt-in, test delta order, gaps, visibility, retention, usage cadence and correction timing during generation. Record if steering cannot alter the current generation and whether interrupt/continue loses work. This adapter tests the value of available traces; it does not establish feature parity with OpenAI or Claude. It is a research track, not a required V0 production provider.

## Adapter 4: Generic hook/CLI runtime (minimum portable fallback)

- Process lifecycle and heartbeat observation.
- Optional hook events (tool start/end), file watcher, user-approved log tail.
- Durable mailbox and next-turn context injection where the runtime permits it.
- No claim of native mid-turn steering.
- Capability negotiation displays `queue_next_turn` only after its actual hook is tested; otherwise `observe_only`.
- Test supported attachment to an independently running session. If no supported API exists, prefer Signal-launched/owned sessions or an explicit user-installed integration; do not infer attachment from a PID or local files.

## Future candidates

OpenCode, Gemini CLI, Cursor, local-model runtimes. Prioritize by verified session APIs, developer demand, and adapter maintenance burden. Do not infer that a provider supports injection just because it supports streaming output.

## Reasoning access rules

- Private provider chain-of-thought may not be exposed; encrypted state is not readable reasoning.
- Summaries are summaries, not every token; tag `provider_summary`.
- Open-weight models may expose a stream of generated reasoning text; capture only if the runtime explicitly returns it, the user opts in and policy allows storage/forwarding.
- Reconstructed goal/intent is inference and must be tagged `inferred_intent`.
- Token consumption often arrives per turn or periodic aggregate, not necessarily per token. Display precision honestly.
- Capture the entire **authorised visible stream** where available, separating provider-exposed trace, provider summary, assistant output, tool events and usage updates. If a provider never transmits private reasoning, client-side interception cannot recover it.
- Test the hypothesis that exposed thought/summary deltas reduce time-to-detection against a tool/file-only baseline; this is not an established performance claim.

## Adapter conformance suite

| Test | Expected |
|---|---|
| Session handshake | accurately reports capabilities and runtime version |
| Event stream ordering | per-session sequence maintained by Signal |
| Inject into active turn | receipt is distinguishable from actual model use |
| Race: turn finishes before injection | explicit fallback or rejection, no false success |
| Reconnect | resume/reconcile from cursor without doubled sends |
| Usage unavailable | null/unknown, never zero |
| Missing reasoning | no trace claim |
| Interrupt | terminal status verified; child tools not assumed stopped |
| Unauthorized attachment | refused, not discovered by filesystem guessing |
| Stream gap/backpressure | explicit gap and dropped count; control lane remains responsive |
| Reasoning classes | summary, trace, output, counts and inferred intent remain distinct |
| Same-task correction | incorporation and independent changed effect recorded before task end, or accurate fallback |
| Pending action | request event precedes execution; path/patch provenance and cancellation semantics are accurate |
| Owner wakeup | only a currently leased, permitted session resumes; offline/unsupported owner gets bounded fallback |
| Forecast race | turn/revision change supersedes candidate before checkpoint or steer |

For PAIE, owned sessions are the first integration target. A Signal-owned pre-edit hook must emit the requested operation before executing it, with a stable request ID and explicit accept/reject/timeout result. Verify that a paused request cannot leak through on timeout, and state the adapter's fail-open/fail-closed policy. File watcher observations after an edit support outcome verification, not pre-edit blocking. Reasoning summaries and plans can improve an earlier *near-future* forecast, but no adapter may claim it read private thoughts. Application OTel remains a separate NEAT data source and cannot stand in for any coding-agent hook.

## Deliverability modes shown in UI

`steer_now (verified)` / `interrupt_then_continue (verified)` / `checkpoint_before_tool (verified, managed session)` / `queue_next_turn` / `observe_only` / `offline`. These are **per session**, not provider-wide promises. A queue-only session does not satisfy the flagship same-task correction claim.
