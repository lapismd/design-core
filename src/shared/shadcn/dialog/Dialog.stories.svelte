<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Dialog from "./index.js";
  import PreviewExample from "./examples/preview.svelte";
  import CustomCloseButtonExample from "./examples/custom-close-button.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Dialog",
    component: Dialog.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Modal dialog for focused editing. Always include a descriptive title.",
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
        '[data-slot="dialog-overlay"], [data-slot="dialog-content"]',
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
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }));
    const dialog = within(document.body).getByRole("dialog", {
      name: "Edit profile",
    });
    await expect(dialog).toHaveAttribute("data-state", "open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <Dialog.Root bind:open>
        <Dialog.Trigger>
          {#snippet child({ props })}
            <Button {...props}>Edit profile</Button>
          {/snippet}
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>Update your display name.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button onclick={() => (open = false)}>Done</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
      <output class="text-muted-foreground text-sm">
        Dialog is {open ? "open" : "closed"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Open dialog"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open Dialog" }));
    await expect(
      within(document.body).getByRole("dialog", { name: "Edit profile" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/dialog/open-dialog-chromium.png"],
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

<Story
  name="Open custom close dialog"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Share" }));
    await expect(
      within(document.body).getByRole("dialog", { name: "Share link" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/dialog/open-custom-close-dialog-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="p-4">
      <CustomCloseButtonExample />
    </div>
  {/snippet}
</Story>
