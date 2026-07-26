<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormField from "./FormField.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Field",
    component: FormField,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<Story
  name="Default row"
  exportName="DefaultRow"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Standard start-aligned text field row." },
    },
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Name">
        <input aria-label="Name" value="Jane Doe" />
      </FormField>
    </div>
  {/snippet}
</Story>

<Story
  name="Center aligned"
  exportName="CenterAligned"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story: 'Use `align="center"` for pill controls and date-like controls.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Sync" align="center" as="div">
        <span class="text-sm">Automatic</span>
      </FormField>
    </div>
  {/snippet}
</Story>

<Story
  name="Div host"
  exportName="DivHost"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story: 'Use `as="div"` when the control contains buttons or popovers.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Network" as="div">
        <button type="button" class="text-sm">LinkedIn</button>
      </FormField>
    </div>
  {/snippet}
</Story>
