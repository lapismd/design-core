<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { useSwipeItemState } from "./swipe-item-context.svelte.js";
  import type { SwipeItemFullSwipeEvent, SwipeItemSide } from "./types.js";

  let {
    ref = $bindable(null),
    side,
    onFullSwipe,
    class: className,
    children,
    "aria-label": ariaLabel,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    side: SwipeItemSide;
    /** Runs once on pointer release beyond Root's full-swipe threshold. */
    onFullSwipe?: (event: SwipeItemFullSwipeEvent) => void;
  } = $props();

  const swipeItem = useSwipeItemState();

  $effect(() => {
    if (!ref) return;
    const fullSwipeCallback = onFullSwipe;
    const measure = () => {
      if (!ref) return;
      const rectWidth = ref.getBoundingClientRect().width;
      const minWidthPx = Number.parseFloat(getComputedStyle(ref).minWidth);
      // If the pane sets min-width as its rest/open size (e.g. growing reveal
      // UIs), prefer that over the live rect so settle thresholds stay stable.
      // Do not read gesture/drag state here — that re-runs this effect mid-drag
      // and unregister() resets the measured width to 0.
      const width =
        Number.isFinite(minWidthPx) && minWidthPx > 0 ? minWidthPx : rectWidth;
      swipeItem.setActionsWidth(side, width);
    };
    measure();
    const unregister = swipeItem.registerActions(side, {
      onFullSwipe: fullSwipeCallback,
    });
    if (typeof ResizeObserver === "undefined") return unregister;
    const observer = new ResizeObserver(measure);
    observer.observe(ref);
    return () => {
      observer.disconnect();
      unregister();
    };
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  id={swipeItem.actionsId(side)}
  class={className}
  data-ui-component="swipe-item"
  data-ui-part="actions"
  data-side={side}
  data-active={swipeItem.open === side ? "true" : undefined}
  data-armed={swipeItem.armedSide === side ? "true" : undefined}
  role="group"
  aria-label={ariaLabel ?? `${side} swipe actions`}
  aria-hidden={swipeItem.open !== side}
  inert={swipeItem.open !== side}
>
  {@render children?.()}
</div>
