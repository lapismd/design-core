# storybook-addon-docs-mcp

A provider-driven Storybook documentation companion with two transports:

- `stdio` for MCP clients. It reads source files directly and does not start or
  connect to Storybook.
- HTTP routes mounted on Storybook, or served by the standalone `serve`
  command.

It intentionally leaves Storybook's official `@storybook/addon-mcp` at `/mcp`.
The companion endpoint is `/docs-mcp`.

## Install

```sh
pnpm add -D storybook-addon-docs-mcp
pnpm exec docs-mcp init
```

`init` adds the addon through Storybook's CLI, creates
`.storybook/docs-mcp.config.ts`, adds a `docs:mcp` script, and merges a stdio
entry into detected Cursor, MCP, and VS Code client files. It preserves JSONC
comments and existing entries. A same-name entry with a different definition
is reported as a conflict instead of being overwritten.

The generated config uses the generic Svelte provider:

```ts
import {
  createSvelteDocsProvider,
  defineDocsMcpConfig,
} from "storybook-addon-docs-mcp";

export default defineDocsMcpConfig({
  provider: createSvelteDocsProvider(),
});
```

The scanner follows explicit local `.svelte` imports used by story metadata,
then falls back only when there is one unambiguous colocated component. Custom
providers can return normalized components, documents, and explicitly curated
blocks/templates for any framework or repository layout.

Catalog entries may author `keywords`, `relatedIds`, parsed `sections`, and
`denseMarkdown`. Omitted sections are derived deterministically from Markdown
headings. Project providers may also publish setup steps, reading order, and
high-value guidance rules.

## Commands

```sh
# Preferred MCP transport; also the default command
pnpm exec docs-mcp stdio --config .storybook/docs-mcp.config.ts

# Standalone HTTP + llms routes
pnpm exec docs-mcp serve --port 9011

# Validate config, provider output, IDs, and source files
pnpm exec docs-mcp doctor --live

# Intent-based discovery, then exact retrieval
pnpm exec docs-mcp search "review AI form changes" --kind block
pnpm exec docs-mcp get block-reviewable-form-workflow
pnpm exec docs-mcp get forms-form-review --section usage

# Generate config/client wiring; HTTP is opt-in
pnpm exec docs-mcp init --transport http --port 9011

# Opt in to marker-managed project guidance (off by default)
pnpm exec docs-mcp init --agent-docs --agent codex
pnpm exec docs-mcp init --remove-agent-docs --agent codex
```

The MCP exposes the same `search` and `get` operations with output schemas and
matching `structuredContent`. `get` defaults to a 12,000-character bounded
response: complete small documents are returned directly, while large
documents return an overview and stable section index. `--format full` returns
all authored prose; `--format dense` uses provider-authored dense Markdown or a
structural fallback without rewriting prose.

Run one stdio process per Storybook project. Separate `--root`, `--config`, and
`--client-name` values make multiple catalogs independent without reserving
ports:

```sh
pnpm --dir /work/design-system exec docs-mcp stdio \
  --config /work/design-system/.storybook/docs-mcp.config.ts
```

## Storybook and HTTP routes

Register `storybook-addon-docs-mcp` as a Storybook addon. Its Storybook 10
`experimental_devServer` hook mounts the docs handler and uses Storybook's
actual public port when logging and generating links.

| Route                                | Purpose                            |
| ------------------------------------ | ---------------------------------- |
| `/docs-mcp`                          | Docs MCP HTTP endpoint             |
| `/llms.txt`                          | Markdown index                     |
| `/llms.md`                           | Browser-readable HTML index        |
| `/llms/<group>/<slug>.{md,txt}`      | Component or document page         |
| `/ui-docs/manifests/components.json` | Debug component manifest           |
| `/ui-docs/manifests/docs.json`       | Debug standalone-docs manifest     |
| `/ui-docs/manifests/artifacts.json`  | Curated block/template manifest    |
| `/mcp`                               | Standalone HTTP compatibility only |

The Storybook mount never claims `/mcp`; that remains owned by
`@storybook/addon-mcp`.

## Configuration and environment

`DOCS_MCP_ROOT`, `DOCS_MCP_CONFIG`, `DOCS_MCP_HOST`, `DOCS_MCP_PORT`,
`DOCS_MCP_BASE_URL`, and `DOCS_MCP_CACHE` configure the CLI. Existing
`UI_DOCS_*` names remain supported as lower-precedence aliases.

Package cache defaults to `.cache/docs-mcp`. Set `DOCS_MCP_CACHE=0` or use
`--no-cache` to bypass it.

Search defaults to 8 results and never exceeds 20. Configure provider-specific
synonyms and retrieval budgets without changing provider output:

```ts
export default defineDocsMcpConfig({
  provider,
  search: {
    synonyms: {
      picker: ["select", "dropdown", "combobox"],
    },
    defaultLimit: 8,
    maxLimit: 20,
  },
  retrieval: { maxChars: 12_000 },
});
```

## Managed agent guidance

`init --agent-docs` writes only inside
`<!-- DOCS-MCP:START/END -->` markers. Existing content in `AGENTS.md`,
`.cursor/rules/docs-mcp.mdc`, or `CLAUDE.md` is preserved. Use
`--agent codex|cursor|claude|all`; `--agent-docs-path` overrides the target but
is rejected if it escapes the project root, including through symlinks.
Re-running refreshes the managed block. `doctor` reports stale or malformed
managed guidance.

## Evaluation

Deterministic relevance cases are ordinary JSON and require no model:

```sh
pnpm exec docs-mcp eval --cases eval/relevance-cases.json --json
```

Each case provides `query`, `expectedIds`, optional `maxRank`,
`forbiddenIds`, and `kinds`. Reports include top-1 accuracy, hit-at-k, mean
reciprocal rank, no-result correctness, and per-kind coverage.

Real-agent comparison is explicitly opt-in:

```sh
pnpm exec docs-mcp eval-agent \
  --cases eval/relevance-cases.json \
  --runner 'my-agent --cwd {cwd} --prompt {promptFile}' \
  --repetitions 5
```

The harness creates a fresh sandbox for `bare`, `mcp`, and `mcp-agent-docs`
conditions, runs every prompt in a new process, logs Docs MCP CLI and stdio tool
calls, checks returned IDs/props/imports, and typechecks an isolated Svelte
fixture when supplied. Identical prompt files never contain expected IDs.
Reports default to `.cache/docs-mcp/evals/`.
