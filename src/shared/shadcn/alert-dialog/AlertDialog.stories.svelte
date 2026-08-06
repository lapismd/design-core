<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as AlertDialog from "./index.js";
  import PreviewExample from "./examples/preview.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Alert Dialog",
    component: AlertDialog.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Confirmation dialog for destructive or irreversible actions.",
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
        '[data-slot="alert-dialog-overlay"], [data-slot="alert-dialog-content"]',
      )
      .forEach((node) => node.remove());
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
    await waitFor(() => {
      expect(
        document.querySelector('[role="alertdialog"][data-state="open"]'),
      ).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  }
</script>

<script lang="ts">
  let open = $state(false);
  let confirmed = $state(false);
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual stories. -->
<Story
  name="Confirms a destructive action"
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Delete item" }));
    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(
      within(dialog).getByRole("heading", { name: "Delete this item?" }),
    ).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("confirmed");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/alert-dialog/confirms-a-destructive-action-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <AlertDialog.Root bind:open>
        <AlertDialog.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="destructive">Delete item</Button>
          {/snippet}
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete this item?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => (confirmed = true)}
              >Delete</AlertDialog.Action
            >
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
      <output class="text-muted-foreground text-sm">
        {confirmed ? "confirmed" : "idle"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Open alert dialog"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Show Dialog" }));
    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(
      within(dialog).getByRole("heading", {
        name: "Are you absolutely sure?",
      }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/alert-dialog/open-alert-dialog-chromium.png",
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
      <PreviewExample />
    </div>
  {/snippet}
</Story>
