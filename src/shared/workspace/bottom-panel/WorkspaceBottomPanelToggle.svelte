<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceBottomPanel.css";

  let {
    label = "Open bottom panel",
    onSelect,
    expanded = false,
  }: {
    label?: string;
    onSelect: (event: MouseEvent) => void;
    expanded?: boolean;
  } = $props();
</script>

<button
  class="ui-workspace-bottom-panel-toggle"
  data-ui-component="workspace-bottom-panel-toggle"
  data-state={expanded ? "expanded" : "collapsed"}
  data-workspace-bottom-panel-toggle
  type="button"
  aria-label={label}
  title={label}
  data-hint-target="bottom-panel-toggle"
  data-hint-group="panel"
  data-hint-action="click"
  data-hint-target-id="bottom-panel:toggle"
  data-hint-label={label}
  onclick={onSelect}
>
  <WorkspaceIcon name="panel-bottom" />
</button>
