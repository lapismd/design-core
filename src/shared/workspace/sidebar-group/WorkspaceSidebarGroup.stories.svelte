<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceSidebarGroup as WorkspaceSidebarGroupModel } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceSidebarGroup from "./WorkspaceSidebarGroup.svelte";
  import "./WorkspaceSidebarGroup.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Sidebar Group",
    component: WorkspaceSidebarGroup,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Measured, collapsible and resizable grouped sidebar panels with top/bottom-only registered tab drop targets.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const outline = createWorkspaceTab({
    id: "group-outline",
    title: "Outline",
    icon: "list-tree",
    view: { type: "example", state: { title: "Outline view" } },
  });
  const links = createWorkspaceTab({
    id: "group-links",
    title: "Links",
    icon: "link",
    view: { type: "example", state: { title: "Links view" } },
  });
  const backlinks = createWorkspaceTab({
    id: "group-backlinks",
    title: "Backlinks",
    icon: "history",
    view: { type: "example", state: { title: "Backlinks view" } },
  });
  const initialGroup: WorkspaceSidebarGroupModel = {
    kind: "sidebar-group",
    id: "story-sidebar-group",
    title: "Reference panels",
    icon: "panel-top",
    tabs: [outline, links, backlinks],
    hiddenTabIds: [],
    collapsedByTabId: {
      [outline.id]: false,
      [links.id]: true,
      [backlinks.id]: true,
    },
    panelSizesByTabId: {
      [outline.id]: 72,
    },
  };
  const initialPane = createWorkspaceTabs([initialGroup], {
    id: "story-sidebar-pane",
    activeItemId: initialGroup.id,
  });
  const layout = createDefaultWorkspaceLayout();
  layout.right = { open: true, size: 320, root: initialPane };
  layout.active = {
    hostId: "root",
    paneId: initialPane.id,
    tabId: outline.id,
  };
  const controller = new WorkspaceShellController({ layout });
  controller.registry.register({
    kind: "svelte",
    type: "example",
    component: ExampleWorkspaceView,
  });
  const livePane = $derived(
    controller.layout.right.root.kind === "tabs"
      ? controller.layout.right.root
      : initialPane,
  );
  const liveGroup = $derived(
    livePane.items.find(
      (item): item is WorkspaceSidebarGroupModel =>
        item.kind === "sidebar-group" && item.id === initialGroup.id,
    ) ?? initialGroup,
  );
</script>

<Story
  name="Partially collapsed panels"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const expand = canvas.getByRole("button", { name: "Expand Links" });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(expand);
    await expect(
      canvas.getByRole("button", { name: "Collapse Links" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("heading", { name: "Links" })).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar-group/partially-collapsed-panels-chromium-darwin.png",
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
    <div class="ui-workspace-sidebar-group-story-frame">
      <WorkspaceSidebarGroup
        {controller}
        group={liveGroup}
        pane={livePane}
        side="right"
      />
    </div>
  {/snippet}
</Story>
