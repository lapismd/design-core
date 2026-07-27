<script lang="ts">
  import type { WorkspaceSettingsSection } from "./types.js";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";
  import WorkspaceSettingField from "./WorkspaceSettingField.svelte";

  let { section }: { section: WorkspaceSettingsSection } = $props();
  const state = getAppSettingsContext();
  let schemaSections = $derived.by(() => {
    const directFields = (section.fields ?? []).filter(
      (field) => field.type !== "group",
    );
    const result: Array<{
      id: string;
      title: string;
      description?: string;
      fields: NonNullable<WorkspaceSettingsSection["fields"]>;
    }> = [];
    if (directFields.length) {
      result.push({
        id: section.id,
        title: section.title,
        description: section.description,
        fields: directFields,
      });
    }
    for (const field of section.fields ?? []) {
      if (field.type !== "group") continue;
      result.push({
        id: field.id,
        title: field.title,
        description: field.description,
        fields: field.fields,
      });
    }
    return result;
  });
</script>

<div class="ui-workspace-settings__schema-form">
  {#each schemaSections as schemaSection (schemaSection.id)}
    <section
      class="ui-workspace-settings__schema-section"
      data-ui-part="settings-section"
      data-settings-schema-section-id={schemaSection.id}
    >
      <header>
        <h1>{schemaSection.title}</h1>
        {#if schemaSection.description}<p>{schemaSection.description}</p>{/if}
      </header>
      <div class="ui-workspace-settings__schema-body">
        {#each schemaSection.fields as field (field.id)}
          <WorkspaceSettingField controller={state.controller} {field} />
        {/each}
      </div>
    </section>
  {/each}
</div>
