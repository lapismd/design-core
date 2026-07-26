<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceSplit,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceTree from "./WorkspaceTree.svelte";
  import "./WorkspaceTree.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Tree",
    component: WorkspaceTree,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The recursive renderer for serializable split, top-tab, and stacked-tab workspace nodes.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const left = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "tree-home",
        title: "Framework home",
        icon: "layout-template",
      }),
      createWorkspaceTab({
        id: "tree-notes",
        title: "Notes",
        icon: "notebook-tabs",
      }),
    ],
    { id: "tree-left", activeItemId: "tree-home" },
  );
  const right = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "tree-reference",
        title: "Reference",
        icon: "book-open",
      }),
      createWorkspaceTab({
        id: "tree-details",
        title: "Details",
        icon: "panel-right",
      }),
    ],
    {
      id: "tree-right",
      activeItemId: "tree-reference",
      presentation: "stacked",
    },
  );
  const root = createWorkspaceSplit("horizontal", [left, right], [55, 45]);
  root.id = "tree-root";
  const layout = createDefaultWorkspaceLayout();
  layout.main = root;
  layout.active = {
    hostId: "root",
    paneId: left.id,
    tabId: "tree-home",
  };
  const controller = new WorkspaceShellController({ layout });
</script>

<Story
  name="Recursive top and stacked panes"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("separator")).toHaveLength(1);
    const notes = canvas.getByRole("tab", { name: "Notes" });
    await userEvent.click(notes);
    await expect(notes).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("button", { name: "Reference" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/tree/recursive-top-and-stacked-panes-chromium-darwin.png",
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
    <div class="ui-workspace-tree-story-frame">
      <WorkspaceTree
        {controller}
        node={controller.layout.main}
        leftSidebarTogglePaneId="tree-left"
        rightSidebarTogglePaneId="tree-right"
      />
    </div>
  {/snippet}
</Story>
