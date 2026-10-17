<script lang="ts">
  import { Button } from "../button/index.js";
  import { PanelToggleIcon } from "../panel-toggle/index.js";
  import type { ComponentProps } from "svelte";
  import { useSidebar } from "./context.svelte.js";

  let {
    ref = $bindable(null),
    side = "left",
    class: className,
    onclick,
    ...restProps
  }: ComponentProps<typeof Button> & {
    /** Edge represented by the visibility icon. The provider has no edge. */
    side?: "left" | "right";
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
  <PanelToggleIcon
    {side}
    expanded={sidebar.isMobile ? sidebar.openMobile : sidebar.open}
    iconVariant="standard"
  />
  <span class="sr-only">Toggle Sidebar</span>
</Button>
