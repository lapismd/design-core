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

| Path                            | Purpose                          |
| ------------------------------- | -------------------------------- |
| `@stevejuma/ui/shadcn/<family>` | shadcn family barrel             |
| `@stevejuma/ui/forms`           | structured forms barrel          |
| `@stevejuma/ui/forms/core`      | form builders, types, registry   |
| `@stevejuma/ui/filter`          | search and filter-query barrel   |
| `@stevejuma/ui/ai`              | reusable AI presentation barrel  |
| `@stevejuma/ui/styles.css`      | package styles entry             |

- `shared/shadcn` contains generated controls and must not depend on higher
  layers.
- `shared/filter` may compose shadcn controls.
- `shared/forms` may compose shadcn and filter primitives.
- `shared/ai` contains reusable, host-controlled presentation components.
- Public components take typed props and callbacks rather than importing host
  routers, persistence, or application context.

Story titles stay under `Shadcn/...`, `UI Forms/...`, `Filter/...`, and
`AI/...`. Stable story ids are part of the committed visual-baseline contract.

## Storybook catalog

Stack: Storybook 10, `@storybook/svelte-vite`, Vite 6, and Svelte 5. The
catalog runs on port 9009. Use the package scripts because they enable polling
and restart the manager when Visual Delta source changes.

### Host file map

| File | Role |
| ---- | ---- |
| [`.storybook/main.ts`](./.storybook/main.ts) | Story globs, addons, static baseline mount, aliases, Docs MCP |
| [`.storybook/preview.ts`](./.storybook/preview.ts) | Global tags, theme, light/dark, a11y, docs, layout |
| [`.storybook/manager.ts`](./.storybook/manager.ts) | Tag badges and catalog toolbar |
| [`.storybook/visual-delta-preset.ts`](./.storybook/visual-delta-preset.ts) | Local addon manager, preview, middleware, and Vite wiring |
| [`.storybook/ui-docs-middleware.ts`](./.storybook/ui-docs-middleware.ts) | Docs MCP and `llms.txt` routes |
| [`.storybook/vitest.setup.ts`](./.storybook/vitest.setup.ts) | Storybook Vitest annotations |

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

| Project | Coverage |
| ------- | -------- |
| `unit` | Node unit specs in `src/` and `scripts/ui-generator/` |
| `visual-delta` | jsdom and React Testing Library specs for the addon |
| `storybook` | browser story tests through `@storybook/addon-vitest` |

## Visual Delta setup

Visual Delta compares the live story canvas with committed Playwright PNGs and
provides overlay, heatmap, create/update, and review controls. The addon API and
host-integration details live in
[`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md).

The boundary is:

| Addon owns | This host owns |
| ---------- | -------------- |
| Panel, overlay, testing UI, run events | Playwright suite and committed PNGs |
| Dev middleware and baseline CSF injection | Baseline-write and tag CLIs |
| Generic shared and workspace snapshot mapping | Host story selection and sidecars |
| Portable Playwright helpers | Approval gates and compare-only defaults |

Committed baselines are mounted at `/visual-baselines` from
`tests/visual/storybook.spec.ts-snapshots`. Current host mappings are:

| Catalog title | Source heuristic | Snapshot directory |
| ------------- | ---------------- | ------------------ |
| `Shadcn/...` | `src/shared/shadcn/` | `shadcn/<family>` |
| `UI Forms/...` | `src/shared/forms/<family>/` | `forms/<family>` |

The reusable addon also supports `packages/workspace/src/lib/` mapped to
`workspace/` for consumer catalogs.

The committed filename suffix is `-chromium-darwin`. A story tagged
`skip-visual` is excluded. If a matching PNG exists, the Vite plugin injects
`parameters.visualDelta` with a canvas-aligned baseline, 50% opacity, and a
0.1% pass threshold.

Never update baselines unless a human explicitly requests it. Ordinary
`pnpm test:visual` is compare-only and Playwright is configured with
`updateSnapshots: "none"`.

### Review tags

| Tag | Meaning |
| --- | ------- |
| `skip-test` | Excluded from Storybook Vitest with a documented reason |
| `skip-visual` | Excluded from the Playwright visual suite |
| `upstream-example` | Generated from upstream documentation |
| `visual-state` | Explicit visual-state story |
| `visual-pending` | Baseline awaits review |
| `visual-approved` | Baseline accepted |
| `visual-ready` | Baseline ready for human review |
| `visual-failed` | Review rejected or comparison failed |

Review tags are mutually exclusive. Adding `skip-visual` clears review state.
The Visual Delta panel and `pnpm ui visual:tag` both patch colocated CSF.

### Baseline write gates

| Gate | Effect |
| ---- | ------ |
| `VISUAL_UPDATE_APPROVED=1` or `--approved` | Required to write baselines |
| `--create-only` | Creates missing PNGs without replacing existing files |
| `--allow-dirty` | Skips the writer's clean-tree check |
| `--skip-build` | Reuses a complete, fresh static Storybook when possible |
| `--rebuild` | Forces a static Storybook rebuild |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=0` | Compare-only |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=1` | Enables writes inside gated commands |

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
pnpm test:unit
pnpm test:storybook
pnpm test:storybook:watch
pnpm test:visual-delta-panel
pnpm test:visual
pnpm test:visual:report
pnpm checks

# Explicitly approved baseline writes
VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>
VISUAL_UPDATE_APPROVED=1 pnpm test:visual-delta-panel:update

# Agent and docs CLI
pnpm ui guide [topic]
pnpm ui components [name]
pnpm ui components --layer shadcn|forms|filter|ai
pnpm ui mcp
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

With Storybook running on port 9009:

| Surface | URL | Purpose |
| ------- | --- | ------- |
| Storybook MCP | `http://localhost:9009/mcp` | Story instructions, previews, story tests |
| Docs MCP | `http://localhost:9009/docs-mcp` | Component and story documentation |
| LLM index | `http://localhost:9009/llms.txt` | Markdown catalog index |
| HTML index | `http://localhost:9009/llms.md` | Browser-readable catalog index |

Component pages use `/llms/<layer>/<id>.txt`; guide pages use
`/llms/guide/<topic>.txt`. When Storybook is down, `pnpm ui mcp` serves the
Docs MCP and LLM routes on `http://127.0.0.1:9011`.

## Generator and CSS

`pnpm ui:add` runs the transactional native-CSS conversion pipeline in a
detached worktree: pinned shadcn ingestion, Tailwind expansion, scoped native
CSS, reference/candidate parity, then one patch. Do not run the upstream
shadcn CLI directly against this package.

All retained source CSS follows [`styles.md`](./styles.md): package tokens,
native selectors, and no Tailwind utility classes in component sources.

## Further reading

| Resource | Use |
| -------- | --- |
| [`AGENTS.md`](./AGENTS.md) | Primary agent workflow |
| `pnpm ui guide layers` | Layer selection and dependency boundaries |
| `pnpm ui guide testing` | Verification sequence |
| [`COMPONENT_AUDIT.md`](./COMPONENT_AUDIT.md) | Retained component inventory |
| [`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md) | Addon API and integration |
| [`packages/storybook-addon-visual-delta/VENDOR.md`](./packages/storybook-addon-visual-delta/VENDOR.md) | Addon provenance and boundary |
