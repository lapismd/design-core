<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import type { CvFileInfo, OptionalFileSection } from "./types.js";

  let {
    cvFiles = [],
    archivedFiles = [],
    trashedFiles = [],
    selectedFileId = null,
    fileSectionVisibility = { archive: true, trash: true },
    creatingCv = false,
    importingCv = false,
    importDragging = false,
    fileActionError = null,
    onCreate = () => {},
    onImport = () => {},
    onSelectFile = () => {},
    onSetSectionVisible = () => {},
    onImportDragOver = () => {},
    onImportDragLeave = () => {},
    onImportDrop = () => {},
  }: {
    cvFiles?: CvFileInfo[];
    archivedFiles?: CvFileInfo[];
    trashedFiles?: CvFileInfo[];
    selectedFileId?: string | null;
    fileSectionVisibility?: Record<OptionalFileSection, boolean>;
    creatingCv?: boolean;
    importingCv?: boolean;
    importDragging?: boolean;
    fileActionError?: string | null;
    onCreate?: () => void;
    onImport?: () => void;
    onSelectFile?: (file: CvFileInfo) => void;
    onSetSectionVisible?: (section: OptionalFileSection, visible: boolean) => void;
    onImportDragOver?: (event: DragEvent) => void;
    onImportDragLeave?: () => void;
    onImportDrop?: (event: DragEvent) => void;
  } = $props();
</script>

<div data-ui-component="cv-workspace-sidebar" data-ui-part="root">
  <div data-ui-component="cv-workspace-sidebar" data-ui-part="actions">
    <!-- Do not set data-ui-component on Button — it overrides button chrome styles. -->
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-ui-part="create-button"
      disabled={creatingCv}
      onclick={onCreate}
    >
      {#if creatingCv}
        <Spinner data-icon="inline-start" />
      {:else}
        <PlusIcon data-icon="inline-start" />
      {/if}
      Create new CV
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-ui-part="import-button"
      data-dragging={importDragging ? "true" : "false"}
      aria-label="Import RenderCV YAML"
      disabled={importingCv}
      ondragover={onImportDragOver}
      ondragleave={onImportDragLeave}
      ondrop={onImportDrop}
      onclick={onImport}
    >
      {#if importingCv}
        <Spinner data-icon="inline-start" />
      {:else}
        <UploadIcon data-icon="inline-start" />
      {/if}
      <span data-ui-part="import-copy">
        <span>Import RenderCV YAML</span>
        <span data-ui-part="import-hint">Drag and drop is supported</span>
      </span>
    </Button>
    {#if fileActionError}
      <p data-ui-part="error">{fileActionError}</p>
    {/if}
  </div>

  <div data-ui-part="scroll">
    <ScrollArea>
      <div data-ui-part="sections">
        <section data-ui-part="section">
          <p data-ui-part="section-title">Active</p>
          {#if cvFiles.length === 0}
            <p data-ui-part="empty">No CV files yet.</p>
          {:else}
            {#each cvFiles as file (file.id)}
              <button
                type="button"
                data-ui-part="file"
                data-selected={selectedFileId === file.id ? "true" : "false"}
                onclick={() => onSelectFile(file)}
              >
                <FileTextIcon />
                <span>{file.name}</span>
              </button>
            {/each}
          {/if}
        </section>

        {#if fileSectionVisibility.archive}
          <section data-ui-part="section">
            <div data-ui-part="section-header">
              <p data-ui-part="section-title">Archive</p>
              <button
                type="button"
                data-ui-part="hide"
                onclick={() => onSetSectionVisible("archive", false)}
              >
                Hide
              </button>
            </div>
            {#if archivedFiles.length === 0}
              <p data-ui-part="empty">No archive files.</p>
            {:else}
              {#each archivedFiles as file (file.id)}
                <button
                  type="button"
                  data-ui-part="file"
                  data-selected={selectedFileId === file.id ? "true" : "false"}
                  onclick={() => onSelectFile(file)}
                >
                  <FileTextIcon />
                  <span>{file.name}</span>
                </button>
              {/each}
            {/if}
          </section>
        {/if}

        {#if fileSectionVisibility.trash}
          <section data-ui-part="section">
            <div data-ui-part="section-header">
              <p data-ui-part="section-title">Trash</p>
              <button
                type="button"
                data-ui-part="hide"
                onclick={() => onSetSectionVisible("trash", false)}
              >
                Hide
              </button>
            </div>
            {#if trashedFiles.length === 0}
              <p data-ui-part="empty">No trash files.</p>
            {:else}
              {#each trashedFiles as file (file.id)}
                <button
                  type="button"
                  data-ui-part="file"
                  data-selected={selectedFileId === file.id ? "true" : "false"}
                  onclick={() => onSelectFile(file)}
                >
                  <FileTextIcon />
                  <span>{file.name}</span>
                </button>
              {/each}
            {/if}
          </section>
        {/if}
      </div>
    </ScrollArea>
  </div>
</div>

<style>
  :global([data-ui-component="cv-workspace-sidebar"][data-ui-part="root"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-ui-component="cv-workspace-sidebar"][data-ui-part="actions"]) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="create-button"]) {
    height: 2.5rem;
    width: 100%;
    justify-content: flex-start;
    border: 1px solid transparent;
    background: var(--sidebar);
    padding-inline: 0.75rem;
    color: var(--sidebar-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="create-button"]:hover) {
    border-color: var(--sidebar-accent-foreground);
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-button"]) {
    height: 3rem;
    width: 100%;
    justify-content: flex-start;
    border: 3px dashed var(--border);
    padding: 0.25rem 0.75rem;
    text-align: left;
    white-space: normal;
    color: var(--sidebar-foreground);
  }

  :global(
    [data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-button"][data-dragging="true"]
  ),
  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-button"]:hover) {
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-copy"]) {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    line-height: 1.25;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-hint"]) {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="create-button"] svg),
  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="import-button"] svg) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="error"]) {
    font-size: 0.75rem;
    color: var(--destructive);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="scroll"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :global(
    [data-ui-component="cv-workspace-sidebar"] [data-ui-part="scroll"] > [data-ui-component="scroll-area"]
  ) {
    min-height: 0;
    flex: 1 1 auto;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="sections"]) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 0.5rem;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="section"]) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="section-header"]) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 0.25rem;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="section-title"]) {
    padding-inline: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="hide"]) {
    border: 0;
    background: transparent;
    font-size: 10px;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="hide"]:hover) {
    color: var(--foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="empty"]) {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="file"]) {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    background: transparent;
    padding: 0.375rem 0.5rem;
    text-align: left;
    font-size: 0.875rem;
    color: inherit;
    cursor: pointer;
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="file"]:hover) {
    background: var(--sidebar-accent);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="file"][data-selected="true"]) {
    border-color: var(--sidebar-border);
    background: var(--background);
    color: var(--sidebar-accent-foreground);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="file"] svg) {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="cv-workspace-sidebar"] [data-ui-part="file"] span) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
