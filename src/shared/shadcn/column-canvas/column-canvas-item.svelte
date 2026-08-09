<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    selected = false,
    disabled = false,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLButtonAttributes> & {
    /** Marks the row as the active selection in this column. */
    selected?: boolean;
    children?: Snippet;
  } = $props();
</script>

<button
  bind:this={ref}
  type="button"
  {...restProps}
  class={className}
  {disabled}
  data-ui-component="column-canvas"
  data-ui-part="column-item"
  data-selected={selected ? "true" : undefined}
  aria-pressed={selected}
>
  {@render children?.()}
</button>
