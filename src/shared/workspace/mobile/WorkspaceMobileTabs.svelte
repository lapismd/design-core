<script lang="ts">
  import { cloneSerializable } from "../core/serializable.js";
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";

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
  }
</script>

<section
  class="ui-workspace-mobile-tabs"
  data-ui-part="mobile-tabs"
  aria-label="Open workspace tabs"
>
  <div class="ui-workspace-mobile-tabs__grid">
    {#each tabs as tab (tab.id)}
      <article class="ui-workspace-mobile-tab" data-mobile-tab-tile={tab.id}>
        <div class="ui-workspace-mobile-tab__preview">
          <div class="ui-workspace-mobile-tab__surface">
            <div class="ui-workspace-mobile-tab__title">{tab.title}</div>
            <WorkspaceViewHost
              {controller}
              {tab}
              hostId="root"
              paneId={paneIdFor(tab.id)}
            />
          </div>
          <button
            type="button"
            class="ui-workspace-mobile-tab__open"
            aria-label={`Open ${tab.title}`}
            onclick={() => onOpenTab(tab)}
          ></button>
          {#if tab.closable !== false}
            <button
              type="button"
              class="ui-workspace-mobile-tab__close"
              aria-label={`Close ${tab.title}`}
              onclick={(event) => {
                event.stopPropagation();
                closeTab(tab);
              }}
            >
              <WorkspaceIcon name="x" />
            </button>
          {/if}
        </div>
        <h2>{tab.title}</h2>
      </article>
    {:else}
      <div class="ui-workspace-mobile-tabs__empty">
        <h2>No matching tabs</h2>
        <p>This workspace does not currently have any open tabs.</p>
      </div>
    {/each}
  </div>

  <div class="ui-workspace-mobile-tabs__controls">
    <button type="button" onclick={addTab} disabled={!createTab}>
      <WorkspaceIcon name="plus" />
      New tab
    </button>
    <button type="button" onclick={undoClose} disabled={!lastClosedTab}>
      <WorkspaceIcon name="rotate-ccw" />
      Undo close
    </button>
    <button type="button" onclick={onDone}>Done</button>
  </div>
</section>
