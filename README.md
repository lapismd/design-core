# `@stevejuma/ui`

Private Svelte 5 UI package with a Storybook 10 catalog, Storybook Vitest,
local Playwright visual regression, and the workspace Visual Delta addon.

This README is the human-facing package map and command reference. Agent
conventions are available offline through `pnpm ui guide` and in
[`AGENTS.md`](./AGENTS.md). Styling rules live in [`styles.md`](./styles.md).

## Archived product surfaces

The former Apps and Tasks product work is preserved in the jj workspace named
`apps-tasks-archive` at `/Users/stevejuma/ui-apps-tasks-archive`. That workspace
retains the product source, specifications, reference evidence, authentication
state, and local capture artifacts so this repository can focus on reusable UI.

## Layout

```text
src/
  lib/utils.ts
  styles.css, theme.css, storybook.css
  shared/
    shadcn/<family>/     # generated families + colocated stories
    forms/<family>/      # structured form primitives + stories
    forms/core/          # builders, types, registry (non-visual)
    filter/              # search chrome + filter-query language
    ai/                  # reusable AI presentation primitives
    shell/               # bounded app chrome + sidebar controller
    workspace/           # full workspace framework
  storybook/             # catalog-only helpers
tests/
  visual/                # Playwright suite + committed snapshots
packages/
  storybook-addon-visual-delta/   # reusable Visual Delta addon
.storybook/              # Storybook host configuration
scripts/
  storybook-run.mjs      # polling/restart-aware Storybook entry
  ui-generator/          # UI CLI, baseline tooling, Docs MCP
```

## Imports and layer boundaries

| Path                                 | Purpose                         |
| ------------------------------------ | ------------------------------- |
| `@stevejuma/ui/shadcn/<family>`      | shadcn family barrel            |
| `@stevejuma/ui/forms`                | structured forms barrel         |
| `@stevejuma/ui/forms/core`           | form builders, types, registry  |
| `@stevejuma/ui/filter`               | search and filter-query barrel  |
| `@stevejuma/ui/ai`                   | reusable AI presentation barrel |
| `@stevejuma/ui/ai/chat`              | stable AI Chat primitives       |
| `@stevejuma/ui/ai/chat/experimental` | experimental AI Chat primitives |
| `@stevejuma/ui/shell`                | bounded structural app shell    |
| `@stevejuma/ui/workspace`            | full workspace framework        |
| `@stevejuma/ui/styles.css`           | package styles entry            |

- `shared/shadcn` contains generated controls and must not depend on higher
  layers.
- `shared/filter` may compose shadcn controls.
- `shared/forms` may compose shadcn and filter primitives.
- `shared/ai` contains reusable, host-controlled presentation components.
- `shared/shell` owns bounded application geometry, fixed chrome, shadcn
  Scroll Areas, independent collapsible/closeable/resizable sidebar state, and
  optional same-side nesting with collapsed/closed edge and delayed toggle
  previews, plus injected sidebar-layout persistence with a default
  localStorage adapter. Its single compound composition resolves desktop or
  mobile presentation from the bounded root width; mobile uses transient
  left/main/right stages while retaining desktop layout state. Auto mode is
  the default. Constrained desktop protects the main body and moves
  lower-priority sidebars into transient overlays without mutating their saved
  layout. Body regions
  support consumer-controlled left or right sidebars such as a Markdown table
  of contents, with targeted toggles fixed to the matching body corner.
  Consumer content, navigation selection, non-shell controls, and non-layout
  persistence stay outside the layer.
- `shared/workspace` owns the full tab, split, view, plugin, and persistence
  framework.
- Public components take typed props and callbacks rather than importing host
  routers, persistence, or application context.

Story titles stay under `Shadcn/...`, `UI Forms/...`, `Filter/...`, and
`AI/...`, with structural and workspace surfaces under `Shell/...` and
`Workspace/...`. Stable story ids are part of the committed visual-baseline
contract.

## Storybook catalog

Stack: Storybook 10, `@storybook/svelte-vite`, Vite 6, and Svelte 5. The
catalog runs on port 9009 by default. Use the package scripts because they
enable polling, load checkout-local port settings, and restart the manager when
Visual Delta source changes.

