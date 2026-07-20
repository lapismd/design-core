# Align reusable workspace with Lapis desktop

## Goal

Bring `@stevejuma/workspace` into visual and behavioral alignment with the
Lapis desktop workspace shell while keeping the package reusable, private,
normalized-CSS-only, and free of Lapis application stores.

The implementation must be verified by a local parity harness, Storybook
stories, interaction tests, controller tests, and immutable visual comparison.
Do not update visual baselines without explicit human review.

## Reference Contract

- Pin the source reference to Lapis revision
  `97518d8158a12ade0f9b1a35aa051ffcf5dfe8ac`.
- Store deterministic reference fixtures under
  `packages/workspace/reference/lapis/97518d8158a12ade0f9b1a35aa051ffcf5dfe8ac/`.
- Record source provenance, fixture checksums, and the Lapis files used for each
  workspace surface.
- Treat `~/code/lapis-notes` as a refresh source only. CI and local verification
  should run from checked-in fixtures, not from a mutable sibling checkout.

## Harness

Mirror this repo's shadcn conversion approach for workspace:

- Add a workspace adapter over the existing reference/candidate/diff parity
  tooling in `scripts/ui-generator/visual`.
- Render paired reference and candidate pages with deterministic Chromium
  settings, reduced motion, stable fonts, and component-clipped screenshots.
- Fail first on geometry mismatch, then on pixel diff above the scenario's
  threshold.
- Write artifacts to a report folder: reference PNG, candidate PNG, diff PNG,
  and generated HTML pages.
- Introduce a scoped `[data-workspace-theme="lapis-reference"]` theme for
  reference checks. It maps workspace tokens to this repo's semantic CSS
  variables and does not add Tailwind as a runtime dependency.

## Parity Scenarios

The harness must cover these shell surfaces before the matching implementation
is considered done:

- Top tabs: default, active, hover, close affordance, title truncation.
- Top-tab overflow: narrow and wide cases with no unwanted scrollbars.
- Tab reorder indicators.
- Five-zone content drops: left, right, top, bottom, center.
- Split result after dropping onto an edge.
- Stacked tab view.
- Sidebar icon-only tabs.
- Sidebar groups expanded and collapsed.
- Left action ribbon.
- Shell spacing, dividers, and view frame header/body.

## Required Gates Per Stage

Each implementation stage must pass four focused gates before moving on:

- Unit tests for state/model behavior.
- Browser interaction tests for the user-visible flow.
- Geometry assertions for dimensions, positions, and overflow behavior.
- Pixel parity under `lapis-reference` theme for the changed surface.

Storybook a11y checks remain enabled. Keyboard tab selection, tab close buttons,
ribbon labels, sidebar tab labels, and group `aria-expanded` behavior must be
asserted.

## Implementation Stages

1. Harness self-test

   - Add the generic workspace parity harness.
   - Verify identical fixtures pass and geometry mismatches fail.

2. Reference fixtures

   - Add the pinned Lapis manifest and scoped reference theme.
   - Add static fixtures for top tabs and drop overlays.

3. Drop behavior

   - Extract the Lapis five-zone drop geometry into reusable workspace code.
   - Add tests for 25 percent edge threshold, nearest-edge selection, 25 percent
     left/right/top overlays, 35 percent bottom overlay, and full center overlay.
   - Add controller support for atomic center moves and edge split drops.

4. Top tabs

   - Replace bespoke tab chrome with a direct normalized-CSS port of Lapis top
     tabs.
   - Preserve ARIA-valid tab semantics with structurally separate close controls
     positioned inside the visual tab.
   - Verify active contour, hover fill, close visibility, truncation, fixed/min/max
     sizing, and absence of accidental scrollbars.

5. Stacked tabs

   - Port stacked geometry and interaction behavior independently from top tabs.
   - Verify vertical title treatment, sticky tab columns, active/hover/close
     states, and view body sizing.

6. Sidebar and ribbon

   - Align the 44px left action ribbon, icon-only sidebar tabs, sidebar group
     headers, collapse controls, panel bodies, and divider geometry.
   - Keep consumer content supplied through typed group/tab configuration and
     render snippets.

7. View frame

   - Add or finalize a shared tab body component with the view header and header
     options.
   - Verify header sizing, options placement, content flex behavior, and no
     overlap across split and stacked layouts.

8. Normal theme verification
   - Re-run the same interaction and geometry tests under this repo's normal
     semantic light/dark themes.
   - Run `pnpm storybook:check` and inspect visual diffs without updating
     baselines.

## Explicit Non-Goals

- Do not port Lapis vault, plugin, persistence, mobile, popout, floating window,
  desktop window controls, or application command behavior.
- Do not depend on Tailwind for workspace runtime styling.
- Do not update committed Playwright visual baselines until explicitly approved.
