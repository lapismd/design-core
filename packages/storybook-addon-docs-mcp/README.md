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
providers can return normalized components and documents for any framework or
repository layout.

## Commands

```sh
# Preferred MCP transport; also the default command
pnpm exec docs-mcp stdio --config .storybook/docs-mcp.config.ts

# Standalone HTTP + llms routes
pnpm exec docs-mcp serve --port 9011

# Validate config, provider output, IDs, and source files
pnpm exec docs-mcp doctor --live

# Generate config/client wiring; HTTP is opt-in
pnpm exec docs-mcp init --transport http --port 9011
```

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
| `/mcp`                               | Standalone HTTP compatibility only |

The Storybook mount never claims `/mcp`; that remains owned by
`@storybook/addon-mcp`.

## Configuration and environment

`DOCS_MCP_ROOT`, `DOCS_MCP_CONFIG`, `DOCS_MCP_HOST`, `DOCS_MCP_PORT`,
`DOCS_MCP_BASE_URL`, and `DOCS_MCP_CACHE` configure the CLI. Existing
`UI_DOCS_*` names remain supported as lower-precedence aliases.

Package cache defaults to `.cache/docs-mcp`. Set `DOCS_MCP_CACHE=0` or use
`--no-cache` to bypass it.
