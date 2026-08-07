<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import WorkspaceBottomPanel from "../bottom-panel/WorkspaceBottomPanel.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let {
    createTab,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const { controller, drag } = getAppShellContext();
</script>

<WorkspaceBottomPanel controller={controller.renderer} {drag} {createTab} />
