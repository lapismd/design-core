# Storybook catalog

## Canonical specification

Normative package behavior lives under [`spec/src`](./spec/src). Apply this
authority order when sources disagree:

1. Higher-level workspace instructions and this tracked guide.
2. The owning `DC-<AREA>-NNN` requirement and verification row in `spec/src`.
3. Public source, exported types, and package entry points.
4. Tests and Storybook scenarios as verification evidence.
5. README, migration trackers, and generated or mirrored documentation.

Update the owning canonical chapter before or with a protected implementation,
package, tooling, or Storybook-host change. Requirements use a unique
`DC-<AREA>-NNN` heading, one concise normative statement, and two to four
atomic acceptance bullets. Add exactly one verification row. Run
`pnpm spec:first` to check the local Jujutsu diff, or pass `--base` and `--head`
for an explicit CI revision range. The canonical path map is in
[`spec-governance.md`](./spec/src/spec-governance.md#change-map).

Use `pnpm spec:search -- "<topic or DC-ID>"` for lexical discovery before a
broad scan. Add `--semantic` only when conceptual retrieval is useful. QMD is
a cache, not an authority: open the returned file and line in `spec/src`
before acting. When QMD is unavailable, follow the reported `rg` fallback.
Run `pnpm spec:check` after specification or protected-surface work.

When working on UI components, use the local Storybook catalog and its browser
tests to validate the change. Human-oriented package overview and command list:
[`README.md`](./README.md).

## Agent reading order

Before inventing workflows, load package conventions offline via the CLI:

1. `pnpm ui guide` — topic index and reading order
2. `pnpm ui guide specification` — canonical requirements and QMD workflow
3. [`styles.md`](./styles.md) — native CSS, tokens, no Tailwind in sources
4. `pnpm ui guide layers` — layers, folder layout, and dependency boundaries
5. [`src/shared/workspace/PLAN.md`](./src/shared/workspace/PLAN.md) — workspace
   framework migration boundary and slice tracker
6. `pnpm ui guide shadcn` — `ui:add` / inspect / docs sync (never raw shadcn CLI)
7. `pnpm ui guide forms` — structured forms vs shadcn controls
8. `pnpm ui guide shell` — canonical AppShell topology, toggles, headers, and
   collapsed rails
9. `pnpm ui guide testing` — stories, checks, and visual baselines after a change
10. `pnpm ui guide vcs` — commit after each verified change (prefer `jj` when available)
11. `pnpm ui components` / `pnpm ui components <layer/id>` — list or show local
    usage and examples across shadcn, forms, filter, AI, and workspace (filter
    with `--layer`)

Use `--json` for machine-readable output (`pnpm ui guide testing --json`,
`pnpm ui components button --json`). Aliases: `pnpm ui:guide`,
`pnpm ui:components`, `pnpm ui:mcp`.

When Storybook is running (`pnpm storybook`), prefer the MCP endpoints below for
interactive story work and live docs; keep the CLI for offline / scripted use.
The HTTP URLs below show the default workspace port. Use the current checkout's
`STORYBOOK_PORT` when `.env.storybook.local` selects another port.

## CLI quick reference

| Command                                    | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `pnpm ui guide [topic]`                    | Agent conventions from `docs/agent/`      |
| `pnpm ui components [name] [--layer …]`    | Catalog list / show (all layers)          |
| `pnpm ui:mcp:stdio`                        | Docs MCP over stdio (preferred)           |
| `pnpm ui mcp [--port 9011] [--no-cache]`   | Standalone Docs MCP + llms (no Storybook) |
| `pnpm docs-mcp search "<intent>"`          | Rank components, guides, and blocks       |
| `pnpm docs-mcp get <exact-id>`             | Bounded docs or one stable section        |
| `pnpm ui:add` / `ui:inspect` / `ui:doctor` | Generator pipeline (see README)           |

## Docs MCP and llms.txt

Docs MCP comes from the standalone `storybook-addon-docs-mcp` workspace
package. Prefer `pnpm ui:mcp:stdio`: it reads the configured provider directly,
works while Storybook is down, and lets multiple catalogs run without port
coordination. It is also mounted on the Storybook server (starts/restarts with
`pnpm storybook`) at a path separate from the core Storybook MCP:

| Surface        | URL                                                                      | Use for                                                                 |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Storybook MCP  | `http://localhost:9009/mcp`                                              | Story instructions, previews, changed stories, `run-story-tests`        |
| Docs MCP       | `http://localhost:9009/docs-mcp`                                         | Prefer `search` → `get`; legacy exhaustive/story tools remain available |
| llms index     | `http://localhost:9009/llms.txt` (markdown) / `/llms.md` (HTML)          | Bulk LLM/markdown index by layer                                        |
| Component page | `http://localhost:9009/llms/<layer>/<id>.md` (HTML) / `.txt` (markdown)  | Full props + examples for one component                                 |
| Guide topic    | `http://localhost:9009/llms/guide/<topic>.md` (HTML) / `.txt` (markdown) | Same content as `pnpm ui guide <topic>`                                 |

Cursor (`.cursor/mcp.json`):

- `stevejuma-ui-storybook` → `http://localhost:9009/mcp`
- `stevejuma-ui-docs` → `pnpm … docs-mcp stdio --config …`

Optional standalone fallback when Storybook is down: `pnpm ui mcp` (alias
`pnpm ui:mcp`) on `:9011` with the same Docs MCP + llms routes. Offline CLI:
`pnpm ui guide` / `pnpm ui components`; use `pnpm docs-mcp search` → `get` for
the same discovery workflow without an MCP client. Cache under `.cache/ui-docs/`
(content-hash invalidation); bypass with `DOCS_MCP_CACHE=0` (or the legacy
`UI_DOCS_CACHE=0`) or
`pnpm ui mcp --no-cache`.

In-catalog decision pages: `UI Forms/Guidance`, `Shadcn/Guidance`. Deferred
full-repo static `llms.txt` notes: `pnpm ui guide llms-extraction`.

## Source folder layout

One directory owns **one independent Storybook/catalog surface** (or one
compound family with a single primary title). Do not dump multiple
independently titled catalog components into one shared folder. Do not split
multipart compound parts into one folder each.

| Layer     | Layout                           | Rule                                                                                                 |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Shadcn    | `src/shared/shadcn/<family>/`    | One folder per **family**; keep multipart parts together (`dialog-content.svelte`, …).               |
| Forms     | `src/shared/forms/<family>/`     | One folder per **catalog family/component**. Supporting renderers may colocate with their host.      |
| Filter    | `src/shared/filter/<family>/`    | One folder per public catalog surface; private helpers stay colocated.                               |
| AI        | `src/shared/ai/<component>/`     | One folder per catalog component (`experimental/<component>/` for experimental).                     |
| Shell     | `src/shared/shell/app-shell/`    | One **compound** family; guidance, tokens, and the package barrel stay at `shell/` layer root.       |
| Workspace | `src/shared/workspace/<family>/` | One folder per **visual family**; large compounds are intentional (same rationale as shadcn Dialog). |

When adding a new independently titled story group (for example a second
orchestrator or review primitive with its own `UI Forms/…` title), give it its
own folder under the layer. When adding parts of an existing compound API
(`AppShell.Root` / `Sidebar`, Dialog content/footer), keep them in the family
folder. Full layer table: `pnpm ui guide layers`. Styling and tokens:
[`styles.md`](./styles.md) and the README **Styling and tokens** section.

## Component documentation

- `@storybook/addon-docs` is enabled and the shared preview applies the
  `autodocs` tag. Stories are the living documentation.
- `Shell/Guidance` is the canonical AppShell composition guide. Use its
  topology, toggle placement, header alignment, and collapsed-rail rules rather
  than inventing application-specific shell markup.
- Add or update a colocated `ComponentName.stories.svelte` in the same change
  as every visual component. Point `defineMeta` at the actual component, give
  the story group a clear catalog title, and give each story a human-readable
  scenario name.
- **Docs Show code must be consumer-usable.** Auto-extracted story templates
  often show harness only (`{@render …}`, `*-story-frame` wrappers, fixtures).
  Colocate `ComponentName.example-sources.ts` with copy-pasteable public imports
  and set `parameters.docs.source` (`code`, `language`, `type: "code"`) on
  `defineMeta` and/or each `Story` — same pattern as shadcn `*.example-sources`
  and Workspace Explorer. Prefer object-literal `parameters={{ … }}` (CSF
  extraction). Reuse the same `Basic` (or story-specific) string from MDX
  `<Source>` when present. Details: `pnpm ui guide testing`.
  `pnpm spec:validate` fails when an Autodocs story uses a local demo, harness,
  fixture, or story surface without complete consumer source; `!autodocs`
  acceptance stories are exempt.
- **Docs code examples must be syntax highlighted.** Use Storybook's bundled
  `tsx` grammar for Svelte component markup in MDX `<Source>` blocks, fenced
  examples, and `parameters.docs.source`. The current `html`, `svelte`, and
  `markup` values render as plain text and are rejected by
  `pnpm spec:validate`.
- Type every public prop and add short JSDoc to non-obvious props, events, and
  state.
- `UI Forms/Guidance` is the catalog's high-level form decision guide. Link
  reusable form primitives back to it.
- `Shadcn/Guidance` is the catalog's shadcn add/convert decision guide. Link
  new or converted families back to it.
- Before adding a visual export, classify it in `COMPONENT_AUDIT.md` as a
  shared primitive or deferred item.
- `Shadcn/` is the UI-owned shadcn-svelte catalog. Source and stories live in
  `src/shared/shadcn/<family>/`. Import a family from
  `@lapismd/design-core/shadcn/<family>`.
- Shared forms live under `src/shared/forms/<family>/`. Import from
  `@lapismd/design-core/forms` or `@lapismd/design-core/forms/core`.
- Search filter chrome and filter-query language live under
  `src/shared/filter/`. Import from `@lapismd/design-core/filter`.
- Shared AI presentation lives under `src/shared/ai/<component>/` (experimental
  under `src/shared/ai/experimental/<component>/`). Import from
  `@lapismd/design-core/ai`, `@lapismd/design-core/ai/chat`, or `@lapismd/design-core/ai/experimental`.
- Structural AppShell lives under `src/shared/shell/app-shell/`. Import from
  `@lapismd/design-core/shell`.
- Interactive examples must be genuinely interactive. Play functions must
  exercise the real control flow and assert a visible or accessible result as
  well as any callback.

## Live reload

- Start the catalog with `pnpm storybook` (UI + Storybook Vitest watch) or
  `pnpm storybook:ui` for the UI only. Do not invoke `storybook dev` directly;
  package scripts enable polling so UI-owned source and colocated stories are
  detected reliably.
- Restart only after changing Storybook startup configuration such as
  `.storybook/main.ts`, addons, or the Vite configuration.

## Parallel workspaces and ports

- The default workspace uses Storybook port 9009. Before starting Storybook or
  browser/visual tests in another jj workspace, copy
  `.env.storybook.local.example` to the ignored `.env.storybook.local` and set
  an unused `STORYBOOK_PORT`.
- Do not edit tracked Storybook, Playwright, or package configuration for a
  workspace-specific port. Do not stop another workspace's listener to reclaim
  its port.
- Package scripts automatically load `.env.storybook.local`. The visual static,
  panel, AI acceptance, pointer-test, and spare debug ports derive from
  `STORYBOOK_PORT`; the README records the offsets. An explicit environment
  variable on the command line takes precedence for a one-off run.
- Run `pnpm storybook:stop` from the same workspace that started the catalog.
  It loads that checkout's port file and leaves the default/main catalog alone.
- Prefer `pnpm ui:mcp:stdio` for docs because it needs no port. For Storybook or
  Docs MCP over HTTP, use the current checkout's `STORYBOOK_PORT`, not the
  default 9009 URL shown above.

## Verification

- Run `pnpm checks` before committing UI work. It verifies formatting,
  `svelte-check` (including warnings), unit tests, Storybook Vitest tests, the
  static Storybook build, and Playwright visual comparison.
- `pnpm storybook:check` runs story tests + Storybook build + visual compare.
- Do not invent component props: verify them from the component source,
  TypeScript types, and existing stories.
- After a verified slice, commit promptly (`pnpm ui guide vcs`): prefer
  `jj commit` when available.

## Generated UI and visual baseline rules

- Use `pnpm ui:add <component>` to add or convert supported shadcn-svelte
  components (v1: `button` with `--overwrite`). Do not run the upstream
  `shadcn-svelte` CLI directly against the shared UI package tree.
- Treat an unsupported conversion or parity failure as a failed addition; do
  not bypass the gate by copying files manually.
- Do not remove `data-ui-component`, `data-ui-part`, `data-slot`, token
  metadata, or provenance files from generated components.

## Visual regression baselines

Local Playwright screenshots live under
`tests/visual/storybook.spec.ts-snapshots/` and are committed.

- Before changing Visual Delta behavior, read the normative
  [Visual Delta system specification](https://github.com/lapismd/storybook-addon-visual-delta/blob/main/spec/src/index.md)
  for the published `@lapismd/storybook-addon-visual-delta` package.
  Update the relevant stable requirement and
  [verification map](https://github.com/lapismd/storybook-addon-visual-delta/blob/main/spec/src/verification.md)
  in the Visual Delta repository before or with an intentional behavior change.
  Spec First CI lives on the Visual Delta GitHub repo, not this catalog.
- Do not re-host Visual Delta self-test Storybook/CSF under this UI catalog.
- **Never** update visual baselines unless the user explicitly asks. Do not pass
  `--update-snapshots` from `storybook`, `test:storybook`, `storybook:check`,
  or `checks`.
- `pnpm test:visual` sets Playwright `updateSnapshots: "none"` and must not
  write baselines.
- Treat `pnpm test:visual` failures as a possible unintended UI change. Inspect
  expected/actual/diff (or `pnpm test:visual:report`) before changing code or
  baselines.
- Existing component snapshots may be changed only through
  `VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>` after
  explicit human review, or via the Storybook **Visual Delta → Update
  baselines** action (dev server only; same gated updater with `--allow-dirty`).
- `ui:add` may create or replace baselines only for the component it is adding,
  and only after reference/candidate parity passes.
- Tag a story `skip-visual` (with a documented reason) only when pixel flake
  cannot be stabilized after disabling animations. Prefer Visual Delta panel
  **More → Skip visual tests** / **Include in visual tests** over hand-editing
  CSF (`POST /__visual-delta/skip-visual`).
- v1 visual suite captures light mode only (Chromium 1280×900 CSS viewport,
  project `deviceScaleFactor` (this catalog: `3`),
  `toHaveScreenshot` `scale: "device"`).
- Playwright baselines are served at `/visual-baselines` for live compare via
  `@lapismd/storybook-addon-visual-delta` (see the [canonical specification](https://github.com/lapismd/storybook-addon-visual-delta/blob/main/spec/src/index.md)).
  A Vite inject
  wires `parameters.visualDelta` for catalog stories that are not
  `skip-visual` when a matching PNG exists under the snapshot dir (Shadcn and
  UI Forms title/path rules — see README Visual Delta setup). Open the
  **Visual Delta** panel for overlay / heatmap;
  the first baseline auto-selects and pins to the story subject (component
  clip). Device-scale PNGs are displayed at CSS size in the overlay.
- In Storybook dev, the testing module includes a **Visual tests** target that
  shells out to the same Playwright suite (compare only — does not update
  baselines). Prefer that for UI status; CLI remains `pnpm test:visual`.

## Accessibility and theme

- Accessibility tests inherit `a11y.test: "error"`; resolve real violations in
  the component or story rather than weakening the global rules.
- `.cm-gutters` is the sole scoped exclusion for CodeMirror decorative gutters.
- Storybook disables the backgrounds addon. Brand themes use
  `@storybook/addon-themes` (`withThemeByDataAttribute` → `data-ui-theme`)
  plus the catalog `theme` toolbar global (currently `default`). Light/dark
  uses the catalog `colorMode` global; the decorator applies the same `.dark`
  class and shared UI tokens.
