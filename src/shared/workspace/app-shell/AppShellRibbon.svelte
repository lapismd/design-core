<script lang="ts">
  import WorkspaceRibbon from "../ribbon/WorkspaceRibbon.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

{#if controller.appearance.showRibbon}
  <WorkspaceRibbon controller={controller.renderer} />
{/if}
