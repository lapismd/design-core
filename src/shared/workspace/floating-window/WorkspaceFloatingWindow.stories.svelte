<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceFloatingWindow from "./WorkspaceFloatingWindow.svelte";
  import "./WorkspaceFloatingWindow.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Floating Window",
    component: WorkspaceFloatingWindow,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controller-backed floating window with focus, move, resize, collapse, minimize, maximize, close, and redock controls.",
        },
      },
    },
  });
</script>

<script lang="ts">
  function createFixture(state: "normal" | "minimized" = "normal") {
    const controller = new WorkspaceShellController({
      layout: createDefaultWorkspaceLayout(),
    });
    controller.registry.register({
      kind: "svelte",
      type: "floating-example",
      component: ExampleWorkspaceView,
      showHeader: false,
    });
    const openedWindow = controller.openWindow(
      createWorkspaceTab({
        id: `floating-${state}`,
        title:
          state === "normal" ? "Floating reference" : "Minimized reference",
        icon: "panel-top",
        view: { type: "floating-example" },
      }),
      "floating",
      { x: 72, y: 48, width: 520, height: 360 },
    )!;
    controller.setWindowState(openedWindow.id, state);
    const workspaceWindow = controller.layout.windows.find(
      (entry) => entry.id === openedWindow.id,
    )!;
    return {
      controller,
      workspaceWindow,
      drag: new WorkspaceDragState(controller),
    };
  }

  const normal = createFixture();
  const minimized = createFixture("minimized");
  let boundsRoot = $state<HTMLElement | null>(null);
</script>

<Story
  name="Window controls"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const maximizeButton = canvas.getByRole("button", {
      name: "Maximize floating pane",
    });
    await expect(
      maximizeButton.querySelector(".lucide-maximize"),
    ).not.toBeNull();
    await userEvent.click(maximizeButton);
    const restoreSizeButton = canvas.getByRole("button", {
      name: "Restore floating pane size",
    });
    await expect(
      restoreSizeButton.querySelector(".lucide-minimize"),
    ).not.toBeNull();
    await userEvent.click(restoreSizeButton);

    const collapseButton = canvas.getByRole("button", {
      name: "Collapse floating pane",
    });
    const header = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-floating-window__header",
    );
    await expect(header).not.toBeNull();
    await userEvent.hover(collapseButton);
    await waitFor(() => {
      expect(getComputedStyle(collapseButton).backgroundColor).not.toBe(
        getComputedStyle(header!).backgroundColor,
      );
    });
    await userEvent.unhover(collapseButton);

    await userEvent.click(collapseButton);
    await expect(
      canvas.getByRole("button", { name: "Restore floating pane" }),
    ).toBeVisible();

    const floatingWindow = canvasElement.querySelector(
      '[data-floating-window-state="collapsed"]',
    );
    const collapsedHeader = floatingWindow?.querySelector(
      ".ui-workspace-floating-window__header",
    );
    await expect(floatingWindow).not.toBeNull();
    await expect(collapsedHeader).not.toBeNull();

    const windowBounds = floatingWindow!.getBoundingClientRect();
    const headerBounds = collapsedHeader!.getBoundingClientRect();
    await expect(windowBounds.height).toBeCloseTo(headerBounds.height);
    await expect(Math.max(0, windowBounds.bottom - headerBounds.bottom)).toBe(
      0,
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/floating-window/window-controls-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div
      bind:this={boundsRoot}
      class="ui-workspace-floating-window-story-frame"
    >
      <WorkspaceFloatingWindow
        controller={normal.controller}
        window={normal.workspaceWindow}
        drag={normal.drag}
        {boundsRoot}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Minimized window"
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/floating-window/minimized-window-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-floating-window-story-minimized">
      <WorkspaceFloatingWindow
        controller={minimized.controller}
        window={minimized.workspaceWindow}
        drag={minimized.drag}
        dockMode="minimized"
      />
    </div>
  {/snippet}
</Story>
