<script lang="ts">
  import type { Snippet } from "svelte";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import LayoutPanelLeft from "@lucide/svelte/icons/layout-panel-left";
  import Search from "@lucide/svelte/icons/search";
  import StudioWorkspaceShell from "../layout/StudioWorkspaceShell.svelte";

  /**
   * Fixed 1280×900 frame matching Fava screen capture viewport for Visual Delta.
   */
  let {
    pageTitle,
    children,
  }: {
    pageTitle: string;
    children?: Snippet;
  } = $props();

  const projects = [
    {
      id: "sample",
      name: "Sample ledger",
      detail: "sample.beancount",
    },
  ];
  const sidebarTabs = [
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "workspace", label: "Workspace", icon: LayoutPanelLeft },
    { id: "search", label: "Search", icon: Search },
  ];
</script>

<div
  class="border-border bg-background overflow-hidden"
  style="width: 1280px; height: 900px;"
  data-fava-screen-frame
>
  <StudioWorkspaceShell
    {pageTitle}
    height="container"
    projectName="Sample ledger"
    {projects}
    currentProjectId="sample"
    {sidebarTabs}
    activeSidebarTab="workspace"
  >
    {#snippet sidebarTabContent(tabId)}
      {#if tabId === "workspace"}
        <p class="text-muted-foreground px-3 py-2 text-sm">Workspace</p>
      {:else if tabId === "search"}
        <p class="text-muted-foreground px-3 py-2 text-sm">Search</p>
      {/if}
    {/snippet}
    {@render children?.()}
  </StudioWorkspaceShell>
</div>
