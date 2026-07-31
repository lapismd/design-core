<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FilesIcon from "@lucide/svelte/icons/files";
  import InfoIcon from "@lucide/svelte/icons/info";
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import ListFilterIcon from "@lucide/svelte/icons/list-filter";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import { Button } from "../../../shadcn/button/index.js";
  import { AppShell } from "../index.js";
  import type {
    AppShellController,
    AppShellSide,
  } from "../app-shell-controller.svelte.js";

  let {
    controller,
    side,
  }: {
    controller: AppShellController;
    side: AppShellSide;
  } = $props();

  let sidebar = $derived(controller.getSidebar(side));

  const recentDocuments = [
    "Principal engineer CV",
    "Platform role",
    "Developer experience",
    "Financial systems",
    "UI architecture",
    "Cloud infrastructure",
    "Accessibility",
    "AI tooling",
    "Observability",
    "Data pipelines",
    "TypeScript",
    "Svelte",
    "Leadership",
    "Mentoring",
  ];
</script>

<AppShell.Sidebar.Header class="ui-shell-story-sidebar-heading">
  {#if side === "left"}
    <LayoutDashboardIcon aria-hidden="true" />
  {:else}
    <InfoIcon aria-hidden="true" />
  {/if}
  {#if !sidebar.collapsed}
    <strong>{side === "left" ? "CV Studio" : "Inspector"}</strong>
  {/if}
</AppShell.Sidebar.Header>

<AppShell.Sidebar.Body class="ui-shell-story-sidebar-body">
  <nav aria-label={side === "left" ? "Primary navigation" : "Inspector panels"}>
    {#if side === "left"}
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="CV library"
        title="CV library"
      >
        <FilesIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>CV library</span>{/if}
      </Button>
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="Applications"
        title="Applications"
      >
        <FileTextIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>Applications</span>{/if}
      </Button>
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="Search"
        title="Search"
      >
        <SearchIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>Search</span>{/if}
      </Button>
      {#if !sidebar.collapsed}
        <span class="ui-shell-story-nav-label">Recent documents</span>
      {/if}
      {#each recentDocuments as document}
        <Button
          variant="ghost"
          size={sidebar.collapsed ? "icon-sm" : "default"}
          class="ui-shell-story-nav-item"
          aria-label={document}
          title={document}
        >
          <FileTextIcon aria-hidden="true" />
          {#if !sidebar.collapsed}<span>{document}</span>{/if}
        </Button>
      {/each}
    {:else}
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="Properties"
        title="Properties"
      >
        <ListFilterIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>Properties</span>{/if}
      </Button>
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="Details"
        title="Details"
      >
        <InfoIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>Details</span>{/if}
      </Button>
      <Button
        variant="ghost"
        size={sidebar.collapsed ? "icon-sm" : "default"}
        class="ui-shell-story-nav-item"
        aria-label="Settings"
        title="Settings"
      >
        <SettingsIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>Settings</span>{/if}
      </Button>
    {/if}
  </nav>
</AppShell.Sidebar.Body>

<AppShell.Sidebar.Footer class="ui-shell-story-sidebar-footer">
  {#if !sidebar.collapsed}
    {side === "left" ? "Docs workspace" : "Inspector ready"}
  {/if}
</AppShell.Sidebar.Footer>
