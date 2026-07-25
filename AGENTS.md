# Storybook catalog

When working on UI components, use the local Storybook catalog and its browser
tests to validate the change. Human-oriented package overview and command list:
[`README.md`](./README.md).

## Agent reading order

Before inventing workflows, load package conventions offline via the CLI:

1. `pnpm ui guide` — topic index and reading order
2. [`styles.md`](./styles.md) — native CSS, tokens, no Tailwind in sources
3. `pnpm ui guide layers` — shadcn vs forms vs filter vs apps vs tasks
4. `pnpm ui guide shadcn` — `ui:add` / inspect / docs sync (never raw shadcn CLI)
5. `pnpm ui guide forms` — structured forms vs shadcn controls
6. `pnpm ui guide testing` — stories, checks, and visual baselines after a change
7. `pnpm ui guide vcs` — commit after each verified change (prefer `jj` when available)
8. `pnpm ui components` / `pnpm ui components <layer/id>` — list or show local
   usage and examples across shadcn, forms, filter, AI, apps, and
   `@stevejuma/tasks` (filter with `--layer`)

Use `--json` for machine-readable output (`pnpm ui guide testing --json`,
`pnpm ui components button --json`). Aliases: `pnpm ui:guide`,
`pnpm ui:components`, `pnpm ui:mcp`.

When Storybook is running (`pnpm storybook`), prefer the MCP endpoints below for
interactive story work and live docs; keep the CLI for offline / scripted use.

## CLI quick reference

| Command                                    | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `pnpm ui guide [topic]`                    | Agent conventions from `docs/agent/`      |
| `pnpm ui components [name] [--layer …]`    | Catalog list / show (all layers)          |
| `pnpm ui mcp [--port 9011] [--no-cache]`   | Standalone Docs MCP + llms (no Storybook) |
| `pnpm ui:add` / `ui:inspect` / `ui:doctor` | Generator pipeline (see README)           |

## Docs MCP and llms.txt

Docs MCP is mounted on the Storybook Vite server (starts/restarts with
`pnpm storybook`) at a path separate from the core Storybook MCP:

| Surface        | URL                                                                      | Use for                                                                                             |
| -------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Storybook MCP  | `http://localhost:9009/mcp`                                              | Story instructions, previews, changed stories, `run-story-tests`                                    |
| Docs MCP       | `http://localhost:9009/docs-mcp`                                         | `list-all-documentation`, `get-documentation`, `get-documentation-for-story` (Svelte props + usage) |
| llms index     | `http://localhost:9009/llms.txt` (markdown) / `/llms.md` (HTML)          | Bulk LLM/markdown index by layer                                                                    |
| Component page | `http://localhost:9009/llms/<layer>/<id>.md` (HTML) / `.txt` (markdown)  | Full props + examples for one component                                                             |
| Guide topic    | `http://localhost:9009/llms/guide/<topic>.md` (HTML) / `.txt` (markdown) | Same content as `pnpm ui guide <topic>`                                                             |

Cursor (`.cursor/mcp.json`):

- `stevejuma-ui-storybook` → `http://localhost:9009/mcp`
- `stevejuma-ui-docs` → `http://localhost:9009/docs-mcp`

Optional standalone fallback when Storybook is down: `pnpm ui mcp` (alias
`pnpm ui:mcp`) on `:9011` with the same Docs MCP + llms routes. Offline CLI:
`pnpm ui guide` / `pnpm ui components`. Cache under `.cache/ui-docs/`
(content-hash invalidation); bypass with `UI_DOCS_CACHE=0` or
`pnpm ui mcp --no-cache`.

In-catalog decision pages: `UI Forms/Guidance`, `Shadcn/Guidance`. Deferred
full-repo static `llms.txt` notes: `pnpm ui guide llms-extraction`.

## Component documentation

- `@storybook/addon-docs` is enabled and the shared preview applies the
  `autodocs` tag. Stories are the living documentation.
- Add or update a colocated `ComponentName.stories.svelte` in the same change
  as every visual component. Point `defineMeta` at the actual component, give
  the story group a clear catalog title, and give each story a human-readable
  scenario name.
- Type every public prop and add short JSDoc to non-obvious props, events, and
  state.
- `UI Forms/Guidance` is the catalog's high-level form decision guide. Link
  reusable form primitives back to it.
- `Shadcn/Guidance` is the catalog's shadcn add/convert decision guide. Link
  new or converted families back to it.
- Before adding a visual form export, classify it in `COMPONENT_AUDIT.md` as a
  shared primitive, app-specific component, or deferred item.
- `Shadcn/` is the UI-owned shadcn-svelte catalog. Source and stories live in
  `src/shared/shadcn`. Import a family from `@stevejuma/ui/shadcn/<family>`.
- Shared forms live under `src/shared/forms/<family>/`. Import from
  `@stevejuma/ui/forms` or `@stevejuma/ui/forms/core`.
- Search filter chrome and filter-query language live under
  `src/shared/filter/`. Import from `@stevejuma/ui/filter`.
- App-specific components belong under `src/apps/cv` or `src/apps/beancount`.
  They must receive props and callbacks rather than importing application
  routers or host app context. Story titles for those surfaces: `Apps/CV/...`
  and `Apps/Beancount/...`.
- `@stevejuma/tasks` is a clean-room reference/spec package until an implementation
  slice adds Stories. Follow `pnpm ui guide tasks`; use synthetic fixtures and
  retain only sanitised capture evidence.
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
  `deviceScaleFactor: 3`, `toHaveScreenshot` `scale: "device"`).
- Playwright baselines are served at `/visual-baselines` for live compare via
  the workspace `storybook-addon-visual-delta` package
  (`packages/storybook-addon-visual-delta/src`; see `VENDOR.md`). A Vite inject
  wires `parameters.visualDelta` for catalog stories that are not
  `skip-visual` when a matching PNG exists under the snapshot dir (Shadcn,
  UI Forms, Apps, and Tasks title/path rules — see README Visual Delta
  setup). Open the **Visual Delta** panel for overlay / heatmap;
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
