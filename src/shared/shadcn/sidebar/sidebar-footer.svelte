<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  {...omitDataUiIdentity(restProps)}
  data-ui-component="sidebar"
  data-ui-part="sidebar-footer"
  data-slot="sidebar-footer"
  class={className}
>
  {@render children?.()}
</div>
