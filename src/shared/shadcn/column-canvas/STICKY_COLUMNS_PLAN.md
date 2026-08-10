# Sticky Column Canvas panels

## Contract

- `Column` accepts presentation-only `sticky?: boolean`, defaulting to false.
- Consecutive leading rendered sticky columns activate in wide and fixed modes.
  Expanded columns retain `--ui-column-canvas-sticky-peek-width` (`4.75rem` by
  default); collapsed columns retain their complete collapsed rail.
- Sticky requests after the first rendered non-sticky column remain in normal
  flow. Compact mode ignores sticky presentation.
- Requested columns expose `data-sticky="true"`; active columns expose
  `data-sticky-state="flowing|stuck"`.
- Native scrolling, durable widths, collapse/close state, active following, and
  the V1 persistence schema remain unchanged.

## Staged status

| Stage                                  | Status     | Evidence                                                           |
| -------------------------------------- | ---------- | ------------------------------------------------------------------ |
| Public contract and progress artifact  | Complete   | Column prop, token, data attributes, and this document             |
| Sticky measurement and native geometry | Complete   | Storybook interactions and real Chromium geometry/input coverage   |
| Stories, examples, and documentation   | Complete   | Adaptive/fixed stories, consumer examples, MDX, and generated docs |
| Browser and repository validation      | Complete\* | Focused checks, pointer suite, production build, and catalog audit |
| Compare-only visual inspection         | Complete   | Both stories are `missing-baseline`; no baseline PNGs were written |

## Risks and guards

- **Sticky panels jump or alter scroll motion:** CSS sticky positioning clamps
  rendered geometry; it never writes canvas scroll position.
- **Multiple rails overlap:** the root measures resolved peek, gap, and
  collapsed widths and assigns cumulative offsets to the leading stack.
- **Stale offsets after structural changes:** layout refreshes after visibility,
  collapse/open, mode, root-size, and runtime sticky changes.
- **Compact behavior regresses:** compact clears active sticky state and retains
  the existing snapping and input-arbitration implementation.
- **Context scrollbars become misleading:** the visual body scrollbar is hidden
  only while its sticky column is actually stuck; scrolling remains available.
- **Presentation leaks into persistence:** sticky never enters controller state
  or the V1 layout payload.

## Validation evidence

- Focused controller Vitest: 8 passed.
- Focused Column Canvas Storybook Vitest: 10 passed, including both new sticky
  scenarios.
- `pnpm test:shadcn:pointer`: 13 passed overall. Eight Column Canvas browser
  scenarios include native wheel/touch threshold crossing, stable stacked
  peeks, non-leading sticky rejection, hidden stuck scrollbars with working body
  scrolling, resize, collapse/expand, close/reopen, path visibility, runtime
  sticky changes, fixed compatibility, and 1280/700/390 responsive round trips.
- The existing compact no-blank-tail, wheel arbitration, keyboard, touch,
  persistence geometry, and fixed free-scroll scenarios still pass after the
  max-content row change.
- `pnpm check`, `pnpm check:docs-mcp`, `pnpm check:no-tailwind`, changed-file
  Prettier validation, and `pnpm build-storybook`: passed.
- `pnpm workspace:visual:audit`: 111 stories, 70 pending, 36 approved, 5
  skipped, no failed stories, orphan baselines, or contract errors.
- Exact canonical Linux/ARM64 compare-only captures for
  `sticky-floating-columns` and `sticky-fixed-columns`: both executed and were
  visually inspected. Both report `outcome: missing-baseline` and
  `policyStatus: warning`; no baseline PNG was created or updated.
- A sibling-repository source search found no Column Canvas consumer, so no
  consumer refresh or workaround is required.
- `pnpm checks` reached `fmt:check` and stopped on six unrelated pre-existing
  formatting findings: `column-canvas-controller.svelte.ts`,
  `WorkspaceAboutDialog.css`, `WorkspaceAboutDialog.stories.svelte`,
  `app-workspace.ts`, `tree.ts`, and `WorkspaceExplorer.css`. Owned files pass
  formatting and the required checks above were run separately.

\* The sticky implementation and its focused validation are complete. The
aggregate command remains blocked only by the inherited formatting findings.
