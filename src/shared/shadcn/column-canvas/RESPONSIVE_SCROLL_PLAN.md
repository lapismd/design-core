# Responsive Column Canvas scrolling

## Contract

- `Root` accepts `displayMode="auto" | "fixed" | "compact"` and defaults to
  `auto`.
- `auto` resolves from the bounded root width. The default
  `compactBreakpoint` is `960` CSS pixels.
- The resolved mode is exposed as `data-display-mode="wide|compact|fixed"`.
- Wide mode transiently gives the newest two rendered columns enough minimum
  width to share the stage, within their configured maximum widths. Larger
  durable widths remain authoritative; an older rendered column stays visible through
  `--ui-column-canvas-wide-context-width`. Resize handles, the trailing spacer,
  independent vertical bodies, and proximity snapping remain.
- Compact mode makes each expanded column fill the complete bounded stage with
  no preceding-column peek. It hides resize handles and the auxiliary
  horizontal scrollbar, removes the trailing blank tail, and uses mandatory
  snapping.
- `fixed` retains the previous fixed-width, free-horizontal-scroll geometry and
  does not auto-follow columns.
- The last rendered, non-closed column is active. Auto-follow runs only after a
  path, visibility, collapse/open, restoration, or resolved-mode transition.
- Scrollable column bodies retain vertical wheel ownership while they can move.
  At a boundary—or over a non-scrollable column—vertical input maps to slower,
  smooth adjacent-column motion with a deliberate ease-in/ease-out trajectory;
  reduced-motion preferences keep it instant. Repeated events while that
  transition is active retain the current adjacent target rather than skipping
  a column. Input at a horizontal edge remains available to the surrounding
  page.
- Root-level Arrow Left/Right and Home/End move among compact snap points without
  changing controller selection or focus.
- V1 persistence remains widths, collapse, and close state only. Resolved mode,
  compact geometry, and scroll position remain transient.

## Staged status

| Stage                                 | Status     | Evidence                                                                                            |
| ------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| Contract and progress artifact        | Complete   | Public types/props, resolved data attribute, and this document                                      |
| Responsive context and geometry       | Complete   | Focused Storybook interactions and Chromium 1280/700/390 assertions                                 |
| Active following and input routing    | Complete   | Real Chromium wheel, native touch, keyboard, body-boundary, focus, and outer-page tests             |
| Examples, docs, tokens, and Storybook | Complete   | Adaptive and fixed stories are `visual-pending`; docs and token exports updated                     |
| Chromium and repository validation    | Complete\* | Focused/full tests, pointer suites, checks, production Storybook, audit, and canonical visuals pass |
| Compare-only visual inspection        | Complete   | Exact canonical captures inspected; both are `missing-baseline`; no PNG baselines written           |

## Risks and guards

- **Auto-follow fights manual scrolling:** alignment is event-triggered rather
  than tied to rendering or scroll state.
- **Wheel hijacking:** vertical-scroller lookup stops at the canvas root so an
  outer scroll owner cannot mask available horizontal movement. Input is
  prevented only when the target body cannot move and the canvas can move in
  the requested direction.
- **Responsive widths leak into persistence:** CSS derives compact and wide-pair
  minimum widths from the container; controller widths are never changed during
  mode transitions. A deliberate resize starts from the presented wide width
  and remains the only action that updates durable geometry.
- **Small-screen blank tail:** the durable trailing spacer is reduced to the
  root's end padding and the active column snaps to the content edge.
- **Motion and focus disruption:** programmatic alignment does not focus a
  column and uses instant motion when reduced motion is requested.

## Validation evidence

- The signed-in Superlist reference was inspected visually at 1343x997,
  900x800, and 390x844. Its wide layout keeps the newest two task panels side by
  side with an older task-panel slice, while the narrower layouts give the
  newest task panel the complete content stage. Superlist's separate navigation
  rail remains consumer-owned and is not part of this component contract.

- `pnpm exec vitest run --project unit
src/shared/shadcn/column-canvas/column-canvas-controller.spec.ts`: 8 passed.
- `pnpm exec vitest run --project storybook
src/shared/shadcn/column-canvas/ColumnCanvas.stories.svelte`: 11 passed.
- `pnpm exec playwright test tests/shadcn/column-canvas-scroll.spec.ts`: 9
  passed, including full-stage 700px/390px compact geometry and wide newest-pair
  context geometry.
- `pnpm test:shadcn:pointer`: 16 passed, including 9 Column Canvas browser
  scenarios covering wide, 700px/390px compact, fixed, wheel, native touch,
  keyboard, resize round-trips, close/reopen, collapse/expand, reduced motion,
  focus retention, and nested vertical-scroll arbitration.
- The compact wheel scenario places a non-scrollable column inside a scrollable
  ancestor. It asserts that available motion smoothly changes the canvas
  `scrollLeft` without changing the ancestor `scrollTop`, and that a scrollable
  body hands off at both boundaries. The backward boundary regression samples
  the first 12 animation frames, requires less than 35% of the stage distance
  to be covered in that opening interval, repeats the same wheel direction to
  guard against skipped columns, and verifies the exact adjacent snap point.
  It separately verifies page handoff once the canvas reaches its horizontal
  edge.
- `pnpm check`: 0 errors and 0 warnings.
- `pnpm check:docs-mcp`: both TypeScript configurations passed.
- `pnpm check:no-tailwind`: passed.
- `pnpm build-storybook`: passed.
- `pnpm test:unit`: 80 files and 486 tests passed.
- `pnpm test:storybook`: 185 files and 529 tests passed after a warmed retry;
  the first run was interrupted by Vite's dependency optimizer reloading newly
  discovered `@lezer/common` chunks.
- `pnpm test:workspace:pointer`: 13 passed.
- `pnpm test:shell:pointer`: 5 passed.
- `pnpm test:ai-chat-browser`: 2 passed.
- `pnpm workspace:visual:audit`: passed with 112 stories, 71 pending, 36
  approved, 5 skipped, no failed stories, no orphan baselines, and no contract
  errors.
- Exact compare-only capture for `responsive-adaptive-canvas` and
  `product-workspace-showcase`: both completed under the canonical Linux/ARM64 capture
  profile with `outcome: missing-baseline` and `policyStatus: warning`. The
  actual captures were inspected; no baseline PNG was created or updated.
- `pnpm test:visual`: all 415 canonical Chromium captures completed. The result
  ledger contains 311 passes, 8 changes within tolerance, 30 mismatches, and 66
  missing baselines under warning policy. Every Column Canvas story is
  `missing-baseline`; the repo-wide mismatches are outside this component and
  remain separate from this slice.
- `pnpm checks` reached `fmt:check` and stopped on six tracked files that were
  already unformatted before this slice:
  `column-canvas-controller.svelte.ts`, `WorkspaceAboutDialog.css`,
  `WorkspaceAboutDialog.stories.svelte`, `app-workspace.ts`, `tree.ts`, and
  `WorkspaceExplorer.css`. The remaining checks were run individually with the
  passing results above. Changed-file Prettier validation passes.

\* The requested implementation and validation are complete. The aggregate
`pnpm checks` command remains blocked only by the unrelated pre-existing
formatting findings listed above.
