<script lang="ts">
  import type { WorkspaceNode, WorkspaceTab } from "../core/types.js";
  import WorkspaceTree from "../tree/WorkspaceTree.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import "./AppShellWorkspace.css";

  let {
    createTab,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const { controller, drag } = getAppShellContext();

  function leadingPaneId(node: WorkspaceNode): string | undefined {
    return node.kind === "tabs"
      ? node.id
      : node.children[0]
        ? leadingPaneId(node.children[0])
        : undefined;
  }

  function topRightPaneId(node: WorkspaceNode): string | undefined {
    if (node.kind === "tabs") return node.id;
    const child =
      node.direction === "horizontal" ? node.children.at(-1) : node.children[0];
    return child ? topRightPaneId(child) : undefined;
  }

  function bottomRightPaneId(node: WorkspaceNode): string | undefined {
    if (node.kind === "tabs") return node.id;
    const child = node.children.at(-1);
    return child ? bottomRightPaneId(child) : undefined;
  }

  let leftSidebarTogglePaneId = $derived(
    controller.renderer.layout.left.open
      ? undefined
      : leadingPaneId(controller.renderer.layout.main),
  );
  let rightSidebarTogglePaneId = $derived(
    controller.renderer.layout.right.open
      ? undefined
      : topRightPaneId(controller.renderer.layout.main),
  );
  let bottomPanelTogglePaneId = $derived(
    controller.renderer.layout.bottom.open
      ? undefined
      : bottomRightPaneId(controller.renderer.layout.main),
  );
</script>

<main
  class="ui-app-shell__workspace"
  data-ui-component="app-shell-workspace"
  data-ui-part="workspace"
  data-app-shell-workspace
>
  <WorkspaceTree
    controller={controller.renderer}
    node={controller.renderer.layout.main}
    hostId="root"
    {drag}
    {leftSidebarTogglePaneId}
    {rightSidebarTogglePaneId}
    {bottomPanelTogglePaneId}
    {createTab}
  />
</main>
