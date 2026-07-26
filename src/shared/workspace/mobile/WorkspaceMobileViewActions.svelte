<script lang="ts">
  import type { WorkspaceAction, WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let {
    controller,
    activeTab,
    onOpenMenu,
  }: {
    controller: WorkspaceShellController;
    activeTab: WorkspaceTab | null;
    onOpenMenu: () => void;
  } = $props();

  let visibleActions = $derived.by((): WorkspaceAction[] => {
    if (!activeTab) return [];
    const definition = controller.registry.resolve(activeTab.view.type);
    return (
      definition
        ?.getChrome?.({
          tab: activeTab,
          hostId: controller.activeHostId,
          paneId: controller.activePaneId ?? "main",
          active: true,
          showInlineTitle: controller.showInlineTitle,
          activate: () => controller.selectTab(activeTab.id),
          close: () => controller.closeTab(activeTab.id),
          setState: (state) => controller.updateViewState(activeTab.id, state),
        })
        .actions?.slice(0, 2) ?? []
    );
  });
</script>

<div
  class="ui-workspace-mobile-view-actions"
  data-ui-component="workspace-mobile-view-actions"
  data-ui-part="actions"
  data-mobile-stage-control
>
  {#each visibleActions as action (action.id)}
    <button
      type="button"
      aria-label={action.label}
      title={action.label}
      disabled={action.disabled}
      onclick={(event) => !action.disabled && action.onSelect(event)}
    >
      <WorkspaceIcon name={action.icon} />
    </button>
  {/each}
  <button type="button" aria-label="Open more actions" onclick={onOpenMenu}>
    <WorkspaceIcon name="ellipsis" />
  </button>
</div>
