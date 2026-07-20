<script lang="ts">
  import type { Snippet } from "svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
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
    /** Consumer-owned controls rendered at the end of each active view header. */
    viewHeaderOptions?: Snippet<[WorkspaceTab]>;
  } = $props();

  let value = $state("");
  let dropIndex = $state<number | null>(null);
  let hoveredTabId = $state<string | null>(null);

  $effect(() => {
    value = group.activeTabId ?? "";
  });

  async function addTab() {
    const tab = await createTab?.(group.id);
    if (tab) controller.addTab(group.id, tab);
  }

  function beginDrag(event: DragEvent, tabId: string) {
    startWorkspaceTabDrag(event, { groupId: group.id, tabId });
  }

  function updateTabDrop(event: DragEvent, index: number) {
    if (!isWorkspaceTabDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    dropIndex = event.clientX < rect.left + rect.width / 2 ? index : index + 1;
  }

  function dropOnTabStrip(event: DragEvent) {
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

  function clearDropState() {
    dropIndex = null;
    hoveredTabId = null;
    clearWorkspaceTabDrag();
  }
</script>

<div data-ui-component="workspace" data-ui-part="tabs">
  {#if group.tabs.length > 0}
    <Tabs.Root bind:value data-workspace-tabs-root>
      <div data-ui-component="workspace" data-ui-part="tab-bar">
        <div
          data-ui-component="workspace"
          data-ui-part="tab-strip"
          role="presentation"
          onpointerleave={() => (hoveredTabId = null)}
          ondrop={dropOnTabStrip}
        >
          <Tabs.List
            variant="line"
            data-workspace-part="tab-list"
            ondragleave={(event) => {
              const list = event.currentTarget as HTMLElement;
              if (
                !(event.relatedTarget instanceof Node) ||
                !list.contains(event.relatedTarget)
              ) {
                dropIndex = null;
              }
            }}
          >
            {#each group.tabs as tab, index (tab.id)}
              {@const icon = controller.registry.resolve(tab.view.type)?.icon}
              <div
                data-ui-component="workspace"
                data-ui-part="tab"
                data-workspace-tab-id={tab.id}
                data-active={group.activeTabId === tab.id}
                data-drop-before={dropIndex === index}
                data-drop-after={dropIndex === index + 1 &&
                  index === group.tabs.length - 1}
                role="presentation"
                onpointerenter={() => (hoveredTabId = tab.id)}
                ondragover={(event) => updateTabDrop(event, index)}
              >
                <Tabs.Trigger
                  value={tab.id}
                  data-workspace-part="tab-trigger"
                  draggable="true"
                  ondragstart={(event) => beginDrag(event, tab.id)}
                  ondragend={clearDropState}
                  onclick={() => controller.selectTab(group.id, tab.id)}
                >
                  {#if icon}
                    {@const Icon = icon}
                    <span data-ui-component="workspace" data-ui-part="tab-icon">
                      <Icon data-icon="inline-start" />
                    </span>
                  {/if}
                  <span data-ui-component="workspace" data-ui-part="tab-title">
                    {tab.title}
                  </span>
                </Tabs.Trigger>
                {#if tab.closable !== false}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Close ${tab.title}`}
                    data-workspace-part="tab-close"
                    tabindex={group.activeTabId === tab.id ||
                    hoveredTabId === tab.id
                      ? 0
                      : -1}
                    onclick={(event) => {
                      event.stopPropagation();
                      controller.closeTab(group.id, tab.id);
                    }}
                  >
                    <XIcon data-icon="inline-start" />
                  </Button>
                {/if}
              </div>
            {/each}
          </Tabs.List>
        </div>
        {#if createTab}
          <div data-ui-component="workspace" data-ui-part="tab-new-action">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Add tab"
              onclick={addTab}
            >
              <PlusIcon data-icon="inline-start" />
            </Button>
          </div>
        {/if}
        <div data-ui-component="workspace" data-ui-part="tab-spacer"></div>
      </div>

      <WorkspaceTabDropZone {controller} {group}>
        {#each group.tabs as tab (tab.id)}
          {#if group.activeTabId === tab.id}
            <Tabs.Content value={tab.id} data-workspace-part="tab-content">
              <WorkspaceTabBody
                {controller}
                groupId={group.id}
                {tab}
                active={true}
                {viewHeaderOptions}
              />
            </Tabs.Content>
          {/if}
        {/each}
      </WorkspaceTabDropZone>
    </Tabs.Root>
  {:else}
    <WorkspaceTabDropZone {controller} {group}>
      <Empty.Root>
        <Empty.Header>
          <Empty.Title>No open tabs</Empty.Title>
          <Empty.Description>
            Add a tab or drag one here from another pane.
          </Empty.Description>
        </Empty.Header>
        {#if createTab}
          <Empty.Content>
            <Button type="button" onclick={addTab}>
              <PlusIcon data-icon="inline-start" />Add tab
            </Button>
          </Empty.Content>
        {/if}
      </Empty.Root>
    </WorkspaceTabDropZone>
  {/if}
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="tabs"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="tabs"]
    :global([data-workspace-tabs-root]) {
    display: flex;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="tab-strip"] {
    position: relative;
    display: flex;
    min-width: 0;
    height: 100%;
    flex: 0 1 auto;
    overflow: hidden;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--border));
  }

  [data-ui-component="workspace"][data-ui-part="tab-bar"] {
    display: flex;
    min-width: 0;
    height: var(--ui-workspace-tab-height, 40px);
    flex: 0 0 var(--ui-workspace-tab-height, 40px);
    align-items: stretch;
    overflow: hidden;
    background: var(--ui-workspace-tab-container-background, var(--muted));
  }

  [data-ui-component="workspace"][data-ui-part="tabs"]
    :global([data-workspace-part="tab-list"]) {
    display: flex;
    min-width: 0;
    height: 100%;
    max-width: 100%;
    flex: 0 1 auto;
    margin: 6px -5px -1px;
    overflow: auto hidden;
    border-radius: 0;
    background: transparent;
    padding: 1px 15px 0;
    scrollbar-width: none;
  }

  [data-ui-component="workspace"][data-ui-part="tabs"]
    :global([data-workspace-part="tab-list"]::-webkit-scrollbar) {
    display: none;
  }

  [data-ui-component="workspace"][data-ui-part="tab"] {
    position: relative;
    display: flex;
    width: var(--ui-workspace-tab-width, 12.5rem);
    min-width: 0;
    max-width: var(--ui-workspace-tab-max-width, 20rem);
    height: 100%;
    flex: 1 1 0;
    align-items: center;
    border-radius: var(--ui-workspace-tab-radius, 4px);
    color: var(--ui-workspace-tab-color, var(--muted-foreground));
    container-name: tab-header;
    container-type: inline-size;
    padding: 0.25rem 0.5rem;
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"] {
    z-index: 1;
    box-shadow: 0 0 0 1px var(--ui-workspace-divider, var(--border));
    color: var(--ui-workspace-tab-active-color, var(--foreground));
    background: var(--ui-workspace-tab-active-background, var(--background));
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]::before,
  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]::after {
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: calc(var(--ui-workspace-tab-curve, 6px) * 2);
    height: calc(var(--ui-workspace-tab-curve, 6px) * 2);
    border-radius: 100%;
    background: var(--ui-workspace-tab-container-background, var(--muted));
    content: "";
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]::before {
    left: calc(var(--ui-workspace-tab-curve, 6px) * -2);
    clip-path: inset(50% calc(var(--ui-workspace-tab-curve, 6px) * -1) 0 50%);
    box-shadow:
      inset 0 0 0 1px var(--ui-workspace-divider, var(--border)),
      0 0 0 calc(var(--ui-workspace-tab-curve, 6px) * 4)
        var(--ui-workspace-tab-active-background, var(--background));
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]::after {
    right: calc(var(--ui-workspace-tab-curve, 6px) * -2);
    clip-path: inset(50% 50% 0 calc(var(--ui-workspace-tab-curve, 6px) * -1));
    box-shadow:
      inset 0 0 0 1px var(--ui-workspace-divider, var(--border)),
      0 0 0 calc(var(--ui-workspace-tab-curve, 6px) * 4)
        var(--ui-workspace-tab-active-background, var(--background));
  }

  [data-ui-component="workspace"][data-ui-part="tab"]::before {
    position: absolute;
    inset-block: 0.375rem 0;
    inset-inline-start: 0;
    z-index: 2;
    width: 3px;
    border-radius: 999px;
    background: transparent;
    content: "";
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-drop-before="true"]::before,
  [data-ui-component="workspace"][data-ui-part="tab"][data-drop-after="true"]::after {
    background: var(--primary);
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-drop-after="true"]::after {
    position: absolute;
    inset-block: 0.375rem 0;
    inset-inline-end: 0;
    width: 2px;
    content: "";
  }

  [data-ui-component="workspace"][data-ui-part="tab"]
    :global([data-workspace-part="tab-trigger"]) {
    width: 100%;
    min-width: 0;
    height: 100%;
    justify-content: flex-start;
    border-radius: var(--ui-workspace-tab-radius, 4px);
    background: transparent;
    color: inherit;
    padding-block: 0;
    padding-inline: 0.375rem 1.75rem;
    text-align: left;
  }

  [data-ui-component="workspace"][data-ui-part="tab"]:not(
      [data-active="true"]
    ):hover
    :global([data-workspace-part="tab-trigger"]) {
    background: var(--ui-workspace-tab-hover, var(--accent));
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]
    :global([data-workspace-part="tab-trigger"]:hover) {
    background: transparent;
  }

  [data-ui-component="workspace"][data-ui-part="tab"]::after {
    position: absolute;
    inset-inline-end: -1px;
    width: 1px;
    height: 20px;
    background: var(--ui-workspace-tab-divider, var(--border));
    content: "";
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]::after {
    opacity: 0;
  }

  [data-ui-component="workspace"][data-ui-part="tab-title"] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-ui-component="workspace"][data-ui-part="tab-icon"] {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    margin-inline-end: 0.5rem;
    color: inherit;
  }

  [data-ui-component="workspace"][data-ui-part="tab"]
    :global([data-workspace-part="tab-close"]) {
    position: absolute;
    inset-inline-end: 0.5rem;
    z-index: 3;
    width: 1.5rem;
    height: 1.5rem;
    visibility: hidden;
    transition: none;
  }

  [data-ui-component="workspace"][data-ui-part="tab"][data-active="true"]
    :global([data-workspace-part="tab-close"]),
  [data-ui-component="workspace"][data-ui-part="tab"]:hover
    :global([data-workspace-part="tab-close"]),
  [data-ui-component="workspace"][data-ui-part="tab"]
    :global([data-workspace-part="tab-close"]:focus-visible) {
    visibility: visible;
  }

  [data-ui-component="workspace"][data-ui-part="tab-new-action"] {
    display: flex;
    height: 100%;
    flex: 0 0 auto;
    align-items: center;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--border));
    padding-inline: 0.25rem 0.5rem;
  }

  [data-ui-component="workspace"][data-ui-part="tab-spacer"] {
    min-width: 0;
    height: 100%;
    flex: 1 1 auto;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--border));
  }

  [data-ui-component="workspace"][data-ui-part="tabs"]
    :global([data-workspace-part="tab-content"]) {
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
</style>
