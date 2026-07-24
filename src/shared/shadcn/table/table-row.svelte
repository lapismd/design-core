<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
  bind:this={ref}
  {...restProps}
  data-ui-component="table"
  data-ui-part="table-row"
  data-slot="table-row"
  class={className}
>
  {@render children?.()}
</tr>
