<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-shortcut"
    data-slot="dropdown-menu-shortcut"
  class={className}
  {...restProps}
>
  {@render children?.()}
</span>
