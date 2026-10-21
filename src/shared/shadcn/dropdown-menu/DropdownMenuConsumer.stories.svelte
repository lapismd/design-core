<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";

  import { Button } from "../button/index.js";
  import * as DropdownMenu from "./index.js";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import PencilIcon from "@lucide/svelte/icons/pencil";

  async function expectMenuClosed() {
    await waitFor(() => {
      expect(within(document.body).queryByRole("menu")).toBeNull();
      expect(getComputedStyle(document.body).pointerEvents).not.toBe("none");
    });
  }

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
    await expectMenuClosed();
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

<Story
  name="Submenu leading icon alignment"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Comment actions" }),
    );
    const menu = within(document.body).getByRole("menu");
    const edit = within(menu).getByRole("menuitem", { name: "Edit comment" });
    const copy = within(menu).getByRole("menuitem", {
      name: /^Copy$/,
    });
    const leading = copy.querySelector('[data-icon="inline-start"]')!;
    const indicator = copy.querySelector(
      '[data-ui-part="dropdown-menu-sub-trigger-icon"]',
    )!;
    await expect(
      Math.abs(
        leading.getBoundingClientRect().left -
          edit.querySelector("svg")!.getBoundingClientRect().left,
      ),
    ).toBeLessThan(1);
    await expect(indicator.getBoundingClientRect().left).toBeGreaterThan(
      leading.getBoundingClientRect().right,
    );
    await userEvent.click(copy);
    await userEvent.click(
      await within(document.body).findByRole("menuitem", {
        name: "Copy message",
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Message copied",
    );
    await expectMenuClosed();
  }}
>
  {#snippet template()}
    <div class="consumer-story">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}<Button {...props} variant="outline"
              >Comment actions</Button
            >{/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content style="min-width: 13.5rem;">
          <DropdownMenu.Group>
            <DropdownMenu.Item
              ><PencilIcon data-icon="inline-start" />Edit comment</DropdownMenu.Item
            >
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger
                ><CopyIcon
                  data-icon="inline-start"
                />Copy</DropdownMenu.SubTrigger
              >
              <DropdownMenu.SubContent>
                <DropdownMenu.Group
                  ><DropdownMenu.Item
                    onSelect={() => (selected = "Message copied")}
                    >Copy message</DropdownMenu.Item
                  ></DropdownMenu.Group
                >
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
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
