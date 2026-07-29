<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Button } from "../button/index.js";
  import { useSwipeItemState } from "./swipe-item-context.svelte.js";
  import type { SwipeItemSide } from "./types.js";

  type ButtonProps = ComponentProps<typeof Button>;

  let {
    ref = $bindable(null),
    side,
    onclick,
    class: className,
    variant = "ghost",
    size = "icon-sm",
    disabled,
    children,
    ...restProps
  }: ButtonProps & {
    /** Logical action edge controlled by this disclosure button. */
    side: SwipeItemSide;
  } = $props();

  const state = useSwipeItemState();
  $effect(() => state.registerTrigger(side, ref));
</script>

<Button
  bind:ref
  {...restProps}
  class={className}
  {variant}
  {size}
  disabled={disabled || state.disabled}
  data-ui-part="trigger"
  aria-controls={state.actionsId(side)}
  aria-expanded={state.open === side}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) state.toggle(side);
  }}
>
  {@render children?.()}
</Button>
