<script lang="ts">
  import WorkspaceStatusBar from "../status-bar/WorkspaceStatusBar.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

<WorkspaceStatusBar controller={controller.renderer} />
