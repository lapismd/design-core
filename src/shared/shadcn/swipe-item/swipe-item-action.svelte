<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Button } from "../button/index.js";
  import { useSwipeItemState } from "./swipe-item-context.svelte.js";

  type ButtonProps = ComponentProps<typeof Button>;

  let {
    ref = $bindable(null),
    closeOnSelect = true,
    onclick,
    class: className,
    variant = "secondary",
    size = "default",
    disabled,
    children,
    ...restProps
  }: ButtonProps & {
    /** Close the stable pane after an unprevented activation. */
    closeOnSelect?: boolean;
  } = $props();

  const state = useSwipeItemState();
</script>

<Button
  bind:ref
  {...restProps}
  class={className}
  {variant}
  {size}
  disabled={disabled || state.disabled}
  data-ui-part="action"
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented && closeOnSelect) state.close();
  }}
>
  {@render children?.()}
</Button>
