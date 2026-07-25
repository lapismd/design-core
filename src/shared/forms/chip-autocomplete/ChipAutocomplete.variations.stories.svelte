<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChipAutocomplete from "./ChipAutocomplete.svelte";
  import FormField from "../form-field/FormField.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Chip Autocomplete",
    component: ChipAutocomplete,
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
  name="With chips"
  exportName="WithChips"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Populated chip list." },
    },
  }}
>
  {#snippet template()}
    <ChipAutocomplete
      value={["typescript", "svelte"]}
      suggestions={["css", "rust"]}
      label="Skills"
      showLabel={true}
    />
  {/snippet}
</Story>

<Story
  name="Embedded in row"
  exportName="EmbeddedInRow"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Row-embedded chrome for StructuredForm / FormField." },
    },
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <FormField label="Roles" as="div">
        <ChipAutocomplete
          value={["Frontend Engineer"]}
          suggestions={["Product Designer"]}
          label="Roles"
          showLabel={false}
          embedded={true}
          uppercase={false}
        />
      </FormField>
    </div>
  {/snippet}
</Story>

<Story
  name="Empty"
  exportName="Empty"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Placeholder-only state." },
    },
  }}
>
  {#snippet template()}
    <ChipAutocomplete
      value={[]}
      suggestions={["svelte"]}
      label="Skills"
      placeholder="Add skill..."
      showLabel={true}
    />
  {/snippet}
</Story>
