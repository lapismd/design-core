<script lang="ts">
  import type {
    WorkspaceNode,
    WorkspaceSide,
    WorkspaceSidebarState,
    WorkspaceTab,
    WorkspaceTabItem,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceViewLabel from "../view-header/WorkspaceViewLabel.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import * as Select from "../../shadcn/select/index.js";

  let {
    controller,
    sidebar,
    side,
  }: {
    controller: WorkspaceShellController;
    sidebar: WorkspaceSidebarState;
    side: WorkspaceSide;
  } = $props();

  type SidebarEntry = {
    item: WorkspaceTabItem;
    paneId: string;
    active: boolean;
  };

  function collectEntries(node: WorkspaceNode): SidebarEntry[] {
    if (node.kind === "tabs") {
      return node.items.map((item) => ({
        item,
        paneId: node.id,
        active: node.activeItemId === item.id,
      }));
    }
    return node.children.flatMap(collectEntries);
  }

  function firstVisibleTab(item: WorkspaceTabItem): WorkspaceTab | null {
    return item.kind === "tab"
      ? item
      : (item.tabs.find((tab) => !item.hiddenTabIds.includes(tab.id)) ?? null);
  }

  function visibleTabs(item: WorkspaceTabItem | undefined): WorkspaceTab[] {
    return item?.kind === "sidebar-group"
      ? item.tabs.filter((tab) => !item.hiddenTabIds.includes(tab.id))
      : [];
  }

  let entries = $derived(collectEntries(sidebar.root));
  let selectedValue = $state("");
  let modelSelectedValue = $derived(
    entries.find((entry) => entry.active)?.item.id ?? entries[0]?.item.id ?? "",
  );
  let selectedEntry = $derived(
    entries.find((entry) => entry.item.id === selectedValue) ?? entries[0],
  );
  let visibleGroupTabs = $derived(visibleTabs(selectedEntry?.item));

  $effect(() => {
    selectedValue = modelSelectedValue;
  });

  function selectEntry(value: string) {
    selectedValue = value;
    const entry = entries.find((candidate) => candidate.item.id === value);
    const tab = entry ? firstVisibleTab(entry.item) : null;
    if (tab) controller.selectTab(tab.id);
  }
</script>

<div
  class="ui-workspace-mobile-sidebar"
  data-ui-part="mobile-sidebar"
  data-mobile-sidebar-body={side}
>
  <div class="ui-workspace-mobile-sidebar__body">
    {#if selectedEntry?.item.kind === "sidebar-group"}
      {#if visibleGroupTabs.length}
        {#each visibleGroupTabs as tab (tab.id)}
          <section
            class="ui-workspace-mobile-sidebar__group-leaf"
            data-mobile-sidebar-group-leaf={tab.id}
          >
            {#if visibleGroupTabs.length > 1}
              <header>
                <WorkspaceViewLabel
                  {controller}
                  {tab}
                  hostId="root"
                  paneId={selectedEntry.paneId}
                  fallbackTitle={tab.title}
                />
              </header>
            {/if}
            <WorkspaceViewHost
              {controller}
              {tab}
              hostId="root"
              paneId={selectedEntry.paneId}
            />
          </section>
        {/each}
      {:else}
        <p class="ui-workspace-mobile-sidebar__empty">
          No visible sidebar panels
        </p>
      {/if}
    {:else if selectedEntry?.item}
      <WorkspaceViewHost
        {controller}
        tab={selectedEntry.item}
        hostId="root"
        paneId={selectedEntry.paneId}
      />
    {:else}
      <p class="ui-workspace-mobile-sidebar__empty">No sidebar content</p>
    {/if}
  </div>

  {#if entries.length}
    <div
      class="ui-workspace-mobile-sidebar__selector"
      data-mobile-sidebar-selector={side}
    >
      <Select.Root
        type="single"
        value={selectedEntry?.item.id ?? ""}
        onValueChange={selectEntry}
      >
        <Select.Trigger
          class="ui-workspace-mobile-sidebar__trigger"
          aria-label={`Select ${side} sidebar tab`}
        >
          {selectedEntry?.item.title ?? "Select a panel"}
        </Select.Trigger>
        <Select.Content aria-label={`Select ${side} sidebar tab options`}>
          <Select.Group>
            {#each entries as entry (entry.item.id)}
              <Select.Item value={entry.item.id} label={entry.item.title}>
                {entry.item.title}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  {/if}
</div>
