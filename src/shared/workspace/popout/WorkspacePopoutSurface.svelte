<script lang="ts">
  import type {
    WorkspaceTab,
    WorkspaceTheme,
    WorkspaceWindow,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTree from "../tree/WorkspaceTree.svelte";
  import { setContext } from "svelte";
  import { disableOverlayPortalContextKey } from "../../../lib/overlay-portal-context.js";
  import type { ScrollAreaVisibility } from "../../shadcn/scroll-area/index.js";
  import "./WorkspacePopoutSurface.css";

  let {
    controller,
    window: workspaceWindow,
    drag,
    createTab,
    theme = "inherit",
    scrollbarVisibility = "scroll",
  }: {
    controller: WorkspaceShellController;
    window: WorkspaceWindow;
    drag: WorkspaceDragState;
    createTab?: (paneId: string) => WorkspaceTab;
    theme?: WorkspaceTheme;
    scrollbarVisibility?: ScrollAreaVisibility;
  } = $props();

  setContext(disableOverlayPortalContextKey, true);
</script>

<div
  class:dark={theme === "dark"}
  class="ui-workspace-popout-surface"
  data-ui-component="workspace-popout-surface"
  data-ui-part="root"
  data-workspace-popout-id={workspaceWindow.id}
  data-workspace-theme={theme}
  data-ui-scrollbar-visibility={scrollbarVisibility}
>
  <WorkspaceTree
    {controller}
    node={workspaceWindow.root}
    hostId={workspaceWindow.id}
    {drag}
    {createTab}
  />
</div>
