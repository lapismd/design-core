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

1. **Stories** — colocated `ComponentName.stories.svelte` in the same change.
   Interactive controls need play functions that assert a visible/accessible
   result (and callbacks when passed).
2. **Live catalog** — `pnpm storybook` or `pnpm storybook:ui` (polling). Do not
   invoke `storybook dev` directly.
3. **Story tests** — Storybook Vitest / Storybook MCP `run-story-tests` while
   iterating. Prefer focused runs, then a broader pass before handoff.
4. **Visual compare** — `pnpm test:visual` (compare only; never writes
   baselines). Inspect expected/actual/diff or `pnpm test:visual:report` on
   failure.
5. **Before commit** — `pnpm checks` (fmt, svelte-check including warnings, unit,
   storybook, static build, visual). Shorter: `pnpm storybook:check`.
6. **Commit** — record the verified slice immediately (see `pnpm ui guide vcs`).
   Prefer `jj commit` when Jujutsu is available; otherwise use Git.

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
  sibling files `{slug}--{stepId}-chromium-darwin.png`, created from the Visual
  Delta **Interactions** tab for named `step("…")` / `visualCapture(step, …)`
  rows only. Import `visualCapture` from `src/storybook/visual-capture`.
- Dev create/update/run/review hit addon-owned Vite middleware
  (`/__visual-delta/*` via the Visual Delta preset `viteFinal`); the host still
  owns Playwright writers and `staticDirs` → `/visual-baselines`.
- `ui:add` may create/replace baselines only for the component it is adding,
  and only after parity passes.
- Tag `skip-visual` only when pixel flake cannot be stabilized (document why).
  Prefer Visual Delta panel **More → Skip visual tests** /
  **Include in visual tests** (`POST /__visual-delta/skip-visual`) over
  hand-editing CSF. Adding skip clears review tags; skipped stories are
  excluded from Playwright / Testing Module runs.
- v1 suite: light mode only, Chromium 1280×900 CSS viewport, deviceScaleFactor 3.

## Fava screen baselines (`Apps/Beancount/Screens`)

Live Fava captures for catalog alignment (not Superlist-style dated refs):

```bash
FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture
pnpm beancount:screens:verify
```

- Matrix + harness: `scripts/beancount-screens/`
- Writes PNGs **directly** to
  `tests/visual/storybook.spec.ts-snapshots/apps/beancount/screens/`
- Stories: `Apps/Beancount/Screens` (tag `fava-reference-visual`, currently
  `skip-visual` until compositions match). Visual Delta uses `/visual-baselines/...`.
- Point at studio with `BEANCOUNT_JS_STUDIO_ROOT` (default sibling
  `../code/beancount-js-studio`).
- Never refresh these PNGs with `test:visual:update`.

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
