<script lang="ts">
  import BoxesIcon from "@lucide/svelte/icons/boxes";
  import FolderKanbanIcon from "@lucide/svelte/icons/folder-kanban";
  import NotebookTabsIcon from "@lucide/svelte/icons/notebook-tabs";
  import PanelsTopLeftIcon from "@lucide/svelte/icons/panels-top-left";
  import type { AppShellSidebarController } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";
  import * as Select from "../../shadcn/select/index.js";

  let {
    sidebar,
    selectedProject,
    onSelectProject,
  }: {
    sidebar: AppShellSidebarController;
    selectedProject: string;
    onSelectProject: (projectId: string) => void;
  } = $props();

  const projects = [
    {
      id: "cv-studio",
      label: "CV Studio",
      icon: PanelsTopLeftIcon,
    },
    {
      id: "lapis-notes",
      label: "Lapis Notes",
      icon: NotebookTabsIcon,
    },
    {
      id: "ui-catalog",
      label: "UI Catalog",
      icon: FolderKanbanIcon,
    },
  ];

  let selectedProjectLabel = $derived(
    projects.find((project) => project.id === selectedProject)?.label ??
      "Choose a project",
  );
  let compact = $derived(
    sidebar.collapsed && !sidebar.closed && !sidebar.previewed,
  );
</script>

<AppShell.Sidebar.Header class="ui-shell-story-project-header">
  {#if compact}
    <AppShell.Sidebar.Close />
  {:else}
    <div class="ui-shell-story-project-app">
      <BoxesIcon aria-hidden="true" />
      <div>
        <strong>Steve Juma</strong>
        <span>Project workspace</span>
      </div>
    </div>
    <AppShell.Sidebar.Close />

    <div class="ui-shell-story-project-selector">
      <span>Project</span>
      <Select.Root
        type="single"
        value={selectedProject}
        onValueChange={onSelectProject}
      >
        <Select.Trigger
          size="sm"
          class="ui-shell-story-project-selector-trigger"
          aria-label="Project selector"
          aria-controls="ui-shell-story-project-options"
          role="combobox"
        >
          {selectedProjectLabel}
        </Select.Trigger>
        <Select.Content
          id="ui-shell-story-project-options"
          aria-label="Project options"
        >
          <Select.Group>
            {#each projects as project}
              <Select.Item value={project.id} label={project.label}>
                {project.label}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  {/if}
</AppShell.Sidebar.Header>

<AppShell.Sidebar.Body class="ui-shell-story-project-body">
  <nav aria-label="Projects">
    {#each projects as project}
      <button
        type="button"
        class="ui-shell-story-project-item"
        data-active={selectedProject === project.id || undefined}
        aria-label={project.label}
        aria-pressed={selectedProject === project.id}
        title={project.label}
        onclick={() => onSelectProject(project.id)}
      >
        <project.icon aria-hidden="true" />
        {#if !compact}<span>{project.label}</span>{/if}
      </button>
    {/each}
  </nav>
</AppShell.Sidebar.Body>

<AppShell.Sidebar.Footer class="ui-shell-story-project-footer">
  {#if !compact}
    <span>{selectedProject ? "Project ready" : "Select a project"}</span>
  {/if}
</AppShell.Sidebar.Footer>
