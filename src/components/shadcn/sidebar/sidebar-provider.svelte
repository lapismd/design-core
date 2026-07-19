<script lang="ts">
  import { cn, type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="sidebar-provider"
  class={cn("flex h-full min-h-0 w-full", className)}
  {...restProps}
>
  {@render children?.()}
</div>
