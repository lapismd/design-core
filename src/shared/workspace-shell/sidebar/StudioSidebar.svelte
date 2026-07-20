<script lang="ts">
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BriefcaseBusinessIcon from "@lucide/svelte/icons/briefcase-business";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import ListTodoIcon from "@lucide/svelte/icons/list-todo";
  import PictureInPicture2Icon from "@lucide/svelte/icons/picture-in-picture-2";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import type { Icon as IconType } from "@lucide/svelte";
  import { onDestroy, type Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";
  import {
    formatProjectPath,
    middleTruncate,
    type SidebarTab,
    type StudioWorkspaceMode,
  } from "./sidebar-types.js";

  let {
    open = $bindable(false),
    collapsed = $bindable(false),
    tab = $bindable<SidebarTab>("workspace"),
    browserOnlyRuntime = false,
    title = "Studio",
    subtitle = "Workspace",
    collapsedTitle = "Workspace",
    activeProjectPath = null,
    workspaceMode = $bindable<StudioWorkspaceMode>("cv"),
    addingProject = false,
    projectsContent,
    workspaceContent,
    searchContent,
    onAddProject = () => {},
    onSelectWorkspace = () => {},
    onOpenSettings = () => {},
  }: {
    open?: boolean;
    collapsed?: boolean;
    tab?: SidebarTab;
    browserOnlyRuntime?: boolean;
    title?: string;
    subtitle?: string;
    collapsedTitle?: string;
    activeProjectPath?: string | null;
    workspaceMode?: StudioWorkspaceMode;
    addingProject?: boolean;
    projectsContent?: Snippet;
    workspaceContent: Snippet;
    searchContent?: Snippet;
    onAddProject?: () => void | Promise<void>;
    onSelectWorkspace?: (mode: StudioWorkspaceMode) => void | Promise<void>;
    onOpenSettings?: () => void;
  } = $props();

  const sidebarTabs: Array<{
    id: SidebarTab;
    label: string;
    icon: typeof IconType;
  }> = [
    { id: "projects", label: "Projects", icon: FolderOpenIcon },
    { id: "workspace", label: "Workspace", icon: PictureInPicture2Icon },
    { id: "search", label: "Search", icon: SearchIcon },
  ];

  const workspaceItems: Array<{
    mode: StudioWorkspaceMode;
    label: string;
    description: string;
    icon: typeof IconType;
  }> = [
    { mode: "cv", label: "CV", description: "Structured CV editor", icon: FileTextIcon },
    {
      mode: "applications",
      label: "Applications",
      description: "Kanban, activity, actions",
      icon: BriefcaseBusinessIcon,
    },
    { mode: "tasks", label: "Tasks", description: "Planner buckets", icon: ListTodoIcon },
    { mode: "docs", label: "Docs", description: "Notes and practice", icon: BookOpenIcon },
  ];

  const activeWorkspaceItem = $derived(
    workspaceItems.find((item) => item.mode === workspaceMode) ?? workspaceItems[0],
  );
  const formattedActiveProjectPath = $derived(
    activeProjectPath ? formatProjectPath(activeProjectPath) : "",
  );
  const activeProjectPathLabel = $derived(middleTruncate(formattedActiveProjectPath, 34));
  const SIDEBAR_WIDTH_STORAGE_KEY = "ui:main-sidebar-width";
  const DEFAULT_SIDEBAR_WIDTH = 256;
  const MIN_SIDEBAR_WIDTH = 220;
  const MAX_SIDEBAR_WIDTH = 520;

  let sidebarWidth = $state(readStoredSidebarWidth());
  let resizing = $state(false);
  let resizeStartX = 0;
  let resizeStartWidth = DEFAULT_SIDEBAR_WIDTH;
  let previousBodyCursor = "";
  let previousBodyUserSelect = "";

  const sidebarStyle = $derived(`width: ${collapsed ? 48 : sidebarWidth}px;`);
  const sidebarBackdropStyle = $derived(`left: ${collapsed ? 48 : sidebarWidth}px;`);

  $effect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
  });

  onDestroy(() => {
    stopSidebarResize();
  });

  function readStoredSidebarWidth() {
    if (typeof localStorage === "undefined") return DEFAULT_SIDEBAR_WIDTH;
    const storedValue = Number.parseInt(
      localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) ?? "",
      10,
    );
    if (!Number.isFinite(storedValue)) return DEFAULT_SIDEBAR_WIDTH;
    return clampSidebarWidth(storedValue);
  }

  function clampSidebarWidth(value: number) {
    return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(value)));
  }

  function startSidebarResize(event: PointerEvent) {
    if (collapsed) return;
    event.preventDefault();
    resizing = true;
    resizeStartX = event.clientX;
    resizeStartWidth = sidebarWidth;
    previousBodyCursor = document.body.style.cursor;
    previousBodyUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handleSidebarResizeMove);
    window.addEventListener("pointerup", stopSidebarResize, { once: true });
  }

  function handleSidebarResizeMove(event: PointerEvent) {
    if (!resizing) return;
    event.preventDefault();
    sidebarWidth = clampSidebarWidth(resizeStartWidth + event.clientX - resizeStartX);
  }

  function stopSidebarResize() {
    if (!resizing) return;
    resizing = false;
    document.body.style.cursor = previousBodyCursor;
    document.body.style.userSelect = previousBodyUserSelect;
    window.removeEventListener("pointermove", handleSidebarResizeMove);
    window.removeEventListener("pointerup", stopSidebarResize);
  }

  function handleSidebarResizeKeydown(event: KeyboardEvent) {
    if (collapsed) return;
    const step = event.shiftKey ? 32 : 16;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      sidebarWidth = clampSidebarWidth(sidebarWidth - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      sidebarWidth = clampSidebarWidth(sidebarWidth + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      sidebarWidth = MIN_SIDEBAR_WIDTH;
    } else if (event.key === "End") {
      event.preventDefault();
      sidebarWidth = MAX_SIDEBAR_WIDTH;
    }
  }
</script>

{#if open}
  <button
    type="button"
    data-ui-component="studio-sidebar"
    data-ui-part="backdrop"
    style={sidebarBackdropStyle}
    aria-label="Close sidebar"
    onclick={() => (open = false)}
  ></button>
{/if}

<Sidebar.Root
  {open}
  style={sidebarStyle}
  data-studio-sidebar="true"
  data-collapsed={collapsed ? "true" : "false"}
>
  {#if collapsed}
    <div data-ui-component="studio-sidebar" data-ui-part="collapsed-rail">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        data-ui-part="icon-button"
        aria-label="Expand sidebar"
        title="Expand sidebar"
        onclick={() => (collapsed = false)}
      >
        <ChevronRightIcon />
      </Button>
      <button
        type="button"
        data-ui-component="studio-sidebar"
        data-ui-part="vertical-label"
        title={collapsedTitle}
        onclick={() => (collapsed = false)}
      >
        <span>{collapsedTitle || subtitle}</span>
      </button>
      {#if !browserOnlyRuntime}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-ui-part="icon-button"
          aria-label="Add project"
          title="Add project"
          disabled={addingProject}
          onclick={() => void onAddProject()}
        >
          {#if addingProject}
            <Spinner />
          {:else}
            <PlusIcon />
          {/if}
        </Button>
      {/if}
    </div>
  {:else}
    <Sidebar.Header>
      <div data-ui-component="studio-sidebar" data-ui-part="brand-row">
        <div data-ui-component="studio-sidebar" data-ui-part="logo" aria-hidden="true">
          <span>{title.slice(0, 1)}</span>
        </div>
        <div data-ui-component="studio-sidebar" data-ui-part="brand-text">
          <p>{title}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-ui-part="icon-button"
          aria-label="Settings"
          title="Settings"
          onclick={onOpenSettings}
        >
          <SettingsIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-ui-part="icon-button"
          data-collapse="true"
          aria-label="Collapse sidebar to project rail"
          title="Collapse sidebar"
          onclick={() => (collapsed = true)}
        >
          <ChevronLeftIcon />
        </Button>
      </div>
      {#if !browserOnlyRuntime}
        {#if formattedActiveProjectPath}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                type="button"
                data-ui-part="project-path"
              >
                <span>{activeProjectPathLabel}</span>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" data-studio-sidebar="tooltip-wide">
                {formattedActiveProjectPath}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        {/if}
        <Tooltip.Provider>
          <div data-ui-component="studio-sidebar" data-ui-part="tab-bar">
            <div data-ui-component="studio-sidebar" data-ui-part="tab-grid">
              {#each sidebarTabs as item (item.id)}
                <Tooltip.Root>
                  <Tooltip.Trigger
                    type="button"
                    data-ui-part="tab"
                    data-active={tab === item.id ? "true" : "false"}
                    aria-label={item.label}
                    title={item.label}
                    onclick={() => (tab = item.id)}
                  >
                    <item.icon />
                  </Tooltip.Trigger>
                  <Tooltip.Content side="bottom">{item.label}</Tooltip.Content>
                </Tooltip.Root>
              {/each}
            </div>
          </div>
        </Tooltip.Provider>
      {/if}
    </Sidebar.Header>

    <Sidebar.Content>
      {#if tab === "projects" && !browserOnlyRuntime}
        {#if projectsContent}
          {@render projectsContent()}
        {/if}
      {:else if tab === "search" && !browserOnlyRuntime}
        {#if searchContent}
          {@render searchContent()}
        {/if}
      {:else}
        {@render workspaceContent()}
      {/if}
    </Sidebar.Content>

    <Sidebar.Footer>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="sm"
              data-ui-part="workspace-switcher"
              aria-label="Switch workspace"
            >
              {@const ActiveIcon = activeWorkspaceItem.icon}
              <ActiveIcon data-icon="inline-start" />
              <span data-ui-part="workspace-label">{activeWorkspaceItem.label}</span>
              <ChevronsUpDownIcon data-icon="inline-end" data-ui-part="muted-icon" />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content side="top" align="start" data-studio-sidebar="menu">
          <DropdownMenu.Label>Workspaces</DropdownMenu.Label>
          <DropdownMenu.Group>
            {#each workspaceItems as item (item.mode)}
              {@const Icon = item.icon}
              <DropdownMenu.Item
                onclick={() => {
                  workspaceMode = item.mode;
                  void onSelectWorkspace(item.mode);
                }}
              >
                <Icon data-icon="inline-start" />
                <span data-ui-component="studio-sidebar" data-ui-part="menu-item-text">
                  <span>{item.label}</span>
                  <span data-ui-part="muted">{item.description}</span>
                </span>
                {#if item.mode === workspaceMode}
                  <CheckIcon data-icon="inline-end" data-ui-part="check" />
                {/if}
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Sidebar.Footer>
    <div
      role="slider"
      tabindex="0"
      data-ui-component="studio-sidebar"
      data-ui-part="resize"
      data-resizing={resizing ? "true" : "false"}
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      aria-valuenow={sidebarWidth}
      title="Resize sidebar"
      onpointerdown={startSidebarResize}
      onkeydown={handleSidebarResizeKeydown}
    >
      <span data-ui-part="resize-thumb" aria-hidden="true"></span>
    </div>
  {/if}
</Sidebar.Root>

<style>
  :global([data-ui-component="studio-sidebar"][data-ui-part="backdrop"]) {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 40;
    background: color-mix(in oklab, var(--background) 70%, transparent);
    backdrop-filter: blur(4px);
  }

  @media (min-width: 1024px) {
    :global([data-ui-component="studio-sidebar"][data-ui-part="backdrop"]) {
      display: none;
    }
  }

  :global([data-studio-sidebar="true"]) {
    position: fixed;
    top: 0.5rem;
    bottom: 0.5rem;
    left: 0.5rem;
    z-index: 50;
    display: flex;
    max-height: calc(100vh - 1rem);
    flex-direction: column;
    overflow: hidden;
    border-radius: 0.75rem;
    background: var(--sidebar);
    color: var(--sidebar-foreground);
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  @media (min-width: 1024px) {
    :global([data-studio-sidebar="true"]) {
      position: relative;
      inset: auto;
      z-index: auto;
      /* Align sidebar chrome with the padded main card */
      top: auto;
      bottom: auto;
      left: auto;
      height: 100%;
      max-height: none;
      align-self: stretch;
      padding-top: var(--ui-workspace-pad, 0.5rem);
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
    }
  }

  :global([data-studio-sidebar="true"][data-collapsed="true"]) {
    width: 3rem;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="collapsed-rail"]) {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.375rem;
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="icon-button"] svg) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="icon-button"][data-collapse="true"]) {
    margin-right: -0.25rem;
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="vertical-label"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    padding: 0.5rem 0.25rem;
    color: var(--sidebar-foreground);
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="vertical-label"]:hover) {
    border-color: var(--sidebar-border);
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="vertical-label"] span) {
    max-height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    writing-mode: vertical-rl;
  }

  :global([data-studio-sidebar="true"] [data-slot="sidebar-header"]) {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 1rem 1rem;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="brand-row"]) {
    display: flex;
    height: var(--ui-workspace-toolbar-height, 3rem);
    align-items: center;
    gap: 0.75rem;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="logo"]) {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    overflow: hidden;
    border-radius: 0.375rem;
    background: transparent;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="logo"] span) {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border-radius: 0.375rem;
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
    font-size: 0.875rem;
    font-weight: 700;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="brand-text"]) {
    min-width: 0;
    flex: 1 1 auto;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="brand-text"] p) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.25;
  }

  :global([data-studio-sidebar="true"] [data-ui-part="project-path"]) {
    display: flex;
    width: 100%;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 0.125rem;
    padding-inline: 0.25rem;
    text-align: center;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 10px;
    color: var(--muted-foreground);
  }

  :global([data-studio-sidebar="true"] [data-ui-part="project-path"]:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
  }

  :global([data-studio-sidebar="true"] [data-ui-part="project-path"] span) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global([data-studio-sidebar="tooltip-wide"]) {
    max-width: 18rem;
    overflow-wrap: anywhere;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="tab-bar"]) {
    margin-inline: -0.5rem;
    border: 1px solid var(--sidebar-border);
    border-radius: 0.375rem;
    background: color-mix(in oklab, var(--sidebar-accent) 50%, transparent);
    padding: 0.25rem;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="tab-grid"]) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.25rem;
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="tab"]) {
    display: flex;
    height: 2rem;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 0.125rem;
    color: var(--muted-foreground);
    transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="tab"]:hover) {
    color: var(--sidebar-foreground);
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="tab"][data-active="true"]) {
    border-color: var(--sidebar-border);
    background: var(--background);
    color: var(--sidebar-accent-foreground);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  :global([data-ui-component="studio-sidebar"] [data-ui-part="tab"] svg) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-studio-sidebar="true"] [data-slot="sidebar-content"]) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    padding-inline: 0.5rem;
  }

  :global([data-studio-sidebar="true"] [data-ui-part="workspace-switcher"]) {
    height: 2rem;
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
    background: transparent;
    padding-inline: 0.5rem;
    color: var(--sidebar-foreground);
  }

  :global([data-studio-sidebar="true"] [data-ui-part="workspace-switcher"]:hover),
  :global(
    [data-studio-sidebar="true"] [data-ui-part="workspace-switcher"][aria-expanded="true"]
  ) {
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
  }

  :global(
    [data-studio-sidebar="true"] [data-ui-part="workspace-switcher"] [data-ui-part="workspace-label"]
  ) {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
  }

  :global([data-studio-sidebar="true"] [data-ui-part="muted-icon"]) {
    color: var(--muted-foreground);
  }

  :global([data-studio-sidebar="menu"]) {
    width: 15rem;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="menu-item-text"]) {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="menu-item-text"] > span:first-child) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="menu-item-text"] [data-ui-part="muted"]) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  :global([data-studio-sidebar="menu"] [data-ui-part="check"]) {
    margin-left: auto;
    color: var(--primary);
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="resize"]) {
    position: absolute;
    top: 0.5rem;
    right: -0.375rem;
    bottom: 0.5rem;
    z-index: 20;
    display: flex;
    width: 0.75rem;
    cursor: col-resize;
    align-items: stretch;
    justify-content: center;
    border-radius: 9999px;
    background: transparent;
    outline: none;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="resize"][data-resizing="true"]) {
    background: color-mix(in oklab, var(--primary) 5%, transparent);
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="resize"] [data-ui-part="resize-thumb"]) {
    width: 0.25rem;
    margin-block: 0.625rem;
    background: transparent;
    transition: background-color 150ms ease;
  }

  :global([data-ui-component="studio-sidebar"][data-ui-part="resize"]:hover [data-ui-part="resize-thumb"]),
  :global(
    [data-ui-component="studio-sidebar"][data-ui-part="resize"]:focus-visible [data-ui-part="resize-thumb"]
  ),
  :global(
    [data-ui-component="studio-sidebar"][data-ui-part="resize"][data-resizing="true"]
      [data-ui-part="resize-thumb"]
  ) {
    background: color-mix(in oklab, var(--primary) 60%, transparent);
  }
</style>
