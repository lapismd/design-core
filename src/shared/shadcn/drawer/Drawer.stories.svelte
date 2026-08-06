<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Drawer from "./index.js";
  import PreviewExample from "./examples/preview.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Drawer",
    component: Drawer.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Mobile-oriented drawer built on vaul-svelte. Prefer Sheet for desktop side panels.",
        },
      },
    },
  });

  async function dismissOverlays() {
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard("{Escape}");
    }
    document
      .querySelectorAll(
        '[data-slot="drawer-overlay"], [data-slot="drawer-content"]',
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

<Story
  name="Opens and closes"
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open drawer" }));
    const drawer = within(document.body).getByRole("dialog", {
      name: "Move Goal",
    });
    await expect(drawer).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div>
      <Drawer.Root bind:open>
        <Drawer.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Open drawer</Button>
          {/snippet}
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Move Goal</Drawer.Title>
            <Drawer.Description>
              Set your daily activity goal.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Footer>
            <Button onclick={() => (open = false)}>Done</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
      <output>
        Drawer is {open ? "open" : "closed"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Default" tags={["visual-pending"]}>
  {#snippet template()}
    <PreviewExample />
  {/snippet}
</Story>
