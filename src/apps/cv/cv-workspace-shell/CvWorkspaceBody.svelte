<script lang="ts">
  import type { Snippet } from "svelte";
  import * as Resizable from "@stevejuma/ui/shadcn/resizable";
  import { cloneSampleCvSource } from "../fixture";
  import CvWorkspaceForm from "../cv-workspace-form/CvWorkspaceForm.svelte";
  import type { CvSource } from "../types";
  import CvEditorToolbar from "./CvEditorToolbar.svelte";

  let {
    sidebarOpen = false,
    value = $bindable(cloneSampleCvSource()),
    tab = $bindable("cv"),
    yamlMode = $bindable(false),
    collapseAll = false,
    showPreview = false,
    toolbarTitle = "CV",
    canUndo = false,
    canRedo = false,
    hasCollapsedSections = false,
    onToggleSidebar = () => {},
    onUndo = () => {},
    onRedo = () => {},
    onToggleAllSections = () => {},
    onChange,
    preview,
  }: {
    sidebarOpen?: boolean;
    value?: CvSource;
    tab?: string;
    yamlMode?: boolean;
    collapseAll?: boolean;
    showPreview?: boolean;
    toolbarTitle?: string;
    canUndo?: boolean;
    canRedo?: boolean;
    hasCollapsedSections?: boolean;
    onToggleSidebar?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onToggleAllSections?: () => void;
    onChange?: (value: CvSource) => void;
    preview?: Snippet;
  } = $props();
</script>

<div data-ui-component="cv-workspace-body" data-ui-part="root">
  <CvEditorToolbar
    {sidebarOpen}
    {canUndo}
    {canRedo}
    {hasCollapsedSections}
    bind:yamlMode
    title={toolbarTitle}
    {onToggleSidebar}
    {onUndo}
    {onRedo}
    {onToggleAllSections}
  />

  {#if showPreview}
    <Resizable.PaneGroup direction="horizontal" data-ui-part="split">
      <Resizable.Pane defaultSize={55} minSize={30} data-ui-part="pane">
        <div data-ui-part="form-scroll">
          <CvWorkspaceForm bind:value bind:tab bind:yamlMode {collapseAll} {onChange} />
        </div>
      </Resizable.Pane>
      <Resizable.Handle withHandle />
      <Resizable.Pane defaultSize={45} minSize={20} data-ui-part="pane">
        <div data-ui-part="preview">
          {#if preview}
            {@render preview()}
          {:else}
            Preview placeholder
          {/if}
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  {:else}
    <div data-ui-part="form-scroll">
      <CvWorkspaceForm bind:value bind:tab bind:yamlMode {collapseAll} {onChange} />
    </div>
  {/if}
</div>

<style>
  :global([data-ui-component="cv-workspace-body"][data-ui-part="root"]) {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    overflow: hidden;
  }

  :global([data-ui-component="cv-workspace-body"] [data-ui-part="split"]) {
    min-height: 0;
    flex: 1 1 auto;
  }

  :global([data-ui-component="cv-workspace-body"] [data-ui-part="pane"]) {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  :global([data-ui-component="cv-workspace-body"] [data-ui-part="form-scroll"]) {
    min-height: 0;
    flex: 1 1 auto;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0.75rem;
  }

  :global([data-ui-component="cv-workspace-body"] [data-ui-part="preview"]) {
    display: flex;
    height: 100%;
    min-height: 0;
    align-items: center;
    justify-content: center;
    border-left: 1px solid var(--border);
    background: color-mix(in oklab, var(--muted) 30%, transparent);
    padding: 1.5rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
