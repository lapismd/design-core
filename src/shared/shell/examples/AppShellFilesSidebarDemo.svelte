<script lang="ts">
  import FileCode2Icon from "@lucide/svelte/icons/file-code-2";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import type {
    AppShellController,
    AppShellSidebarController,
  } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";

  let {
    controller,
    projectSidebar,
    selectedProject,
  }: {
    controller: AppShellController;
    projectSidebar: AppShellSidebarController;
    selectedProject: string;
  } = $props();

  let sidebar = $derived(controller.left);
  let projectName = $derived(
    selectedProject === "lapis-notes"
      ? "Lapis Notes"
      : selectedProject === "ui-catalog"
        ? "UI Catalog"
        : "CV Studio",
  );
  let projectToggleLabel = $derived(
    projectSidebar.closed
      ? "Open projects sidebar"
      : projectSidebar.collapsed
        ? "Expand projects sidebar"
        : "Collapse projects sidebar",
  );
</script>

<AppShell.Sidebar.Header class="ui-shell-story-files-header">
  <AppShell.Sidebar.Toggle
    side="left"
    sidebarController={projectSidebar}
    label={projectToggleLabel}
    previewOnHover
  />
  <FolderOpenIcon aria-hidden="true" />
  {#if !sidebar.collapsed}
    <strong>Files</strong>
  {/if}
</AppShell.Sidebar.Header>

<AppShell.Sidebar.Body class="ui-shell-story-files-body">
  <nav aria-label={`${projectName} files`}>
    <button type="button" aria-label="Source folder">
      <FolderIcon aria-hidden="true" />
      {#if !sidebar.collapsed}<span>src</span>{/if}
    </button>
    <button type="button" aria-label="Shared folder">
      <FolderIcon aria-hidden="true" />
      {#if !sidebar.collapsed}<span>shared</span>{/if}
    </button>
    <button type="button" aria-label="App shell file">
      <FileCode2Icon aria-hidden="true" />
      {#if !sidebar.collapsed}<span>AppShell.svelte</span>{/if}
    </button>
    <button type="button" aria-label="Project readme">
      <FileTextIcon aria-hidden="true" />
      {#if !sidebar.collapsed}<span>README.md</span>{/if}
    </button>
  </nav>
</AppShell.Sidebar.Body>

<AppShell.Sidebar.Footer class="ui-shell-story-files-footer">
  {#if !sidebar.collapsed}
    <span>{projectName}</span>
  {/if}
</AppShell.Sidebar.Footer>
