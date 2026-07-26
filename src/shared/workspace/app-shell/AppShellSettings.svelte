<script lang="ts">
  import WorkspaceSettingsSurface from "../settings/WorkspaceSettingsSurface.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

<WorkspaceSettingsSurface controller={controller.settings} app={controller} />
