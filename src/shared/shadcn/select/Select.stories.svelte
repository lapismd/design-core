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
  let interactionValue = $state("draft");
  const labels: Record<string, string> = {
    draft: "Draft",
    published: "Published",
  };
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Chooses an option"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.keyboard("{Escape}");
    const trigger = canvas.getByRole("combobox", { name: "Status" });
    await expect(trigger).toBeEnabled();
    await userEvent.click(trigger);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Published" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Published");
  }}
>
  {#snippet template()}
    <div class="flex max-w-xs flex-col gap-2">
      <span class="text-sm font-medium" id="catalog-status-label">Status</span>
      <Select.Root type="single" bind:value={interactionValue}>
        <Select.Trigger
          aria-controls="catalog-status-options"
          aria-labelledby="catalog-status-label"
          role="combobox"
        >
          {labels[interactionValue]}
        </Select.Trigger>
        <Select.Content id="catalog-status-options" aria-label="Status options">
          <Select.Item value="draft" label="Draft">Draft</Select.Item>
          <Select.Item value="published" label="Published"
            >Published</Select.Item
          >
        </Select.Content>
      </Select.Root>
      <output class="text-muted-foreground text-sm"
        >{labels[interactionValue]}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Open menu"
  tags={["visual-state", "visual-failed"]}
  play={async ({ canvas }) => {
    // Open via interaction so we don't share a sticky bind:open across stories.
    await userEvent.keyboard("{Escape}");
    const trigger = canvas.getByRole("combobox", { name: "Status" });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(
      within(document.body).getByRole("listbox", { name: "Status options" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="flex max-w-xs flex-col gap-2 p-4">
      <span class="text-sm font-medium" id="catalog-status-label-open"
        >Status</span
      >
      <Select.Root type="single" value="draft">
        <Select.Trigger
          aria-controls="catalog-status-options-open"
          aria-labelledby="catalog-status-label-open"
          role="combobox"
        >
          Draft
        </Select.Trigger>
        <Select.Content
          id="catalog-status-options-open"
          aria-label="Status options"
        >
          <Select.Item value="draft" label="Draft">Draft</Select.Item>
          <Select.Item value="published" label="Published"
            >Published</Select.Item
          >
        </Select.Content>
      </Select.Root>
    </div>
  {/snippet}
</Story>
