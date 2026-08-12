<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
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
  let dialogOpen = $state(false);
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/command/filters-and-selects-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
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

<Story
  name="Dialog"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open palette" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
      {
        name: "Project palette",
      },
    );
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveStyle({ position: "fixed" });
    const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>(
      '[data-ui-component="dialog"][data-ui-part="dialog-overlay"]',
    );
    await expect(overlay).toBeVisible();
    await expect(getComputedStyle(overlay!).backgroundColor).toBe(
      "rgba(0, 0, 0, 0.5)",
    );
    const bounds = dialog.getBoundingClientRect();
    const viewport = dialog.ownerDocument.defaultView;
    await expect(
      Math.abs(bounds.left + bounds.width / 2 - viewport!.innerWidth / 2),
    ).toBeLessThanOrEqual(1);
    await expect(bounds.top).toBeLessThan(viewport!.innerHeight / 2);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeVisible());
  }}
>
  {#snippet template()}
    <button type="button" onclick={() => (dialogOpen = true)}
      >Open palette</button
    >
    <Command.Dialog
      bind:open={dialogOpen}
      title="Project palette"
      description="Search projects"
    >
      <Command.Input
        aria-controls="catalog-project-command-list"
        placeholder="Search projects…"
      />
      <Command.List id="catalog-project-command-list">
        <Command.Empty>No projects</Command.Empty>
        <Command.Group>
          <Command.Item value="Lapis Notes">Lapis Notes</Command.Item>
          <Command.Item value="Design Core">Design Core</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  {/snippet}
</Story>
