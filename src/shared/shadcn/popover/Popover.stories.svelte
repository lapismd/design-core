<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Popover from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Popover",
    component: Popover.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Non-modal floating panel for lightweight editing or menus.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(false);
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Opens a panel"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/popover/opens-a-panel-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <Popover.Root bind:open>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Filters</Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-56 p-3 text-sm"
          >Active filters</Popover.Content
        >
      </Popover.Root>
      <output class="text-muted-foreground text-sm">
        {open ? "open" : "closed"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Open panel"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await expect(
      within(document.body).getByText("Active filters"),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/popover/open-panel-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-3 p-4">
      <Popover.Root>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Filters</Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-56 p-3 text-sm"
          >Active filters</Popover.Content
        >
      </Popover.Root>
    </div>
  {/snippet}
</Story>
