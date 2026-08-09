<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspacePanelGroup } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceBottomPanel from "./WorkspaceBottomPanel.svelte";
  import * as exampleSources from "./WorkspaceBottomPanel.example-sources.js";
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
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let imperativeResizeChanges = 0;

  function createController(empty = false) {
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
    const pane = createWorkspaceTabs(empty ? [] : [terminal, diagnostics], {
      id: empty ? "bottom-empty-story-pane" : "bottom-story-pane",
      activeItemId: empty ? null : terminal.id,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.bottom = { open: true, size: 288, root: pane };
    layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: empty ? null : terminal.id,
    };
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

  function createImperativeGroupedController() {
    const properties = createWorkspaceTab({
      id: "bottom-properties",
      title: "Properties",
      icon: "archive",
      view: { type: "imperative-panel-story" },
    });
    const group: WorkspacePanelGroup = {
      kind: "sidebar-group",
      id: "bottom-properties-group",
      title: "Properties",
      icon: "archive",
      tabs: [properties],
      hiddenTabIds: [],
      collapsedByTabId: { [properties.id]: false },
      panelSizesByTabId: { [properties.id]: 100 },
    };
    const pane = createWorkspaceTabs([group], {
      id: "bottom-imperative-story-pane",
      activeItemId: group.id,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.bottom = { open: true, size: 288, root: pane };
    layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: properties.id,
    };
    const controller = new WorkspaceShellController({ layout });
    let retainedView: HTMLElement | null = null;
    controller.registry.register({
      kind: "imperative",
      type: "imperative-panel-story",
      mount: (target) => {
        retainedView ??= document.createElement("section");
        retainedView.className = "ui-workspace-bottom-panel-story-view";
        retainedView.dataset.testid = "bottom-imperative-view";
        retainedView.setAttribute("aria-label", "Properties content");
        retainedView.textContent = "Properties are ready.";
        target.replaceChildren(retainedView);
        return () => {
          if (retainedView?.parentElement === target) retainedView.remove();
        };
      },
    });
    controller.onChange((_layout, event) => {
      if (
        event.source === "resize" &&
        event.id === group.id &&
        event.operation === "sidebar-panel"
      ) {
        imperativeResizeChanges += 1;
      }
    });
    return controller;
  }

  const controller = createController();
  const groupedController = createController();
  const emptyController = createController(true);
  const imperativeGroupedController = createImperativeGroupedController();
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
    const panel = canvasElement.querySelector(
      '[data-ui-component="workspace-bottom-panel"]',
    );
    const maximize = canvas.getByRole("button", {
      name: "Maximize bottom panel",
    });
    const restingBackground = getComputedStyle(maximize).backgroundColor;
    await userEvent.click(maximize);
    const restore = canvas.getByRole("button", {
      name: "Restore bottom panel",
    });
    await expect(restore).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(getComputedStyle(restore).backgroundColor).not.toBe(
        restingBackground,
      ),
    );
    await expect(panel).toHaveAttribute("data-maximized", "true");
    await expect(
      canvas.getByRole("button", { name: "Resize bottom panel" }),
    ).toBeDisabled();
    await userEvent.click(restore);
    await expect(panel).toHaveAttribute("data-maximized", "false");
    await expect(controller.layout.bottom.size).toBe(298);
  }}
>
  {#snippet template()}
    <div class="ui-workspace-bottom-panel-story-frame">
      <WorkspaceBottomPanel {controller} />
    </div>
  {/snippet}
</Story>

<Story
  name="Initially selected imperative group"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByTestId("bottom-imperative-view")).toBeVisible();
    const frame = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-bottom-panel-story-frame",
    );
    if (!frame) throw new Error("Expected the bottom-panel story frame");
    frame.style.width = "80%";
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(canvas.getByTestId("bottom-imperative-view")).toBeVisible();
    await expect(imperativeResizeChanges).toBe(0);
    await expect(
      canvas.getByRole("button", { name: "Collapse Properties" }),
    ).toHaveAttribute("aria-expanded", "true");
  }}
>
  {#snippet template()}
    <div class="ui-workspace-bottom-panel-story-frame">
      <WorkspaceBottomPanel controller={imperativeGroupedController} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty panel"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const empty = canvasElement.querySelector<HTMLElement>(
      "[data-workspace-bottom-panel-empty]",
    );
    await expect(empty).not.toBeNull();
    await expect(
      within(empty!).getByRole("heading", { name: "Heads up!" }),
    ).toBeVisible();

    const close = within(empty!).getByRole("button", {
      name: "Close bottom panel",
    });
    await expect(close).toBeVisible();
    await userEvent.click(close);
    await expect(
      canvas.queryByLabelText("Bottom panel"),
    ).not.toBeInTheDocument();

    emptyController.setDockOpen("bottom", true);
    const restored = await canvas.findByLabelText("Bottom panel");
    const restoredEmpty = restored.querySelector<HTMLElement>(
      "[data-workspace-bottom-panel-empty]",
    );
    await expect(restoredEmpty).not.toBeNull();
    expect(getComputedStyle(restoredEmpty!).backgroundColor).toBe(
      getComputedStyle(restored).backgroundColor,
    );
  }}
>
  {#snippet template()}
    <div class="ui-workspace-bottom-panel-story-frame">
      <WorkspaceBottomPanel controller={emptyController} />
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
    await expect(
      expandOutput.querySelector(".lucide-chevron-right"),
    ).not.toBeNull();
    await userEvent.click(expandOutput);
    const collapseOutput = canvas.getByRole("button", {
      name: "Collapse Output",
    });
    await expect(collapseOutput).toHaveAttribute("aria-expanded", "true");
    await expect(
      collapseOutput.querySelector(".lucide-chevron-down"),
    ).not.toBeNull();
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
