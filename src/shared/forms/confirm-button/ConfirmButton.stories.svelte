<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ConfirmButton from "./ConfirmButton.svelte";
  import source from "./ConfirmButtonExample.svelte?raw";
  const { Story } = defineMeta({
    title: "UI Forms/Layout/Confirm Button",
    component: ConfirmButton,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: {
          code: source,
          language: "tsx",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let count = $state(0);
</script>

<Story
  name="Confirm and restore focus"
  play={async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Clear history" });
    await userEvent.click(trigger);
    const dialog = within(canvasElement.ownerDocument.body).getByRole(
      "alertdialog",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Confirm" }),
    );
    await expect(canvas.getByText("Cleared 1 time")).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
  }}
  >{#snippet template()}<ConfirmButton
      title="Clear history?"
      description="Remove saved history from this device."
      destructive
      onConfirm={() => {
        count += 1;
      }}>Clear history</ConfirmButton
    >
    <p>Cleared {count} time</p>{/snippet}</Story
>
