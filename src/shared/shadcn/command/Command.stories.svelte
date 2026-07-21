<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Command from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Command",
    component: Command.Root,
    parameters: {
      docs: {
        description: {
          component: "Command palette list used by searchable pickers.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("none");
</script>

<Story
  name="Filters and selects"
  play={async ({ canvas }) => {
    const input = canvas.getByPlaceholderText("Search…");
    await userEvent.type(input, "cal");
    await expect(canvas.getByText("Calendar")).toBeVisible();
    await userEvent.click(canvas.getByRole("option", { name: "Calendar" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Calendar");
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-2">
      <Command.Root class="rounded-md border">
        <Command.Input
          aria-controls="catalog-command-list"
          placeholder="Search…"
        />
        <Command.List id="catalog-command-list">
          <Command.Empty>No results</Command.Empty>
          <Command.Group>
            <Command.Item
              value="calendar"
              onSelect={() => (selected = "Calendar")}
            >
              Calendar
            </Command.Item>
            <Command.Item
              value="calculator"
              onSelect={() => (selected = "Calculator")}
            >
              Calculator
            </Command.Item>
            <Command.Item
              value="settings"
              onSelect={() => (selected = "Settings")}
            >
              Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Root>
      <output class="text-muted-foreground text-sm">{selected}</output>
    </div>
  {/snippet}
</Story>
