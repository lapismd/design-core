<script lang="ts">
  import type { WorkspaceSide } from "../core/types.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSidebarToggle from "../sidebar-toggle/WorkspaceSidebarToggle.svelte";
  import "./WorkspaceSidebarEmpty.css";

  let {
    side,
    onClose,
  }: {
    side: WorkspaceSide;
    onClose: () => void;
  } = $props();
</script>

<!-- Source: packages/workspace/src/lib/components/tabs/tabs-split.svelte -->
<div
  class="ui-workspace-sidebar-empty"
  data-ui-component="workspace-sidebar-empty"
  data-workspace-sidebar-empty={side}
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
        <WorkspaceSidebarToggle
          {side}
          label={`Close ${side} sidebar`}
          size="small"
          expanded
          onSelect={onClose}
        />
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
