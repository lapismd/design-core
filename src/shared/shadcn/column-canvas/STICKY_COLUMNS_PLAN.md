# Floating sticky Column Canvas rails

## Contract

- `Column` accepts presentation-only `sticky?: boolean`, defaulting to false,
  plus a named `stickyRail` snippet for consumer-owned return-button contents.
- Source columns always retain normal flow, durable width, resizers, body
  scrolling, and scrollbar presentation. Sticky presentation never applies
  `position: sticky` to the source column.
- When a leading sticky source moves underneath its rail-width slot, `Root`
  renders a separate opaque collapsed return rail. Clicking it scrolls back to
  the source without changing controller selection, collapse, close, or path.
- Consecutive leading rails stack at the root inline start with no gap. Expanded
  sources use `--ui-column-canvas-sticky-peek-width` (the collapsed-column
  `2.75rem` width by default); collapsed sources use their full collapsed width.
  The opaque stack ignores root padding so it is flush with both the inline
  start and full block extent.
- Each rail provides a circular outlined shadcn icon button plus its visible
  column label. The standard back arrow is the default; `stickyRail` customizes
  that button's contents.
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
  with zero flex gap, only internal separators, and offsets that cancel the
  root's inline and block padding.
- **Return controls mutate domain state:** the click handler writes only the
  root scroll position; it never calls the controller.
- **Stale rails after structural changes:** registration and layout refreshes
  cover visibility, close/open, collapse/expand, resize, mode, root size, and
  runtime `sticky` or `stickyRail` changes.
- **Compact behavior regresses:** compact clears both active source state and
  rendered rail state before its existing layout/input logic runs.
- **Sticky rails become unreachable with a vertical mouse wheel:** wide and
  fixed sticky canvases route only otherwise-unused vertical motion into scaled
  continuous horizontal movement. Scrollable bodies retain priority and
  non-sticky fixed canvases retain their original wheel behavior.
- **Presentation leaks into persistence:** registrations and stuck state live
  only in the root component.

## Validation evidence

- Focused Column Canvas Storybook Vitest: 10 passed after the corrected rail
  model, compact controls, and custom snippets were added.
- Live fixed-story inspection measured the stack at the root's exact inline and
  block start, with a full 460px root height, two 44px rails, no inter-rail gap,
  visible labels, and 32px circular outlined return buttons.
- The previous sticky slice passed the full 15-test shadcn pointer suite. The
  current follow-up passed all 8 Column Canvas cases across its full and focused
  Chromium runs, covering native motion, unused vertical-wheel routing, the
  non-sticky fixed boundary, gapless rail geometry, smooth and reduced-motion
  return, lifecycle changes, and compact suppression. Three unrelated first-page
  loads timed out only in the final parallel suite while Storybook was under
  concurrent build load; their isolated reruns passed.
- Focused controller Vitest: 8 passed. `pnpm check`, `pnpm check:no-tailwind`,
  `pnpm check:docs-mcp`, the owned-file Prettier check, `pnpm build-storybook`,
  and `pnpm workspace:visual:audit` passed.
- Compare-only canonical Linux/ARM64 Chromium execution captured and inspected
  both sticky stories. Each correctly reported `missing-baseline`; no PNG
  baseline was created or updated.
- Final `pnpm checks` stopped at `fmt:check` on six inherited files outside
  this slice: the Column Canvas controller and five Workspace sources. The
  owned-file Prettier check remains green; those unrelated files were not
  modified.
