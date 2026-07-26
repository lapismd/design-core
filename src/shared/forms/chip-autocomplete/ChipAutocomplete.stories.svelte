<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChipAutocomplete from "./ChipAutocomplete.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Chip Autocomplete",
    component: ChipAutocomplete,
    parameters: {
      docs: {
        description: {
          component: "Multi-value chip input with suggestion autocomplete.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let chips = $state<string[]>(["typescript"]);
</script>

<Story
  name="Adds a chip"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Skills", { selector: "input" });
    await userEvent.type(input, "svelte{Enter}");
    await expect(canvas.getByText(/svelte/i)).toBeVisible();
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-md">
      <ChipAutocomplete
        value={chips}
        suggestions={["svelte", "typescript", "css"]}
        label="Skills"
        showLabel={true}
        onChange={(next) => {
          chips = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-md">
      <ChipAutocomplete
        value={[]}
        suggestions={["svelte", "typescript"]}
        label="Skills"
        showLabel={true}
        error="Enter at least one value."
        onChange={() => {}}
      />
    </div>
  {/snippet}
</Story>
