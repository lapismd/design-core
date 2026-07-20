# Lapis workspace reference captures

These images are target evidence for the reusable workspace stories. They were
captured from the running Lapis Notes workspace at `http://localhost:9090/#/`
on 2026-07-20 with a 1280 x 900 CSS-pixel viewport.

The source implementation is
`/Users/stevejuma/code/lapis-notes/packages/workspace`. The app's saved default
layout is the reset point for the desktop shell captures.

## Captures

- `lapis-default-layout-chromium-darwin.png` - complete saved desktop layout.
- `lapis-action-ribbon-chromium-darwin.png` - icon-only action ribbon.
- `lapis-left-sidebar-chromium-darwin.png` - left sidebar tabs and file panel.
- `lapis-right-sidebar-groups-chromium-darwin.png` - collapsible right groups.
- `lapis-top-tab-chrome-chromium-darwin.png` - top-tab strips across panes.
- `lapis-tabs-and-splits-chromium-darwin.png` - complete central split tree.
- `lapis-active-tab-pane-chromium-darwin.png` - one top tab and its body.
- `lapis-stacked-tabs-chromium-darwin.png` - temporary stacked presentation;
  the app was restored to the saved top-tab layout after capture.
- `lapis-stacked-layout-full-chromium-darwin.png` - the full shell while that
  temporary stacked pane was active, for contextual comparison.
- `lapis-drop-{top,right,bottom,left,center}-chromium-darwin.png` - stabilized
  live drop overlays. Each capture uses Lapis's own `dragstart` and `dragover`
  event path and was cancelled with `dragend`, so the saved layout was not
  changed.

Reference files live outside the story-baseline namespace on purpose. Stories
opt into them through explicit `parameters.visualDelta.images`; Playwright's
generated story screenshots remain under `workspace/components/`.
