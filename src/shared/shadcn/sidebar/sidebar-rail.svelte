<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import { useSidebar } from "./context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<
    HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > = $props();

  const sidebar = useSidebar();
</script>

<button
  bind:this={ref}
  data-sidebar="rail"
  {...restProps}
  data-ui-component="sidebar"
  data-ui-part="sidebar-rail"
  data-slot="sidebar-rail"
  aria-label="Toggle Sidebar"
  tabindex={-1}
  onclick={sidebar.toggle}
  title="Toggle Sidebar"
  class={className}
>
  {@render children?.()}
</button>
