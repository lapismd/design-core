<script lang="ts">
  import type { Snippet } from "svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type { WorkspaceTab, WorkspaceTabsNode } from "../core/types.js";
  import {
    clearWorkspaceTabDrag,
    isWorkspaceTabDrag,
    readWorkspaceTabDrag,
    startWorkspaceTabDrag,
  } from "./tab-drag.js";
  import WorkspaceTabDropZone from "./WorkspaceTabDropZone.svelte";
  import WorkspaceTabBody from "./WorkspaceTabBody.svelte";

  let {
    controller,
    group,
    createTab,
    viewHeaderOptions,
  }: {
    controller: WorkspaceController;
    group: WorkspaceTabsNode;
    createTab?: (
      groupId: string,
    ) => WorkspaceTab | null | Promise<WorkspaceTab | null>;
    viewHeaderOptions?: Snippet<[WorkspaceTab]>;
  } = $props();

  let dropIndex = $state<number | null>(null);

  async function addTab() {
    const tab = await createTab?.(group.id);
    if (tab) controller.addTab(group.id, tab);
  }

  function selectRelative(event: KeyboardEvent, index: number) {
    let target = index;
    if (event.key === "ArrowLeft") target = Math.max(0, index - 1);
    else if (event.key === "ArrowRight") {
      target = Math.min(group.tabs.length - 1, index + 1);
    } else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = group.tabs.length - 1;
    else return;
    event.preventDefault();
    controller.selectTab(
      group.id,
      group.tabs[target]?.id ?? group.tabs[index].id,
    );
  }

  function updateDrop(event: DragEvent, index: number) {
    if (!isWorkspaceTabDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    dropIndex = event.clientX < rect.left + rect.width / 2 ? index : index + 1;
  }

  function performDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const payload = readWorkspaceTabDrag(event);
    const targetIndex = dropIndex;
    dropIndex = null;
    clearWorkspaceTabDrag();
    if (payload && targetIndex !== null) {
      const sourceIndex = group.tabs.findIndex(
        (tab) => tab.id === payload.tabId,
      );
      const finalIndex =
        payload.groupId === group.id &&
        sourceIndex >= 0 &&
        targetIndex > sourceIndex
          ? targetIndex - 1
          : targetIndex;
      controller.moveTab(payload.tabId, group.id, finalIndex);
    }
  }
</script>

<div data-ui-component="workspace" data-ui-part="stacked-tabs">
  <div data-ui-component="workspace" data-ui-part="stacked-toolbar">
    {#if createTab}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Add tab"
        onclick={addTab}
      >
        <PlusIcon data-icon="inline-start" />
      </Button>
    {/if}
    <div
      data-ui-component="workspace"
      data-ui-part="stacked-toolbar-spacer"
    ></div>
  </div>

  <div
    data-ui-component="workspace"
    data-ui-part="stacked-strip"
    role="group"
    aria-label="Stacked workspace tabs"
    ondrop={performDrop}
    ondragleave={() => (dropIndex = null)}
  >
    {#each group.tabs as tab, index (tab.id)}
      {@const active = group.activeTabId === tab.id}
      <section
        data-ui-component="workspace"
        data-ui-part="stacked-panel"
        data-active={active}
        data-drop-before={dropIndex === index}
        data-drop-after={dropIndex === index + 1 &&
          index === group.tabs.length - 1}
        role="presentation"
        ondragover={(event) => updateDrop(event, index)}
      >
        <button
          type="button"
          aria-pressed={active}
          aria-controls={active
            ? `workspace-stacked-panel-${group.id}-${tab.id}`
            : undefined}
          tabindex={active ? 0 : -1}
          draggable="true"
          data-workspace-part="stacked-tab-trigger"
          ondragstart={(event) =>
            startWorkspaceTabDrag(event, { groupId: group.id, tabId: tab.id })}
          ondragend={() => {
            dropIndex = null;
            clearWorkspaceTabDrag();
          }}
          onclick={() => controller.selectTab(group.id, tab.id)}
          onkeydown={(event) => selectRelative(event, index)}
        >
          <span>{tab.title}</span>
        </button>
        {#if tab.closable !== false}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Close ${tab.title}`}
            data-workspace-part="stacked-tab-close"
            onclick={() => controller.closeTab(group.id, tab.id)}
          >
            <XIcon data-icon="inline-start" />
          </Button>
        {/if}

        {#if active}
          <div
            id={`workspace-stacked-panel-${group.id}-${tab.id}`}
            data-ui-component="workspace"
            data-ui-part="stacked-view"
            role="region"
            aria-label={`${tab.title} view`}
          >
            <WorkspaceTabDropZone {controller} {group}>
              <WorkspaceTabBody
                {controller}
                groupId={group.id}
                {tab}
                active={true}
                {viewHeaderOptions}
              />
            </WorkspaceTabDropZone>
          </div>
        {/if}
      </section>
    {/each}
  </div>
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="stacked-tabs"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="stacked-toolbar"] {
    display: flex;
    min-width: 0;
    height: var(--ui-workspace-tab-height, 2.5rem);
    flex: 0 0 var(--ui-workspace-tab-height, 2.5rem);
    align-items: center;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--border));
    background: var(--ui-workspace-tab-container-background, var(--muted));
    padding-inline: 0.375rem;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-toolbar-spacer"] {
    min-width: 0;
    height: 100%;
    flex: 1 1 auto;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-strip"] {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"] {
    position: relative;
    display: flex;
    width: var(--ui-workspace-stacked-tab-width, 2.5rem);
    min-width: var(--ui-workspace-stacked-tab-width, 2.5rem);
    min-height: 0;
    flex: 0 0 var(--ui-workspace-stacked-tab-width, 2.5rem);
    overflow: hidden;
    border-inline-start: 1px solid var(--ui-workspace-divider, var(--border));
    background: var(--ui-workspace-tab-container-background, var(--muted));
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]:first-child {
    border-inline-start: 0;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"][data-active="true"] {
    min-width: var(--ui-workspace-stacked-min-pane-width, 12rem);
    flex: 1 1 auto;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"][data-drop-before="true"] {
    border-inline-start: 2px solid var(--primary);
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"][data-drop-after="true"] {
    border-inline-end: 2px solid var(--primary);
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-trigger"]) {
    display: flex;
    width: var(--ui-workspace-stacked-tab-width, 2.5rem);
    min-width: var(--ui-workspace-stacked-tab-width, 2.5rem);
    height: 100%;
    align-items: center;
    justify-content: flex-start;
    border: 0;
    background: transparent;
    padding-block: 0.625rem 2.25rem;
    color: var(--muted-foreground);
    cursor: pointer;
    writing-mode: vertical-rl;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-trigger"]:hover) {
    background: var(--ui-workspace-tab-hover, var(--accent));
    color: var(--foreground);
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-trigger"]:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-trigger"] span) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-close"]) {
    position: absolute;
    inset-block-end: 0.375rem;
    inset-inline-start: 0.5rem;
    z-index: 1;
    width: 1.5rem;
    height: 1.5rem;
    opacity: 0;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-panel"][data-active="true"]
    :global([data-workspace-part="stacked-tab-close"]),
  [data-ui-component="workspace"][data-ui-part="stacked-panel"]:hover
    :global([data-workspace-part="stacked-tab-close"]),
  [data-ui-component="workspace"][data-ui-part="stacked-panel"]
    :global([data-workspace-part="stacked-tab-close"]:focus-visible) {
    opacity: 1;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-view"] {
    position: relative;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="stacked-view"]
    :global([data-ui-part="tab-drop-zone"]) {
    width: 100%;
    height: 100%;
  }
</style>
