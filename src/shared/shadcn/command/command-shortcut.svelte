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
  data-ui-component="command"
  data-ui-part="command-shortcut"
    data-slot="command-shortcut"
  class={className}
  {...restProps}
>
  {@render children?.()}
</span>
