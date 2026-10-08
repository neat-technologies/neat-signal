# 02 — Existing NEAT integration boundary

## Source observations (documentation, not a code audit)

**Official repository:** https://github.com/neat-technologies/neat  
**Official architecture:** https://github.com/neat-technologies/neat/blob/main/docs/architecture.md  
**Contracts:** https://github.com/neat-technologies/neat/blob/main/docs/contracts.md  
**Provenance:** https://github.com/neat-technologies/neat/blob/main/PROVENANCE.md  
**API reference:** https://github.com/neat-technologies/neat/blob/main/docs/api-reference.md

The repository documentation describes:

- A TypeScript monorepo with `packages/types`, `packages/core`, `packages/mcp`, and `packages/web`.
- Static source extraction using tree-sitter, a runtime OTel ingestion path, and a graph with file-level relationships.
- NEAT REST and MCP interfaces for dependencies, blast radius, policy checks, graph diffs, and related queries.
- Provenance categories including `EXTRACTED`, `OBSERVED`, `INFERRED`, `STALE`; the checked source also defines `FRONTIER`, which is not a settled dependency for impact traversal.

**Checked source, not runtime proof:** the local NEAT checkout at `2b90e405` contains `packages/types/src/constants.ts` and `edges.ts` with a `FRONTIER` provenance value in addition to the four settled/aging values above; `packages/core/src/api.ts` defines node, dependency, blast-radius and diff routes; and `packages/types/src/mcp-tools.ts` lists the MCP tools. These source observations do not verify a running endpoint, branch-aware query, tenant isolation or Signal integration. Re-audit the commit selected for implementation.

## Hard integration rules

1. Signal is a **new bounded context**, not a rewrite of NEAT core.
2. Reuse existing `@neat.is/types` schemas only after reading their source and tests. Extend schemas compatibly.
3. Prefer a **typed core query port** with an HTTP adapter initially; avoid importing the graph engine into the event service.
4. Do not write ephemeral events or every token into NEAT's durable architecture graph. Persist Signal events separately; store references to NEAT nodes and graph snapshots.
5. Treat repository/worktree revisions as first-class: the graph built from `main` is not automatically valid for Agent B's uncommitted branch.
6. Clearly distinguish graph-edge provenance from *agent-state evidence provenance* (new schema, separate enum).
7. Ensure NEAT works unchanged when Signal is not installed, connected, or enabled.
8. Before using a dependency or policy result to intervene, record the NEAT daemon/project, graph snapshot or extraction revision, node identity, edge provenance and confidence, and the target worktree's base commit plus dirty revision. Revalidate immediately before dispatch. If the graph cannot represent that scope, return `unsupported_scope` or a labelled approximation and stay in Observe/Assist.
9. The Live Reasoning Interface, provider event adapters, fast steering lane and verification journal are **new Signal work**. Existing NEAT graph and MCP/REST queries do not imply any live agent observation or steering capability.

## Proposed package layout (NOT an assertion about existing files)

```text
packages/
  signal/
    src/
      domain/         # schemas, identity, messages, versioning
      journal/        # SQLite journal + migrations
      transport/      # event bus, subscriptions, routing, replay
      registry/       # session discovery, leases, capabilities
      adapters/       # provider-specific process/session bridges
      lri/            # authorised live deltas + ephemeral projection
      state/          # agent state projection + evidence
      neat/           # typed NEAT graph query bridge
      intervene/      # detection, policy, steering orchestration
      control/        # bounded high-priority steering lane
      api/            # Signal HTTP and streaming endpoints
      cli/            # CLI commands (after command router audit)
      security/       # redaction, authz, policy enforcement
      tests/
  web/                # add an optional Signal surface via existing web
```

If existing repository conventions make that layout inappropriate, create an ADR before changing it. No circular dependency on `packages/core` internals.

## Graph query port (new interface)

```ts
interface NeatImpactPort {
  resolveFiles(scope: RepoScope, paths: string[]): Promise<ResolvedNode[]>;
  dependencies(scope: RepoScope, nodeIds: string[], depth: number): Promise<GraphEvidence[]>;
  blastRadius(scope: RepoScope, nodeIds: string[], depth: number): Promise<GraphEvidence[]>;
  policyFindings(scope: RepoScope, nodeIds: string[]): Promise<PolicyFinding[]>;
}
```

`RepoScope` includes repository identity, worktree identifier, base commit SHA, working-tree revision marker and timestamp. If NEAT's current API cannot represent a scope, the adapter must return `unsupported_scope` or a labeled approximation; **never silently query `main` and label the result as branch-accurate**.

## Required code audit before implementation

- [ ] Verify package manager, TypeScript target, test runner and monorepo conventions.
- [ ] Inspect NEAT HTTP routes and public type exports; record exact compatible endpoints.
- [ ] Inspect graph and policy query semantics, including edge direction and per-project scoping.
- [ ] Determine whether local watch can index uncommitted worktree edits independently.
- [ ] Check auth, daemon lifecycle, SSE/WebSocket support and storage persistence.
- [ ] Inspect `docs/contracts.md` and `CLAUDE.md` for invariants before modifying code.
- [ ] Add integration tests against real local NEAT before declaring any Signal↔NEAT capability supported.
- [ ] Compare graph extraction revision with a dirty fixture worktree and verify a stale graph cannot authorise an automatic steer.
- [ ] Record an ADR for any mismatch between this plan and the selected NEAT commit; do not invent a branch-aware query surface.

## Verification status of new product

As of this document's creation, **none of Signal's new components is asserted to exist**. All product diagrams and APIs in this pack are designs, not descriptions of shipped functionality.

## Proposed ADRs from the source review

- **ADR-SIG-001 — Graph scope for dirty worktrees.** The proposed `RepoScope` needs branch/base/dirty-revision accuracy, but the routes observed in `packages/core/src/api.ts` do not by themselves prove that per-worktree overlays exist. Decide whether to build an overlay, re-extract the worktree, or return `unsupported_scope`; automatic intervention must fail closed until a matching graph revision is verified.
- **ADR-SIG-002 — Provenance mapping.** Earlier four-state summaries omit `FRONTIER` present in the checked `@neat.is/types` source. Define how Signal displays it and exclude it from settled dependency proof, following NEAT's current traversal contract. Keep agent-observation provenance in a separate namespace.

These are proposed decisions, not assertions that the current checkout implements the bridge. Verify against the implementation commit before coding.
