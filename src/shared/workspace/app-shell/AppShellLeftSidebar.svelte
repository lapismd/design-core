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
  let width = $derived(
    controller.appearance.showRibbon
      ? `calc(${controller.renderer.layout.left.size}px - var(--ui-workspace-ribbon-width) + 1px)`
      : `${controller.renderer.layout.left.size}px`,
  );
</script>

<WorkspaceSidebar controller={controller.renderer} side="left" {drag} {width}>
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
