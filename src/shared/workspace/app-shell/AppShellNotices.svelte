<script lang="ts">
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import AppShellNoticeToasts from "./AppShellNoticeToasts.svelte";

  const { controller } = getAppShellContext();
</script>

<AppShellNoticeToasts app={controller} />
