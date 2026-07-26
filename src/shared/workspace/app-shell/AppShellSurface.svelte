<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
  import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
  import AppShellRibbon from "./AppShellRibbon.svelte";
  import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
  import AppShellStatusBar from "./AppShellStatusBar.svelte";
  import AppShellWorkspace from "./AppShellWorkspace.svelte";

  let {
    createTab,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();
</script>

<AppShellRibbon />
<AppShellLeftSidebar />
<AppShellWorkspace {createTab} />
<AppShellRightSidebar />
<AppShellFloatingLayer {createTab} />
<AppShellStatusBar />
