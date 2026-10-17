<script lang="ts">
  import { PanelToggle } from "../../shadcn/panel-toggle/index.js";

  let {
    label,
    onSelect,
    expanded = false,
    "data-desktop-drag-region": desktopDragRegion = "false",
  }: {
    label?: string;
    onSelect: (event: MouseEvent) => void;
    /** Legacy density hint; both values now use the shared PanelToggle defaults. */
    size?: "small" | "default";
    expanded?: boolean;
    "data-desktop-drag-region"?: string;
  } = $props();

  let resolvedLabel = $derived(
    label ?? (expanded ? "Close bottom panel" : "Open bottom panel"),
  );
</script>

<PanelToggle
  class="ui-workspace-bottom-panel-toggle"
  data-ui-part="workspace-bottom-panel-toggle"
  data-desktop-drag-region={desktopDragRegion}
  side="bottom"
  {expanded}
  iconVariant="standard"
  data-state={expanded ? "expanded" : "collapsed"}
  data-workspace-bottom-panel-toggle
  type="button"
  aria-label={resolvedLabel}
  title={resolvedLabel}
  data-hint-target="bottom-panel-toggle"
  data-hint-group="panel"
  data-hint-action="click"
  data-hint-target-id="bottom-panel:toggle"
  data-hint-label={resolvedLabel}
  onclick={onSelect}
/>
