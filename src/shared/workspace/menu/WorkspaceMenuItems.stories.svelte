<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceMenuItems from "./WorkspaceMenuItems.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Menu",
    component: WorkspaceMenuItems,
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component:
            "Renderer-neutral workspace menu entries presented through direct Bits UI primitives and native Workspace tokens.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { DropdownMenu } from "bits-ui";

  let selected = $state("Nothing selected");
  const menu = new WorkspaceMenu()
    .addItem((item) =>
      item
        .setTitle("Split right")
        .setIcon("separator-vertical")
        .onClick(() => {
          selected = "Split right selected";
        }),
    )
    .addMenu("Move to", (submenu) => {
      submenu.addItem((item) =>
        item.setTitle("Floating window").onClick(() => {
          selected = "Floating window selected";
        }),
      );
    })
    .addSeparator()
    .addItem((item) => item.setTitle("Close").setIcon("x").setDisabled(true));
</script>

<Story
  name="Items, submenus, and disabled state"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open pane menu" }),
    );
    const page = within(document.body);
    await expect(
      page.getByRole("menuitem", { name: "Split right" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("menuitem", { name: "Split right" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Split right selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/menu/items-submenus-and-disabled-state-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="ui-workspace-menu-story-trigger">
        Open pane menu
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class="ui-workspace-menu__content"
          data-ui-component="workspace-menu"
          data-ui-part="content"
          sideOffset={4}
        >
          <WorkspaceMenuItems {menu} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    <output class="sr-only">{selected}</output>
  {/snippet}
</Story>

<style>
  :global(.ui-workspace-menu-story-trigger) {
    border: 1px solid var(--ui-workspace-border);
    border-radius: var(--ui-workspace-radius-small);
    padding: 0.5rem 0.75rem;
    color: var(--ui-workspace-foreground);
    background: var(--ui-workspace-background);
  }
</style>
