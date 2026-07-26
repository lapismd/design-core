<script lang="ts">
  import { AppShell } from "../app-shell/index.js";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import "./ReusableFrameworkDemo.css";

  let {
    app,
    displayMode,
  }: {
    app: AppShellController;
    displayMode?: "desktop" | "mobile" | "auto";
  } = $props();
</script>

<div class="ui-workspace-framework-demo">
  <AppShell.Root controller={app} theme="inherit">
    <AppShell.Surface {displayMode} workspaceLabel="Framework demo" />
  </AppShell.Root>
</div>
