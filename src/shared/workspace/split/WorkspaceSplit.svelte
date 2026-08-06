<script lang="ts">
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
  import { onMount, type Snippet } from "svelte";
  import type { WorkspaceNode, WorkspaceSplitNode } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import "./WorkspaceSplit.css";

  let {
    controller,
    split,
    children,
  }: {
    controller: WorkspaceShellController;
    split: WorkspaceSplitNode;
    children: Snippet<[node: WorkspaceNode, index: number]>;
  } = $props();

  let layoutReady = $state(false);

  onMount(() => {
    layoutReady = true;
  });

  function onLayoutChange(sizes: number[]) {
    if (!layoutReady) return;
    controller.setSplitSizes(split.id, sizes, true);
  }
</script>

<!-- Source shape: packages/workspace/src/lib/components/tabs/tabs-split.svelte -->
<div
  class="ui-workspace-split"
  data-ui-component="workspace-split"
  data-workspace-split-id={split.id}
  data-workspace-split-direction={split.direction}
>
  <Resizable.PaneGroup
    direction={split.direction}
    class="ui-workspace-split__group"
    data-ui-part="split-group"
    data-direction={split.direction}
    {onLayoutChange}
  >
    {#each split.children as child, index (child.id)}
      {#if index > 0}
        <Resizable.Handle
          class="ui-workspace-split__handle"
          data-ui-part="split-handle"
          data-direction={split.direction}
          aria-orientation={split.direction === "horizontal"
            ? "vertical"
            : "horizontal"}
        />
      {/if}
      <Resizable.Pane
        defaultSize={split.sizes[index] ?? 100 / split.children.length}
        minSize={10}
        class="ui-workspace-split__pane"
        data-ui-part="split-pane"
      >
        {@render children(child, index)}
      </Resizable.Pane>
    {/each}
  </Resizable.PaneGroup>
</div>
