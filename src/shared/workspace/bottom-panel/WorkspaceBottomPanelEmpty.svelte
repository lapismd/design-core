<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "../sidebar-empty/WorkspaceSidebarEmpty.css";
  import WorkspaceBottomPanelToggle from "./WorkspaceBottomPanelToggle.svelte";

  let {
    onClose,
  }: {
    onClose: () => void;
  } = $props();
</script>

<div
  class="ui-workspace-sidebar-empty ui-workspace-bottom-panel-empty"
  data-ui-component="workspace-bottom-panel-empty"
  data-workspace-bottom-panel-empty
>
  <div class="ui-workspace-sidebar-empty__alert" data-ui-part="alert">
    <WorkspaceIcon name="terminal" />
    <div class="ui-workspace-sidebar-empty__content" data-ui-part="content">
      <div
        class="ui-workspace-sidebar-empty__title-row"
        data-ui-part="title-row"
      >
        <h2 class="ui-workspace-sidebar-empty__title" data-ui-part="title">
          Heads up!
        </h2>
        <WorkspaceBottomPanelToggle size="small" expanded onSelect={onClose} />
      </div>
      <p
        class="ui-workspace-sidebar-empty__description"
        data-ui-part="description"
      >
        The container is empty, try dragging a tab here.
      </p>
    </div>
  </div>
</div>
