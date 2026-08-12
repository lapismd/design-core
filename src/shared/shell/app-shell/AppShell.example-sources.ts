type ShellSourceOptions = {
  displayMode?: '"auto"' | '"desktop"' | '"mobile"' | "{displayMode}";
  controllerOptions?: string;
  desktopMinMainWidth?: number;
  namedOuterSidebar?: boolean;
  rightSidebar?: boolean;
};

function shellSource({
  displayMode = '"desktop"',
  controllerOptions = "",
  desktopMinMainWidth,
  namedOuterSidebar = false,
  rightSidebar = true,
}: ShellSourceOptions = {}): string {
  const controllerSetup = controllerOptions
    ? `const controller = new AppShellController(${controllerOptions});`
    : "const controller = new AppShellController();";
  const namedSidebarSetup = namedOuterSidebar
    ? '\nconst projects = controller.createSidebar("projects", "left", { width: 220 });'
    : "";
  const minimumWidth =
    desktopMinMainWidth === undefined
      ? ""
      : `\n    desktopMinMainWidth={${desktopMinMainWidth}}`;
  const outerSidebar = namedOuterSidebar
    ? `
    <AppShell.Sidebar
      side="left"
      sidebarController={projects}
      variant="outer"
      label="Projects"
      closeable
      revealOnEdgeHover
    >
      <AppShell.Sidebar.Header>
        <strong>Projects</strong>
        <AppShell.Sidebar.Close />
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>Project navigation</AppShell.Sidebar.Body>
    </AppShell.Sidebar>
`
    : "";
  const leftToggle = namedOuterSidebar
    ? '<AppShell.Sidebar.Toggle side="left" sidebarName="files" />'
    : '<AppShell.Sidebar.Toggle side="left" />';
  const right = rightSidebar
    ? `
    <AppShell.Sidebar side="right" label="Inspector" closeable>
      <AppShell.Sidebar.Header>
        <strong>Inspector</strong>
        <AppShell.Sidebar.Close />
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>Contextual details</AppShell.Sidebar.Body>
    </AppShell.Sidebar>
`
    : "";

  return `<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";

  ${controllerSetup}${namedSidebarSetup}
</script>

<div style="height: 42rem">
  <AppShell.Root
    {controller}
    displayMode=${displayMode}${minimumWidth}
  >${outerSidebar}
    <AppShell.Sidebar side="left" label="Files">
      <AppShell.Sidebar.Header>
        <strong>Files</strong>
        <AppShell.Sidebar.Toggle side="left" />
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>File navigation</AppShell.Sidebar.Body>
    </AppShell.Sidebar>

    <AppShell.Main>
      <AppShell.Toolbar>
        ${leftToggle}
        <strong>Application workspace</strong>
        ${rightSidebar ? '<AppShell.Sidebar.Toggle side="right" />' : ""}
      </AppShell.Toolbar>
      <AppShell.Body label="Workspace content">
        <h1>Workspace</h1>
      </AppShell.Body>
    </AppShell.Main>${right}
  </AppShell.Root>
</div>`;
}

export const TwoExpandedSidebars = shellSource({
  controllerOptions: "{ leftWidth: 260, rightWidth: 280 }",
});

export const NestedProjectAndFileSidebars = shellSource({
  namedOuterSidebar: true,
});

export const CompleteShellComposition = shellSource({
  displayMode: '"auto"',
  namedOuterSidebar: true,
});

export const AutomaticTabletComposition = shellSource({
  displayMode: '"auto"',
  controllerOptions: "{ leftCollapsed: true, rightClosed: true }",
  namedOuterSidebar: true,
});

export const MobileEdgePanels = shellSource({
  displayMode: '"mobile"',
  controllerOptions: "{ leftCollapsed: true, rightClosed: true }",
  namedOuterSidebar: true,
});

export const ProgrammaticDisplayModes = `<script lang="ts">
  import {
    AppShell,
    AppShellController,
    type AppShellDisplayMode,
  } from "@lapismd/design-core/shell";

  const controller = new AppShellController();
  let displayMode = $state<AppShellDisplayMode>("auto");
</script>

<nav aria-label="Shell display mode">
  {#each ["auto", "desktop", "mobile"] as mode}
    <button
      type="button"
      aria-pressed={displayMode === mode}
      onclick={() => (displayMode = mode as AppShellDisplayMode)}
    >
      {mode}
    </button>
  {/each}
</nav>

<div style="height: 42rem">
  <AppShell.Root {controller} {displayMode}>
    <AppShell.Main>
      <AppShell.Body label="Workspace content">Workspace</AppShell.Body>
    </AppShell.Main>
  </AppShell.Root>
</div>`;

export const ConstrainedDesktopOverlays = shellSource({
  displayMode: '"desktop"',
  controllerOptions: "{ leftCollapsed: true, leftWidth: 220, rightWidth: 240 }",
  desktopMinMainWidth: 720,
  namedOuterSidebar: true,
});

export const MarkdownDocumentBodySidebars = `<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";

  const controller = new AppShellController();
  let tableOfContentsOpen = $state(true);
</script>

<div style="height: 42rem">
  <AppShell.Root {controller} displayMode="desktop">
    <AppShell.Main>
      <AppShell.Toolbar>
        <AppShell.Body.Toggle
          side="right"
          target="table-of-contents"
          pressed={tableOfContentsOpen}
          onclick={() => (tableOfContentsOpen = !tableOfContentsOpen)}
        />
      </AppShell.Toolbar>
      <AppShell.Body layout="regions" label="Markdown document">
        <AppShell.Body.Content>
          <article><h1>Document title</h1></article>
        </AppShell.Body.Content>
        <AppShell.Body.Sidebar
          side="right"
          panelId="table-of-contents"
          bind:open={tableOfContentsOpen}
          label="Table of contents"
        >
          <nav aria-label="Document sections">Overview</nav>
        </AppShell.Body.Sidebar>
      </AppShell.Body>
    </AppShell.Main>
  </AppShell.Root>
</div>`;

export const IndependentIconRails = shellSource({
  controllerOptions: "{ leftCollapsed: true, rightCollapsed: true }",
});

export const SingleSidebarComposition = shellSource({
  rightSidebar: false,
});
