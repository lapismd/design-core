<script lang="ts">
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import AppSettingsContent from "./AppSettingsContent.svelte";
  import AppSettingsNavigation from "./AppSettingsNavigation.svelte";
  import AppSettingsRoot from "./AppSettingsRoot.svelte";
  import AppSettingsSearch from "./AppSettingsSearch.svelte";

  let {
    controller,
    app,
  }: {
    controller: WorkspaceSettingsController;
    app?: AppShellController;
  } = $props();
</script>

<AppSettingsRoot {controller} {app}>
  <aside
    class="ui-workspace-settings__sidebar"
    data-ui-part="settings-sidebar"
    aria-label="Settings navigation"
  >
    <AppSettingsSearch />
    <AppSettingsNavigation />
  </aside>
  <AppSettingsContent />
</AppSettingsRoot>
