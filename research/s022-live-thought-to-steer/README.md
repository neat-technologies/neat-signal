# S-022 — Live Thought-to-Steer feasibility

The P0 question for Signal (see [`plan/10-IMPLEMENTATION-PLAN.md`](../../plan/10-IMPLEMENTATION-PLAN.md)) is whether an authorised observer can detect that an active agent's work has gone stale and deliver a correction the agent **incorporates before its task ends** — not merely a message it accepts. This folder is the first feasibility run against that question.

**Result: feasible on the owned-agent loop.** Full report in [`RESULTS.md`](RESULTS.md). Headline, k=1 per arm:

| arm | model | runtime_accepted | incorporated | effect_verified |
|---|---|---|---|---|
| treatment | sonnet | yes | yes | yes |
| treatment | opus | yes | yes | yes |
| baseline (observe-only) | sonnet | yes | yes | yes |
| queue_next (control) | sonnet | no | no | **no** (ships old contract, `tsc` fails) |

The three gates are measured independently (`runtime_accepted ≠ incorporated_by_agent ≠ effect_verified`); `effect_verified` requires the final client to have zero `token_id`, at least one `session_id`, **and** a clean `tsc --noEmit` against the renamed server. The `queue_next` control withholds the correction for the *current* task and correctly fails — so the win is caused by the delivery, not the agent guessing. Delivery works through any channel the agent re-reads; explicit "steer" framing is not required for an agent that re-fetches the contract.

**Honest limits.** This is a **k=1 feasibility signal, not a powered study** — one fixture, owned sessions, one runtime family. The true *push* form (injecting the correction at an arbitrary tool boundary without the agent polling) is **not** demonstrated here: a Pre/PostToolUse hook + `--dangerously-skip-permissions` reads to the harness safety classifier as a hijackable-agent pattern, which is a fair signal that unsolicited mid-task injection is structurally close to agent-hijacking. The viable v0 mechanism is tool-channel (pull) delivery; a real push surface needs a permissioned hook, a stream-json interrupt (untested), or the ACP/attach surface.

## Layout
- `RESULTS.md` — the verbatim run report.
- `harness/run-arm.sh` — drives a Claude agent (`claude -p … --output-format stream-json`) on a long edit of `client/auth.ts`, with the contract service as the mid-task channel; flips the contract at the boundary and verifies the result.
- `harness/contract-service.sh` — the authoritative contract the agent re-fetches; per-arm behaviour (treatment steers, baseline reports the raw current field, queue_next withholds the rename this task).
- `harness/measure.py` — parses a run's `stream.tsv` into the three gates plus timings.
- `fixture/` — the two-file contract fixture (`server/auth.ts` is authoritative; `client/auth.ts` consumes it).
- `runs/<arm>-<model>/` — raw per-run evidence: `stream.tsv` (full agent transcript), `result.json`, `verify.txt`, `client-final.ts`, `tsc.out`.

## Reproduce
The scripts are **verbatim as-run** on the bench box (paths rooted at `~/signal-proof`), kept unedited so they match the numbers above. To re-run elsewhere, place `run-arm.sh`, `measure.py`, `contract-service.sh` and `fixture/` together, adjust `ROOT`, and provide an owned Claude agent CLI on `PATH` plus a local `tsc`:

```
./run-arm.sh treatment claude-sonnet-5-5
python3 measure.py runs/treatment-claude-sonnet-5-5
```

Refs #2.
