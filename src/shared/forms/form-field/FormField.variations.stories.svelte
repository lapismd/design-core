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
  parameters={{
    visualDelta: {"images":["/visual-baselines/forms/form-field/default-row-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
    docs: {
      description: { story: "Standard start-aligned text field row." },
    },
  }}

  tags={["visual-approved"]}
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
  parameters={{
    visualDelta: {"images":["/visual-baselines/forms/form-field/center-aligned-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
    docs: {
      description: { story: "Use `align=\"center\"` for pill controls and date-like controls." },
    },
  }}

  tags={["visual-approved"]}
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
  parameters={{
    visualDelta: {"images":["/visual-baselines/forms/form-field/div-host-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
    docs: {
      description: {
        story:
          'Use `as="div"` for buttons/popovers. Prefer `align="center"` for single-line interactive values; start align still matches input padding on bare buttons.',
      },
    },
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Network" as="div">
        <button type="button">LinkedIn</button>
      </FormField>
    </div>
  {/snippet}
</Story>
