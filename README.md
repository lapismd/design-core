# `@stevejuma/ui`

Private Svelte 5 UI package with a Storybook 10 catalog, Storybook Vitest,
local Playwright visual regression, and the workspace **Visual Delta** addon.

This README is the host-side map for humans and agents. Point an agent here to
recreate a similar Storybook catalog (addons, Visual Delta, sidebar review
badges, scripts, MCP). The [Visual Delta setup](#visual-delta-setup-this-host)
section plus the [recreate recipe](#recipe-recreate-a-similar-storybook-setup)
are the single source of truth for that workflow. For package layers and
day-to-day UI conventions, also use `pnpm ui guide` and
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
| [`.storybook/focus-prototype-guard.ts`](./.storybook/focus-prototype-guard.ts) | Local patch for Storybook 10.5 Docs `Illegal invocation` (see below) |

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
| `installFocusPrototypeGuard()` | Preview-side guard; see **Known Storybook docs error** |

### Known Storybook docs error (focus prototype guard)

Storybook **10.5** instruments `HTMLElement.prototype.focus` with an accessor
whose getter reads `this.ownerDocument`. On Docs pages, React Aria (pulled in
by `@storybook/addon-docs` blocks) reads `HTMLElement.prototype.focus` to wrap
it. That invokes the Storybook getter with `this === HTMLElement.prototype` and
throws:

`TypeError: Illegal invocation`

This commonly shows up as a broken Docs page **after a Storybook server restart
/ full reload** (first Docs load in a fresh preview iframe). Story view may
still work.

**Local fix (not an upstream pnpm patch):**
[`.storybook/focus-prototype-guard.ts`](./.storybook/focus-prototype-guard.ts)
wraps Storybook’s accessor so prototype reads return a safe `focus` function.
[`preview.ts`](./.storybook/preview.ts) calls `installFocusPrototypeGuard()`
**before** Docs/react-aria run. Covered by
`scripts/ui-generator/tests/focus-prototype-guard.spec.ts`.

Upstream: [storybookjs/storybook#35503](https://github.com/storybookjs/storybook/issues/35503)
(tracked fix e.g. PR [#35528](https://github.com/storybookjs/storybook/pull/35528)).
**Remove the guard** once Storybook ships a guarded getter and this catalog
bumps past that release.

### Preview conventions (`.storybook/preview.ts`)

- Installs `installFocusPrototypeGuard()` first (Docs reload guard; see above).
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
- Visual Delta review/skip chips: solid fills + white glyphs — see
  [Sidebar and toolbar Visual Delta labels](#sidebar-and-toolbar-visual-delta-labels).
- Stacked sidebar labels (`manager-stacked-badges.ts`) pin tags to a fixed
  column left of the status glyph (no status-store margin guessing).
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
(overlay, heatmap Live Diff, create/update baselines, review tags). This
section is the **host-side** source of truth for recreating the same workflow.
Addon API/options: [`packages/storybook-addon-visual-delta/README.md`](./packages/storybook-addon-visual-delta/README.md)
(including **Review layout** — canvas on top, Visual Delta docked full-width
below). Boundary notes: [`VENDOR.md`](./packages/storybook-addon-visual-delta/VENDOR.md).

### Addon vs host boundary

| Owned by `packages/storybook-addon-visual-delta` | Owned by `@stevejuma/ui` (host) |
| ------------------------------------------------ | -------------------------------- |
| Panel / Testing Module UI, overlay, Live Diff, **review layout** toggle | Playwright suite `tests/visual/storybook.spec.ts` |
| Preset `viteFinal`: `/__visual-delta/*` middleware, baseline CSF inject, src watch | `staticDirs` → `/visual-baselines` |
| Preview `runStep` / park / overlay channel | Baseline write CLIs (`visual-update`, `visual-interaction-update`) |
| Fetch clients + path constants | CSF patchers under `scripts/ui-generator/visual/` |
| Panel Pass/Fail chrome (Storybook theme) | Sidebar/toolbar **tag badges** + stacked `renderLabel` |
| | Approval / gating (`VISUAL_UPDATE_APPROVED`, `--approved`) |

There is **no** Visual Delta chrome in catalog CSS (`src/storybook.css`). Sidebar
and toolbar chips are styled in manager React/emotion config only.

### How this repo registers the addon

Storybook’s manager builder is a **one-shot esbuild bundle** and ignores
`node_modules` watches. Editing a workspace addon via the package name would not
reliably update the manager. This host therefore:

1. Registers **`.storybook/visual-delta-preset.ts`** (absolute paths into
   `packages/storybook-addon-visual-delta/src/{manager,preview,preset}`)
2. Starts Storybook via **`node scripts/storybook-run.mjs`**, which restarts the
   process when manager/panel/`src/node` (and related `.storybook` files) change
3. Serves PNGs with `staticDirs` → `/visual-baselines`
4. Relies on addon **defaults** for CLI argv — no extra `options.visualDelta` in
   `main.ts` today
5. Leaves **`.storybook/preview.ts` free of Visual Delta parameters** — overlay
   wiring comes only from the addon preview entry via the preset

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

**Baseline filename suffix** (hard-coded for this host’s committed darwin
baselines): `-chromium-darwin` (see addon
`src/shared/baseline-url.ts`). Example URL:
`/visual-baselines/shadcn/button/default-chromium-darwin.png`. Other OS/CI
targets must match or change the suffix everywhere.

Deprecated thin shims (prefer `storybook-addon-visual-delta/node`):
`.storybook/visual-delta-middleware.ts`,
`.storybook/visual-baseline-vite-plugin.ts`,
`.storybook/visual-baseline-design.ts`.

### Sidebar and toolbar Visual Delta labels

Visual review / skip state is shown as **Storybook tags** rendered by
`storybook-addon-tag-badges`, configured in
[`.storybook/manager.ts`](./.storybook/manager.ts). The stock single-badge
sidebar label is replaced by a custom React stack in
[`.storybook/manager-stacked-badges.ts`](./.storybook/manager-stacked-badges.ts)
(`sidebar.renderLabel`). That file also needs **`react`** (same peer as the
Visual Delta panel).

| Tag | Sidebar icon | Toolbar / MDX label | Fill / border |
| --- | ------------ | ------------------- | ------------- |
| `visual-failed` | `✕` | `✕ Failed` | `#c52020` / `#8a1414` |
| `visual-pending` | `⏱` | `⏱ Pending review` | `#c2540a` / `#8a3a05` |
| `visual-approved` | `⛨` | `⛨ Approved` | `#15843e` / `#0c5a29` |
| `skip-visual` | `⊘` | `⊘ Skip visual` | `#a66707` / `#734603` |
| `skip-test` | `∅` | `∅ Skip test` | `#656e81` / `#3f4656` |
| `upstream-example` | `↑` | `↑ Upstream` | `#157dac` / `#0a5070` |
| `visual-state` | `◉` | `◉ Visual` | `#12826c` / `#0a5344` |
| `tasks-reference-visual` | `☰` | `☰ Tasks ref` | `#5d22c3` / `#3d1386` |
| `fava-reference-visual` | `☰` | `☰ Fava ref` | `#5d22c3` / `#3d1386` |

Chip styling (manager config, not CSS files):

- Solid fill + white glyph/text (`#ffffff`), WCAG AA against fills
- Sidebar chips: **18×18** circles
- Toolbar labels: small-caps + `letterSpacing: 0.04em`
- Stack layout: status slot `28px`, gap `8px`, chip overlap `-6px`, ring via
  `--tag-stack-ring` (Storybook theme `background.content` / `background.app`)

**Config order:** review tags (`visual-failed` → `visual-pending` →
`visual-approved`) are registered **before** other catalog tags so the stacked
avatar group leads with review status. Review tags use a broad `display` so they
show on story/docs/component/group with `skipInherited: false` (a parent
Approved does not hide leaf badges). Then `...defaultConfig` from
`storybook-addon-tag-badges` (new/beta/… with host icon overrides).

`collectSidebarBadges()` walks **all** matching tag configs (not first-match
only) so multiple chips can stack.

### CSF `parameters.visualDelta` inject

The addon Vite plugin (via the local preset) transforms `.stories.svelte` when
a baseline PNG exists under `snapshotDir`. Title / path → directory:

| Catalog title prefix | Path heuristic | Snapshot dir |
| -------------------- | -------------- | ------------ |
| `Shadcn/…` | `/shared/shadcn/` | `shadcn/<family>` |
| `UI Forms/…` | `/shared/forms/<family>/` | `forms/<family>` |
| `Apps/…` | `/src/apps/<…>/` | `apps/<…>` |
| `Tasks/…` | `/packages/tasks/src/` | `tasks/…` |

Inject rules:

- Skip if the story open tag has `skip-visual` or already has `visualDelta:`
- Skip if the PNG is missing on disk
- Default object when injecting:

```ts
{
  images: [src], // e.g. "/visual-baselines/shadcn/button/default-chromium-darwin.png"
  opacity: 0.5,
  colorInversion: false,
  align: "canvas",
  placement: "right",
  passThresholdPercent: 0.1,
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

**Host coupling:** middleware shells host CLIs and imports CSF patchers by
relative path from `scripts/ui-generator/visual/`
(`patch-story-visual-delta`, `patch-story-visual-review`, `diff-result`,
`ensure-playwright-webserver`). A published-addon install still needs those
scripts (or must re-point options / fork middleware).

Writer side effects:

- **Create missing** (`--create-only`): writes missing PNGs, patches
  `visualDelta.images`, stamps `visual-pending`
- **Overwrite**: requires approval; sets `PLAYWRIGHT_UPDATE_SNAPSHOTS=1`; resets
  `visual-approved` → `visual-pending`
- Compare-only runs set `PLAYWRIGHT_UPDATE_SNAPSHOTS=0`
- Panel always passes `--allow-dirty` and sets `VISUAL_UPDATE_APPROVED=1` in the
  child env (argv also includes `--approved`)

There is **no** `package.json` script for interaction baselines — only the
middleware default `visual-interaction-update` CLI (or invoke the CLI directly).

### Playwright visual suite

- Config: [`playwright.config.ts`](./playwright.config.ts)
- Specs: `tests/visual/`
- Baselines: `tests/visual/storybook.spec.ts-snapshots/` (committed)
- Served for Live Diff at `/visual-baselines`
- Shared capture constants:
  `scripts/ui-generator/visual/capture-config.ts` ↔ addon `constants.ts`
- Story selection: `storybook-static/index.json` stories **without**
  `skip-visual`
- v1 capture: light mode only, Chromium, **1280×900** CSS viewport,
  `deviceScaleFactor: 3`, `toHaveScreenshot` `scale: "device"`
- Static Storybook served for Playwright via `storybook-static/` + local HTTP
  server (see `webServer` in Playwright config)
- Sidecar `.json` files next to PNGs feed Live Diff / Testing Module

**Never** update baselines unless a human explicitly asks. Ordinary
`pnpm test:visual` never writes snapshots (`updateSnapshots: "none"`).

### Env and flags

| Gate | Effect |
| ---- | ------ |
| `VISUAL_UPDATE_APPROVED=1` or `--approved` | Required by host CLIs to write baselines |
| `--allow-dirty` | Skip clean-git gate (panel always passes this) |
| `--create-only` | Missing PNGs only + CSF image wiring + `visual-pending` |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=0` | Compare-only (Testing Module / `test:visual`) |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS=1` | Allow Playwright to write (gated writers only) |
| `PLAYWRIGHT_UPDATE_MODE=missing` | Playwright `updateSnapshots: "missing"` |
| `PLAYWRIGHT_INTERACTION_CAPTURE` | JSON `{ storyId, stepId, stepLabel? }` mid-play capture |
| `WATCHPACK_POLLING=250` | Reliable story source detection under `pnpm storybook` |
| `STORYBOOK_PORT` / `STORYBOOK_EXTRA_PORTS` | `storybook-run.mjs` ports |

CLI also refuses `--component *|all` and refuses overwriting Tasks Shell
Superlist reference baselines.

### `skip-visual` from Visual Delta

Panel **More → Skip visual tests** / **Include in visual tests** patches the
current story’s CSF via `POST /__visual-delta/skip-visual`. Prefer that over
hand-editing tags when excluding flake. Document permanent skips in the story.
Adding `skip-visual` clears review tags; review / Update baselines stay disabled
while skipped.

### Optional catalog fixtures

`src/storybook/visual-delta/*` stories exercise panel chrome (typically tagged
`skip-visual`). Useful when developing the addon; not required for a consumer
host that only wants Live Diff on product stories.

### `storybook-run` restart watch (manager does not HMR)

`scripts/storybook-run.mjs` restarts when content hashes change under addon
`src/manager*`, `panel/`, `node/`, `preset`, shared constants/types, plus
`.storybook/visual-delta-preset.ts`, `manager.ts`, `manager-stacked-badges.ts`.
It does **not** watch `.storybook/main.ts` (macOS FSEvents restart loops).
Preview overlay edits HMR via Vite; manager/panel need a full process restart
(`pnpm storybook:restart` if needed).

---

## Commands

```text
# Catalog
pnpm storybook              # UI + Docs MCP/llms on :9009; restarts on Visual Delta src edits
pnpm storybook:ui           # same server entry (UI-focused workflow)
pnpm storybook:stop         # kill Storybook listeners (:9009 + extras)
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

Use this checklist when standing up another Svelte UI catalog with the same
Visual Delta workflow. Prefer copying **behavior** from the sections above over
guessing from the addon package alone.

### 1. Dependencies

- `storybook`, `@storybook/svelte-vite`, Vite, Svelte 5
- Addons: `addon-docs`, `addon-a11y`, `addon-svelte-csf`, `addon-vitest`,
  `addon-mcp`, `addon-themes`, `storybook-addon-tag-badges`
- Visual Delta package (workspace or published) + **`react`** (manager panel
  **and** stacked sidebar badges)
- `@playwright/test` / Playwright; Vitest + `@vitest/browser-playwright`

### 2. Storybook host files

1. Copy the **roles** in the [host file map](#host-file-map) (adapt paths).
2. Register addons in `main.ts`; include Visual Delta (package name **or** a
   local `src/` preset if developing the addon in-tree).
3. Add `staticDirs` mapping snapshot dir → `/visual-baselines`.
4. Wire preview: themes (`data-ui-theme`), `colorMode` / `.dark`, a11y
   `test: "error"`, disable backgrounds if tokens own surfaces. Install the
   [Docs focus-prototype guard](#known-storybook-docs-error-focus-prototype-guard)
   while on Storybook 10.5. **Do not** put Visual Delta parameters in preview —
   the preset’s preview entry owns overlay wiring.
5. Wire manager: `storybook-addon-tag-badges` + Visual Delta tag colors/icons +
   optional stacked `renderLabel` (see
   [Sidebar and toolbar Visual Delta labels](#sidebar-and-toolbar-visual-delta-labels)).

### 3. Visual Delta + Playwright

1. Commit baselines under a snapshot directory matching `snapshotDir`.
2. Match viewport / device scale / baseline suffix (`-chromium-darwin` here) or
   change them consistently in Playwright + addon URL helpers.
3. Implement (or reuse) host CLIs that honor middleware-appended flags:
   `--create-only`, `--component` / `--story-id`, `--step-label`, `--step-id`,
   plus host approval (`--approved` / `VISUAL_UPDATE_APPROVED=1`). Keep the CSF
   patchers under `scripts/ui-generator/visual/` (or re-point middleware).
4. Point `visualUpdateArgs` / `visualInteractionUpdateArgs` at those CLIs, or
   keep the addon defaults and provide matching script paths.
5. Playwright: compare-only by default (`updateSnapshots: "none"`); serve
   `storybook-static` for the suite; skip stories tagged `skip-visual`.
6. If developing the addon from `src/`, use a local preset + a runner that
   **restarts** Storybook on manager/panel changes (manager does not HMR).
7. Understand [CSF inject](#csf-parametersvisualdelta-inject) scopes (Shadcn,
   Forms, Apps, Tasks) and [env gates](#env-and-flags).

### 4. Scripts to expose

Minimum useful scripts (names can differ; behavior should match):

| Script | Behavior |
| ------ | -------- |
| `storybook` | Dev server (polling; restart on manager edits if needed) |
| `build-storybook` | Static build for Playwright / CI |
| `test:storybook` | Storybook Vitest once |
| `test:visual` | Playwright compare only (never write baselines) |
| `test:visual:update` | Gated baseline writer (`visual-update`) |
| `checks` / `storybook:check` | Story tests + build + visual |

Interaction baseline writes can stay CLI/middleware-only (this repo does not
expose a dedicated `package.json` script for them).

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
- Keep the Docs focus-prototype guard (or an equivalent upstream fix) while on
  Storybook 10.5 — without it, Docs pages can throw `Illegal invocation` after
  a server restart / full reload.
- Do not look for Visual Delta sidebar styles in catalog CSS — they live in
  manager tag-badge config + `manager-stacked-badges.ts`.

### 7. Minimal file checklist (copy these host pieces)

1. `.storybook/main.ts` — local preset **or** package name; `staticDirs`;
   workspace aliases if loading addon from `src/`
2. `.storybook/visual-delta-preset.ts` (in-tree addon development)
3. `.storybook/manager.ts` + `manager-stacked-badges.ts` +
   `storybook-addon-tag-badges` + `react`
4. `scripts/storybook-run.mjs` (+ `WATCHPACK_POLLING`) if manager must refresh
   from workspace `src/`
5. Playwright config + `tests/visual/storybook.spec.ts` + committed snapshots
6. Host CLIs: `visual-update`, `visual-interaction-update`, CSF patchers under
   `scripts/ui-generator/visual/`
7. Approval env gates; never let ordinary `test:visual` write
8. Match DSF / viewport / `-chromium-darwin` (or change suffix everywhere)

---

## Story tags

Configured tags render as sidebar and toolbar badges via
`storybook-addon-tag-badges` (see `.storybook/manager.ts`). Status tags from the
addon defaults (`new`, `beta`, `deprecated`, and related) are available without
extra wiring. Global tags `autodocs` and `test` are not badged.

Visual Delta review/skip chips (icons, colors, stacking): see
[Sidebar and toolbar Visual Delta labels](#sidebar-and-toolbar-visual-delta-labels).

| Tag | Meaning |
| --- | ------- |
| `skip-test` | Exclude from Storybook Vitest (document reason) |
| `skip-visual` | Exclude from Playwright visual suite (document reason). Toggle from Visual Delta panel **More → Skip visual tests** / **Include in visual tests** |
| `upstream-example` | Generated from upstream docs examples |
| `visual-state` | Explicit visual-state story |
| `visual-pending` | Baseline exists; awaiting human approval (Visual Delta) |
| `visual-approved` | Baseline reviewed and accepted (Visual Delta) |
| `visual-failed` | Baseline review failed or rejected (Visual Delta) |
| `tasks-reference-visual` | Tasks vs Superlist reference baselines |
| `fava-reference-visual` | Beancount screens vs live Fava captures |

Review tags (`visual-failed` / `visual-pending` / `visual-approved`) are
mutually exclusive; CSF patchers keep a single review tag. Skipping visual
clears review tags.

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
