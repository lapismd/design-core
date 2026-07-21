<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as DropdownMenu from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Dropdown Menu",
    component: DropdownMenu.Root,
    parameters: {
      docs: {
        description: {
          component: "Action menu anchored to a trigger control.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let chosen = $state("none");
</script>

<Story
  name="Chooses a menu item"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Duplicate" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Duplicate");
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Actions</Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => (chosen = "Duplicate")}>
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => (chosen = "Archive")}>
              Archive
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <output class="text-muted-foreground text-sm">{chosen}</output>
    </div>
  {/snippet}
</Story>
