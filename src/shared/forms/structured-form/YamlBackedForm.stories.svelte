<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import YamlBackedForm from "./YamlBackedForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Orchestrators/YAML Backed Form",
    component: YamlBackedForm,
    parameters: {
      docs: {
        description: {
          component: "Structured form with optional YAML source mode.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { createFormConfig, textField } from "../core/core";

  type Doc = { title: string };

  const config = createFormConfig<Doc>({
    id: "doc",
    fields: [
      textField({
        id: "title",
        label: "Title",
        get: (doc) => doc.title,
        set: (doc, title) => ({ ...doc, title }),
      }),
    ],
  });

  let value = $state<Doc>({ title: "Untitled" });
  let yamlMode = $state(false);
  let yamlText = $state("title: Untitled\n");
</script>

<Story
  name="Edits structured fields"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Title");
    await userEvent.clear(input);
    await userEvent.type(input, "Resume");
    await expect(canvas.getByRole("status")).toHaveTextContent("Resume");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="max-w-xl">
      <YamlBackedForm
        {value}
        {config}
        {yamlMode}
        bind:yamlText
        onChange={(next) => {
          value = next as Doc;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm"
        >{value.title}</output
      >
    </div>
  {/snippet}
</Story>
