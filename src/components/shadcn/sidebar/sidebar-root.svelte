<script lang="ts">
  import { cn, type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    open = $bindable(true),
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    open?: boolean;
  } = $props();
</script>

{#if open}
  <aside
    bind:this={ref}
    data-slot="sidebar"
    class={cn("bg-sidebar text-sidebar-foreground w-72 shrink-0", className)}
    {...restProps}
  >
    {@render children?.()}
  </aside>
{/if}
