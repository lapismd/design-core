<script lang="ts">
  import WorkspaceSidebar from "../sidebar/WorkspaceSidebar.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let {
    workspaceLabel = "Workspace",
    onOpenSettings,
  }: {
    workspaceLabel?: string;
    onOpenSettings?: () => void;
  } = $props();

  const { controller, drag } = getAppShellContext();
</script>

<WorkspaceSidebar controller={controller.renderer} side="left" {drag}>
  {#snippet footer()}
    {#if onOpenSettings}
      <footer
        class="ui-workspace-sidebar__footer"
        data-ui-part="sidebar-footer"
      >
        <button
          type="button"
          class="ui-workspace-sidebar__workspace-trigger"
          aria-label={`Current workspace: ${workspaceLabel}`}
          title={workspaceLabel}
        >
          <span>{workspaceLabel}</span>
          <WorkspaceIcon name="chevrons-up-down" />
        </button>
        <button
          type="button"
          class="ui-workspace-sidebar__settings-trigger"
          data-hint-target="sidebar-control"
          data-hint-group="sidebar"
          data-hint-action="click"
          data-hint-target-id="sidebar:settings"
          data-hint-label="Open settings"
          aria-label="Open settings"
          title="Open settings"
          onclick={onOpenSettings}
        >
          <WorkspaceIcon name="settings" />
        </button>
      </footer>
    {/if}
  {/snippet}
</WorkspaceSidebar>
