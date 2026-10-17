<script lang="ts">
  import { PanelToggleIcon } from "../../shadcn/panel-toggle/index.js";
  import type { WorkspaceSide } from "../core/types.js";
  import "./WorkspaceSidebarToggle.css";

  let {
    side,
    label,
    onSelect,
    size = "default",
    expanded = false,
    "data-desktop-drag-region": desktopDragRegion = "false",
  }: {
    side: WorkspaceSide;
    label: string;
    onSelect: (event: MouseEvent) => void;
    size?: "small" | "default";
    expanded?: boolean;
    "data-desktop-drag-region"?: string;
  } = $props();
</script>

<button
  class="ui-workspace-sidebar-toggle"
  data-ui-component="workspace-sidebar-toggle"
  data-desktop-drag-region={desktopDragRegion}
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
  <PanelToggleIcon
    class="ui-workspace-sidebar-toggle__icon"
    {side}
    {expanded}
    iconVariant="standard"
  />
  <span class="sr-only">{label}</span>
</button>
