<script lang="ts">
  import WorkspaceCommandPalette from "../command-palette/WorkspaceCommandPalette.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let {
    placeholder = "Type a command or search...",
  }: {
    placeholder?: string;
  } = $props();
  const { controller } = getAppShellContext();
</script>

<WorkspaceCommandPalette app={controller} {placeholder} />
