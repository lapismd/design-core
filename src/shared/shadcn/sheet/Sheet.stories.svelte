<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Sheet from "./index.js";
  import PreviewExample from "./examples/preview.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Sheet",
    component: Sheet.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Slide-over panel that extends Dialog. Use for complementary forms and mobile sidebars.",
        },
      },
    },
  });

  /** Clear portals / scroll-lock left by a prior open overlay story. */
  async function dismissOverlays() {
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard("{Escape}");
    }
    document
      .querySelectorAll(
        '[data-slot="sheet-overlay"], [data-slot="sheet-content"]',
      )
      .forEach((node) => node.remove());
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
    await waitFor(() => {
      expect(
        document.querySelector('[role="dialog"][data-state="open"]'),
      ).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  }
</script>

<script lang="ts">
  let open = $state(false);
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual stories. -->
<Story
  name="Opens and closes"
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    const sheet = within(document.body).getByRole("dialog", {
      name: "Edit profile",
    });
    await expect(sheet).toHaveAttribute("data-state", "open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <Sheet.Root bind:open>
        <Sheet.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Open sheet</Button>
          {/snippet}
        </Sheet.Trigger>
        <Sheet.Content side="right">
          <Sheet.Header>
            <Sheet.Title>Edit profile</Sheet.Title>
            <Sheet.Description>
              Make changes to your profile here.
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Footer>
            <Button onclick={() => (open = false)}>Done</Button>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet.Root>
      <output class="text-muted-foreground text-sm">
        Sheet is {open ? "open" : "closed"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Open sheet"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await expect(
      within(document.body).getByRole("dialog", { name: "Edit profile" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/sheet/open-sheet-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="p-4">
      <PreviewExample />
    </div>
  {/snippet}
</Story>
