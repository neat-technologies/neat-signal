# 06 — Agent State Mirror and NEAT linkage

## Core distinction

**NEAT System Graph** holds code and runtime dependency evidence. **Signal Execution Graph** holds the time-varying facts about agent sessions, tasks, turns, files touched, events and interventions. They are linked by scoped file references, not merged into one unbounded data store.

## Proposed execution graph

Node types:

- `Agent`: logical identity and permissions.
- `Session`: provider process/session, with capability set.
- `Turn`: unit of work with start/end lifecycle.
- `Task`: explicit assigned objective and owner.
- `Worktree`: checkout, base commit, dirty revision.
- `FileActivity`: observed file read/change or reported intent.
- `Message`: instruction and delivery lifecycle.
- `Intervention`: hypothesis, decision, action, evidence and outcome.

Edge types:

- `AGENT_RUNNING_SESSION`, `SESSION_EXECUTES_TURN`, `TURN_WORKS_ON_TASK`.
- `TURN_READS_FILE`, `TURN_EDITS_FILE`, `TASK_DEPENDS_ON_TASK`.
- `MESSAGE_TARGETS_TURN`, `INTERVENTION_CITES_EVENT`.
- `FILE_REFERS_TO_NEAT_NODE` (always has repo/worktree/commit scope).

Agent reasoning summaries or plans are **attributes/evidence** of a turn, not authoritative graph dependencies.

LRI also maintains a short-lived **active-turn projection** from permitted deltas. A provider-exposed trace, a provider summary, visible output, tool intent and file change remain separately labelled inputs. The projection may say “possibly preparing to edit X” with freshness, source IDs and confidence; it must never say “will edit X” merely because the agent mentioned it. Missing deltas can mean unavailable capability, delayed delivery, a stream gap or silence, each with a different quality state.

## Evidence quality

Each agent-state claim stores:

```text
claim, origin_event_ids[], observation_kind,
observed_at, last_validated_at, confidence_if_inferred,
repo_scope, stale_after, contradictions[]
```

`observation_kind` includes `direct_tool_event`, `file_hash_verified`, `provider_reported`, `agent_self_report`, `model_inference`, `neat_extracted`, `neat_observed`, `neat_inferred`. Do not mislabel a reported intention as executed behaviour.

Add `provider_reasoning_trace`, `provider_reasoning_summary`, `assistant_output_delta`, `tool_intent` and `stream_gap` as distinct observation kinds. A content projection is ephemeral by default; the durable journal keeps source IDs, timing, redacted digests and capability/quality metadata unless the user opts into time-bounded content retention. A trace expressly supplied by a provider is still not proof of inaccessible internal computation.

## How to detect a cross-agent conflict

1. Agent A changes `src/server/auth.ts` in worktree A.
2. Verify the file hash/diff and record the changed exports/types where parsable.
3. Ask NEAT for dependencies and impact paths from the affected node within a *known graph revision*.
4. Match candidate impacted files to current Agent B activity in worktree B (observed touch or declared plan).
5. Inspect whether Agent B references an older contract (`context_version`, imports/types, available plan evidence).
6. Produce a finding only if the dependency and incompatibility are supported. Mere concurrent work in related files is **not** sufficient proof.
7. Send a safe targeted correction only after authorisation, timing checks and risk budget checks.

### Reasoning-aware examples to test

| Scenario | Direct observation | Inference and NEAT check | Control and independent verification |
|---|---|---|---|
| Removed API field | An authorised output/trace says B plans to remove `token_id`, or a tool event shows an edit | Intended removal is uncertain until a diff; verify the field's actual consumers in a graph revision matching B's worktree | In Observe/Assist, propose a scoped correction; use `steer_now` only if the session probe and authority allow it. Verify B's later diff and tests preserve or migrate consumers before task end. |
| Shared dependency edit | A pre-tool intent or file-change event names a dependency A just changed | Tool intent is not execution; recheck A's diff and the NEAT dependency path at both worktree revisions | A verified managed-session checkpoint may pause the pending tool with user permission; otherwise warn/steer at a supported boundary. Verify the resulting edit against the new contract. |
| Superseded requirement | A timestamped human requirement update and B's visible output/summary still reference the old contract | Compare task `context_version`; do not treat summary text as proof of future action | Human-authorised correction to the active turn or interrupt-and-continue; verify subsequent implementation and tests before B finishes. |
| Dirty worktree vs analysed graph | Hash/revision check shows uncommitted code outside the graph's analysed snapshot | The graph cannot verify the new dependency until re-extracted or overlaid | Downgrade to warning or request refresh, never auto-steer from a falsely current graph; verify the new graph scope before action. |

These examples are test fixtures, not claims that the current NEAT API already supports branch overlays or that any provider exposes the cited stream. Contradictory peer messages and a single short reasoning statement require arbitration, not automatic interruption.

## Repository / branch correctness

The master code graph can be stale relative to A's local edits and B's base commit. Requirements:

- Every finding identifies which snapshot it describes.
- Prefer an ephemeral overlay graph computed from changed files/worktree diffs, then link overlay nodes to NEAT stable node identities.
- If overlay parsing fails, lower confidence and fall back to a warning, not automatic steer.
- Watch for file renames, case-folding, symlinks, generated files and shared package references.
- Never claim a dependency exists in B's worktree solely because it appears in a different branch.
- Stamp every intervention finding with the analysed graph revision and current dirty-worktree marker; revalidate both just before dispatch.

## Initial deterministic detectors (in build order)

1. Same-file concurrent edits in separate active worktrees.
2. A's exported declaration/API contract changed while B references its earlier version.
3. Dependency path between changed file and B's active work item verified by graph query.
4. NEAT policy result changed after an observed edit.
5. Repeated tool-error loops or escalating token usage **as advisory only**, not grounds for automatic interrupt in V0.

## State reconstruction

Reducer consumes the append-only journal; snapshots are derivable. Last-write-wins based on server clock is forbidden for conflicting causal events. A field may be `unknown`, `stale` or `contradicted`; these are first-class UI states.

## Privacy and inference budget

Do not copy full source files or raw messages into the journal by default. Store file identity, hashes, change ranges and short permitted summaries. Use rules and static parser checks first; any LLM-based inference must be optional, metered and labelled.

## Why this helps the parent NEAT product

Signal becomes a new graph consumer and can surface provenance and blast-radius reasoning to agent builders at decision time. This may increase usage of NEAT graph queries and make its architectural policy feature visible at the exact moment it matters. These effects must be instrumented, not assumed.
