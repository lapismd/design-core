<script lang="ts">
  import { PanelToggle } from "../../shadcn/panel-toggle/index.js";
  import type { WorkspaceSide } from "../core/types.js";

  let {
    side,
    label,
    onSelect,
    expanded = false,
    "data-desktop-drag-region": desktopDragRegion = "false",
  }: {
    side: WorkspaceSide;
    label: string;
    onSelect: (event: MouseEvent) => void;
    /** Legacy density hint; both values now use the shared PanelToggle defaults. */
    size?: "small" | "default";
    expanded?: boolean;
    "data-desktop-drag-region"?: string;
  } = $props();
</script>

<PanelToggle
  class="ui-workspace-sidebar-toggle"
  data-ui-part="workspace-sidebar-toggle"
  data-desktop-drag-region={desktopDragRegion}
  data-side={side}
  {side}
  {expanded}
  iconVariant="standard"
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
/>
