# `@stevejuma/ui`

Private Svelte 5 UI package with Storybook catalog, Storybook Vitest, and local
Playwright visual regression.

## Layout

```text
src/
  lib/utils.ts
  styles.css, theme.css, storybook.css
  shared/
    shadcn/<family>/     # registry filenames + colocated stories
    forms/<family>/      # kebab-case families + colocated stories
    forms/core/          # builders, types, registry (non-visual)
  apps/
    cv/                  # reserved for CV domain UI
    beancount/           # reserved for beancount domain UI
tests/
  visual/                # Playwright visual suite + committed snapshots
packages/
  tasks/                 # white-label task-app reference contracts + capture harness
```

## Imports

| Path                            | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `@stevejuma/ui/shadcn/<family>` | shadcn family barrel                      |
| `@stevejuma/ui/forms`           | forms barrel                              |
| `@stevejuma/ui/forms/core`      | form builders / types / registry          |
| `@stevejuma/ui/apps/cv`         | CV app barrel (placeholder)               |
| `@stevejuma/ui/apps/beancount`  | Beancount app barrel (placeholder)        |
| `@stevejuma/tasks`              | task-app contracts and synthetic fixtures |
| `@stevejuma/tasks/theme.css`    | scoped Tasks companion theme              |
| `@stevejuma/ui/styles.css`      | package styles entry                      |

Story titles stay `Shadcn/...` and `UI Forms/...` (stable story ids for visual
baselines). App stories use `Apps/CV/...` and `Apps/Beancount/...`.

## Dependency rules

- `shared/shadcn` must not import forms or apps.
- `shared/forms` may import shadcn; must not import apps.
- `apps/*` may import shared; must not import sibling apps.
- App components take props/callbacks — no app routers or host app context.
- `packages/tasks` is a reference/spec package. It may describe shared primitive
  composition but must not copy observed product source, brand, or account data.

## Commands

```text
pnpm storybook              # UI + Docs MCP/llms on :9009; restarts on Visual Delta src edits
pnpm storybook:ui           # same server entry (UI-focused workflow)
pnpm storybook:restart      # kill + restart Storybook on :9009
pnpm storybook:check        # story tests + build + visual compare
pnpm test:unit              # node unit
pnpm test:storybook         # headless story Vitest once
pnpm test:storybook:watch   # story Vitest watch
pnpm test:visual            # screenshot compare (never writes baselines)
pnpm test:visual:update --component <name>  # guarded baseline update
pnpm test:visual:report     # open Playwright HTML report
pnpm ui                     # CLI entry (guide | components | mcp | …)
pnpm ui guide [topic]       # agent/human conventions (--json for agents)
pnpm ui:guide [topic]       # alias for ui guide
pnpm ui components [name]   # list/show catalog usage + examples (all layers)
pnpm ui:components [name]   # alias for ui components
pnpm ui components --layer forms
pnpm --dir packages/tasks reference:verify
pnpm ui mcp                 # standalone Docs MCP + llms on :9010 (Storybook off)
pnpm ui:mcp                 # alias for ui mcp
pnpm ui:doctor              # generator environment checks
pnpm ui:inspect <name>      # support tier + candidates (no writes)
pnpm ui:add <name> [--overwrite] [--dry-run]
pnpm ui:add:batch <a|b|c|d> # convert an allowlisted complexity batch
pnpm checks                 # fmt + svelte-check + unit + storybook + build + visual
```

### Agent CLI

Offline conventions and component docs (no Storybook required):

| Command                            | Purpose                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `pnpm ui guide`                    | Topic index (`layers`, `shadcn`, `forms`, `testing`, …)        |
| `pnpm ui guide <topic>`            | Full topic markdown                                            |
| `pnpm ui components`               | Catalog index across shadcn, forms, AI, apps, tasks |
| `pnpm ui components <layer/id>`    | One component: import, summary, examples                       |
| `pnpm ui components --layer forms` | Filter by layer                                                |

Use `--json` for machine-readable output. Topics live under `docs/agent/`.
In-catalog decision pages: `Shadcn/Guidance`, `UI Forms/Guidance`.
Agent workflow notes: see [`AGENTS.md`](./AGENTS.md).

### MCP and llms.txt

With `pnpm storybook` running on port **9009**, two MCP endpoints and the llms
surface share that server:

| Surface                 | URL                                               | Tools / content                                                                                     |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Storybook MCP           | `http://localhost:9009/mcp`                       | Story instructions, previews, changed stories, `run-story-tests`                                    |
| Docs MCP                | `http://localhost:9009/docs-mcp`                  | `list-all-documentation`, `get-documentation`, `get-documentation-for-story` (Svelte props + usage) |
| llms index              | `http://localhost:9009/llms.txt` / `/llms.md`     | Layered index (`.md` = HTML, `.txt` = markdown)                                                     |
| Component / guide pages | `/llms/<layer>/<id>.md`, `/llms/guide/<topic>.md` | Full pages (`.txt` aliases)                                                                         |

Cursor project MCP (`.cursor/mcp.json`):

- `stevejuma-ui-storybook` → `http://localhost:9009/mcp`
- `stevejuma-ui-docs` → `http://localhost:9009/docs-mcp`

When Storybook is not running, `pnpm ui mcp` (alias `pnpm ui:mcp`) serves the
same Docs MCP + llms routes on `http://127.0.0.1:9010`. Cache:
`.cache/ui-docs/` (content-hash); bypass with `UI_DOCS_CACHE=0` or
`pnpm ui mcp --no-cache`.

Visual baselines are under `tests/visual/storybook.spec.ts-snapshots/`.
`test:visual` never writes snapshots. Update existing baselines only with
`VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>`.
Install Chromium once with `pnpm exec playwright install chromium`.

### Native CSS generator

`pnpm ui:add` runs the transactional converter in a detached git worktree:
intake via pinned `shadcn-svelte`, Tailwind CLI expansion, scoped native CSS,
reference/candidate parity, then one binary patch. Failures leave the real
worktree unchanged.

- **Batches:** `a` simple roots, `b` stateful/light compound, `c` portals,
  `d` layout/field compounds (sidebar, resizable, scroll-area, field, input-group)
- **Converted:** all `src/shared/shadcn/*` families (see `COMPONENT_AUDIT.md`)

## Story tags

Configured tags render as sidebar and toolbar badges via
`storybook-addon-tag-badges` (see `.storybook/manager.ts`). Status tags from the
addon defaults (`new`, `beta`, `deprecated`, and related) are available without
extra wiring. Global tags `autodocs` and `test` are not badged.

- `skip-test` — exclude from Storybook Vitest (document reason)
- `skip-visual` — exclude from Playwright visual suite (document reason)
- `upstream-example` — generated from upstream docs examples
- `visual-state` — explicit visual-state story
- `visual-pending` — baseline exists; awaiting human approval (Visual Delta)
- `visual-approved` — baseline reviewed and accepted (Visual Delta)
- `visual-failed` — baseline review failed or rejected (Visual Delta)
- `tasks-reference-visual` — Tasks vs Superlist reference baselines
