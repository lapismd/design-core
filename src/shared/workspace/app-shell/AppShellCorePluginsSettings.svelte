<script lang="ts">
  import AppShellPluginsSettings from "../settings/AppShellPluginsSettings.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

<AppShellPluginsSettings app={controller} />
