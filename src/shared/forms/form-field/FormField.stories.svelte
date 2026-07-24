<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormField from "./FormField.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Form Field",
    component: FormField,
    parameters: {
      docs: {
        description: {
          component:
            'One labelled row in a `cv-structured-form` grid. Use `as="div"` and `align="center"` for interactive pills.',
        },
      },
    },
  });
</script>

<script lang="ts">
  let name = $state("Household ledger");
</script>

<Story
  name="Text input"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Ledger name");
    await userEvent.clear(input);
    await userEvent.type(input, "Shared ledger");
    await expect(canvas.getByRole("status")).toHaveTextContent("Shared ledger");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/forms/form-field/text-input-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Ledger name">
        <input aria-label="Ledger name" bind:value={name} />
      </FormField>
      <output class="sr-only">{name}</output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Ledger name" error="This field is required.">
        <input aria-label="Ledger name" value="" />
      </FormField>
    </div>
  {/snippet}
</Story>
