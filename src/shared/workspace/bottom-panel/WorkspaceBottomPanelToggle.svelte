<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceBottomPanel.css";

  let {
    label,
    onSelect,
    expanded = false,
  }: {
    label?: string;
    onSelect: (event: MouseEvent) => void;
    expanded?: boolean;
  } = $props();

  let resolvedLabel = $derived(
    label ?? (expanded ? "Close bottom panel" : "Open bottom panel"),
  );
</script>

<button
  class="ui-workspace-bottom-panel-toggle"
  data-ui-component="workspace-bottom-panel-toggle"
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
  <WorkspaceIcon name={expanded ? "chevron-down" : "chevron-right"} />
</button>
