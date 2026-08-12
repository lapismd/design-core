---
id: testing
title: Testing after UI changes
summary: Stories, Storybook Vitest, visual compare, and gated baseline updates.
sources:
  - AGENTS.md
  - README.md
---

# Testing after UI changes

After changing a core component, story, style, theme, or design token, validate
with the catalog — do not invent props or skip visual compare.

## Required loop

Run `pnpm spec:first` for protected production, package, tooling, or Storybook
host changes and keep the owning canonical chapter in the same diff. Run
`pnpm spec:check` when specification governance or mirrors change.

1. **Stories** — colocated `ComponentName.stories.svelte` in the same change.
   Interactive controls need play functions that assert a visible/accessible
   result (and callbacks when passed).
2. **Docs Show code** — Canvas **Show code** must show copy-pasteable consumer
   usage (public `@lapismd/design-core/…` imports + mount), not story harness.
   Auto-extraction from Svelte CSF often emits `{@render …}`, fixture helpers,
   or `*-story-frame` wrappers. For every new family (and when touching docs):
   - Colocate `ComponentName.example-sources.ts` exporting at least `Basic`
     (and story-specific snippets when the public API differs).
   - Set `parameters.docs.source` with `code`, `language` (`ts` when the snippet
     includes `<script>`), and `type: "code"` on `defineMeta` and/or each
     `Story`. Use an **object literal** `parameters={{ … }}` so CSF picks it up;
     do not hide the object behind a helper call.
   - Follow shadcn `*.example-sources` / Workspace Explorer. Reuse the same
     string from MDX `<Source code={…}>` when the docs page has a Usage block.
   - `pnpm spec:validate` enforces complete consumer source for Autodocs stories
     that render through a local demo, harness, fixture, or story surface;
     `!autodocs` acceptance stories are exempt.
3. **Live catalog** — `pnpm storybook` or `pnpm storybook:ui` (polling). Do not
   invoke `storybook dev` directly.
4. **Story tests** — Storybook Vitest / Storybook MCP `run-story-tests` while
   iterating. Prefer focused runs, then a broader pass before handoff.
5. **Visual compare** — `pnpm test:visual` (compare only; never writes
   baselines). Inspect expected/actual/diff or `pnpm test:visual:report` on
   failure.
6. **Before commit** — `pnpm checks` (fmt, `svelte-check --fail-on-warnings`,
   unit, storybook, static build, visual). Shorter: `pnpm storybook:check`.
   Vite / Storybook also fail transforms on first-party Svelte compiler
   warnings (`svelte.config.js` `onwarn`), except known-safe noise (`*`
   unused selectors; global-only styles on bits-ui/shadcn wrappers with
   no scopable HTML). Warnings from `node_modules` are logged only.
7. **Commit** — record the verified slice immediately (see `pnpm ui guide vcs`).
   Prefer `jj commit` when Jujutsu is available; otherwise use Git.

For an explicitly non-visual governance or documentation migration, use
`pnpm checks:nonvisual` and the relevant focused commands. This does not grant
permission to skip visual comparison for later component or styling changes.

## Visual baselines

Committed under `tests/visual/storybook.spec.ts-snapshots/`.

- **Never** update baselines unless the user explicitly asks.
- Do not pass `--update-snapshots` from storybook / test:storybook /
  storybook:check / checks.
- Existing baselines: only
  `VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>` after
  human review, or Storybook **Visual Delta → Update baselines** (dev; gated,
  `--allow-dirty`).
- **Primary PNG = end of play** (unchanged). Opt-in mid-play captures are
  sibling files `{slug}--{stepId}-chromium.png`, created from the Visual
  Delta **Interactions** tab for named `step("…")` / `visualCapture(step, …)`
  rows only. Import `visualCapture` from `src/storybook/visual-capture`.
- Dev create/update/run/review hit addon-owned Vite middleware
  (`/__visual-delta/*` via the Visual Delta preset `viteFinal`); the host still
  owns Playwright writers and `staticDirs` → `/visual-baselines`.
- Visual Delta self-test CSF lives in the package Storybook
  (the published `@lapismd/storybook-addon-visual-delta` package Storybook.
  catalog, not the UI Storybook.
- `ui:add` may create/replace baselines only for the component it is adding,
  and only after parity passes.
- Tag `skip-visual` only when pixel flake cannot be stabilized (document why).
  Prefer Visual Delta panel **More → Skip visual tests** /
  **Include in visual tests** (`POST /__visual-delta/skip-visual`) over
  hand-editing CSF. For bulk updates: `pnpm ui visual:tag skip|include|review
…` (see `pnpm ui visual:tag --help`). Skip/include preserves independent
  review metadata; skipped stories are excluded from Playwright / Testing
  Module runs. Review tags are mutually exclusive with one another.
- Visual runs need a **complete** `storybook-static` (`index.json` +
  `iframe.html`). Incomplete static hangs Playwright on 404s; `--skip-build`
  still rebuilds when the build gate says reuse is unsafe.
- v1 suite: light mode only, Chromium 1280×900 CSS viewport, deviceScaleFactor 3.

## Storybook MCP (when catalog is up)

- `get-storybook-story-instructions` before writing/editing stories or UI look
- `preview-stories` after visual changes
- `run-story-tests` for validation (not package.json story scripts via MCP path)

Offline convention lookup stays on `pnpm ui guide`.

## Accessibility and theme

- `a11y.test: "error"` — fix real violations; do not weaken global rules.
- Brand theme via catalog `theme` global + `@storybook/addon-themes`
  (`default` / `data-ui-theme`); light/dark via `colorMode` (`.dark` + shared
  tokens). Not backgrounds addon.
