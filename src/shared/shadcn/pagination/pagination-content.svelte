<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();
</script>

<ul
  bind:this={ref}
  {...restProps}
  data-ui-component="pagination"
  data-ui-part="pagination-content"
  data-slot="pagination-content"
  class={className}
>
  {@render children?.()}
</ul>
