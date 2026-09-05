<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";

  import { Button } from "../button/index.js";
  import * as DropdownMenu from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Dropdown Menu",
    component: DropdownMenu.Root,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "An action-only public composition that proves family styles do not depend on importing optional checkbox or radio items.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("None");
</script>

<Story
  name="Item-only composition"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Profile actions" }),
    );
    const menu = within(document.body).getByRole("menu");
    const settings = within(menu).getByRole("menuitem", { name: "Settings" });
    await expect(getComputedStyle(menu).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(getComputedStyle(settings).display).toBe("flex");
    await userEvent.click(settings);
    await expect(canvas.getByRole("status")).toHaveTextContent("Settings");
  }}
>
  {#snippet template()}
    <div class="consumer-story">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Profile actions</Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => (selected = "Profile")}
              >Profile</DropdownMenu.Item
            >
            <DropdownMenu.Item onSelect={() => (selected = "Settings")}
              >Settings</DropdownMenu.Item
            >
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <output>{selected}</output>
    </div>
  {/snippet}
</Story>

<style>
  .consumer-story {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 10rem;
    justify-content: center;
  }

  output {
    color: var(--muted-foreground);
    font-size: var(--text-sm);
  }
</style>
