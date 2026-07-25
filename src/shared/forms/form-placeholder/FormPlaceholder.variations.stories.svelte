<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormPlaceholder from "./FormPlaceholder.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Placeholder",
    component: FormPlaceholder,
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
  name="Basic"
  exportName="Basic"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Basic placeholder copy." },
    },
  }}
>
  {#snippet template()}
    <FormPlaceholder>Placeholder content</FormPlaceholder>
  {/snippet}
</Story>

<Story
  name="Tall body"
  exportName="TallBody"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Taller stub to judge vertical rhythm." },
    },
  }}
>
  {#snippet template()}
    <FormPlaceholder>
      <p class="m-0">Line one</p>
      <p class="m-0 mt-2">Line two</p>
      <p class="m-0 mt-2">Line three</p>
    </FormPlaceholder>
  {/snippet}
</Story>
