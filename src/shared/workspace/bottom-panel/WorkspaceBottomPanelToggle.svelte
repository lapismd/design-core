<script lang="ts">
  import "./WorkspaceBottomPanel.css";

  let {
    label,
    onSelect,
    size = "default",
    expanded = false,
  }: {
    label?: string;
    onSelect: (event: MouseEvent) => void;
    size?: "small" | "default";
    expanded?: boolean;
  } = $props();

  let resolvedLabel = $derived(
    label ?? (expanded ? "Close bottom panel" : "Open bottom panel"),
  );
</script>

<button
  class="ui-workspace-bottom-panel-toggle"
  data-ui-component="workspace-bottom-panel-toggle"
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
  <svg
    class="ui-workspace-bottom-panel-toggle__icon"
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
    <!-- Dedicated bottom-panel geometry keeps the sidebar icon's landscape frame. -->
    <rect x="1" y="2" width="22" height="20" rx="4"></rect>
    <rect
      x="5"
      y={expanded ? "14" : "17"}
      width="14"
      height={expanded ? "5" : "2"}
      rx={expanded ? "2" : "1"}
      fill="currentColor"
      data-ui-part="indicator"
      class="ui-workspace-bottom-panel-toggle__indicator"
    ></rect>
  </svg>
</button>
