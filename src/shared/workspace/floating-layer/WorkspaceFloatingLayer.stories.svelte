<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceFloatingLayer from "./WorkspaceFloatingLayer.svelte";
  import "./WorkspaceFloatingLayer.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Floating Layer",
    component: WorkspaceFloatingLayer,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Presentation layer for free and minimized floating windows, driven entirely by serialized controller state.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const controller = new WorkspaceShellController({
    layout: createDefaultWorkspaceLayout(),
  });
  controller.registry.register({
    kind: "svelte",
    type: "floating-layer-example",
    component: ExampleWorkspaceView,
    showHeader: false,
  });
  const normal = controller.openWindow(
    createWorkspaceTab({
      id: "floating-layer-normal",
      title: "Reference",
      view: { type: "floating-layer-example" },
    }),
    "floating",
    { x: 96, y: 64, width: 480, height: 340 },
  )!;
  const minimized = controller.openWindow(
    createWorkspaceTab({
      id: "floating-layer-minimized",
      title: "Details",
      view: { type: "floating-layer-example" },
    }),
    "floating",
    { x: 320, y: 180, width: 420, height: 300 },
  )!;
  controller.setWindowState(minimized.id, "minimized");
  let boundsRoot = $state<HTMLElement | null>(null);
</script>

<Story
  name="Free and minimized windows"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("dialog", { name: "Reference" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", {
        name: "Restore floating pane Details",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div bind:this={boundsRoot} class="ui-workspace-floating-layer-story-frame">
      <WorkspaceFloatingLayer {controller} {boundsRoot} />
    </div>
  {/snippet}
</Story>
