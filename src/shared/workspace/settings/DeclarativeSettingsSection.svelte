<script lang="ts">
  import AppSettingsRoot from "./AppSettingsRoot.svelte";
  import AppSettingsSection from "./AppSettingsSection.svelte";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import type { WorkspaceSettingsSection } from "./types.js";

  let {
    controller,
    section,
    class: className = "",
  }: {
    controller: WorkspaceSettingsController;
    section: WorkspaceSettingsSection;
    class?: string;
  } = $props();
</script>

<AppSettingsRoot {controller} class={className}>
  <AppSettingsSection {section} />
</AppSettingsRoot>
