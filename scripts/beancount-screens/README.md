# Beancount / Fava screen capture

Playwright harness that starts local Fava and writes full-page PNGs **directly**
into Storybook visual baseline paths under
`tests/visual/storybook.spec.ts-snapshots/apps/beancount/screens/`.

No dated reference tree, Chrome MCP, or sync step.

## Requirements

- Local checkout of [beancount-js-studio](https://github.com/) (or set
  `BEANCOUNT_JS_STUDIO_ROOT`).
- Default path: sibling `../code/beancount-js-studio` relative to this repo.
- Fava uses `sample.beancount` at the studio root.

## Viewport

Matches catalog visual baselines: **1280×900 CSS**, **deviceScaleFactor 3**,
light mode only. On-disk names use the Playwright suffix
`-chromium-darwin.png`.

## Commands

```bash
# Write Fava screenshots into baseline destinations (required gate)
FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture

# Optional: subset
FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture -- --ids=dashboard,journal

# Check matrix paths + story ids
pnpm beancount:screens:verify
```

Do **not** refresh these PNGs with `pnpm test:visual:update` — that would
overwrite Fava truth with Storybook renders. Re-run capture when Fava product
UI changes intentionally.

## Matrix

[`capture-matrix.json`](./capture-matrix.json) maps each
`Apps/Beancount/Screens` story id to a Fava `viewPath` and exact `outputPath`.
