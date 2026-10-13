# NEAT Signal — Live Thought-to-Steer feasibility proof (S-022 keystone)

Owned Claude-agent loop; mid-task contract correction delivered at a tool boundary.
Fixture: server/auth.ts (token_id) <- client/auth.ts. Mid long edit, contract renames
token_id -> session_id. Measured same-task incorporation + independent verify. k=1/arm.

Gates (non-negotiable): runtime_accepted != incorporated_by_agent != effect_verified.
effect_verified = final client has 0 token_id, >0 session_id, AND tsc --noEmit passes vs the renamed server.

| arm | model | runtime_accepted | incorporated | effect_verified | steer_latency_s | fetches | tokens |
|---|---|---|---|---|---|---|---|
| treatment | sonnet | yes | yes | yes | 1.93 | 3 | 136762 |
| treatment | opus   | yes | yes | yes | 4.52 | 3 | 187497 |
| baseline (observe-only) | sonnet | yes | yes | yes | 4.54 | 4 | 162949 |
| queue_next (control) | sonnet | no | no | NO (ships token_id, tsc fail) | - | 2 | 78112 |

## Verdict
FEASIBLE. The owned-loop path achieves same-task incorporation + effect_verified on both
models. The withheld-correction control (queue_next) correctly fails, so the win is caused by
the delivery, not the agent guessing. The observe-only arm also incorporates when the agent
re-polls the contract -> delivery through ANY channel the agent reads is the requirement;
explicit steer framing is not strictly required for a diligent (re-fetching) agent.

## Biggest blocker
The push form of injection (a Pre/PostToolUse hook or stream-json interrupt that delivers the
correction WITHOUT the agent polling) is blocked here by the harness safety classifier
("Create Unsafe Agents": instruction-injecting hook + --dangerously-skip-permissions reads as a
hijackable agent). The viable v0 mechanism is TOOL-CHANNEL delivery (agent re-fetches a
contract service and receives the correction in the result). An unsolicited push at an arbitrary
tool boundary needs either an explicit permission allowance for the hook path, the stream-json
multi-turn interrupt (untested; may also trip the classifier), or the real Signal ACP/attach surface.

k=1 feasibility demo, not a powered study.
