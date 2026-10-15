# Shared Panel Toggle icon — slice 1

2026-10-15. Isolated `design-core-plain-css` workspace, parent `b4c28cef`.
The shared icon and review catalog are this slice. Migrating Workspace,
AppShell, Sidebar and mobile controls remains a separate review checkpoint.

## Contract and review refinements

- Keep the compact default and existing Column Canvas behavior; add standard
  Workspace geometry and left/right/top/bottom orientation to the public icon
  and controlled button.
- Export `PanelToggleIconProps` and accept SVG styling attributes. Import native
  icon CSS independently of Button styling. Document separate standard geometry
  tokens and shared motion behavior.
- Preserve the frame orientation. Top indicators grow downward; bottom
  indicators grow upward. Per user review, compact horizontal expansion is
  5 SVG units instead of the 9-unit left/right width. Standard bottom geometry
  stays unchanged.
- Consolidate the catalog into one Variant comparison story: both variants,
  four edges, collapsed/expanded/disabled controls, native-button composition
  and custom content. Keep all scenarios interactive and `visual-pending`.

## Focused baseline and regression evidence

- Before edits, Panel Toggle and Column Canvas: 18 stories pass, zero failures
  (`/tmp/dc-panel-baseline-stories.log`).
- Before edits, `pnpm test:shadcn:pointer tests/shadcn/panel-toggle-pointer.spec.ts`:
  five pass, zero failures (`/tmp/dc-panel-baseline-browser.log`).
- The compact bottom refinement reproduced one failure with the explicit
  5-unit expectation (`/tmp/dc-panel-bottom-before.log`). All eight expanded
  pointer tests subsequently passed, including fixed frame/edge geometry,
  keyboard, disabled controls, reduced motion, forced colors and token sizing
  (`/tmp/dc-panel-browser-final.log`).
- The initial consolidated story had one fixture error: userEvent correctly
  rejected a pointer click on a disabled button with `pointer-events: none`.
  The story now checks disabled semantics and native activation remains inert;
  real pointer behavior stays covered by Playwright. No product assertion was
  weakened.

## Final verification

- Reran the original focused command,
  `pnpm test:storybook src/shared/shadcn/panel-toggle/PanelToggle.stories.svelte src/shared/shadcn/column-canvas/ColumnCanvas.stories.svelte`:
  15 pass, zero failures across two files after consolidation (one comparison
  story and 14 Column Canvas stories; `/tmp/dc-panel-stories-consolidated.log`).
- Reran `pnpm test:shadcn:pointer tests/shadcn/panel-toggle-pointer.spec.ts`:
  eight pass, zero failures (`/tmp/dc-panel-browser-consolidated.log`).
- `pnpm checks` passed formatting, all three specification lanes, all four type
  lanes with zero errors/warnings, the no-Tailwind gate, 740 unit tests, three
  Turbo helper tests and 16 release/helper tests. The static Storybook build and
  metadata audit passed with zero contract errors; all 696 Storybook tests
  across 217 files passed (`/tmp/dc-panel-checks.log`).
- The aggregate command stopped on one Shell browser startup failure, with
  ten passing tests. The test was “horizontal pans reveal and dismiss both
  edge lanes” in `tests/shell/app-shell-mobile-pointer.spec.ts`; Visual Delta's
  `waitForVisualStoryFinished` raised a null `getAttribute` error before the
  gestures ran. An unchanged fresh run of that exact test passed (one pass,
  `/tmp/dc-panel-shell-focused.log`), followed by an unchanged fresh full Shell
  suite (11 pass, `/tmp/dc-panel-shell-final.log`). The original aggregate is
  recorded as failed; its required lanes subsequently passed individually.
- Full browser lanes completed: Workspace 15 pass, Shell 11 pass, AI three
  pass, and primitives 59 pass with one existing Chromium skip for a WebKit-only
  overlay scenario (which passed in WebKit). Total: 88 passes and one platform
  skip. Additional logs: `/tmp/dc-panel-ai-final.log` and
  `/tmp/dc-panel-shadcn-final.log`.
- `pnpm package:local` passed: three compiled CSS roots, 208 audited stylesheets
  and style blocks, zero remaining utility references (`/tmp/dc-panel-pack.log`).
  Archive: `.local/packages/lapismd-design-core-0.3.5-built.tgz`;
  SHA256: `f570e75a442f4170b159366e39b768ddfe4e466c1a7b49007c7da7660fe4ed4e`.
- `checkPublicPackageRuntime` from
  `scripts/check-public-package-runtime.mjs` passed against that archive and
  `https://registry.npmjs.org`. A fresh consumer passed types plus cold
  development and production acceptance for CSS, fonts, keyboard focus, light
  and dark themes, token overrides, panel geometry, reactive CodeEditor and
  bound Composer Input lifecycle without Tailwind tooling or Svelte diagnostics
  (`/tmp/dc-panel-consumer.log`).

## Review checkpoint

The built catalog contains only the Panel Toggle docs entry and
`shadcn-layout-panel-toggle--variant-comparison`. Review Storybook is running
at <http://127.0.0.1:9409/?path=/story/shadcn-layout-panel-toggle--variant-comparison>.
The story remains `visual-pending`; no snapshot baselines, main-workspace files
or downstream dependencies are changed. Slice 2 integration remains pending
user review of this slice.
