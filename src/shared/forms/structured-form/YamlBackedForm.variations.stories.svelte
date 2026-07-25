<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import YamlBackedForm from "./YamlBackedForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/YAML Backed Form",
    component: YamlBackedForm,
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
  import { createFormConfig, textField } from "../core/core";

  type Profile = { name: string };

  const config = createFormConfig<Profile>({
    id: "docs-yaml-profile",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (p) => p.name,
        set: (p, name) => ({ ...p, name }),
      }),
    ],
  });

  let value = $state<Profile>({ name: "Jane Doe" });
  let yamlMode = $state(false);
  let yamlText = $state("name: Jane Doe\n");
</script>


<Story
  name="Structured mode"
  exportName="StructuredMode"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Default structured editing surface." },
    },
  }}
>
  {#snippet template()}
    <div class="max-w-xl">
      <YamlBackedForm
        {value}
        {config}
        {yamlMode}
        bind:yamlText
        onChange={(next) => {
          value = next as Profile;
        }}
      />
    </div>
  {/snippet}
</Story>
