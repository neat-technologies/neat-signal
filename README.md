# NEAT Signal specification

This repository holds the proposed plan for **NEAT Signal**, an optional NEAT component for coordinating coding agents working on the same software system. Its central goal is to observe the live execution signals a runtime actually exposes, detect when an active agent's work is becoming wrong, and deliver an authorised correction **before that task finishes**. Success means the agent incorporates the correction and its subsequent action verifies the change; message delivery alone is insufficient.

**Status: specification only.** The files in this repository do not establish that any Signal feature exists or that a proposed NEAT or agent-runtime interface works. No implementation is included.

Start with the [spec overview](plan/README.md), then read the numbered chapters in order. The [implementation plan](plan/10-IMPLEMENTATION-PLAN.md) puts runtime observation and live-steering feasibility first and defines the **Live Thought-to-Steer** proof of concept. [Agent instructions](plan/AGENTS.md) record the proposed engineering rules for future work.

Signal may observe provider-exposed reasoning traces or summaries, visible output, tool events and usage reports only where the selected runtime actually supplies them and the user authorises capture. It cannot read hidden private reasoning or guarantee mid-token intervention. Active-turn steering, interrupt-and-continue, safe pre-tool checkpoints, next-turn queueing and observe-only operation are distinct capabilities that must be tested per runtime and session.

The chapters in [`plan/`](plan/README.md) began with `neat-signal-specs.zip` and incorporate the subsequent requirements directly. Proposed package names, CLI commands, APIs, and product claims remain subject to the audits and validation described there.
