# Responsive Column Canvas scrolling

## Contract

- `Root` accepts `displayMode="auto" | "fixed" | "compact"` and defaults to
  `auto`.
- `auto` resolves from the bounded root width. The default
  `compactBreakpoint` is `960` CSS pixels.
- The resolved mode is exposed as `data-display-mode="wide|compact|fixed"`.
- Wide mode retains durable pixel widths, resize handles, the trailing spacer,
  independent vertical bodies, and proximity snapping.
- Compact mode makes each expanded column one stage wide while exposing
  `--ui-column-canvas-compact-peek-width` of the preceding column. It hides
  resize handles, removes the trailing blank tail, and uses mandatory snapping.
- `fixed` retains the previous fixed-width, free-horizontal-scroll geometry and
  does not auto-follow columns.
- The last rendered, non-closed column is active. Auto-follow runs only after a
  path, visibility, collapse/open, restoration, or resolved-mode transition.
- Compact vertical wheel input stays in a scrollable column body until its
  boundary, then advances the horizontal canvas when possible. Unconsumed edge
  input remains available to the surrounding page.
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
- **Wheel hijacking:** vertical input is prevented only when the target body
  cannot consume it and the canvas can move in the requested direction.
- **Compact widths leak into persistence:** CSS derives compact width from the
  container; controller widths are never changed during mode transitions.
- **Small-screen blank tail:** the durable trailing spacer is reduced to the
  root's end padding and the active column snaps to the content edge.
- **Motion and focus disruption:** programmatic alignment does not focus a
  column and uses instant motion when reduced motion is requested.

## Validation evidence

- `pnpm exec vitest run --project unit
src/shared/shadcn/column-canvas/column-canvas-controller.spec.ts`: 8 passed.
- `pnpm exec vitest run --project storybook
src/shared/shadcn/column-canvas/ColumnCanvas.stories.svelte`: 8 passed.
- `pnpm test:shadcn:pointer`: 10 passed, including 5 Column Canvas browser
  scenarios covering wide, 700px/390px compact, fixed, wheel, native touch,
  keyboard, resize round-trips, close/reopen, collapse/expand, reduced motion,
  focus retention, and nested vertical-scroll arbitration.
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
- `pnpm workspace:visual:audit`: passed with 111 stories, 70 pending, 36
  approved, 5 skipped, no failed stories, no orphan baselines, and no contract
  errors.
- Exact compare-only capture for `responsive-adaptive-canvas` and
  `fixed-compatibility`: both completed under the canonical Linux/ARM64 capture
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
