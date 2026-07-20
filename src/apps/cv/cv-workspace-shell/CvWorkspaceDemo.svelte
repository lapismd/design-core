<script lang="ts">
  import {
    AiChatPanel,
    type AiChatMessage,
    type AiChatPlacement,
    type AiChatVisibility,
  } from "@stevejuma/ui/ai";
  import {
    StudioSidebar,
    StudioWorkspaceShell,
    type SidebarTab,
    type StudioWorkspaceMode,
  } from "@stevejuma/ui/workspace-shell";
  import { cloneSampleCvSource } from "../fixture";
  import CvWorkspaceSidebar from "../sidebar/CvWorkspaceSidebar.svelte";
  import type { CvFileInfo, OptionalFileSection } from "../sidebar/types";
  import type { CvSource } from "../types";
  import CvWorkspaceBody from "./CvWorkspaceBody.svelte";

  let {
    showPreview = false,
  }: {
    showPreview?: boolean;
  } = $props();

  let sidebarOpen = $state(true);
  let sidebarCollapsed = $state(false);
  let sidebarTab = $state<SidebarTab>("workspace");
  let workspaceMode = $state<StudioWorkspaceMode>("cv");
  let value = $state<CvSource>(cloneSampleCvSource());
  let formTab = $state("cv");
  let yamlMode = $state(false);
  let collapseAll = $state(false);
  let selectedFileId = $state("cv-1");
  let fileSectionVisibility = $state<Record<OptionalFileSection, boolean>>({
    archive: true,
    trash: true,
  });
  let aiVisibility = $state<AiChatVisibility>("expanded");
  let aiPlacement = $state<AiChatPlacement>("right");
  let messages = $state<AiChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      text: "I can help refine your CV. Try asking to tighten the summary or reorder experience.",
    },
  ]);

  const cvFiles: CvFileInfo[] = [
    { id: "cv-1", name: "John Doe.yaml", bucket: "active" },
    { id: "cv-2", name: "Portfolio CV.yaml", bucket: "active" },
  ];
  const archivedFiles: CvFileInfo[] = [
    { id: "cv-3", name: "Old draft.yaml", bucket: "archive" },
  ];
  const trashedFiles: CvFileInfo[] = [];

  const selectedFile = $derived(
    [...cvFiles, ...archivedFiles, ...trashedFiles].find((f) => f.id === selectedFileId) ??
      null,
  );
  const activeProjectPath = "/Users/demo/Projects/portfolio";
  const collapsedTitle = $derived(
    activeProjectPath.split("/").filter(Boolean).at(-1) ?? selectedFile?.name ?? "Workspace",
  );

  function handleSend(text: string) {
    messages = [
      ...messages,
      { id: `u-${Date.now()}`, role: "user", text },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Stub reply — wire /api/ai in the consuming app.",
      },
    ];
  }
</script>

<StudioWorkspaceShell sidebarOpen={sidebarOpen && !sidebarCollapsed}>
  {#snippet sidebar()}
    <StudioSidebar
      bind:open={sidebarOpen}
      bind:collapsed={sidebarCollapsed}
      bind:tab={sidebarTab}
      bind:workspaceMode
      title="Studio"
      subtitle="CV"
      {collapsedTitle}
      {activeProjectPath}
      onSelectWorkspace={(mode) => {
        workspaceMode = mode;
      }}
      onOpenSettings={() => {}}
    >
      {#snippet projectsContent()}
        <p data-ui-component="cv-workspace-demo" data-ui-part="stub">
          Projects browser stub — wire in the consuming app.
        </p>
      {/snippet}
      {#snippet workspaceContent()}
        <CvWorkspaceSidebar
          {cvFiles}
          {archivedFiles}
          {trashedFiles}
          {selectedFileId}
          {fileSectionVisibility}
          onCreate={() => {}}
          onImport={() => {}}
          onSelectFile={(file) => {
            selectedFileId = file.id;
          }}
          onSetSectionVisible={(section, visible) => {
            fileSectionVisibility = { ...fileSectionVisibility, [section]: visible };
          }}
        />
      {/snippet}
      {#snippet searchContent()}
        <p data-ui-component="cv-workspace-demo" data-ui-part="stub">
          Global search stub — wire in the consuming app.
        </p>
      {/snippet}
    </StudioSidebar>
  {/snippet}

  {#snippet main()}
    <CvWorkspaceBody
      {sidebarOpen}
      bind:value
      bind:tab={formTab}
      bind:yamlMode
      {collapseAll}
      {showPreview}
      toolbarTitle={selectedFile?.name ?? "CV"}
      hasCollapsedSections={collapseAll}
      onToggleSidebar={() => {
        sidebarOpen = !sidebarOpen;
        if (sidebarOpen) sidebarCollapsed = false;
      }}
      onToggleAllSections={() => {
        collapseAll = !collapseAll;
      }}
    >
      {#snippet preview()}
        <div data-ui-component="cv-workspace-demo" data-ui-part="preview-stub">
          <p data-ui-part="preview-title">Preview placeholder</p>
          <p data-ui-part="preview-copy">Preview renderer stays in the consuming app.</p>
        </div>
      {/snippet}
    </CvWorkspaceBody>
  {/snippet}

  {#snippet ai()}
    <AiChatPanel
      {messages}
      bind:visibility={aiVisibility}
      bind:placement={aiPlacement}
      label="AI chat"
      onSend={handleSend}
    />
  {/snippet}
</StudioWorkspaceShell>

<style>
  :global([data-ui-component="cv-workspace-demo"][data-ui-part="stub"]) {
    padding-inline: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="cv-workspace-demo"][data-ui-part="preview-stub"]) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  :global([data-ui-component="cv-workspace-demo"] [data-ui-part="preview-title"]) {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
  }

  :global([data-ui-component="cv-workspace-demo"] [data-ui-part="preview-copy"]) {
    margin: 0;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
