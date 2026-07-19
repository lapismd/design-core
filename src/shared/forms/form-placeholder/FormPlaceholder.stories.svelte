<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormPlaceholder from "./FormPlaceholder.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Placeholder",
    component: FormPlaceholder,
    parameters: {
      docs: {
        description: {
          component:
            "Dotted outline for story/demo bodies so spacing is easy to judge.",
        },
      },
    },
  });
</script>

<Story name="Default" tags={["skip-visual"]}>
  {#snippet template()}
    <FormPlaceholder>Placeholder content</FormPlaceholder>
  {/snippet}
</Story>
