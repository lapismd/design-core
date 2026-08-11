# storybook-addon-docs-mcp

Use this addon to expose Storybook documentation to Model Context Protocol (MCP) clients. The recommended standard input/output (`stdio`) transport reads project files without starting Storybook. You can also mount Hypertext Transfer Protocol (HTTP) routes in Storybook or run the standalone HTTP server.

The addon leaves Storybook's official `@storybook/addon-mcp` at `/mcp`. Its separate documentation endpoint is `/docs-mcp`.

## Prerequisites

Before you initialize the addon:

- Install Node.js and pnpm
- Run commands from the Storybook project root, which should contain `package.json`
- Create `.storybook/main.ts`, `.storybook/main.js`, `.storybook/main.mjs`, or `.storybook/main.cjs` if you want `init` to register the Storybook HTTP addon
- Let Cursor or VS Code create its MCP configuration file before `init` if you want that file updated automatically

The current initializer invokes pnpm for Storybook registration and writes pnpm-based commands into generated `stdio` client entries.

## Install and initialize

Install the addon in the Storybook project:

```sh
pnpm add -D storybook-addon-docs-mcp
```

Initialize the recommended `stdio` setup:

```sh
pnpm exec docs-mcp init --root . --transport stdio
```

Both `--root .` and `--transport stdio` are defaults, so this shorter command creates the same setup:

```sh
pnpm exec docs-mcp init
```

Validate the generated configuration and load the live catalog:

```sh
pnpm exec docs-mcp doctor --live
```

Reload the MCP client after initialization so it reads the updated project configuration. The client starts its own `stdio` process, so the recommended setup does not require a terminal or a reserved port.

Test discovery without connecting an MCP client:

```sh
pnpm exec docs-mcp search "searchable filter toolbar"
pnpm exec docs-mcp get exact-id-from-search
```

### Files changed by `init`

`init` makes the following idempotent changes:

| Target                          | Change                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `.storybook/docs-mcp.config.ts` | Creates the generic Svelte provider config when the file does not exist             |
| `package.json`                  | Adds `"docs:mcp": "docs-mcp stdio --config .storybook/docs-mcp.config.ts"`          |
| `.storybook/main.*`             | Uses `storybook add` to register the addon when a supported Storybook config exists |
| `.cursor/mcp.json`              | Adds the generated server under `mcpServers` when the file already exists           |
| `.mcp.json`                     | Adds the generated server under `mcpServers` when the file already exists           |
| `.vscode/mcp.json`              | Adds the generated server under `servers` when the file already exists              |

The initializer updates every supported client file that already exists. If none exists, it creates `.mcp.json` and adds the server there. Client files must contain valid JSON with Comments (JSONC). Existing comments, unrelated servers, and matching entries remain unchanged.

The default client name comes from the project package name. For example, `@acme/catalog` becomes `acme-catalog-docs`. A same-name entry with different settings causes an error. Choose another name or update the existing entry explicitly:

```sh
pnpm exec docs-mcp init --client-name acme-catalog-docs-local
```

`init` can register the HTTP addon only when `.storybook/main.*` exists. If you create the Storybook config later, rerun `init`. The recommended `stdio` transport works without Storybook registration.

### Initialize another project root

Run the installed binary from the target project and pass the same absolute root to `init`:

```sh
pnpm --dir /absolute/path/to/storybook_project exec docs-mcp init \
  --root /absolute/path/to/storybook_project
```

Use a custom config path when the project does not use `.storybook/docs-mcp.config.ts`:

```sh
pnpm exec docs-mcp init \
  --config config/docs-mcp.config.ts
```

The config path resolves from `--root`.

### Configure HTTP instead of `stdio`

HTTP setup requires a server process. `init` writes the client URL but does not start that server.

To use the standalone server on port `9011`, initialize the client entry:

```sh
pnpm exec docs-mcp init \
  --transport http \
  --port 9011 \
  --client-name acme-catalog-docs-http
```

Then keep the standalone server running in another terminal:

```sh
pnpm exec docs-mcp serve --port 9011
```

To use the Storybook-mounted endpoint, pass Storybook's public port during initialization and start Storybook:

```sh
pnpm exec docs-mcp init \
  --transport http \
  --port 6006 \
  --client-name acme-catalog-docs-http
pnpm storybook
```

Replace `pnpm storybook` with the project's Storybook start command. This example generates `http://localhost:6006/docs-mcp`. Use a different `--client-name` when retaining both `stdio` and HTTP entries.

### `init` option reference

| Option                               | Default                         | Purpose                                                            |
| ------------------------------------ | ------------------------------- | ------------------------------------------------------------------ |
| `--root path`                        | Current directory               | Select the project root                                            |
| `--config path`                      | `.storybook/docs-mcp.config.ts` | Select the provider config relative to the project root            |
| `--transport stdio\|http`            | `stdio`                         | Choose the generated MCP client transport                          |
| `--port number`                      | `9011`                          | Set the HTTP client URL port; it does not start a server           |
| `--client-name name`                 | Derived from `package.json`     | Set the key written to client configuration files                  |
| `--agent-docs`                       | Off                             | Generate marker-managed agent guidance after loading the catalog   |
| `--agent codex\|cursor\|claude\|all` | `codex`                         | Select managed guidance targets                                    |
| `--agent-docs-path path`             | Agent-specific path             | Write one managed guidance block to a path inside the project root |
| `--remove-agent-docs`                | Off                             | Remove only the selected managed guidance blocks                   |
| `--no-cache`                         | Off                             | Bypass the catalog cache while generating managed guidance         |
| `--json`                             | Off                             | Print machine-readable initialization results                      |

The generated config uses the generic Svelte provider:

```ts
import {
  createSvelteDocsProvider,
  defineDocsMcpConfig,
} from "storybook-addon-docs-mcp";

export default defineDocsMcpConfig({
  provider: createSvelteDocsProvider(),
  mcpPath: "/docs-mcp",
});
```

The default config path needs no extra Storybook options. If you selected a custom config path, replace the addon's generated string entry in the existing `addons` array with this object. Keep the other Storybook settings and addons:

```ts
const config = {
  addons: [
    {
      name: "storybook-addon-docs-mcp",
      options: {
        config: "config/docs-mcp.config.ts",
      },
    },
  ],
};

export default config;
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

Use these commands after initialization:

```sh
# Run the generated stdio package script
pnpm run docs:mcp

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
```

The `stdio` commands wait for JSON-RPC messages from an MCP client. Use `doctor`, `search`, or `get` for human-readable terminal checks.

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

Generate guidance for one agent:

```sh
pnpm exec docs-mcp init --agent-docs --agent codex
pnpm exec docs-mcp init --agent-docs --agent cursor
pnpm exec docs-mcp init --agent-docs --agent claude
```

Generate all three targets:

```sh
pnpm exec docs-mcp init --agent-docs --agent all
```

Write a single managed block to a custom project-relative path:

```sh
pnpm exec docs-mcp init \
  --agent-docs \
  --agent codex \
  --agent-docs-path docs/agents/docs-mcp.md
```

Combine `--agent-docs-path` with one specific `--agent` value. A custom path always targets one file.

Remove the default managed blocks while preserving surrounding content:

```sh
pnpm exec docs-mcp init --remove-agent-docs --agent all
```

Remove a managed block from a custom path:

```sh
pnpm exec docs-mcp init \
  --remove-agent-docs \
  --agent codex \
  --agent-docs-path docs/agents/docs-mcp.md
```

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
fixture with the owning workspace's installed `svelte-check` when supplied.
Identical prompt files never contain expected IDs.
Reports default to `.cache/docs-mcp/evals/`.
