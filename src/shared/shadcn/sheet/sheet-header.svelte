<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="sheet"
  data-ui-part="sheet-header"
  data-slot="sheet-header"
  class={className}
>
  {@render children?.()}
</div>
