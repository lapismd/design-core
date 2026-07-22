<script lang="ts">
  import { Button } from "../button/index.js";
  import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
  import type { ComponentProps } from "svelte";
  import { useSidebar } from "./context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    onclick,
    ...restProps
  }: ComponentProps<typeof Button> & {
    onclick?: (e: MouseEvent) => void;
  } = $props();

  const sidebar = useSidebar();
</script>

<Button
  bind:ref
  data-sidebar="trigger"
  data-ui-part="sidebar-trigger"
  data-slot="sidebar-trigger"
  variant="ghost"
  size="icon-sm"
  class={className}
  type="button"
  {...restProps}
  onclick={(e) => {
    onclick?.(e);
    sidebar.toggle();
  }}
>
  <PanelLeftIcon />
  <span class="sr-only">Toggle Sidebar</span>
</Button>
