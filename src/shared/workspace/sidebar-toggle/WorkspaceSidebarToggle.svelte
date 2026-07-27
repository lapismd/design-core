<script lang="ts">
  import type { WorkspaceSide } from "../core/types.js";
  import "./WorkspaceSidebarToggle.css";

  let {
    side,
    label,
    onSelect,
    size = "default",
    expanded = false,
  }: {
    side: WorkspaceSide;
    label: string;
    onSelect: (event: MouseEvent) => void;
    size?: "small" | "default";
    expanded?: boolean;
  } = $props();
</script>

<button
  class="ui-workspace-sidebar-toggle"
  data-ui-component="workspace-sidebar-toggle"
  data-size={size}
  data-side={side}
  data-state={expanded ? "expanded" : "collapsed"}
  data-workspace-sidebar-toggle={side}
  type="button"
  aria-label={label}
  title={label}
  data-hint-target="sidebar-toggle"
  data-hint-group="sidebar"
  data-hint-action="click"
  data-hint-target-id={`sidebar:${side}:toggle`}
  data-hint-label={label}
  onclick={onSelect}
>
  <!-- Source: packages/ui/src/lib/components/ui/sidebar-custom/sidebar-trigger.svelte -->
  <svg
    class="ui-workspace-sidebar-toggle__icon"
    data-ui-part="icon"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="1" y="2" width="22" height="20" rx="4"></rect>
    <rect
      x={side === "left" ? "4" : "18"}
      y="5"
      width="2"
      height="14"
      rx="2"
      fill="currentColor"
      data-ui-part="indicator"
      class="ui-workspace-sidebar-toggle__indicator"
    ></rect>
  </svg>
  <span class="sr-only">{label}</span>
</button>
