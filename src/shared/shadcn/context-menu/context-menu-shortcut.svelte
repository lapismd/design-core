<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  {...restProps}
  data-ui-component="context-menu"
  data-ui-part="context-menu-shortcut"
  data-slot="context-menu-shortcut"
  class={className}
>
  {@render children?.()}
</span>
