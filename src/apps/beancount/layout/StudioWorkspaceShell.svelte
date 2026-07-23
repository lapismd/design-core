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
  class={`${height === "viewport" ? "h-screen" : "h-full"} overflow-hidden`}
>
  <AppShell {pageTitle} {height} hasSidebar>
    <svelte:fragment slot="sidebar">
      <Sidebar.Root collapsible="icon">
        <div class="relative flex h-full min-h-0 flex-col">
          <div
            class="flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden"
          >
            <Sidebar.Header class="gap-3">
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
                        ? "border-sidebar-border bg-background text-sidebar-accent-foreground hover:bg-background h-8 w-full border shadow-sm"
                        : "text-muted-foreground hover:text-sidebar-foreground h-8 w-full border border-transparent"}
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

            <Sidebar.Content class="px-2 pb-3" aria-label={ariaLabel}>
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
                <div class="flex min-h-0 flex-1 flex-col">
                  {@render sidebarTabContent(activeSidebarTab)}
                </div>
              {:else}
                <p class="text-muted-foreground px-2 text-sm">
                  Select a workspace section.
                </p>
              {/if}
            </Sidebar.Content>
          </div>

          <div
            class="hidden h-full min-h-0 flex-col items-center gap-2 px-1.5 py-2 group-data-[collapsible=icon]:flex"
          >
            <Sidebar.Trigger
              class="size-8"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight aria-hidden="true" />
              <span class="sr-only">Expand sidebar</span>
            </Sidebar.Trigger>
            <Sidebar.Trigger
              class="text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-0 flex-1 items-center justify-center rounded-md border border-transparent px-1 py-2"
              aria-label="Expand project rail"
              title={projectName}
            >
              <span
                class="max-h-full truncate text-[12px] font-semibold [writing-mode:vertical-rl]"
              >
                {projectName}
              </span>
            </Sidebar.Trigger>
          </div>
        </div>
      </Sidebar.Root>
    </svelte:fragment>

    <svelte:fragment slot="mobile-navigation-trigger">
      <Sidebar.Trigger
        class="md:hidden"
        aria-label="Show navigation"
        title="Show navigation"
      />
    </svelte:fragment>

    <svelte:fragment slot="desktop-sidebar-trigger">
      <Sidebar.Trigger
        class="hidden size-8 md:inline-flex"
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
  .studio-workspace-sidebar-tabs {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(
      var(--studio-workspace-tab-count),
      minmax(0, 1fr)
    );
    gap: 0.25rem;
    border: 1px solid hsl(var(--sidebar-border));
    border-radius: 0.375rem;
    background: hsl(var(--sidebar-accent) / 0.5);
    padding: 0.25rem;
  }
</style>
