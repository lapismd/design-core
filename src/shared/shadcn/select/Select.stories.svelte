<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
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
  let closeComplete = $state(false);
  let followUpActions = $state(0);
  const labels: Record<string, string> = {
    draft: "Draft",
    published: "Published",
  };
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Chooses an option"
  play={async ({ canvas }) => {
    await userEvent.keyboard("{Escape}");
    interactionValue = "draft";
    followUpActions = 0;
    const trigger = canvas.getByRole("combobox", { name: "Status" });
    await expect(trigger).toBeEnabled();
    await userEvent.click(trigger);
    const options = within(document.body).getByRole("listbox", {
      name: "Status options",
    });
    await expect(trigger).toHaveAttribute("aria-controls", options.id);
    closeComplete = false;
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Published" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Published");
    await waitFor(() => expect(closeComplete).toBe(true));
    await expect(getComputedStyle(document.body).pointerEvents).toBe("auto");
    await userEvent.click(
      canvas.getByRole("button", { name: "Continue after selection" }),
    );
    await expect(
      canvas.getByTestId("after-selection-actions"),
    ).toHaveTextContent("1");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/select/chooses-an-option-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="flex max-w-xs flex-col gap-2">
      <span class="text-sm font-medium" id="catalog-status-label">Status</span>
      <Select.Root
        type="single"
        bind:value={interactionValue}
        onOpenChangeComplete={(open) => {
          if (!open) closeComplete = true;
        }}
      >
        <Select.Trigger aria-labelledby="catalog-status-label">
          {labels[interactionValue]}
        </Select.Trigger>
        <Select.Content id="catalog-status-options" aria-label="Status options">
          <Select.Group>
            <Select.Item value="draft" label="Draft">Draft</Select.Item>
            <Select.Item value="published" label="Published"
              >Published</Select.Item
            >
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <output class="text-muted-foreground text-sm"
        >{labels[interactionValue]}</output
      >
      <Button onclick={() => (followUpActions += 1)}
        >Continue after selection</Button
      >
      <span data-testid="after-selection-actions">{followUpActions}</span>
    </div>
  {/snippet}
</Story>

<Story
  name="Open menu"
  tags={["visual-state", "visual-pending"]}
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
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/select/open-menu-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex max-w-xs flex-col gap-2 p-4">
      <span class="text-sm font-medium" id="catalog-status-label-open"
        >Status</span
      >
      <Select.Root type="single" value="draft">
        <Select.Trigger aria-labelledby="catalog-status-label-open">
          Draft
        </Select.Trigger>
        <Select.Content
          id="catalog-status-options-open"
          aria-label="Status options"
        >
          <Select.Group>
            <Select.Item value="draft" label="Draft">Draft</Select.Item>
            <Select.Item value="published" label="Published"
              >Published</Select.Item
            >
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  {/snippet}
</Story>
