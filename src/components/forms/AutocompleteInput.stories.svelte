<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AutocompleteInput from "./AutocompleteInput.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Autocomplete Input",
    component: AutocompleteInput,
    parameters: {
      docs: {
        description: {
          component: "Text input with suggestion list for free-form values.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
  let committed = $state("");
</script>

<Story
  name="Commits a suggestion"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Skill");
    await userEvent.type(input, "typescript{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("typescript");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <AutocompleteInput
        bind:value
        suggestions={["typescript", "typography"]}
        ariaLabel="Skill"
        onCommit={(next) => {
          committed = next;
          value = "";
        }}
      />
      <output class="text-muted-foreground text-sm"
        >{committed || "none"}</output
      >
    </div>
  {/snippet}
</Story>
