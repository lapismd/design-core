<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
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
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse floating pane" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Restore floating pane" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/floating-window/window-controls-chromium-darwin.png",
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
        "/visual-baselines/workspace/floating-window/minimized-window-chromium-darwin.png",
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
