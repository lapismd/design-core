<script lang="ts">
  import type {
    WorkspaceImperativeViewDefinition,
    WorkspaceViewContext,
  } from "../core/types.js";
  import "./WorkspaceViewHost.css";

  let {
    definition,
    context,
  }: {
    definition: WorkspaceImperativeViewDefinition;
    context: WorkspaceViewContext;
  } = $props();

  let target: HTMLDivElement;

  $effect(() => {
    const cleanup = definition.mount(target, context);
    return () => cleanup?.();
  });
</script>

<div
  bind:this={target}
  class="ui-workspace-imperative-view"
  data-ui-component="workspace-imperative-view"
></div>
