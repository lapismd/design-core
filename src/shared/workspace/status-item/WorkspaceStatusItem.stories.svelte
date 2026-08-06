<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import type { WorkspaceStatusItem as WorkspaceStatusItemModel } from "../core/types.js";
  import WorkspaceStatusItem from "./WorkspaceStatusItem.svelte";
  import "./WorkspaceStatusItem.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Status Item",
    component: WorkspaceStatusItem,
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component:
            "Compact status contribution supporting icons, segments, progress, actions, and declarative menus.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let result = $state("Nothing selected");
  const actionItem: WorkspaceStatusItemModel = {
    id: "ready",
    icon: "circle-check",
    label: "Framework ready",
    tooltip: "Workspace framework ready",
    onSelect: () => {
      result = "Ready selected";
    },
  };
  const menuItem: WorkspaceStatusItemModel = {
    id: "plugins",
    icon: "puzzle",
    label: "Plugins",
    buildMenu(menu) {
      menu.addItem((item) =>
        item.setTitle("Manage plugins").onClick(() => {
          result = "Manage plugins selected";
        }),
      );
    },
  };
</script>

<Story
  name="Action and menu items"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Workspace framework ready" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Ready selected",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Plugins" }));
    const page = within(document.body);
    await userEvent.click(
      page.getByRole("menuitem", { name: "Manage plugins" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Manage plugins selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/status-item/action-and-menu-items-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-status-item-story-frame">
      <WorkspaceStatusItem item={actionItem} />
      <WorkspaceStatusItem item={menuItem} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>
