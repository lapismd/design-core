<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let {
    controller,
    activeTab,
    tabCount,
    page,
    menuOpen,
    createTab,
    onOpenLeftSidebar,
    onOpenTabs,
    onToggleMenu,
  }: {
    controller: WorkspaceShellController;
    activeTab: WorkspaceTab | null;
    tabCount: number;
    page: "editor" | "tabs";
    menuOpen: boolean;
    createTab?: (paneId: string) => WorkspaceTab;
    onOpenLeftSidebar: () => void;
    onOpenTabs: () => void;
    onToggleMenu: () => void;
  } = $props();

  let chrome = $derived.by(() => {
    if (!activeTab) return {};
    const definition = controller.registry.resolve(activeTab.view.type);
    return (
      definition?.getChrome?.({
        tab: activeTab,
        hostId: controller.activeHostId,
        paneId: controller.activePaneId ?? "main",
        active: true,
        showInlineTitle: controller.showInlineTitle,
        activate: () => controller.selectTab(activeTab.id),
        close: () => controller.closeTab(activeTab.id),
        setState: (state) => controller.updateViewState(activeTab.id, state),
      }) ?? {}
    );
  });

  function addTab() {
    const paneId = controller.activePaneId;
    if (!createTab || !paneId) return;
    controller.addCreatedTab(paneId, createTab(paneId));
  }
</script>

<div
  class="ui-workspace-mobile-dock"
  data-ui-part="mobile-dock"
  data-mobile-floating-dock
  data-mobile-stage-control
>
  <nav aria-label="Mobile workspace dock">
    <button
      type="button"
      aria-label="Go back"
      disabled={!chrome.canGoBack}
      onclick={() => void chrome.onGoBack?.()}
    >
      <WorkspaceIcon name="arrow-left" />
    </button>
    <button
      type="button"
      aria-label="Go forward"
      disabled={!chrome.canGoForward}
      onclick={() => void chrome.onGoForward?.()}
    >
      <WorkspaceIcon name="arrow-right" />
    </button>
    <button
      type="button"
      aria-label="Open search sidebar"
      onclick={onOpenLeftSidebar}
    >
      <WorkspaceIcon name="search" />
    </button>
    <button
      type="button"
      aria-label="Create new tab"
      disabled={!createTab}
      onclick={addTab}
    >
      <WorkspaceIcon name="plus" />
    </button>
    <button
      type="button"
      class="ui-workspace-mobile-dock__count"
      data-active={page === "tabs"}
      aria-label={`Open tabs (${tabCount})`}
      onclick={onOpenTabs}
    >
      <WorkspaceIcon name="square-stack" />
      <span>{tabCount}</span>
    </button>
    <button
      type="button"
      data-active={menuOpen}
      aria-label="Open more actions"
      onclick={onToggleMenu}
    >
      <WorkspaceIcon name="ellipsis" />
    </button>
  </nav>
</div>
