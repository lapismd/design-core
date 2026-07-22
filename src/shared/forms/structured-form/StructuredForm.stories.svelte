<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import StructuredForm from "./StructuredForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Orchestrators/Structured Form",
    component: StructuredForm,
    parameters: {
      docs: {
        description: {
          component:
            "Config-driven form runtime for schema-shaped data. See UI Forms/Guidance.",
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
    id: "settings",
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
  name="Updates a schema-shaped form"
  play={async ({ canvas }) => {
    const name = canvas.getByLabelText("Display name");
    await userEvent.clear(name);
    await userEvent.type(name, "Studio");
    await userEvent.click(canvas.getByRole("button", { name: "Manual" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Studio uses manual",
    );
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
      <output class="text-muted-foreground mt-3 block text-sm">
        {settings.name} uses {settings.syncMode} sync
      </output>
    </div>
  {/snippet}
</Story>
