# Swipe Item

Reveal logical start or end actions by translating and clipping an item's
foreground content. Swipe Item supports touch, mouse, and stylus pointer
drags, trackpad / horizontal wheel swipes, visible click triggers, and
optional release-only full-swipe callbacks.

This is a project-authored native-CSS family. It composes the shared Button and
does not copy the unrelated upstream shadcn Item family.

## Import

```ts
import * as SwipeItem from "@lapismd/design-core/shadcn/swipe-item";
```

## Usage

```svelte
<script lang="ts">
  import * as SwipeItem from "@lapismd/design-core/shadcn/swipe-item";

  function archive() {
    // Consumer-owned domain work.
  }
</script>

<SwipeItem.Root>
  <SwipeItem.Actions side="end" onFullSwipe={archive}>
    <SwipeItem.Action onclick={archive}>Archive</SwipeItem.Action>
  </SwipeItem.Actions>

  <SwipeItem.Content>
    <span>Quarterly planning</span>
    <SwipeItem.Trigger side="end" aria-label="Show message actions">
      More
    </SwipeItem.Trigger>
  </SwipeItem.Content>
</SwipeItem.Root>
```

## Interaction contract

- `start` and `end` follow the rendered writing direction.
- A 10-pixel horizontal activation distance preserves vertical scrolling with
  static `touch-action: pan-y`. The same threshold applies to trackpad /
  horizontal `wheel` gestures before the item claims the stream.
- Vertical-dominant wheel input is left to the page; horizontal-dominant wheel
  follows the content live and settles after a short idle gap using the same
  open / close / full-swipe rules as pointer release.
- Releasing past half the measured action width opens the pane.
- A full-swipe callback fires once, on release past 75% of item width. Velocity
  can settle a pane open or closed but never commits by itself. Wheel full
  swipes report `pointerType: "wheel"`.
- Escape, a tap on open Content, or an outside pointer press closes the item.
- Nested buttons, links, form controls, and editors never start a swipe
  gesture; use `data-swipe-item-gesture-ignore` for other custom hit targets
  that must own their pointer stream. Pointer capture begins only after the
  horizontal activation distance is crossed on non-interactive Content.

## Accessibility

Swipe must not be the only route to an action. Provide a visible
`SwipeItem.Trigger` for each action side or an equivalent tap/click control in
the same screen. Trigger exposes `aria-expanded` and `aria-controls`; hidden
action panes remain `inert` and `aria-hidden`.

Every icon-only Trigger and Action requires an accessible label. Consumers own
confirmation, undo, and error feedback for destructive or asynchronous work.

## Styling

Override the public `--ui-swipe-item-*` tokens on an ancestor. Production
sources use native CSS; Action and Trigger controls compose the shared Button
family.
