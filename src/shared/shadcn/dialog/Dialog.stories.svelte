<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Dialog from "./index.js";

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
</script>

<script lang="ts">
  let open = $state(false);
</script>

<Story
  name="Opens and closes"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }));
    const dialog = within(document.body).getByRole("dialog", {
      name: "Edit profile",
    });
    await expect(dialog).toHaveAttribute("data-state", "open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  tags={["visual-approved"]}
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
