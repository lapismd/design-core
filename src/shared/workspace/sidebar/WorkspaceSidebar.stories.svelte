<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { withLapisStorybookReference } from "../reference/lapis-visual-delta.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceSidebar from "./WorkspaceSidebar.svelte";
  import "./WorkspaceSidebar.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Sidebar",
    component: WorkspaceSidebar,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Composable left/right sidebar chrome with icon tabs, grouped panels, top/bottom drop targets, source empty state, and controller-owned close behavior.",
        },
      },
    },
  });
</script>

<script lang="ts">
  function createController(withItems = true) {
    const files = createWorkspaceTab({
      id: "sidebar-files",
      title: "Files",
      icon: "files",
      view: { type: "example" },
    });
    const outline = createWorkspaceTab({
      id: "sidebar-outline",
      title: "Outline",
      icon: "list-tree",
      view: { type: "example" },
    });
    const links = createWorkspaceTab({
      id: "sidebar-links",
      title: "Links",
      icon: "link",
      view: { type: "example" },
    });
    const group: WorkspaceSidebarGroup = {
      kind: "sidebar-group",
      id: "sidebar-reference",
      title: "Reference",
      icon: "panel-top",
      tabs: [outline, links],
      hiddenTabIds: [],
      collapsedByTabId: { [outline.id]: false, [links.id]: true },
      panelSizesByTabId: { [outline.id]: 80 },
    };
    const pane = createWorkspaceTabs(withItems ? [files, group] : [], {
      id: withItems ? "sidebar-story-pane" : "sidebar-empty-pane",
      activeItemId: withItems ? files.id : null,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.right = { open: true, size: 320, root: pane };
    layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: withItems ? files.id : null,
    };
    const controller = new WorkspaceShellController({ layout });
    controller.registry.register({
      kind: "svelte",
      type: "example",
      component: ExampleWorkspaceView,
    });
    return controller;
  }

  const controller = createController();
  const emptyController = createController(false);
</script>

<Story
  name="Icon tabs and grouped panels"
  tags={["visual-pending", "lapis-reference-visual"]}
  play={async ({ canvas }) => {
    const reference = canvas.getByRole("tab", { name: "Reference" });
    await userEvent.click(reference);
    await expect(reference).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("button", { name: "Collapse Outline" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/sidebar/icon-tabs-and-grouped-panels-chromium-darwin.png",
      "workspace-shell-components-sidebar-groups--grouped-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar {controller} side="right" />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty right sidebar"
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar/empty-right-sidebar-chromium-darwin.png",
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
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar controller={emptyController} side="right" />
    </div>
  {/snippet}
</Story>
