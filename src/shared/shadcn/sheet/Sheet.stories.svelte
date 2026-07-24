<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Sheet from "./index.js";

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
</script>

<script lang="ts">
  let open = $state(false);
</script>

<Story
  name="Opens and closes"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    const sheet = within(document.body).getByRole("dialog", {
      name: "Edit profile",
    });
    await expect(sheet).toHaveAttribute("data-state", "open");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/sheet/opens-and-closes-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}

  tags={["visual-pending"]}
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
