<script lang="ts">
  import "./swipe-item.css";
  import { useId } from "bits-ui";
  import { setSwipeItemState } from "./swipe-item-context.svelte.js";
  import type { SwipeItemRootProps } from "./types.js";

  let {
    ref = $bindable(null),
    open = $bindable(null),
    disabled = false,
    activationDistance = 10,
    revealThreshold = 0.5,
    fullSwipeThreshold = 0.75,
    velocityThreshold = 0.45,
    onOpenChange,
    class: className,
    children,
    ...restProps
  }: SwipeItemRootProps = $props();

  const rootId = useId("swipe-item");
  const state = setSwipeItemState({
    open: () => open,
    setOpen: (nextOpen) => {
      if (nextOpen === open) return;
      open = nextOpen;
      onOpenChange?.(nextOpen);
    },
    disabled: () => disabled,
    activationDistance: () => activationDistance,
    revealThreshold: () => revealThreshold,
    fullSwipeThreshold: () => fullSwipeThreshold,
    velocityThreshold: () => velocityThreshold,
    actionsId: (side) => `${rootId}-${side}-actions`,
  });

  $effect(() => state.bindRoot(ref));
  $effect(() => {
    if (!disabled || open === null) return;
    state.setOpen(null);
  });
  $effect(() => {
    if (open === null || !ref) return;
    const ownerDocument = ref.ownerDocument;
    ownerDocument.addEventListener(
      "pointerdown",
      state.handleOutsidePointerDown,
      true,
    );
    return () =>
      ownerDocument.removeEventListener(
        "pointerdown",
        state.handleOutsidePointerDown,
        true,
      );
  });
  $effect(() => () => state.destroy());
</script>

<div
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="swipe-item"
  data-ui-part="root"
  data-state={open === null ? "closed" : "open"}
  data-open-side={open ?? undefined}
  data-active-side={state.activeSide ?? undefined}
  data-armed-side={state.armedSide ?? undefined}
  data-dragging={state.dragging ? "true" : undefined}
  data-disabled={disabled ? "true" : undefined}
  style:--ui-swipe-item-offset={`${state.offset}px`}
  onkeydown={state.handleKeydown}
>
  {@render children?.()}
</div>
