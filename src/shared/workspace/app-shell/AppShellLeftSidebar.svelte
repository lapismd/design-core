<script lang="ts">
  import WorkspaceSidebar from "../sidebar/WorkspaceSidebar.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller, drag } = getAppShellContext();
</script>

<WorkspaceSidebar controller={controller.renderer} side="left" {drag} />
