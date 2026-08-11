<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
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
    defineFormConfig,
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

  type Profile = {
    enabled: boolean;
    name: string;
    socialNetworks: Array<{ network: string; username: string }>;
  };

  const socialNetworkConfig = defineFormConfig<
    Profile["socialNetworks"][number]
  >()({
    id: "typed-social-network",
    fields: {
      network: { kind: "text" },
      username: { kind: "text" },
    },
  });

  const typedConfig = defineFormConfig<Profile>()({
    id: "typed-profile",
    validationMode: "onTouched",
    groups: {
      profile: { title: "Profile", collapsible: true },
    },
    fields: {
      enabled: { kind: "boolean", group: "profile" },
      name: {
        kind: "text",
        group: "profile",
        label: "Name",
        validate: (value) => (value.trim() ? undefined : "Name is required"),
      },
      socialNetworks: {
        kind: "array",
        group: "profile",
        label: "Social Networks",
        presentation: "rows",
        addPlacement: "header",
        addLabel: "Add",
        createItem: () => ({ network: "LinkedIn", username: "" }),
        itemTitle: ({ item }) => item.network || "Social network",
        itemConfig: socialNetworkConfig,
        testId: "typed-social-networks",
      },
    },
  });

  let profile = $state<Profile>({
    enabled: true,
    name: "Northstar",
    socialNetworks: [{ network: "GitHub", username: "northstar" }],
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
  tags={["visual-failed"]}
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

<Story
  name="Renders a type-safe path config"
  exportName="TypeSafePathConfig"
  play={async ({ canvas }) => {
    const name = canvas.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Studio");
    await expect(name).toHaveValue("Studio");

    const networks = canvas.getByTestId("typed-social-networks");
    await userEvent.click(
      within(networks).getByRole("button", { name: "Add" }),
    );
    await expect(within(networks).getAllByLabelText("Network")).toHaveLength(2);
    await userEvent.click(
      within(networks).getAllByRole("button", { name: "Move up" })[1],
    );
    await userEvent.click(
      within(networks).getAllByRole("button", {
        name: "Remove LinkedIn",
      })[0],
    );
    await expect(within(networks).getAllByLabelText("Network")).toHaveLength(1);
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={profile}
        config={typedConfig}
        onChange={(next) => {
          profile = next;
        }}
      />
    </div>
  {/snippet}
</Story>
