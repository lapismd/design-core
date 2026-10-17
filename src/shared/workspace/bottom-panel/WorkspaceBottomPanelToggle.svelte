<script lang="ts">
  import "./WorkspaceBottomPanel.css";
  import { PanelToggleIcon } from "../../shadcn/panel-toggle/index.js";

  let {
    label,
    onSelect,
    size = "default",
    expanded = false,
    "data-desktop-drag-region": desktopDragRegion = "false",
  }: {
    label?: string;
    onSelect: (event: MouseEvent) => void;
    size?: "small" | "default";
    expanded?: boolean;
    "data-desktop-drag-region"?: string;
  } = $props();

  let resolvedLabel = $derived(
    label ?? (expanded ? "Close bottom panel" : "Open bottom panel"),
  );
</script>

<button
  class="ui-workspace-bottom-panel-toggle"
  data-ui-component="workspace-bottom-panel-toggle"
  data-desktop-drag-region={desktopDragRegion}
  data-size={size}
  data-state={expanded ? "expanded" : "collapsed"}
  data-workspace-bottom-panel-toggle
  type="button"
  aria-label={resolvedLabel}
  aria-expanded={expanded}
  title={resolvedLabel}
  data-hint-target="bottom-panel-toggle"
  data-hint-group="panel"
  data-hint-action="click"
  data-hint-target-id="bottom-panel:toggle"
  data-hint-label={resolvedLabel}
  onclick={onSelect}
>
  <PanelToggleIcon
    class="ui-workspace-bottom-panel-toggle__icon"
    side="bottom"
    {expanded}
    iconVariant="standard"
  />
</button>
