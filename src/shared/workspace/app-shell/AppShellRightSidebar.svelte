<script lang="ts">
  import WorkspaceSidebar from "../sidebar/WorkspaceSidebar.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller, drag } = getAppShellContext();
  let hasBottomPanelItems = $derived(
    controller.renderer.layout.bottom.root.items.length > 0,
  );
</script>

<WorkspaceSidebar
  controller={controller.renderer}
  side="right"
  {drag}
  showBottomPanelToggle={hasBottomPanelItems}
/>
