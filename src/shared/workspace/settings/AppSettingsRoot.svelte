<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import { setAppSettingsContext } from "./app-settings-context.svelte.js";
  import "./WorkspaceSettings.css";

  let {
    controller,
    app,
    children,
    class: className = "",
  }: {
    controller: WorkspaceSettingsController;
    app?: AppShellController;
    children?: Snippet;
    class?: string;
  } = $props();

  const rootController = untrack(() => controller);
  const rootApp = untrack(() => app);
  setAppSettingsContext(rootController, rootApp);

  $effect(() => {
    if (!controller.ready) void controller.load();
  });
</script>

<div
  class={`ui-workspace-settings ${className}`}
  data-ui-component="workspace-settings"
  data-ui-part="root"
  data-app-settings-root
>
  {@render children?.()}
</div>
