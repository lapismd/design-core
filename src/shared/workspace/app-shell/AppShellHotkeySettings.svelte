<script lang="ts">
  import AppShellHotkeySettings from "../settings/AppShellHotkeySettings.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

<AppShellHotkeySettings app={controller} />