### Parallel workspaces and ports

Do not edit tracked Storybook or Playwright configuration to give a jj
workspace a different port. Each additional workspace should copy the example
to the ignored checkout-local file and choose an unused base port:

```bash
cp .env.storybook.local.example .env.storybook.local
```

```dotenv
STORYBOOK_PORT=9309
```

The package scripts automatically load `.env.storybook.local`. An explicit
shell variable still takes precedence for a one-off run:

```bash
STORYBOOK_PORT=9409 pnpm storybook
```

Setting only `STORYBOOK_PORT` allocates the related lanes from the same base:

| Lane                         | Derived port |
| ---------------------------- | ------------ |
| Storybook and AI acceptance  | base         |
| Visual Delta static server   | base + 1     |
| Visual Delta panel static    | base + 3     |
| Visual Delta panel Storybook | base + 4     |
| Visual Delta panel visual    | base + 5     |
| Spare debug/cleanup port     | base + 90    |
| Workspace pointer Storybook  | base + 200   |
| Workspace pointer visual     | base + 201   |

`pnpm storybook`, `storybook:stop`, `storybook:restart`, the browser suites,
the Visual Delta CLI, and the visual audit all use the checkout-local file.
This keeps start, test, and cleanup commands scoped to the same workspace.
The dev command owns one supervisor per checkout and base port: a duplicate
`pnpm storybook` reports the existing process and exits successfully.
`pnpm storybook:restart` explicitly replaces that owner, while
`pnpm storybook:stop` terminates its descendants and matching legacy
supervisors before cleaning up checkout-owned listeners. Preview addon edits
use Vite HMR; Visual Delta manager, shared, and node edits are debounced into
one server restart and the runtime's single manager reload.
`VISUAL_SERVER_PORT`, `STORYBOOK_EXTRA_PORTS`, `AI_CHAT_STORYBOOK_URL`, and the
suite-specific port variables remain available as advanced overrides, but a
normal secondary workspace only needs `STORYBOOK_PORT`.

### Host file map

| File                                                                       | Role                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`.storybook/main.ts`](./.storybook/main.ts)                               | Story globs, addons, static baseline mount, aliases, Docs MCP |
| [`.storybook/preview.ts`](./.storybook/preview.ts)                         | Global tags, theme, light/dark, a11y, docs, layout            |
| [`.storybook/manager.ts`](./.storybook/manager.ts)                         | Tag badges and catalog toolbar                                |
| [`.storybook/visual-delta-preset.ts`](./.storybook/visual-delta-preset.ts) | Local addon manager, preview, middleware, and Vite wiring     |
| [`.storybook/ui-docs-middleware.ts`](./.storybook/ui-docs-middleware.ts)   | Docs MCP and `llms.txt` routes                                |
| [`.storybook/vitest.setup.ts`](./.storybook/vitest.setup.ts)               | Storybook Vitest annotations                                  |

Registered addons:

- `@storybook/addon-docs`
- `@storybook/addon-a11y`
- `@storybook/addon-svelte-csf`
- `@storybook/addon-vitest`
- `@storybook/addon-mcp`
- `@storybook/addon-themes`
- `storybook-addon-tag-badges`
- the local Visual Delta preset

The preview applies the `autodocs` and `test` tags, uses
`parameters.a11y.test: "error"`, and owns light/dark mode through the
`colorMode` global. The backgrounds addon is disabled because package tokens
own surfaces.

### Storybook projects

[`vitest.config.ts`](./vitest.config.ts) defines:

| Project        | Coverage                                              |
| -------------- | ----------------------------------------------------- |
| `unit`         | Node unit specs in `src/` and `scripts/ui-generator/` |
| `visual-delta` | jsdom and React Testing Library specs for the addon   |
| `storybook`    | browser story tests through `@storybook/addon-vitest` |

## Visual Delta setup

