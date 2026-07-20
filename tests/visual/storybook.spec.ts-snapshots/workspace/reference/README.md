# Lapis workspace component targets

These images are tight component targets captured from the running Lapis
workspace at `http://localhost:9090/#/` on 2026-07-20.

The browser viewport was fixed at 1280 x 900 CSS pixels. A temporary full-page
capture was used only as a crop source; the committed assets are the component
boundaries used by the Storybook Visual Delta panel:

- `lapis-ribbon-chromium-darwin.png` — 49 x 861 action ribbon.
- `lapis-left-split-chromium-darwin.png` — 304 x 900 left sidebar split.
- `lapis-main-panel-chromium-darwin.png` — 672 x 900 single main panel.
- `lapis-right-split-chromium-darwin.png` — 256 x 900 right sidebar split.
- `lapis-horizontal-split-chromium-darwin.png` — 672 x 900 two-column split.
- `lapis-vertical-split-chromium-darwin.png` — 672 x 900 two-row split.

The horizontal and vertical states were created through Lapis's own tab drag
and drop path. The tab was merged back and the extra tab was closed after the
captures, leaving the running app at one main pane with one tab.

Unlike the earlier evidence stories, these PNGs are not rendered inside the
story canvas. Each story renders the reusable workspace component directly;
the PNG is supplied separately through `parameters.visualDelta`, matching the
component-clipped Shadcn visual workflow.
