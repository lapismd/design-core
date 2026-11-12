<script lang="ts">
  import { PanelToggle } from "../../shadcn/panel-toggle/index.js";
  import type { WorkspaceAction, WorkspaceTab } from "../core/types.js";
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
    searchAction,
    createAction,
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
    searchAction?: WorkspaceAction;
    createAction?: WorkspaceAction;
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
    {#if searchAction}
      <button
        type="button"
        aria-label={searchAction.label}
        disabled={searchAction.disabled}
        onclick={searchAction.onSelect}
      >
        <WorkspaceIcon name={searchAction.icon ?? "search"} />
      </button>
    {:else}
      <PanelToggle
        size="icon"
        expanded={controller.mobileNavigation.reveal === "left"}
        side="left"
        iconVariant="standard"
        aria-label="Browse sidebar"
        onclick={onOpenLeftSidebar}
      />
    {/if}
    <button
      type="button"
      aria-label={createAction?.label ?? "Create new tab"}
      disabled={createAction ? createAction.disabled : !createTab}
      onclick={(event) =>
        createAction ? createAction.onSelect(event) : addTab()}
    >
      <WorkspaceIcon name={createAction?.icon ?? "plus"} />
    </button>
    <button
      type="button"
      class="ui-workspace-mobile-dock__count"
      data-active={page === "tabs"}
      aria-label={`Open ${tabCount} tabs`}
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
