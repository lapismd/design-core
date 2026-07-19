<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as AlertDialog from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Alert Dialog",
    component: AlertDialog.Root,
    parameters: {
      docs: {
        description: {
          component: "Confirmation dialog for destructive or irreversible actions.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(false);
  let confirmed = $state(false);
</script>

<Story
  name="Confirms a destructive action"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete item" }));
    const dialog = within(document.body).getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("confirmed");
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
            <AlertDialog.Action onclick={() => (confirmed = true)}>Delete</AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
      <output class="text-sm text-muted-foreground">
        {confirmed ? "confirmed" : "idle"}
      </output>
    </div>
  {/snippet}
</Story>
