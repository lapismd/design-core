<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import * as Resizable from "@stevejuma/ui/shadcn/resizable";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type {
    WorkspaceNode,
    WorkspaceTab,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import WorkspaceTabs from "./WorkspaceTabs.svelte";
  import WorkspaceStackedTabs from "./WorkspaceStackedTabs.svelte";
  import WorkspaceSplitDropZone from "./WorkspaceSplitDropZone.svelte";
  import WorkspaceSplit from "./WorkspaceSplit.svelte";

  let {
    controller,
    node,
    createTab,
    viewHeaderOptions,
  }: {
    controller: WorkspaceController;
    node: WorkspaceNode;
    createTab?: (
      groupId: string,
    ) => WorkspaceTab | null | Promise<WorkspaceTab | null>;
    viewHeaderOptions?: Snippet<[WorkspaceTab]>;
  } = $props();

  let ready = $state(false);

  onMount(() => {
    ready = true;
  });

  function updateSizes(sizes: number[]) {
    if (ready && node.kind === "split")
      controller.setSplitSizes(node.id, sizes);
  }
</script>

{#if node.kind === "split"}
  {#if node.children.length === 0}
    <WorkspaceSplitDropZone {controller} split={node}>
      <div data-ui-component="workspace" data-ui-part="split-empty-state">
        <h2>Empty split</h2>
        <p>Drag a tab here to restore this pane.</p>
      </div>
    </WorkspaceSplitDropZone>
  {:else}
    <Resizable.PaneGroup
      direction={node.direction}
      onLayoutChange={updateSizes}
    >
      {#each node.children as child, index (child.id)}
        {#if index > 0}
          <Resizable.Handle withHandle />
        {/if}
        <Resizable.Pane
          defaultSize={node.sizes[index] ?? 100 / node.children.length}
        >
          <div data-ui-component="workspace" data-ui-part="split-pane">
            <WorkspaceSplit
              {controller}
              node={child}
              {createTab}
              {viewHeaderOptions}
            />
          </div>
        </Resizable.Pane>
      {/each}
    </Resizable.PaneGroup>
  {/if}
{:else if node.presentation === "stacked"}
  <WorkspaceStackedTabs
    {controller}
    group={node as WorkspaceTabsNode}
    {createTab}
    {viewHeaderOptions}
  />
{:else}
  <WorkspaceTabs
    {controller}
    group={node as WorkspaceTabsNode}
    {createTab}
    {viewHeaderOptions}
  />
{/if}

<style>
  [data-ui-component="workspace"][data-ui-part="split-pane"] {
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="split-empty-state"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--background);
    color: var(--muted-foreground);
    text-align: center;
  }

  [data-ui-component="workspace"][data-ui-part="split-empty-state"] h2,
  [data-ui-component="workspace"][data-ui-part="split-empty-state"] p {
    margin: 0;
  }

  [data-ui-component="workspace"][data-ui-part="split-empty-state"] h2 {
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 600;
  }

  [data-ui-component="workspace"][data-ui-part="split-empty-state"] p {
    font-size: 0.8125rem;
  }
</style>
