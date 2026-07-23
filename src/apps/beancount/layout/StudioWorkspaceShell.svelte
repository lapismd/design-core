<script lang="ts">
  import type { Icon } from "@lucide/svelte";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { Snippet } from "svelte";
  import AppShell from "./AppShell.svelte";
  import ProjectSwitcher, {
    type ProjectSwitcherItem,
  } from "../navigation/ProjectSwitcher.svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";
  import StudioShellHeader from "./StudioShellHeader.svelte";

  export type StudioWorkspaceSidebarTab = {
    /** Stable parent-owned selection value. */
    id: string;
    label: string;
    icon: typeof Icon;
    disabled?: boolean;
  };

  let {
    pageTitle,
    height = "viewport",
    projectName = "No project",
    projects,
    currentProjectId,
    sidebarTabs,
    activeSidebarTab,
    projectTabId = "projects",
    settingsOpen = false,
    showCloseSidebar = true,
    addProjectLabel,
    addProjectPending = false,
    emptyProjectLabel,
    ariaLabel = "Studio workspace",
    onActiveSidebarTabChange = () => {},
    onProjectSelect,
    onAddProject,
    onOpenSettings = () => {},
    onCloseSidebar = () => {},
    sidebarTabContent,
    titleTrailing,
    headerLeading,
    headerActions,
    status,
    ai,
    children,
  }: {
    pageTitle: string;
    height?: "viewport" | "container";
    projectName?: string;
    /** Display-ready projects. Project discovery and storage remain application-owned. */
    projects: readonly ProjectSwitcherItem[];
    currentProjectId?: string;
    /** Compact sidebar-mode controls, such as projects, workspace, and search. */
    sidebarTabs: readonly StudioWorkspaceSidebarTab[];
    activeSidebarTab: string;
    /** Identifies the tab that renders the built-in project switcher. */
    projectTabId?: string;
    settingsOpen?: boolean;
    showCloseSidebar?: boolean;
    addProjectLabel?: string;
    addProjectPending?: boolean;
    emptyProjectLabel?: string;
    ariaLabel?: string;
    onActiveSidebarTabChange?: (id: string) => void;
    onProjectSelect?: (project: ProjectSwitcherItem) => void;
    onAddProject?: () => void;
    onOpenSettings?: () => void;
    onCloseSidebar?: () => void;
    /** Renders the application-owned body for non-project sidebar tabs. */
    sidebarTabContent?: Snippet<[string]>;
    titleTrailing?: Snippet;
    headerLeading?: Snippet;
    headerActions?: Snippet;
    status?: Snippet;
    ai?: Snippet;
    /** Renders the application-owned workspace content. */
    children?: Snippet;
  } = $props();

  function selectTab(tab: StudioWorkspaceSidebarTab) {
    if (!tab.disabled) onActiveSidebarTabChange(tab.id);
  }
</script>

<Sidebar.Provider
  class={height === "viewport"
    ? "bc-studio-workspace-shell bc-studio-workspace-shell--viewport"
    : "bc-studio-workspace-shell"}
