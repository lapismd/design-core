<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent, waitFor } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspacePanelGroup } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceBottomPanel from "./WorkspaceBottomPanel.svelte";
  import WorkspaceBottomPanelStoryView from "./WorkspaceBottomPanelStoryView.svelte";
  import "./WorkspaceBottomPanel.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Bottom Panel",
    component: WorkspaceBottomPanel,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A VS Code-style bottom dock with a horizontal tab strip and transposed grouped panels that resize left-to-right and collapse into vertical title rails.",
        },
      },
    },
  });
</script>

<script lang="ts">
  function createController() {
    const terminal = createWorkspaceTab({
      id: "bottom-terminal",
      title: "Terminal",
      icon: "terminal",
      view: { type: "terminal-story" },
    });
    const problems = createWorkspaceTab({
      id: "bottom-problems",
      title: "Problems",
      icon: "circle-alert",
      view: {
        type: "panel-story",
        state: { message: "No problems have been detected." },
      },
    });
    const output = createWorkspaceTab({
      id: "bottom-output",
      title: "Output",
      icon: "list-output",
      view: {
        type: "panel-story",
        state: { message: "Build output is ready." },
      },
    });
    const diagnostics: WorkspacePanelGroup = {
      kind: "sidebar-group",
      id: "bottom-diagnostics",
      title: "Diagnostics",
      icon: "panel-top-open",
      tabs: [problems, output],
      hiddenTabIds: [],
      collapsedByTabId: { [problems.id]: false, [output.id]: true },
      panelSizesByTabId: { [problems.id]: 76 },
    };
    const pane = createWorkspaceTabs([terminal, diagnostics], {
      id: "bottom-story-pane",
      activeItemId: terminal.id,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.bottom = { open: true, size: 288, root: pane };
    layout.active = { hostId: "root", paneId: pane.id, tabId: terminal.id };
    const controller = new WorkspaceShellController({ layout });
    controller.registry.register({
      kind: "svelte",
      type: "terminal-story",
      component: WorkspaceBottomPanelStoryView,
    });
    controller.registry.register({
      kind: "svelte",
      type: "panel-story",
      component: WorkspaceBottomPanelStoryView,
    });
    return controller;
  }

  const controller = createController();
  const groupedController = createController();
</script>

<Story
  name="Terminal tabs"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("tab", { name: "Terminal" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByLabelText("Terminal")).toHaveTextContent(
      "24 tests passed",
    );

    const resize = canvas.getByRole("button", { name: "Resize bottom panel" });
    await fireEvent.keyDown(resize, { key: "ArrowUp" });
    await waitFor(() => {
      expect(controller.layout.bottom.size).toBe(298);
    });
    await expect(
      canvasElement.querySelector(
        '[data-ui-component="workspace-bottom-panel"]',
      ),
    ).toHaveStyle("--ui-workspace-bottom-panel-height: 298px");
  }}
>
  {#snippet template()}
    <div class="ui-workspace-bottom-panel-story-frame">
      <WorkspaceBottomPanel {controller} />
    </div>
  {/snippet}
</Story>

<Story
  name="Transposed grouped panels"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Diagnostics" }));
    await expect(
      canvas.getByRole("button", { name: "Collapse Problems" }),
    ).toBeVisible();
    const expandOutput = canvas.getByRole("button", { name: "Expand Output" });
    await expect(expandOutput).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(expandOutput);
    await expect(
      canvas.getByRole("button", { name: "Collapse Output" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("heading", { name: "Output" })).toBeVisible();
    await expect(
      canvasElement.querySelector(
        '[data-ui-component="workspace-bottom-panel-group"]',
      ),
    ).not.toBeNull();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-bottom-panel-story-frame">
      <WorkspaceBottomPanel controller={groupedController} />
    </div>
  {/snippet}
</Story>
