<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import type {
    AppShellController,
    AppShellSidebarController,
  } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";

  let {
    controller,
    projectSidebar,
    selectedFile,
    onSelectFile,
  }: {
    controller: AppShellController;
    projectSidebar?: AppShellSidebarController;
    selectedFile: string;
    onSelectFile: (file: string) => void;
  } = $props();

  const files = ["README.md", "architecture.md", "contributing.md"];
  let sidebar = $derived(controller.left);
  let projectToggleLabel = $derived(
    projectSidebar?.closed
      ? "Open projects sidebar"
      : projectSidebar?.collapsed
        ? "Expand projects sidebar"
        : "Collapse projects sidebar",
  );
</script>

<AppShell.Sidebar.Header class="ui-shell-story-files-header">
  {#if projectSidebar}
    <AppShell.Sidebar.Toggle
      side="left"
      sidebarController={projectSidebar}
      label={projectToggleLabel}
      previewOnHover
    />
  {:else}
    <AppShell.Sidebar.Toggle side="left" />
  {/if}
  <FolderOpenIcon aria-hidden="true" />
  {#if !sidebar.collapsed}
    <strong>Markdown files</strong>
  {/if}
</AppShell.Sidebar.Header>

<AppShell.Sidebar.Body class="ui-shell-story-files-body">
  <nav aria-label="Documentation files">
    {#each files as file}
      <button
        type="button"
        aria-label={`Open ${file}`}
        aria-pressed={selectedFile === file}
        data-active={selectedFile === file ? "" : undefined}
        onclick={() => onSelectFile(file)}
      >
        <FileTextIcon aria-hidden="true" />
        {#if !sidebar.collapsed}<span>{file}</span>{/if}
      </button>
    {/each}
  </nav>
</AppShell.Sidebar.Body>

<AppShell.Sidebar.Footer class="ui-shell-story-files-footer">
  {#if !sidebar.collapsed}
    <span>Documentation</span>
  {/if}
</AppShell.Sidebar.Footer>
