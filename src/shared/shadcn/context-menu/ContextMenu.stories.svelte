<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as ContextMenu from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Context Menu",
    component: ContextMenu.Root,
    parameters: {
      docs: {
        description: {
          component: "UI-owned right-click menu built on bits-ui.",
        },
      },
    },
  });
</script>

<Story
  name="Default"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByText("Right click here");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });
    const body = canvasElement.ownerDocument.body;
    await expect(body.querySelector('[data-slot="context-menu-content"]')).toBeTruthy();
  }}
>
  {#snippet template()}
    <ContextMenu.Root>
      <ContextMenu.Trigger
        class="flex h-[120px] w-[240px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right click here
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Back</ContextMenu.Item>
        <ContextMenu.Item>Reload</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  {/snippet}
</Story>
