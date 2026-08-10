# Floating sticky Column Canvas rails

## Contract

- `Column` accepts presentation-only `sticky?: boolean`, defaulting to false,
  plus a named `stickyRail` snippet for consumer-owned collapsed contents.
- Source columns always retain normal flow, durable width, resizers, body
  scrolling, and scrollbar presentation. Sticky presentation never applies
  `position: sticky` to the source column.
- When a leading sticky source moves underneath its rail-width slot, `Root`
  renders a separate opaque collapsed return rail. Clicking it scrolls back to
  the source without changing controller selection, collapse, close, or path.
- Consecutive leading rails stack at the root inline start with no gap. Expanded
  sources use `--ui-column-canvas-sticky-peek-width` (`4.75rem` by default);
  collapsed sources use their full collapsed width.
- A sticky request after the first rendered non-sticky column stays inactive.
  Compact mode renders no floating rails and retains its existing peek,
  snapping, wheel routing, and scrollbar treatment.
- Requested source columns expose `data-sticky="true"` and active sources expose
  `data-sticky-state="flowing|stuck"`; floating replacements expose
  `data-sticky-for` and `data-sticky-state="stuck"`.
- Sticky configuration and rail visibility remain transient presentation state.
  The controller and V1 persistence schema are unchanged.

## Staged status

| Stage                                      | Status   | Evidence                                                         |
| ------------------------------------------ | -------- | ---------------------------------------------------------------- |
| Corrected public contract and registration | Complete | `stickyRail`, root registration, and this document               |
| Gapless floating stack and return action   | Complete | Live Storybook inspection and focused story interactions         |
| Stories, examples, and documentation       | Complete | Adaptive/fixed custom rails and consumer-facing prose            |
| Chromium regression coverage               | Complete | Native motion, geometry, return, lifecycle, and responsive tests |
| Repository and compare-only validation     | Complete | Focused checks, build, audit, and visual comparison              |

## Risks and guards

- **Source panels accidentally pin or resize:** browser tests compare source
  movement directly with `scrollLeft` and assert `position: relative`.
- **Content shows between stacked rails:** the root renders one opaque stack
  with zero flex gap and only internal separators.
- **Return controls mutate domain state:** the click handler writes only the
  root scroll position; it never calls the controller.
- **Stale rails after structural changes:** registration and layout refreshes
  cover visibility, close/open, collapse/expand, resize, mode, root size, and
  runtime `sticky` or `stickyRail` changes.
- **Compact behavior regresses:** compact clears both active source state and
  rendered rail state before its existing layout/input logic runs.
- **Presentation leaks into persistence:** registrations and stuck state live
  only in the root component.

## Validation evidence

- Focused Column Canvas Storybook Vitest: 10 passed after the corrected rail
  model and custom snippets were added.
- Live fixed-story inspection confirms two custom collapsed replacements render
  as one opaque stack with no visible gap.
- Full shadcn pointer suite: 15 passed, including 8 Column Canvas responsive and
  sticky cases covering native motion, gapless rail geometry, smooth and
  reduced-motion return, lifecycle changes, and compact suppression.
- Focused controller Vitest: 8 passed. `pnpm check`, `pnpm check:no-tailwind`,
  `pnpm check:docs-mcp`, the owned-file Prettier check, `pnpm build-storybook`,
  and `pnpm workspace:visual:audit` passed.
- Compare-only canonical Chromium execution passed both sticky stories. Each
  correctly reported `missing-baseline`; no PNG baseline was created or
  updated. The wrapper's final checkout guard separately detected the
  concurrently changed Workspace Popout source outside this slice.
- Final `pnpm checks` stopped at `fmt:check` on six inherited files outside
  this slice: the Column Canvas controller and five Workspace sources. The
  owned-file Prettier check remains green; those unrelated files were not
  modified.
