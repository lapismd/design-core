<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type { WorkspaceTab } from "../core/types.js";
  import WorkspaceViewFrame from "./WorkspaceViewFrame.svelte";
  import WorkspaceViewHost from "./WorkspaceViewHost.svelte";

  let {
    controller,
    groupId,
    tab,
    active = true,
    viewHeaderOptions,
  }: {
    controller: WorkspaceController;
    groupId: string;
    tab: WorkspaceTab;
    active?: boolean;
    /** Consumer-owned controls rendered at the end of the view header. */
    viewHeaderOptions?: Snippet<[WorkspaceTab]>;
  } = $props();

  const definition = $derived(controller.registry.resolve(tab.view.type));
</script>

{#if definition?.showHeader === false}
  <WorkspaceViewHost {controller} {groupId} {tab} {active} />
{:else}
  <WorkspaceViewFrame title={tab.title}>
    {#snippet options()}
      {@render viewHeaderOptions?.(tab)}
    {/snippet}
    <WorkspaceViewHost {controller} {groupId} {tab} {active} />
  </WorkspaceViewFrame>
{/if}
