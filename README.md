# `@stevejuma/ui`

Private Svelte 5 UI package with a Storybook 10 catalog, Storybook Vitest,
local Playwright visual regression, and the workspace **Visual Delta** addon.

This README is the host-side map for humans and agents. Point an agent here to
recreate a similar Storybook catalog (addons, Visual Delta, scripts, MCP). For
package layers and day-to-day UI conventions, also use `pnpm ui guide` and
[`AGENTS.md`](./AGENTS.md). Deep addon API:
[`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md).

## Layout

```text
src/
  lib/utils.ts
  styles.css, theme.css, storybook.css
  shared/
    shadcn/<family>/     # registry filenames + colocated stories
    forms/<family>/      # kebab-case families + colocated stories
    forms/core/          # builders, types, registry (non-visual)
    filter/              # search filter chrome + filter-query language
  apps/
    cv/                  # reserved for CV domain UI
    beancount/           # reserved for beancount domain UI
  storybook/             # catalog-only helpers (e.g. visual-capture)
tests/
  visual/                # Playwright visual suite + committed snapshots
packages/
  storybook-addon-visual-delta/   # Visual Delta addon (src/ loaded by Storybook)
  tasks/                          # white-label task-app reference contracts
.storybook/              # Storybook host config (see below)
scripts/
  storybook-run.mjs      # Storybook entry; restarts on Visual Delta manager edits
  ui-generator/          # ui CLI, visual-update writers, Docs MCP
```

## Imports

| Path                            | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `@stevejuma/ui/shadcn/<family>` | shadcn family barrel                      |
| `@stevejuma/ui/forms`           | forms barrel                              |
| `@stevejuma/ui/forms/core`      | form builders / types / registry          |
| `@stevejuma/ui/filter`          | search filter barrel                      |
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

---

## Storybook catalog configuration

Stack: **Storybook 10** + **`@storybook/svelte-vite`** + **Vite 6** + **Svelte 5**.
Port **9009**. Do **not** run `storybook dev` directly — package scripts enable
polling and (for Visual Delta) manager restarts.

### Host file map

| File | Role |
| ---- | ---- |
| [`.storybook/main.ts`](./.storybook/main.ts) | Stories globs, addons, `staticDirs`, host `viteFinal` (aliases + Docs MCP) |
| [`.storybook/preview.ts`](./.storybook/preview.ts) | Global tags, theme/`colorMode`, a11y, docs TOC, layout |
| [`.storybook/manager.ts`](./.storybook/manager.ts) | Tag-badge config, color-mode toolbar tool, stacked sidebar labels |
| [`.storybook/manager-stacked-badges.ts`](./.storybook/manager-stacked-badges.ts) | Sidebar tag chips pinned clear of Storybook status glyphs |
| [`.storybook/manager-color-mode-toggle.tsx`](./.storybook/manager-color-mode-toggle.tsx) | Sun/moon light/dark tool (`colorMode` global) |
| [`.storybook/visual-delta-preset.ts`](./.storybook/visual-delta-preset.ts) | Loads Visual Delta from package `src/` (manager + preview + `viteFinal`) |
| [`.storybook/ui-docs-middleware.ts`](./.storybook/ui-docs-middleware.ts) | Host Vite plugin: Docs MCP + `llms.txt` on the Storybook server |
| [`.storybook/vitest.setup.ts`](./.storybook/vitest.setup.ts) | Storybook Vitest project annotations |
| [`.storybook/focus-prototype-guard.ts`](./.storybook/focus-prototype-guard.ts) | Storybook 10.5 focus/react-aria guard |

### Addons in use

Registered in `.storybook/main.ts` `addons`:

| Addon | Purpose in this catalog |
| ----- | ----------------------- |
| `@storybook/addon-docs` | MDX / autodocs; TOC in preview `parameters.docs` |
| `@storybook/addon-a11y` | A11y panel; `parameters.a11y.test: "error"` (fail on violations) |
| `@storybook/addon-svelte-csf` | Svelte CSF stories (`defineMeta`, colocated `.stories.svelte`) |
| `@storybook/addon-vitest` | Browser Vitest project for story play/tests (`vitest.config.ts`) |
| `@storybook/addon-mcp` | Storybook MCP at `http://localhost:9009/mcp` |
| `@storybook/addon-themes` | Brand theme via `data-ui-theme` (`withThemeByDataAttribute`) |
| **Visual Delta** (local preset) | Overlay / Live Diff, Testing Module, `/__visual-delta/*` middleware |
| `storybook-addon-tag-badges` | Sidebar + toolbar badges for configured tags |

Related (not Storybook addons, but catalog infrastructure):

| Piece | Purpose |
| ----- | ------- |
| `scripts/storybook-run.mjs` | Starts Storybook; **restarts** when Visual Delta manager/panel/`src/node` change |
| Host `uiDocsMiddlewarePlugin` | Docs MCP (`/docs-mcp`) + `/llms.txt` next to Storybook MCP |
| Playwright (`tests/visual`) | Compare-only visual suite; committed PNGs under `storybook.spec.ts-snapshots/` |
| `react` | Required peer for Visual Delta manager UI (React panel chrome) |

### Preview conventions (`.storybook/preview.ts`)

- Global tags: `autodocs`, `test` (not badged).
- Brand: `theme` toolbar global + `withThemeByDataAttribute` → `data-ui-theme`
  (currently `default`). Addon themes toolbar control is **disabled**; brand
  switcher is the custom paintbrush global.
- Light/dark: `colorMode` global (`light` / `dark`) toggled by the manager tool;
  decorator applies `.dark` on `documentElement`.
- Backgrounds addon: **disabled** (tokens + themes own surfaces).
- A11y: `test: "error"`; sole scoped exclusion `.cm-gutters` (CodeMirror).
- Layout: `fullscreen`.

### Manager conventions (`.storybook/manager.ts`)

- Tag badges via `storybook-addon-tag-badges` (sidebar icon + toolbar label).
- Stacked sidebar labels pin tags to a fixed column left of the status glyph
  (no status-store margin guessing).
- Color-mode tool is a single sun/moon button (not a Storybook backgrounds tool).

### Host `viteFinal` (in `main.ts`)

Visual Delta’s own `viteFinal` runs through the **addon preset**. The host adds:

1. `uiDocsMiddlewarePlugin()` — Docs MCP + llms
2. Resolve aliases (`@stevejuma/ui/shadcn`, `storybook-addon-visual-delta` → package root)
3. `optimizeDeps.exclude` for the workspace Visual Delta package
4. Ignore `storybook-static/**` in the Vite watcher

### Storybook Vitest

[`vitest.config.ts`](./vitest.config.ts) defines three projects:

| Project | What |
| ------- | ---- |
| `unit` | Node unit specs under `src/`, `scripts/ui-generator/`, `packages/tasks` |
| `visual-delta` | jsdom + RTL specs for the addon package |
| `storybook` | `@storybook/addon-vitest` + Playwright browser provider |

Setup: `.storybook/vitest.setup.ts` merges a11y + project preview annotations.

---

## Visual Delta setup (this host)

Visual Delta compares the live story canvas to committed Playwright PNGs
(overlay, heatmap Live Diff, create/update baselines, review tags).

### Addon vs host boundary

| Owned by `packages/storybook-addon-visual-delta` | Owned by `@stevejuma/ui` (host) |
| ------------------------------------------------ | -------------------------------- |
| Panel / Testing Module UI, overlay, Live Diff | Playwright suite `tests/visual/storybook.spec.ts` |
| Preset `viteFinal`: `/__visual-delta/*` middleware, baseline CSF inject, src watch | `staticDirs` → `/visual-baselines` |
| Preview `runStep` / park / overlay channel | Baseline write CLIs (`visual-update`, `visual-interaction-update`) |
| Fetch clients + path constants | Approval / gating (`VISUAL_UPDATE_APPROVED`, `--approved`) |

### How this repo registers the addon

Storybook’s manager builder is a **one-shot esbuild bundle** and ignores
`node_modules` watches. Editing a workspace addon via the package name would not
reliably update the manager. This host therefore:

1. Registers **`.storybook/visual-delta-preset.ts`** (absolute paths into
   `packages/storybook-addon-visual-delta/src/{manager,preview,preset}`)
2. Starts Storybook via **`node scripts/storybook-run.mjs`**, which restarts the
   process when manager/panel/`src/node` (and related `.storybook` files) change
3. Serves PNGs with `staticDirs` → `/visual-baselines`
4. Relies on addon **defaults** for CLI argv (see below) — no extra
   `options.visualDelta` in `main.ts` today

Consumer install with a published package name can use:

```ts
addons: ["storybook-addon-visual-delta"],
// or { name: "storybook-addon-visual-delta", options: { visualDelta: { … } } }
```

Full options table: addon README. Defaults used here:

| Option | Default in this repo |
| ------ | -------------------- |
| `snapshotDir` | `tests/visual/storybook.spec.ts-snapshots` |
| `visualUpdateArgs` | `pnpm exec tsx scripts/ui-generator/cli.ts visual-update --allow-dirty --approved` |
| `visualInteractionUpdateArgs` | `… visual-interaction-update --allow-dirty --approved --skip-build` |
| `allowRebuild` | `true` (may `pnpm build-storybook` before run-tests) |

`staticDirs` (required; addon does not mount files):

```ts
{
  from: "../tests/visual/storybook.spec.ts-snapshots",
  to: "/visual-baselines",
}
```

### Middleware (dev only)

| Method | Path | Action |
| ------ | ---- | ------ |
| `POST` | `/__visual-delta/create-baseline` | Create missing baselines + CSF wiring |
| `POST` | `/__visual-delta/update-baseline` | Overwrite baselines |
| `POST` | `/__visual-delta/create-interaction-baseline` | Mid-play step capture |
| `POST` | `/__visual-delta/run-tests` | Compare-only Playwright (NDJSON stream) |
| `POST` | `/__visual-delta/cancel-tests` | Abort in-flight run |
| `POST` | `/__visual-delta/review-status` | Set CSF review tags |
| `POST` | `/__visual-delta/skip-visual` | Add or remove `skip-visual` on a story |

Compare-only runs set `PLAYWRIGHT_UPDATE_SNAPSHOTS=0`. Writers require approval
env/flags from the host CLIs.

### Playwright visual suite

- Config: [`playwright.config.ts`](./playwright.config.ts)
- Specs: `tests/visual/`
- Baselines: `tests/visual/storybook.spec.ts-snapshots/` (committed)
- Served for Live Diff at `/visual-baselines`
- v1 capture: light mode only, Chromium, **1280×900** CSS viewport,
  `deviceScaleFactor: 3`, `toHaveScreenshot` `scale: "device"`
- Static Storybook served for Playwright via `storybook-static/` + local HTTP
  server (see `webServer` in Playwright config)

**Never** update baselines unless a human explicitly asks. Ordinary
`pnpm test:visual` never writes snapshots.

### `skip-visual` from Visual Delta

Panel **More → Skip visual tests** / **Include in visual tests** patches the
current story’s CSF via `POST /__visual-delta/skip-visual`. Prefer that over
hand-editing tags when excluding flake. Document permanent skips in the story.
Adding `skip-visual` clears review tags; review / Update baselines stay disabled
while skipped.

---

## Commands

```text
# Catalog
pnpm storybook              # UI + Docs MCP/llms on :9009; restarts on Visual Delta src edits
pnpm storybook:ui           # same server entry (UI-focused workflow)
pnpm storybook:restart      # kill + restart Storybook on :9009
pnpm build-storybook        # static build → storybook-static/
pnpm storybook:check        # story tests + build + visual compare

# Tests
pnpm test:unit              # node unit + visual-delta package specs
pnpm test:storybook         # headless story Vitest once
pnpm test:storybook:watch   # story Vitest watch
pnpm test:visual            # screenshot compare (never writes baselines)
pnpm test:visual:update --component <name>  # gated baseline update
pnpm test:visual:report     # open Playwright HTML report
pnpm checks                 # fmt + svelte-check + unit + storybook + build + visual

# Agent / docs CLI
pnpm ui                     # CLI entry (guide | components | mcp | …)
pnpm ui guide [topic]       # agent/human conventions (--json for agents)
pnpm ui:guide [topic]       # alias
pnpm ui components [name]   # list/show catalog usage + examples
pnpm ui:components [name]   # alias
pnpm ui components --layer forms
pnpm ui mcp                 # standalone Docs MCP + llms on :9010 (Storybook off)
pnpm ui:mcp                 # alias

# Generator
pnpm ui:doctor              # generator environment checks
pnpm ui:inspect <name>      # support tier + candidates (no writes)
pnpm ui:add <name> [--overwrite] [--dry-run]
pnpm ui:add:batch <a|b|c|d> # convert an allowlisted complexity batch

# Tasks reference
pnpm --dir packages/tasks reference:verify
```

Install Chromium once for Playwright: `pnpm exec playwright install chromium`.

### Agent CLI

Offline conventions and component docs (no Storybook required):

| Command                            | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `pnpm ui guide`                    | Topic index (`layers`, `shadcn`, `forms`, `testing`, …) |
| `pnpm ui guide <topic>`            | Full topic markdown                                     |
| `pnpm ui components`               | Catalog index across shadcn, forms, AI, apps, tasks     |
| `pnpm ui components <layer/id>`    | One component: import, summary, examples                |
| `pnpm ui components --layer forms` | Filter by layer                                         |

Use `--json` for machine-readable output. Topics live under `docs/agent/`.
In-catalog decision pages: `Shadcn/Guidance`, `UI Forms/Guidance`.
Agent workflow notes: [`AGENTS.md`](./AGENTS.md).

### MCP and llms.txt

With `pnpm storybook` on port **9009**:

| Surface                 | URL                                               | Tools / content                                                                                     |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Storybook MCP           | `http://localhost:9009/mcp`                       | Story instructions, previews, changed stories, `run-story-tests`                                    |
| Docs MCP                | `http://localhost:9009/docs-mcp`                  | `list-all-documentation`, `get-documentation`, `get-documentation-for-story` (Svelte props + usage) |
| llms index              | `http://localhost:9009/llms.txt` / `/llms.md`     | Layered index (`.md` = HTML, `.txt` = markdown)                                                     |
| Component / guide pages | `/llms/<layer>/<id>.md`, `/llms/guide/<topic>.md` | Full pages (`.txt` aliases)                                                                         |

Cursor project MCP ([`.cursor/mcp.json`](./.cursor/mcp.json)):

- `stevejuma-ui-storybook` → `http://localhost:9009/mcp`
- `stevejuma-ui-docs` → `http://localhost:9009/docs-mcp`

When Storybook is down, `pnpm ui mcp` serves Docs MCP + llms on
`http://127.0.0.1:9010`. Cache: `.cache/ui-docs/` (content-hash); bypass with
`UI_DOCS_CACHE=0` or `pnpm ui mcp --no-cache`.

---

## Recipe: recreate a similar Storybook setup

Use this checklist when standing up another Svelte UI catalog with Visual Delta.

### 1. Dependencies

- `storybook`, `@storybook/svelte-vite`, Vite, Svelte 5
- Addons: `addon-docs`, `addon-a11y`, `addon-svelte-csf`, `addon-vitest`,
  `addon-mcp`, `addon-themes`, `storybook-addon-tag-badges`
- Visual Delta package (workspace or published) + **`react`** (manager UI)
- `@playwright/test` / Playwright; Vitest + `@vitest/browser-playwright`

### 2. Storybook host files

1. Copy the **roles** in the [host file map](#host-file-map) (adapt paths).
2. Register addons in `main.ts`; include Visual Delta (package name **or** a
   local `src/` preset if developing the addon in-tree).
3. Add `staticDirs` mapping snapshot dir → `/visual-baselines`.
4. Wire preview: themes (`data-ui-theme`), `colorMode` / `.dark`, a11y
   `test: "error"`, disable backgrounds if tokens own surfaces.
5. Wire manager: tag badges (+ optional stacked sidebar labels).

### 3. Visual Delta + Playwright

1. Commit baselines under a snapshot directory matching `snapshotDir`.
2. Implement (or reuse) CLIs that honor middleware-appended flags:
   `--create-only`, `--component` / `--story-id`, `--step-label`, `--step-id`,
   plus host approval (`--approved` / `VISUAL_UPDATE_APPROVED=1`).
3. Point `visualUpdateArgs` / `visualInteractionUpdateArgs` at those CLIs, or
   keep the addon defaults and provide matching script paths.
4. Playwright: compare-only by default (`updateSnapshots: "none"`); serve
   `storybook-static` for the suite; match viewport / device scale to baselines.
5. If developing the addon from `src/`, use a local preset + a runner that
   **restarts** Storybook on manager/panel changes (manager does not HMR).

### 4. Scripts to expose

Minimum useful scripts (names can differ; behavior should match):

| Script | Behavior |
| ------ | -------- |
| `storybook` | Dev server (polling; restart on manager edits if needed) |
| `build-storybook` | Static build for Playwright / CI |
| `test:storybook` | Storybook Vitest once |
| `test:visual` | Playwright compare only (never write baselines) |
| `test:visual:update` | Gated baseline writer |
| `checks` / `storybook:check` | Story tests + build + visual |

### 5. Agent surfaces (optional but used here)

- Storybook MCP (`addon-mcp`) + Docs MCP / `llms.txt` on the same Vite server
- Cursor `.cursor/mcp.json` pointing at those URLs
- Offline `pnpm ui guide` / `pnpm ui components` for conventions when Storybook
  is down

### 6. Hard rules to preserve

- Do not invoke raw `storybook dev` if the package relies on `storybook-run` /
  polling.
- Do not update visual baselines without explicit human approval.
- Do not invent component props — verify from source, types, and stories.
- After Visual Delta **manager/panel** edits, expect a full Storybook restart
  (not only a Vite page reload).

---

## Story tags

Configured tags render as sidebar and toolbar badges via
`storybook-addon-tag-badges` (see `.storybook/manager.ts`). Status tags from the
addon defaults (`new`, `beta`, `deprecated`, and related) are available without
extra wiring. Global tags `autodocs` and `test` are not badged.

- `skip-test` — exclude from Storybook Vitest (document reason)
- `skip-visual` — exclude from Playwright visual suite (document reason). Toggle
  from Visual Delta panel **More → Skip visual tests** / **Include in visual tests**.
- `upstream-example` — generated from upstream docs examples
- `visual-state` — explicit visual-state story
- `visual-pending` — baseline exists; awaiting human approval (Visual Delta)
- `visual-approved` — baseline reviewed and accepted (Visual Delta)
- `visual-failed` — baseline review failed or rejected (Visual Delta)
- `tasks-reference-visual` — Tasks vs Superlist reference baselines

## Native CSS generator

`pnpm ui:add` runs the transactional converter in a detached git worktree:
ingest via pinned `shadcn-svelte`, Tailwind CLI expansion, scoped native CSS,
reference/candidate parity, then one binary patch. Failures leave the real
worktree unchanged.

- **Batches:** `a` simple roots, `b` stateful/light compound, `c` portals,
  `d` layout/field compounds (sidebar, resizable, scroll-area, field, input-group)
- **Converted:** all `src/shared/shadcn/*` families (see `COMPONENT_AUDIT.md`)

## Further reading

| Doc | When |
| --- | ---- |
| [`AGENTS.md`](./AGENTS.md) | Primary agent contract (catalog + visuals) |
| `pnpm ui guide testing` | Post-change verification loop |
| [`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md) | Addon install, options, middleware |
| [`packages/storybook-addon-visual-delta/VENDOR.md`](./packages/storybook-addon-visual-delta/VENDOR.md) | Addon vs host boundary notes |
