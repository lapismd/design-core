<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InlineOptionPicker from "./InlineOptionPicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Inline Option Picker",
    component: InlineOptionPicker,
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
  name="Menu"
  exportName="Menu"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Default menu presentation." },
    },
  }}
>
  {#snippet template()}
    <InlineOptionPicker
      value="draft"
      options={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
      presentation="menu"
      ariaLabel="Status"
    />
  {/snippet}
</Story>

<Story
  name="Swap"
  exportName="Swap"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Swap presentation for cycling values." },
    },
  }}
>
  {#snippet template()}
    <InlineOptionPicker
      value="a"
      options={[
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
      ]}
      presentation="swap"
      ariaLabel="Option"
    />
  {/snippet}
</Story>
