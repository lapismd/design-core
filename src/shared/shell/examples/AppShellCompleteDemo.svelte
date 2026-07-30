<script lang="ts">
  import { untrack } from "svelte";
  import type {
    AppShellController,
    AppShellDisplayMode,
    AppShellSide,
    AppShellSidebarController,
  } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";
  import AppShellConversationDemo from "./AppShellConversationDemo.svelte";
  import AppShellMarkdownDocumentDemo from "./AppShellMarkdownDocumentDemo.svelte";
  import AppShellMarkdownFilesDemo from "./AppShellMarkdownFilesDemo.svelte";
  import AppShellProjectSidebarDemo from "./AppShellProjectSidebarDemo.svelte";
  import AppShellToolbarDemo from "./AppShellToolbarDemo.svelte";

  let {
    controller,
    projectSidebar,
    displayMode = "auto",
    mobileBreakpoint = 1024,
    desktopMinMainWidth,
    frameClass,
    showBodySidebar = true,
  }: {
    controller: AppShellController;
    projectSidebar: AppShellSidebarController;
    displayMode?: AppShellDisplayMode;
    mobileBreakpoint?: number;
    desktopMinMainWidth?: number;
    frameClass?: string;
    /** Whether the document TOC body sidebar starts open on the right. */
    showBodySidebar?: boolean;
  } = $props();

  let selectedProject = $state("lapis-notes");
  let selectedMarkdownFile = $state("README.md");
  let bodySidebarSide = $state<AppShellSide | undefined>(
    untrack(() => (showBodySidebar ? "right" : undefined)),
  );

  function selectProject(projectId: string): void {
    selectedProject = projectId;
    if (projectId) {
      controller.left.expand();
      if (!selectedMarkdownFile) selectedMarkdownFile = "README.md";
    } else {
      controller.left.close();
    }
  }

  function openMarkdownFile(file: string): void {
    selectedMarkdownFile = file;
    if (!bodySidebarSide) bodySidebarSide = "right";
  }

  function toggleBodySidebar(side: AppShellSide): void {
    if (!selectedMarkdownFile) selectedMarkdownFile = "README.md";
    bodySidebarSide = bodySidebarSide === side ? undefined : side;
  }
</script>

<div class={["ui-shell-story-frame", frameClass].filter(Boolean).join(" ")}>
  <AppShell.Root
    {controller}
    {displayMode}
    {mobileBreakpoint}
    {desktopMinMainWidth}
    class="ui-shell-story-surface ui-shell-story-complete"
  >
    <AppShell.Sidebar
      side="left"
      sidebarController={projectSidebar}
      label="Projects sidebar"
      mobileLabel="Projects"
      resizeLabel="Resize projects sidebar"
      variant="outer"
      closeable
      revealOnEdgeHover
      edgeRevealLabel="Preview projects sidebar"
    >
      <AppShellProjectSidebarDemo
        sidebar={projectSidebar}
        {selectedProject}
        onSelectProject={selectProject}
      />
    </AppShell.Sidebar>

    <AppShell.Sidebar
      side="left"
      label="Files sidebar"
      mobileLabel="Files"
      resizeLabel="Resize files sidebar"
    >
      <AppShellMarkdownFilesDemo
        {controller}
        {projectSidebar}
        selectedFile={selectedMarkdownFile}
        onSelectFile={openMarkdownFile}
      />
    </AppShell.Sidebar>

    <AppShell.Main>
      <AppShell.Toolbar>
        <AppShellToolbarDemo leftSidebarName="files" />
      </AppShell.Toolbar>
      <AppShellMarkdownDocumentDemo
        file={selectedMarkdownFile}
        sidebarSide={bodySidebarSide}
        onToggleSidebar={toggleBodySidebar}
      />
    </AppShell.Main>

    <AppShell.Sidebar
      side="right"
      label="AI sidebar"
      mobileLabel="AI conversation"
      resizeLabel="Resize AI sidebar"
      closeable
    >
      <AppShellConversationDemo {controller} />
    </AppShell.Sidebar>
  </AppShell.Root>
</div>
