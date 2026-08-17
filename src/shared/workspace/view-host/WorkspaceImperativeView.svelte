<script lang="ts">
  import { untrack } from "svelte";
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

  let remountKey = $derived(`${context.tab.id}:${definition.type}`);

  function mountView(key: string) {
    return (element: HTMLDivElement) => {
      void key;
      const cleanup = untrack(() => definition.mount(element, context));
      return () => cleanup?.();
    };
  }
</script>

<div
  class="ui-workspace-imperative-view"
  data-ui-component="workspace-imperative-view"
  {@attach mountView(remountKey)}
></div>
