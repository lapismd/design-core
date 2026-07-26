<script lang="ts">
  import { untrack } from "svelte";
  import type { WorkspaceNode, WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import WorkspaceMobileDock from "./WorkspaceMobileDock.svelte";
  import WorkspaceMobileSidebar from "./WorkspaceMobileSidebar.svelte";
  import WorkspaceMobileTabs from "./WorkspaceMobileTabs.svelte";
  import "./WorkspaceMobile.css";

  let {
    controller,
    createTab,
    defaultPage = "editor",
    showBottomNav = true,
    includeSidebarsInTabs = true,
    includeFloatingInTabs = true,
    onOpenSettings,
  }: {
    controller: WorkspaceShellController;
    createTab?: (paneId: string) => WorkspaceTab;
    defaultPage?: "editor" | "tabs";
    showBottomNav?: boolean;
    includeSidebarsInTabs?: boolean;
    includeFloatingInTabs?: boolean;
    onOpenSettings?: () => void;
  } = $props();

  type Reveal = "left" | "center" | "right";
  type Entry = {
    tab: WorkspaceTab;
    paneId: string;
    origin: "main" | "left" | "right" | "floating";
  };

  let page = $state<"editor" | "tabs">(untrack(() => defaultPage));
  let reveal = $state<Reveal>("center");
  let menuOpen = $state(false);
  let activeTab = $derived(controller.activeTab);

  function collectEntries(
    node: WorkspaceNode,
    origin: Entry["origin"],
    result: Entry[] = [],
  ): Entry[] {
    if (node.kind === "split") {
      node.children.forEach((child) => collectEntries(child, origin, result));
      return result;
    }
    for (const item of node.items) {
      const tabs = item.kind === "tab" ? [item] : item.tabs;
      tabs.forEach((tab) => result.push({ tab, paneId: node.id, origin }));
    }
    return result;
  }

  let mainEntries = $derived(collectEntries(controller.layout.main, "main"));
  let entries = $derived([
    ...mainEntries,
    ...(includeSidebarsInTabs
      ? [
          ...collectEntries(controller.layout.left.root, "left"),
          ...collectEntries(controller.layout.right.root, "right"),
        ]
      : []),
    ...(includeFloatingInTabs
      ? controller.layout.windows.flatMap((workspaceWindow) =>
          collectEntries(workspaceWindow.root, "floating"),
        )
      : []),
  ]);
  let paneMenu = $derived(
    activeTab ? controller.createPaneMenu(activeTab.id) : null,
  );

  function paneIdFor(tabId: string) {
    return (
      entries.find((entry) => entry.tab.id === tabId)?.paneId ??
      controller.activePaneId ??
      "main"
    );
  }

  function openTab(tab: WorkspaceTab) {
    const entry = entries.find((candidate) => candidate.tab.id === tab.id);
    controller.selectTab(tab.id);
    page = "editor";
    reveal =
      entry?.origin === "left"
        ? "left"
        : entry?.origin === "right"
          ? "right"
          : "center";
  }
</script>

<div
  class="ui-workspace-mobile"
  data-ui-component="workspace-mobile"
  data-ui-part="root"
  data-mobile-workspace-page={menuOpen ? "menu" : page}
  data-mobile-left-sidebar-open={reveal === "left"}
  data-mobile-right-sidebar-open={reveal === "right"}
>
  {#if page === "tabs"}
    <WorkspaceMobileTabs
      {controller}
      tabs={entries.map((entry) => entry.tab)}
      {paneIdFor}
      {createTab}
      onDone={() => (page = "editor")}
      onOpenTab={openTab}
    />
  {:else}
    <div
      class="ui-workspace-mobile__stage"
      data-mobile-stage-reveal={reveal}
      aria-label="Mobile workspace stage"
    >
      <div class="ui-workspace-mobile__track" data-reveal={reveal}>
        <aside
          data-mobile-sidebar-panel="left"
          aria-label="Mobile left sidebar"
        >
          <WorkspaceMobileSidebar
            {controller}
            sidebar={controller.layout.left}
            side="left"
          />
        </aside>

        <main>
          <button
            type="button"
            class="ui-workspace-mobile__sidebar-toggle"
            aria-label={reveal === "left"
              ? "Close left sidebar"
              : "Open left sidebar"}
            onclick={() => (reveal = reveal === "left" ? "center" : "left")}
          >
            <WorkspaceIcon name="panel-left" />
          </button>

          <button
            type="button"
            class="ui-workspace-mobile__menu-toggle"
            aria-label="Open more actions"
            onclick={() => (menuOpen = !menuOpen)}
          >
            <WorkspaceIcon name="ellipsis" />
          </button>

          {#if activeTab}
            <WorkspaceViewHost
              {controller}
              tab={activeTab}
              hostId={controller.activeHostId}
              paneId={controller.activePaneId ?? "main"}
            />
          {:else}
            <div class="ui-workspace-mobile__empty">
              <h2>No active view</h2>
              <p>Open a tab to choose a workspace leaf.</p>
              <button type="button" onclick={() => (page = "tabs")}>
                Open tabs
              </button>
            </div>
          {/if}

          {#if menuOpen}
            <div class="ui-workspace-mobile__menu" role="dialog">
              <header>
                <h2>More actions</h2>
                <button
                  type="button"
                  aria-label="Close more actions"
                  onclick={() => (menuOpen = false)}
                >
                  <WorkspaceIcon name="x" />
                </button>
              </header>
              <button type="button" onclick={() => (reveal = "right")}>
                <WorkspaceIcon name="panel-right" />
                Open right sidebar
              </button>
              {#if onOpenSettings}
                <button type="button" onclick={onOpenSettings}>
                  <WorkspaceIcon name="settings-2" />
                  Open settings
                </button>
              {/if}
              {#if paneMenu}
                {#each paneMenu.entries as entry, index (`${entry.kind}-${index}`)}
                  {#if entry.kind === "separator"}
                    <hr />
                  {:else if entry.kind === "item"}
                    <button
                      type="button"
                      disabled={entry.disabled}
                      onclick={async (event) => {
                        await entry.callback?.(event);
                        if (entry.closeOnSelect) menuOpen = false;
                      }}
                    >
                      {#if entry.icon}
                        <WorkspaceIcon name={entry.icon} />
                      {/if}
                      {entry.title}
                    </button>
                  {/if}
                {/each}
              {/if}
            </div>
          {/if}

          {#if showBottomNav}
            <WorkspaceMobileDock
              {controller}
              {activeTab}
              tabCount={entries.length}
              {page}
              {menuOpen}
              {createTab}
              onOpenLeftSidebar={() => (reveal = "left")}
              onOpenTabs={() => (page = "tabs")}
              onToggleMenu={() => (menuOpen = !menuOpen)}
            />
          {/if}
        </main>

        <aside
          data-mobile-sidebar-panel="right"
          aria-label="Mobile right sidebar"
        >
          <WorkspaceMobileSidebar
            {controller}
            sidebar={controller.layout.right}
            side="right"
          />
        </aside>
      </div>
    </div>
  {/if}
</div>
