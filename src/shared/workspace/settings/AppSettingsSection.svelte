<script lang="ts">
  import type { WorkspaceSettingsSection } from "./types.js";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";
  import WorkspaceSettingField from "./WorkspaceSettingField.svelte";

  let { section }: { section: WorkspaceSettingsSection } = $props();
  const state = getAppSettingsContext();
</script>

<section
  class="ui-workspace-settings__schema-section"
  data-ui-part="settings-section"
  data-settings-schema-section-id={section.id}
>
  <header>
    <h1>{section.title}</h1>
    {#if section.description}<p>{section.description}</p>{/if}
  </header>
  <div class="ui-workspace-settings__schema-body">
    {#each section.fields ?? [] as field (field.id)}
      <WorkspaceSettingField controller={state.controller} {field} />
    {/each}
  </div>
</section>
