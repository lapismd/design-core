<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import InlineOptionPicker from "./InlineOptionPicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Inline Option Picker",
    component: InlineOptionPicker,
    parameters: {
      docs: {
        description: {
          component: "Compact inline menu for choosing among labeled options.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("draft");
</script>

<Story
  name="Selects an option"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(canvas.getByRole("option", { name: "Published" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("published");
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <InlineOptionPicker
        {value}
        ariaLabel="Status"
        options={[
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ]}
        onChange={(next) => {
          value = next;
        }}
      />
      <output class="text-muted-foreground text-sm">{value}</output>
    </div>
  {/snippet}
</Story>
