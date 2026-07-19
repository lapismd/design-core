<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import SearchableChoicePicker from "./SearchableChoicePicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Searchable Choice Picker",
    component: SearchableChoicePicker,
    parameters: {
      docs: {
        description: {
          component:
            "Legacy searchable picker. Prefer Command-based pickers for new work.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("ts");
</script>

<Story
  name="Chooses an option"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(
      within(document.body).getByRole("option", { name: /Python/i }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("py");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <SearchableChoicePicker
        {value}
        options={[
          { value: "ts", label: "TypeScript" },
          { value: "py", label: "Python" },
        ]}
        ariaLabel="Language"
        onChange={(next) => (value = next)}
      />
      <output class="text-muted-foreground text-sm">{value}</output>
    </div>
  {/snippet}
</Story>
