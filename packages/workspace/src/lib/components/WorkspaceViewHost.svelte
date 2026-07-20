<script lang="ts">
  import { onDestroy } from "svelte";
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type { WorkspaceViewContext, WorkspaceTab } from "../core/types.js";

  let {
    controller,
    groupId,
    tab,
    active,
  }: {
    controller: WorkspaceController;
    groupId: string;
    tab: WorkspaceTab;
    active: boolean;
  } = $props();

  let target = $state<HTMLElement | null>(null);
  let mountedKey = "";
  let cleanup: (() => void) | undefined;

  const definition = $derived(controller.registry.resolve(tab.view.type));
  const context = $derived<WorkspaceViewContext>({
    tab,
    active,
    setState: (state) => controller.updateViewState(tab.id, state),
    close: () => controller.closeTab(groupId, tab.id),
  });

  function dispose() {
    cleanup?.();
    cleanup = undefined;
    mountedKey = "";
  }

  $effect(() => {
    if (!target || !definition || definition.kind !== "imperative") {
      dispose();
      return;
    }
    const key = `${tab.id}:${definition.type}`;
    if (mountedKey === key) return;
    dispose();
    cleanup = definition.mount(target, context) ?? undefined;
    mountedKey = key;
  });

  onDestroy(dispose);
</script>

<div
  data-ui-component="workspace"
  data-ui-part="view-host"
  data-active={active ? "true" : "false"}
>
  {#if definition?.kind === "svelte"}
    {@const View = definition.component}
    <View {...context} />
  {:else if definition?.kind === "imperative"}
    <div
      bind:this={target}
      data-ui-component="workspace"
      data-ui-part="imperative-view"
    ></div>
  {:else}
    <Empty.Root>
      <Empty.Header>
        <Empty.Title>View unavailable</Empty.Title>
        <Empty.Description
          >No renderer is registered for “{tab.view.type}”.</Empty.Description
        >
      </Empty.Header>
    </Empty.Root>
  {/if}
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="view-host"],
  [data-ui-component="workspace"][data-ui-part="imperative-view"] {
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }
</style>
