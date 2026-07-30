<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Popover from "./index.js";
  import PreviewExample from "./examples/preview.svelte";

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

  /** Clear portals left by a prior open overlay story. */
  async function dismissOverlays() {
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard("{Escape}");
    }
    document
      .querySelectorAll('[data-slot="popover-content"]')
      .forEach((node) => node.remove());
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-slot="popover-content"][data-state="open"]',
        ),
      ).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  }
</script>

<script lang="ts">
  let open = $state(false);
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Opens a panel"
  play={async ({ canvas }) => {
    await dismissOverlays();
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  tags={["skip-visual"]}
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
  tags={["visual-state", "visual-failed"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open popover" }));
    await expect(within(document.body).getByText("Dimensions")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="p-4">
      <PreviewExample />
    </div>
  {/snippet}
</Story>
