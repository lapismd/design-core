<script lang="ts">
  import ChevronsDownUpIcon from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
  import Redo2Icon from "@lucide/svelte/icons/redo-2";
  import Undo2Icon from "@lucide/svelte/icons/undo-2";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Label } from "@stevejuma/ui/shadcn/label";
  import { Switch } from "@stevejuma/ui/shadcn/switch";
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";

  let {
    sidebarOpen = false,
    canUndo = false,
    canRedo = false,
    collapseAllLabel = "Collapse all sections",
    hasCollapseTarget = true,
    hasCollapsedSections = false,
    yamlMode = $bindable(false),
    title = "CV",
    onToggleSidebar = () => {},
    onUndo = () => {},
    onRedo = () => {},
    onToggleAllSections = () => {},
    onToggleYamlMode = () => {},
  }: {
    sidebarOpen?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    collapseAllLabel?: string;
    hasCollapseTarget?: boolean;
    hasCollapsedSections?: boolean;
    yamlMode?: boolean;
    title?: string;
    onToggleSidebar?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onToggleAllSections?: () => void;
    onToggleYamlMode?: (checked: boolean) => void;
  } = $props();
</script>

<header data-ui-component="cv-editor-toolbar" data-ui-part="root">
  <div data-ui-part="cluster">
    <Sidebar.Trigger
      aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      onclick={onToggleSidebar}
      data-ui-part="sidebar-trigger"
    >
      <PanelLeftIcon />
    </Sidebar.Trigger>
    <div data-ui-part="history">
      <Button
        variant="ghost"
        size="icon-sm"
        data-ui-part="history-button"
        aria-label="Undo"
        disabled={!canUndo}
        onclick={onUndo}
      >
        <Undo2Icon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        data-ui-part="history-button"
        data-border="start"
        aria-label="Redo"
        disabled={!canRedo}
        onclick={onRedo}
      >
        <Redo2Icon />
      </Button>
    </div>
    <Button
      variant="outline"
      size="icon-sm"
      data-ui-part="icon-button"
      aria-label={collapseAllLabel}
      disabled={!hasCollapseTarget}
      onclick={onToggleAllSections}
    >
      {#if hasCollapsedSections}
        <ChevronsUpDownIcon />
      {:else}
        <ChevronsDownUpIcon />
      {/if}
    </Button>
  </div>

  <p data-ui-part="title">{title}</p>

  <div data-ui-part="cluster">
    <Label for="cv-workspace-yaml-toggle" data-ui-part="yaml-label">YAML</Label>
    <Switch
      id="cv-workspace-yaml-toggle"
      checked={yamlMode}
      onCheckedChange={(checked) => {
        yamlMode = checked;
        onToggleYamlMode(checked);
      }}
    />
  </div>
</header>

<style>
  :global([data-ui-component="cv-editor-toolbar"][data-ui-part="root"]) {
    display: flex;
    height: var(--ui-workspace-toolbar-height, 3rem);
    flex-shrink: 0;
    align-items: center;
    gap: 0.75rem;
    overflow-x: auto;
    padding-inline: 0.75rem;
    scrollbar-width: none;
  }

  :global(
      [data-ui-component="cv-editor-toolbar"][data-ui-part="root"]::-webkit-scrollbar
    ) {
    display: none;
  }

  :global([data-ui-component="cv-editor-toolbar"] [data-ui-part="cluster"]) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
  }

  :global(
      [data-ui-component="cv-editor-toolbar"] [data-ui-part="sidebar-trigger"]
    ) {
    margin-left: -0.25rem;
  }

  :global([data-ui-component="cv-editor-toolbar"] [data-ui-part="history"]) {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  :global(
      [data-ui-component="cv-editor-toolbar"] [data-ui-part="history-button"]
    ) {
    border-radius: 0;
  }

  :global(
      [data-ui-component="cv-editor-toolbar"]
        [data-ui-part="history-button"][data-border="start"]
    ) {
    border-left: 1px solid var(--border);
  }

  :global(
      [data-ui-component="cv-editor-toolbar"] [data-ui-part="icon-button"] svg
    ),
  :global(
      [data-ui-component="cv-editor-toolbar"]
        [data-ui-part="history-button"]
        svg
    ),
  :global(
      [data-ui-component="cv-editor-toolbar"]
        [data-ui-part="sidebar-trigger"]
        svg
    ) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-ui-component="cv-editor-toolbar"] [data-ui-part="title"]) {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
  }

  :global([data-ui-component="cv-editor-toolbar"] [data-ui-part="yaml-label"]) {
    font-size: 0.875rem;
    font-weight: 600;
  }
</style>
