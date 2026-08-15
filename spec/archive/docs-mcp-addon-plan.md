# Standalone Docs MCP addon plan

Historical, non-normative implementation plan. Current tooling requirements
live in [`spec/src/tooling.md`](../src/tooling.md).

Status: implemented; focused acceptance complete. Broad Storybook acceptance is
blocked by unrelated concurrent AI catalog changes recorded below.

## Phase 2: AI-oriented discovery and evaluation

Status: implemented; focused acceptance complete. Broad Storybook acceptance is
blocked by unrelated concurrent AI catalog changes recorded below.

This phase keeps the existing Storybook documentation tools compatible while
adding the discovery workflow and evaluation discipline described in ASTRYX's
AI documentation. The reusable addon remains provider-driven and framework
neutral.

### Discovery and retrieval

- [x] Extend catalog entries with authored keywords, parsed sections, related
      IDs, optional dense Markdown, project guidance, and curated artifacts.
- [x] Add one deterministic retrieval engine shared by MCP, CLI, HTTP
      manifests, and evaluation.
- [x] Rank exact names, authored keywords, typo-tolerant names, keyword
      proximity, descriptions, and section prose; normalize stopwords, stems,
      and provider synonyms; reject low-confidence noise.
- [x] Add additive MCP and CLI `search` and `get` interfaces with structured
      output, exact follow-up IDs, bounded retrieval, and section selection.
- [x] Include artifacts and retrieval metadata in llms output, manifests,
      cache invalidation, and doctor duplicate checks.
- [x] Seed only two curated UI blocks: the reviewable form workflow and the
      filterable-list toolbar. Do not publish a page template until a
      reference-quality full-page example exists.

### Managed guidance and evaluation

- [x] Add opt-in, marker-managed Codex, Cursor, and Claude project guidance
      without replacing surrounding repository instructions.
- [x] Add deterministic relevance fixtures and `docs-mcp eval` metrics for
      exact-name, synonym, typo, multi-concept, guide, block, ambiguity, and
      nonsense cases.
- [x] Add an opt-in external `eval-agent` runner with fresh consumer sandboxes,
      identical hidden-answer prompts, objective MCP/CLI logs, repeated trials,
      and reports beneath `.cache/docs-mcp/evals/`.
- [x] Verify provider compatibility, response budgets, MCP/CLI parity, managed
      block safety/idempotence, cache invalidation, dual stdio instances,
      standalone HTTP, alternate Storybook ports, static build, and package
      typecheck without updating visual baselines.

### Phase 2 defaults and boundaries

- Default search limit: 8; maximum: 20; bounded response budget: 12,000
  characters.
- Full prose is preserved for small entries. Large bounded responses expose the
  overview and stable section index; dense output is structural and never
  rewrites prose. Provider-authored dense content wins.
- Artifacts are explicitly registered by providers and are never inferred from
  component complexity.
- Deterministic relevance evaluation is routine CI work. External-model trials
  are opt-in and never required by normal checks.
- Implementation stays within `/Users/stevejuma/ui`, preserves the completed
  ASTRYX slice, and lands as package-local, path-scoped Jujutsu commits.

## Scope and boundaries

- [x] Keep `@storybook/addon-mcp` at `/mcp`.
- [x] Extract custom documentation behavior into
      `packages/storybook-addon-docs-mcp`.
- [x] Preserve the UI catalog's existing component, guide, props, llms, and
      manifest content through a project-specific provider.
- [x] Add a generic Svelte story/provider adapter for other repositories.
- [x] Prefer direct stdio access so multiple Storybooks need no port
      coordination.
- [x] Keep Storybook-mounted and standalone HTTP modes.
- [x] Limit implementation to `/Users/stevejuma/ui`; validate dev servers on
      ports 9109 and 9111 so the comparison workspace on 9009 is untouched.

## Implementation stages

1. [x] Package core: normalized provider contract, content-hash cache, Svelte
       props, Storybook v0 manifests, llms pages, and exports.
2. [x] Transports: direct stdio MCP and shared HTTP handler/server.
3. [x] Storybook host: mount with `experimental_devServer` and report the
       actual Storybook `options.port`, not Vite's internal 5173 default.
4. [x] CLI: `init`, `stdio`, `serve`, and `doctor`; prefer `DOCS_MCP_*` while
       retaining `UI_DOCS_*` aliases.
5. [x] Client setup: JSONC-preserving Cursor, root MCP, and VS Code merges;
       default to stdio; refuse conflicting same-name definitions.
6. [x] UI integration: shared `.storybook/docs-mcp.config.ts`,
       `pnpm ui:mcp:stdio`, existing `pnpm ui mcp` HTTP compatibility, and a stdio
       Cursor entry.
7. [x] Acceptance: focused package/unit tests, two concurrent stdio servers,
       standalone HTTP on 9111, Storybook on 9109, static Storybook checks, and
       broad repository checks without updating visual baselines. Unrelated
       broad-suite failures are recorded rather than folded into addon status.

## Risks and mitigations

- Storybook and Vite expose different ports. The addon mounts in Storybook's
  dev-server hook and logs only the hook's public port.
- Stdio stdout is protocol-only. CLI diagnostics go to stderr and transport
  tests parse every emitted stdout line as JSON-RPC.
- Generic story-to-component inference can be ambiguous. Explicit imports win;
  unsafe fallbacks produce doctor warnings.
- Client config files may contain comments or unrelated servers. Updates use
  JSONC edits, preserve existing content, and stop on name conflicts.
- Existing UI docs are layout-specific. That logic remains in the UI provider
  instead of leaking into the reusable addon.

## Verification record

- [x] Package discovery, retrieval, provider, init, agent-docs, evaluation,
      HTTP, and dual-stdio tests pass: 10 files and 20 tests.
- [x] Package typecheck and distributable Node build pass.
- [x] `docs-mcp doctor --live --json --no-cache` reports 90 components, 6
      documents, 2 curated blocks, and no issues.
- [x] The 8-case relevance fixture reports 0.8571 top-1 accuracy, 1.0 hit-at-5,
      0.9286 mean reciprocal rank, 1.0 no-result correctness, and full
      component, guide, and block coverage.
- [x] Two concurrent stdio processes initialize independently, expose the
      expected tools, answer tool calls, and emit JSON-RPC only on stdout.
- [x] Standalone HTTP on 9111 serves health, llms, search/get MCP calls, all 90
      components, and both curated blocks.
- [x] Storybook on 9109 advertises and serves `/docs-mcp` and llms URLs on
      9109; the official addon still serves `/mcp`; port 5173 is not listening.
- [x] Full unit suite passes: 104 files and 511 tests. Root `svelte-check`
      reports zero errors and zero warnings.
- [x] Static Storybook build passes.
- [ ] `pnpm checks` is blocked at formatting by concurrently edited AI chat
      source and story files outside this slice. A direct Storybook interaction
      run separately reports 40 failed tests and 1 failed suite from existing
      React-backed Visual Delta invalid-hook errors and concurrent AI story play
      failures.
- [ ] Visual comparison passes 194 existing baselines; its 64 failures are all
      unrelated, concurrently added `AI/Chat` stories without baselines. No
      snapshots were updated.
