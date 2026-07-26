<script lang="ts">
  import { cloneSerializable } from "../core/serializable.js";
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMobileTabTile from "./WorkspaceMobileTabTile.svelte";
  import WorkspaceMobileTabsActions from "./WorkspaceMobileTabsActions.svelte";

  let {
    controller,
    tabs,
    paneIdFor,
    createTab,
    onDone,
    onOpenTab,
  }: {
    controller: WorkspaceShellController;
    tabs: WorkspaceTab[];
    paneIdFor: (tabId: string) => string;
    createTab?: (paneId: string) => WorkspaceTab;
    onDone: () => void;
    onOpenTab: (tab: WorkspaceTab) => void;
  } = $props();

  let actionsOpen = $state(false);
  let lastClosedTab = $state<WorkspaceTab | null>(null);

  function closeTab(tab: WorkspaceTab) {
    lastClosedTab = cloneSerializable(tab);
    controller.closeTab(tab.id);
  }

  function addTab() {
    const paneId = controller.activePaneId ?? paneIdFor(tabs[0]?.id ?? "");
    if (!createTab || !paneId) return;
    controller.addTab(paneId, createTab(paneId), true);
    onDone();
  }

  function undoClose() {
    const paneId = controller.activePaneId ?? paneIdFor(tabs[0]?.id ?? "");
    if (!lastClosedTab || !paneId) return;
    controller.addTab(paneId, lastClosedTab, true);
    lastClosedTab = null;
    onDone();
  }

  function closeTabs() {
    for (const tab of [...tabs]) {
      if (tab.closable === false) continue;
      lastClosedTab = cloneSerializable(tab);
      controller.closeTab(tab.id);
    }
    onDone();
  }
</script>

<section
  class="ui-workspace-mobile-tabs"
  data-ui-part="mobile-tabs"
  aria-label="Open workspace tabs"
>
  <div class="ui-workspace-mobile-tabs__grid">
    {#each tabs as tab (tab.id)}
      <WorkspaceMobileTabTile
        {controller}
        {tab}
        paneId={paneIdFor(tab.id)}
        onOpen={() => onOpenTab(tab)}
        onClose={() => closeTab(tab)}
      />
    {:else}
      <div class="ui-workspace-mobile-tabs__empty">
        <h2>No matching tabs</h2>
        <p>This workspace does not currently have any open tabs.</p>
      </div>
    {/each}
  </div>

  <div class="ui-workspace-mobile-tabs__controls">
    <span aria-hidden="true"></span>
    <button
      type="button"
      class="ui-workspace-mobile-tabs__action-trigger"
      aria-label={`Open tab actions (${tabs.length})`}
      onclick={() => (actionsOpen = true)}
    >
      <WorkspaceIcon name="square-stack" />
      <span>{tabs.length}</span>
    </button>
    <button type="button" onclick={onDone}>Done</button>
  </div>

  <WorkspaceMobileTabsActions
    bind:open={actionsOpen}
    tabCount={tabs.length}
    canUndoClose={Boolean(lastClosedTab)}
    onNewTab={addTab}
    onUndoCloseTab={undoClose}
    onCloseTabs={closeTabs}
  />
</section>
