# Standalone Docs MCP addon plan

Status: implemented; focused acceptance complete. Broad Storybook acceptance is
blocked by unrelated concurrent AI catalog changes recorded below.

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

- [x] Original 7 Docs MCP tests pass after extraction.
- [x] Package provider, init, HTTP, and dual-stdio tests pass.
- [x] Package typecheck and distributable Node build pass.
- [x] `docs-mcp doctor --live --json` reports 70 components, 6 documents, and
      no issues.
- [x] Two concurrent stdio processes initialize independently, expose the
      expected tools, answer tool calls, and emit JSON-RPC only on stdout.
- [x] Standalone HTTP on 9111 serves health, llms, and all 70 components.
- [x] Storybook on 9109 advertises and serves `/docs-mcp` and llms URLs on
      9109; the official addon still serves `/mcp`; port 5173 is not listening.
- [x] Full unit suite passes: 97 files and 494 tests.
- [x] Static Storybook build passes, as do the 35 Visual Delta panel tests.
- [ ] `pnpm checks` reaches the Storybook suite but is blocked by 42 unrelated
      failures: existing React-backed Visual Delta stories hit duplicate React
      invalid-hook errors, while concurrently added AI chat stories have play
      failures.
- [ ] Visual comparison passes 194 existing baselines; its 28 failures are all
      unrelated, concurrently added `AI/Chat` stories without baselines. No
      snapshots were updated.
