# Shared Swipe Item

Implementation contract and progress record for the project-authored
`@stevejuma/ui/shadcn/swipe-item` family.

## Classification and provenance

- Layer: generic shared primitive under `src/shared/shadcn/swipe-item`.
- Source: project-authored native Svelte and CSS.
- Dependencies: the existing shared Button family only.
- Registry status: the pinned shadcn-svelte registry has no `swipe-item` or
  `swipeable` item. The unrelated upstream `item` family is unsupported by the
  local converter. This component does not copy those sources and must not be
  installed with the raw upstream CLI.
- Consumers own domain actions, persistence, confirmation, undo, async errors,
  and item removal.

## Research basis

- SwiftUI `swipeActions` associates actions with logical leading/trailing edges
  and optionally performs an action after a full swipe.
- Ionic `ion-item-sliding` measures an open ratio, supports start/end option
  panes, and can expand an action for a complete swipe.
- Android `SwipeToDismissBox` separates gesture state, positional thresholds,
  and confirmation callbacks.
- W3C Pointer Events provides one device-independent pointer stream and requires
  `touch-action` to declare direct-manipulation behavior before a gesture starts.
- WCAG failure F105 names swipe-to-reveal without an equivalent tap/click
  control as a failure. `SwipeItem.Trigger` is therefore part of the public
  family and examples must expose it visibly.

References:

- https://developer.apple.com/documentation/SwiftUI/View/swipeActions%28edge%3AallowsFullSwipe%3Acontent%3A%29
- https://ionicframework.com/docs/api/item-sliding
- https://developer.android.com/reference/kotlin/androidx/compose/material3/SwipeToDismissBoxState
- https://www.w3.org/TR/pointerevents/
- https://www.w3.org/WAI/WCAG22/Techniques/failures/F105

## Public contract

```ts
type SwipeItemSide = "start" | "end";
type SwipeItemOpen = SwipeItemSide | null;

interface SwipeItemFullSwipeEvent {
  side: SwipeItemSide;
  pointerType: string;
}
```

The compound exports are:

- `SwipeItem.Root`: bindable `open`, `disabled`, `onOpenChange`, and gesture
  thresholds.
- `SwipeItem.Content`: translated foreground row and gesture surface.
- `SwipeItem.Actions`: one measured logical-edge pane with optional
  `onFullSwipe`.
- `SwipeItem.Action`: shared Button composition that closes after activation
  unless prevented or configured otherwise.
- `SwipeItem.Trigger`: shared Button composition that provides the required
  tap/click disclosure path.

Defaults:

- activation distance: `10px`;
- reveal threshold: `0.5` of the measured action-pane width;
- full-swipe threshold: `0.75` of the measured item width;
- velocity threshold: `0.45px/ms`, used only to settle open/closed.

## Gesture state machine

1. Ignore disabled, non-primary, non-left-button, action-pane, trigger, form,
   editor, and `[data-swipe-item-gesture-ignore]` starts.
2. Record the stable open side and pointer origin. Mouse/stylus use pointer
   capture; touch uses document listeners matching the existing Shell pattern.
3. Stay pending until the activation distance is crossed. Abort when vertical
   movement wins; `touch-action: pan-y` remains static for the entire gesture.
4. Translate Content within the available logical-edge bounds. Permit resisted
   overswipe only where that side has an `onFullSwipe` callback.
5. On pointer release:
   - commit once when the distance still exceeds the full-swipe threshold;
   - otherwise reveal when distance or velocity selects an available pane;
   - otherwise close.
6. Pointer cancellation restores the prior stable state. A completed drag
   suppresses the compatibility click. A full-swipe callback runs only on
   release and the item closes afterward if it remains mounted.

Logical `start`/`end` maps through the rendered writing direction. Resizing an
open item remeasures and preserves the logical state rather than stale pixels.

## Accessibility and interaction

- Hidden action panes are `inert` and `aria-hidden`.
- Trigger supplies `aria-expanded` and `aria-controls`, responds to native
  Button keyboard activation, and remains the focus-restoration target.
- Escape closes from a trigger or action and restores focus to the matching
  trigger when available.
- Tapping Content while open closes and consumes the tap. Closed Content
  preserves consumer click behavior.
- Clicking outside closes an open item.
- Action targets have a mobile-friendly minimum size.
- Reduced-motion users get immediate settling without transform animation.

## Progress

- [x] Contract and research recorded.
- [x] Component classified in `COMPONENT_AUDIT.md`.
- [ ] Pure gesture math and unit tests.
- [ ] Compound component family and public tokens.
- [ ] Storybook docs and interaction stories.
- [ ] Real mouse and touch-pointer Playwright coverage.
- [ ] Focused checks and full repository validation.
- [ ] Live visual review; baseline creation only after explicit approval.

## Validation evidence

Record exact commands and outcomes here as slices land. Compare-only visual
checks must remain distinct from any later approved baseline write.