Visual Delta compares the live story canvas with committed Playwright PNGs and
provides overlay, heatmap, create/update, and review controls. The addon API and
host-integration details live in
[`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md).
The normative behavior and acceptance criteria live in the
[`Visual Delta system specification`](./packages/storybook-addon-visual-delta/spec/src/index.md).

The boundary is:

| Addon owns                                    | This host owns                           |
| --------------------------------------------- | ---------------------------------------- |
| Panel, overlay, testing UI, run events        | Playwright suite and committed PNGs      |
| Dev middleware and baseline CSF injection     | Baseline-write and tag CLIs              |
| Generic shared and workspace snapshot mapping | Host story selection and sidecars        |
| Portable Playwright helpers                   | Approval gates and compare-only defaults |

Committed baselines are mounted at `/visual-baselines` from
`tests/visual/storybook.spec.ts-snapshots`. Current host mappings are:

| Catalog title  | Source heuristic             | Snapshot directory |
| -------------- | ---------------------------- | ------------------ |
| `Shadcn/...`   | `src/shared/shadcn/`         | `shadcn/<family>`  |
| `UI Forms/...` | `src/shared/forms/<family>/` | `forms/<family>`   |

The reusable addon also supports `packages/workspace/src/lib/` mapped to
`workspace/` for consumer catalogs.

The committed filename suffix is `-chromium-darwin`. A story tagged
`skip-visual` is excluded. If a matching PNG exists, the Vite plugin injects
`parameters.visualDelta` with a canvas-aligned baseline, 50% opacity, and a
0.1% pass threshold.

Never update baselines unless a human explicitly requests it. Ordinary
`pnpm test:visual` is compare-only and Playwright is configured with
`updateSnapshots: "none"`.

`pnpm test:visual` always runs the complete suite and seeds the ignored local
affected cache. `pnpm test:visual:affected` uses Storybook's generated
dependency stats to skip unchanged stories, while conservatively falling back
to all stories for global-risk or unresolved changes. Inspect a decision
without capturing with
`pnpm visual-delta test --affected --dry-run --explain`.

### Review tags

| Tag                | Meaning                                                 |
| ------------------ | ------------------------------------------------------- |
| `skip-test`        | Excluded from Storybook Vitest with a documented reason |
| `skip-visual`      | Excluded from the Playwright visual suite               |
| `upstream-example` | Generated from upstream documentation                   |
| `visual-state`     | Explicit visual-state story                             |
| `visual-pending`   | Baseline awaits review                                  |
| `visual-approved`  | Baseline accepted                                       |
| `visual-ready`     | Baseline ready for human review                         |
| `visual-failed`    | Review rejected or comparison failed                    |

Review tags are mutually exclusive and independent of `skip-visual`.
Skip/include preserves the current review state while making the story
ineligible/eligible for comparison. The Visual Delta panel and
`pnpm ui visual:tag` both patch colocated CSF.
Each baseline accordion has a kebab for History, exact-story Update baseline,
and Delete screenshot. Delete removes the matching CSF image/interaction,
invalidates its comparison evidence, and deletes only that PNG and its derived
local diff artifacts; review state is unchanged.

### Baseline write gates

| Gate                                       | Effect                                                  |
| ------------------------------------------ | ------------------------------------------------------- |
| `VISUAL_UPDATE_APPROVED=1` or `--approved` | Required to write baselines                             |
| `--create-only`                            | Creates missing PNGs without replacing existing files   |
| `--allow-dirty`                            | Skips the writer's clean-tree check                     |
| `--skip-build`                             | Reuses a complete, fresh static Storybook when possible |
| `--rebuild`                                | Forces a static Storybook rebuild                       |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=0`            | Compare-only                                            |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=1`            | Enables writes inside gated commands                    |

The CLI rejects broad `--component *` and `--component all` updates.

## Commands

```text
# Catalog
pnpm storybook
pnpm storybook:ui
pnpm storybook:stop
pnpm storybook:restart
pnpm build-storybook
pnpm storybook:check

# Verification
pnpm visual-delta:spec:check
pnpm test:unit
pnpm test:storybook
pnpm test:storybook:watch
pnpm test:visual-delta-panel
pnpm test:visual
pnpm test:visual:affected
pnpm test:visual:report
pnpm checks

# Canonical Visual Delta specification
pnpm visual-delta:spec:build
pnpm visual-delta:spec:serve

# Explicitly approved baseline writes
VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>
VISUAL_UPDATE_APPROVED=1 pnpm test:visual-delta-panel:update

# Agent and docs CLI
pnpm ui guide [topic]
pnpm ui components [name]
pnpm ui components --layer shadcn|forms|filter|ai
pnpm ui:mcp:stdio
pnpm ui mcp
pnpm docs-mcp search "<intent>"
pnpm docs-mcp get <exact-id> [--section <id>]
pnpm docs-mcp eval --cases packages/storybook-addon-docs-mcp/eval/ui-relevance-cases.json
pnpm ui visual:tag skip|include --component <name>
pnpm ui visual:tag review --status ready --component <name>

# Generator
pnpm ui:doctor
pnpm ui:inspect <name>
pnpm ui:add <name> [--overwrite] [--dry-run]
pnpm ui:add:batch <a|b|c|d>
```

Use `--json` with `pnpm ui guide` and `pnpm ui components` for
machine-readable output. Install Chromium once with
`pnpm exec playwright install chromium`.

## MCP and `llms.txt`

The preferred docs transport is stdio because each project gets its own
process, so multiple Storybooks do not need unique MCP ports:

```sh
pnpm ui:mcp:stdio
```

The Cursor entry in `.cursor/mcp.json` uses this command. The standalone
`storybook-addon-docs-mcp` package also provides `search` → `get` discovery,
`init`, `stdio`, `serve`, `doctor`, deterministic `eval`, and opt-in
`eval-agent`; see its
[`README.md`](./packages/storybook-addon-docs-mcp/README.md).

Use `pnpm docs-mcp search "<intent>"` to rank components, guides, and curated
blocks, then `pnpm docs-mcp get <exact-id>` for bounded documentation. The same
tools and structured results are available through stdio and HTTP MCP.

With Storybook running on its default port 9009, HTTP remains available. In a
secondary workspace, replace 9009 with that checkout's `STORYBOOK_PORT`:

| Surface       | URL                              | Purpose                                   |
| ------------- | -------------------------------- | ----------------------------------------- |
| Storybook MCP | `http://localhost:9009/mcp`      | Story instructions, previews, story tests |
| Docs MCP      | `http://localhost:9009/docs-mcp` | Component and story documentation         |
| LLM index     | `http://localhost:9009/llms.txt` | Markdown catalog index                    |
| HTML index    | `http://localhost:9009/llms.md`  | Browser-readable catalog index            |

Component pages use `/llms/<layer>/<id>.txt`; guide pages use
`/llms/guide/<topic>.txt`. When Storybook is down, `pnpm ui mcp` serves the
Docs MCP and LLM routes on `http://127.0.0.1:9011`. The Storybook mount uses
the public Storybook server port; Vite's internal 5173 default is not
advertised.

## Generator and CSS

`pnpm ui:add` runs the transactional native-CSS conversion pipeline in a
detached worktree: pinned shadcn ingestion, Tailwind expansion, scoped native
CSS, reference/candidate parity, then one patch. Do not run the upstream
shadcn CLI directly against this package.

All retained source CSS follows [`styles.md`](./styles.md): package tokens,
native selectors, and no Tailwind utility classes in component sources.

## Further reading

| Resource                                                                                                               | Use                                       |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [`AGENTS.md`](./AGENTS.md)                                                                                             | Primary agent workflow                    |
| `pnpm ui guide layers`                                                                                                 | Layer selection and dependency boundaries |
| `pnpm ui guide testing`                                                                                                | Verification sequence                     |
| [`COMPONENT_AUDIT.md`](./COMPONENT_AUDIT.md)                                                                           | Retained component inventory              |
| [`packages/storybook-addon-visual-delta/spec/src/index.md`](./packages/storybook-addon-visual-delta/spec/src/index.md) | Normative Visual Delta system contract    |
| [`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md)                 | Addon API and integration                 |