>
  <AppShell {pageTitle} {height} hasSidebar>
    <svelte:fragment slot="sidebar">
      <Sidebar.Root collapsible="icon">
        <div class="bc-studio-workspace-shell__sidebar">
          <div class="bc-studio-workspace-shell__expanded-sidebar">
            <Sidebar.Header class="bc-studio-workspace-shell__sidebar-header">
              <StudioShellHeader
                {projectName}
                {settingsOpen}
                {showCloseSidebar}
                onOpenLedgerSettings={onOpenSettings}
                {onCloseSidebar}
              />

              {#if sidebarTabs.length > 1 && !settingsOpen}
                <div
                  class="studio-workspace-sidebar-tabs"
                  style={`--studio-workspace-tab-count: ${sidebarTabs.length}`}
                  aria-label="Workspace sidebar sections"
                >
                  {#each sidebarTabs as tab (tab.id)}
                    {@const Icon = tab.icon}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class={activeSidebarTab === tab.id
                        ? "bc-studio-workspace-shell__sidebar-tab bc-studio-workspace-shell__sidebar-tab--active"
                        : "bc-studio-workspace-shell__sidebar-tab"}
                      aria-label={tab.label}
                      aria-pressed={activeSidebarTab === tab.id}
                      title={tab.label}
                      disabled={tab.disabled}
                      onclick={() => selectTab(tab)}
                    >
                      <Icon aria-hidden="true" />
                    </Button>
                  {/each}
                </div>
              {/if}
            </Sidebar.Header>

            <Sidebar.Content
              class="bc-studio-workspace-shell__sidebar-content"
              aria-label={ariaLabel}
            >
              {#if activeSidebarTab === projectTabId}
                <ProjectSwitcher
                  {projects}
                  {currentProjectId}
                  addLabel={addProjectLabel}
                  addPending={addProjectPending}
                  emptyLabel={emptyProjectLabel}
                  onSelect={onProjectSelect}
                  onAdd={onAddProject}
                />
              {:else if sidebarTabContent}
                <div class="bc-studio-workspace-shell__sidebar-tab-content">
                  {@render sidebarTabContent(activeSidebarTab)}
                </div>
              {:else}
                <p class="bc-studio-workspace-shell__sidebar-empty">
                  Select a workspace section.
                </p>
              {/if}
            </Sidebar.Content>
          </div>

          <div class="bc-studio-workspace-shell__collapsed-sidebar">
            <Sidebar.Trigger
              class="bc-studio-workspace-shell__expand-trigger"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight aria-hidden="true" />
              <span class="bc-studio-workspace-shell__visually-hidden">
                Expand sidebar
              </span>
            </Sidebar.Trigger>
            <Sidebar.Trigger
              class="bc-studio-workspace-shell__project-rail"
              aria-label="Expand project rail"
              title={projectName}
            >
              <span class="bc-studio-workspace-shell__project-rail-label">
                {projectName}
              </span>
            </Sidebar.Trigger>
          </div>
        </div>
      </Sidebar.Root>
    </svelte:fragment>

    <svelte:fragment slot="mobile-navigation-trigger">
      <Sidebar.Trigger
        class="bc-studio-workspace-shell__mobile-trigger"
        aria-label="Show navigation"
        title="Show navigation"
      />
    </svelte:fragment>

    <svelte:fragment slot="desktop-sidebar-trigger">
      <Sidebar.Trigger
        class="bc-studio-workspace-shell__desktop-trigger"
        aria-label="Collapse sidebar to project rail"
        title="Collapse sidebar"
      />
    </svelte:fragment>

    <svelte:fragment slot="title-trailing">
      {@render titleTrailing?.()}
    </svelte:fragment>

    <svelte:fragment slot="header-leading">
      {@render headerLeading?.()}
    </svelte:fragment>

    <svelte:fragment slot="header-actions">
      {@render headerActions?.()}
    </svelte:fragment>

    <svelte:fragment slot="status">
      {@render status?.()}
    </svelte:fragment>

    {@render children?.()}

    <svelte:fragment slot="ai">
      {@render ai?.()}
    </svelte:fragment>
  </AppShell>
</Sidebar.Provider>

<style>
  :global(.bc-studio-workspace-shell) {
    height: 100%;
    overflow: hidden;
  }

  :global(.bc-studio-workspace-shell--viewport) {
    height: 100vh;
  }

  .bc-studio-workspace-shell__sidebar {
    position: relative;
    display: flex;
    min-height: 0;
    height: 100%;
    flex-direction: column;
  }

  .bc-studio-workspace-shell__expanded-sidebar {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
  }

  :global(
      [data-collapsible="icon"] .bc-studio-workspace-shell__expanded-sidebar
    ) {
    display: none;
  }

  :global(.bc-studio-workspace-shell__sidebar-header) {
    gap: var(--ui-beancount-space-3);
  }

  .studio-workspace-sidebar-tabs {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(
      var(--studio-workspace-tab-count),
      minmax(0, 1fr)
    );
    gap: var(--ui-beancount-space-1);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-sm);
    background: color-mix(
      in srgb,
      var(--ui-beancount-sidebar-accent) 50%,
      transparent
    );
    padding: var(--ui-beancount-space-1);
  }

  :global(.bc-studio-workspace-shell__sidebar-tab) {
    width: 100%;
    height: var(--ui-beancount-compact-control-height);
    border: 1px solid transparent;
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-studio-workspace-shell__sidebar-tab:hover) {
    color: var(--ui-beancount-sidebar-foreground);
  }

  :global(.bc-studio-workspace-shell__sidebar-tab--active),
  :global(.bc-studio-workspace-shell__sidebar-tab--active:hover) {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-studio-workspace-shell__sidebar-content) {
    padding-inline: var(--ui-beancount-space-2);
    padding-block-end: var(--ui-beancount-space-3);
  }

  .bc-studio-workspace-shell__sidebar-tab-content {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
  }

  .bc-studio-workspace-shell__sidebar-empty {
    margin: 0;
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-studio-workspace-shell__collapsed-sidebar {
    display: none;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    padding: var(--ui-beancount-space-2)
      calc(var(--ui-beancount-space-2) * 0.75);
  }

  :global(
      [data-collapsible="icon"] .bc-studio-workspace-shell__collapsed-sidebar
    ) {
    display: flex;
  }

  :global(.bc-studio-workspace-shell__expand-trigger) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
  }

  :global(.bc-studio-workspace-shell__project-rail) {
    display: flex;
    min-height: 0;
    flex: 1;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-1);
    color: var(--ui-beancount-sidebar-foreground);
  }

  :global(.bc-studio-workspace-shell__project-rail:hover) {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-sidebar-accent-foreground);
  }

  .bc-studio-workspace-shell__project-rail-label {
    max-height: 100%;
    overflow: hidden;
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
    writing-mode: vertical-rl;
  }

  .bc-studio-workspace-shell__visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-studio-workspace-shell__mobile-trigger) {
    display: inline-flex;
  }

  :global(.bc-studio-workspace-shell__desktop-trigger) {
    display: none;
  }

  @media (min-width: 48rem) {
    :global(.bc-studio-workspace-shell__mobile-trigger) {
      display: none;
    }

    :global(.bc-studio-workspace-shell__desktop-trigger) {
      display: inline-flex;
      width: var(--ui-beancount-compact-control-height);
      height: var(--ui-beancount-compact-control-height);
    }
  }
</style>
