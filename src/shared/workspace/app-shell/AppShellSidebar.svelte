<script lang="ts">
  import type { WorkspaceSide } from "../core/types.js";
  import WorkspaceSidebar from "../sidebar/WorkspaceSidebar.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let { side }: { side: WorkspaceSide } = $props();
  const { controller, drag } = getAppShellContext();
</script>

<WorkspaceSidebar controller={controller.renderer} {side} {drag} />
