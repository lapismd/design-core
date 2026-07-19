<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import * as Select from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Select",
    component: Select.Root,
    parameters: {
      docs: {
        description: {
          component: "Single-value select built on bits-ui.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("draft");
  const labels: Record<string, string> = {
    draft: "Draft",
    published: "Published",
  };
</script>

<Story
  name="Chooses an option"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Published" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Published");
  }}
>
  {#snippet template()}
    <div class="flex max-w-xs flex-col gap-2">
      <span class="text-sm font-medium" id="catalog-status-label">Status</span>
      <Select.Root type="single" bind:value>
        <Select.Trigger aria-labelledby="catalog-status-label">
          {labels[value]}
        </Select.Trigger>
        <Select.Content aria-label="Status options">
          <Select.Item value="draft" label="Draft">Draft</Select.Item>
          <Select.Item value="published" label="Published">Published</Select.Item>
        </Select.Content>
      </Select.Root>
      <output class="text-sm text-muted-foreground">{labels[value]}</output>
    </div>
  {/snippet}
</Story>
