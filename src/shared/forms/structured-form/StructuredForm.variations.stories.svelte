<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StructuredForm from "./StructuredForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Orchestrators/Structured Form",
    component: StructuredForm,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    booleanField,
    createFormConfig,
    segmentedField,
    textField,
  } from "../core/core";

  type Settings = {
    name: string;
    syncMode: string;
    enabled: boolean;
  };

  const config = createFormConfig<Settings>({
    id: "docs-settings",
    fields: [
      textField({
        id: "name",
        label: "Display name",
        get: (s) => s.name,
        set: (s, name) => ({ ...s, name }),
      }),
      segmentedField({
        id: "sync-mode",
        label: "Sync mode",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
        get: (s) => s.syncMode,
        set: (s, syncMode) => ({ ...s, syncMode }),
      }),
      booleanField({
        id: "enabled",
        label: "Enabled",
        get: (s) => s.enabled,
        set: (s, enabled) => ({ ...s, enabled }),
      }),
    ],
  });

  let settings = $state<Settings>({
    name: "Northstar",
    syncMode: "automatic",
    enabled: true,
  });
</script>

<Story
  name="Schema fields"
  exportName="SchemaFields"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story: "Text, segmented, and boolean fields from a typed config.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={settings}
        {config}
        onChange={(next) => {
          settings = next as Settings;
        }}
      />
    </div>
  {/snippet}
</Story>
