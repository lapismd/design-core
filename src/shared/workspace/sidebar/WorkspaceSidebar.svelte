<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    WorkspaceSide,
    WorkspaceSidebarState,
    WorkspaceTab,
    WorkspaceTabItem,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSidebarEmpty from "../sidebar-empty/WorkspaceSidebarEmpty.svelte";
  import WorkspaceSidebarGroup from "../sidebar-group/WorkspaceSidebarGroup.svelte";
  import WorkspaceSidebarToggle from "../sidebar-toggle/WorkspaceSidebarToggle.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import "./WorkspaceSidebar.css";

  let {
    controller,
    side,
    state,
    drag,
    footer,
    width,
  }: {
    controller: WorkspaceShellController;
    side: WorkspaceSide;
    state?: WorkspaceSidebarState;
    drag?: WorkspaceDragState;
    footer?: Snippet;
    width?: string;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let sidebar = $derived(state ?? controller.layout[side]);
  let pane = $derived(sidebar.root.kind === "tabs" ? sidebar.root : undefined);
  let activeItem = $derived(
    pane?.items.find((item) => item.id === pane?.activeItemId) ??
      pane?.items[0],
  );

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function select(item: WorkspaceTabItem) {
    const tab = tabFor(item);
    if (tab) controller.selectTab(tab.id);
  }

  function isSelected(item: WorkspaceTabItem) {
    return pane?.activeItemId === item.id;
  }
</script>

{#if sidebar.open}
  <aside
    class="ui-workspace-sidebar"
    data-ui-component="workspace-sidebar"
    data-ui-part="sidebar"
    data-app-shell-sidebar={side}
    data-workspace-sidebar-side={side}
    style={`width: ${width ?? `${sidebar.size}px`}`}
    aria-label={`${side === "left" ? "Left" : "Right"} sidebar`}
  >
    {#if pane}
      <div class="ui-workspace-sidebar__tab-bar" data-ui-part="sidebar-tab-bar">
        <div
          class="ui-workspace-sidebar__tab-list"
          role="tablist"
          aria-label={`${side === "left" ? "Left" : "Right"} sidebar tabs`}
        >
          {#each pane.items as item (item.id)}
            {@const tab = tabFor(item)}
            <button
              type="button"
              role="tab"
              class="ui-workspace-sidebar__tab"
              data-ui-part="sidebar-tab"
              data-state={isSelected(item) ? "on" : "off"}
              aria-selected={isSelected(item)}
              aria-controls={`workspace-sidebar-panel-${side}`}
              id={`workspace-sidebar-tab-${side}-${item.id}`}
              aria-label={item.title}
              title={item.title}
              draggable={Boolean(tab)}
              data-workspace-tab-id={tab?.id}
              data-workspace-item-id={item.id}
              onpointerdown={(event) =>
                tab && dragState.startPointer(event, tab.id)}
              ondragstart={(event) =>
                tab && dragState.startHtml5(event, tab.id)}
              ondragend={(event) => tab && dragState.endHtml5(event)}
              onclick={() => select(item)}
            >
              <WorkspaceIcon name={item.icon ?? tab?.icon ?? "file"} />
              <span class="sr-only">{item.title}</span>
            </button>
          {/each}
        </div>

        <div class="ui-workspace-sidebar__tab-spacer"></div>

        <WorkspaceSidebarToggle
          {side}
          size="small"
          label={`Close ${side} sidebar`}
          onSelect={() => controller.setSidebarOpen(side, false)}
        />
      </div>

      <div
        class="ui-workspace-sidebar__body"
        data-ui-part="sidebar-body"
        id={`workspace-sidebar-panel-${side}`}
        role="tabpanel"
        aria-labelledby={activeItem
          ? `workspace-sidebar-tab-${side}-${activeItem.id}`
          : undefined}
      >
        {#if activeItem?.kind === "sidebar-group"}
          <WorkspaceSidebarGroup
            {controller}
            group={activeItem}
            {pane}
            {side}
            drag={dragState}
          />
        {:else if activeItem?.kind === "tab"}
          <WorkspaceTabsDrop
            {controller}
            drag={dragState}
            parent={pane}
            dropZones={["top", "bottom"]}
            class="ui-workspace-sidebar__drop-target"
          >
            <WorkspaceViewHost
              {controller}
              tab={activeItem}
              hostId="root"
              paneId={pane.id}
            />
          </WorkspaceTabsDrop>
        {:else}
          <WorkspaceSidebarEmpty
            {side}
            onClose={() => controller.setSidebarOpen(side, false)}
          />
        {/if}
      </div>
    {:else}
      <WorkspaceSidebarEmpty
        {side}
        onClose={() => controller.setSidebarOpen(side, false)}
      />
    {/if}
    {@render footer?.()}
  </aside>
{/if}
