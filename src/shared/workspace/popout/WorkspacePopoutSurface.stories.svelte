<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspacePopoutSurface from "./WorkspacePopoutSurface.svelte";
  import "./WorkspacePopoutSurface.stories.css";

  const layout = createDefaultWorkspaceLayout();
  const tab = createWorkspaceTab({
    id: "popout-story-tab",
    title: "Detached view",
    icon: "picture-in-picture",
    view: { type: "empty", state: {} },
  });
  const popoutWindow = {
    id: "popout-story-window",
    mode: "popout" as const,
    state: "normal" as const,
    bounds: { x: 120, y: 90, width: 720, height: 480 },
    root: createWorkspaceTabs([tab], {
      id: "popout-story-pane",
      activeItemId: tab.id,
    }),
  };
  layout.windows = [popoutWindow];
  const popoutApp = new AppShellController({ layout });
  const drag = new WorkspaceDragState(popoutApp.renderer);

  const { Story } = defineMeta({
    title: "Workspace/Components/Popout Surface",
    component: WorkspacePopoutSurface,
    parameters: { layout: "fullscreen" },
  });
</script>

<Story
  name="Detached workspace tree"
  tags={["visual-ready"]}
  play={async ({ canvas, canvasElement }) => {
    await expect(
      canvasElement.querySelector(
        '[data-workspace-popout-id="popout-story-window"]',
      ),
    ).not.toBeNull();
    await expect(
      canvas.getByRole("tab", { name: "Detached view" }),
    ).toHaveAttribute("aria-selected", "true");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/popout/detached-workspace-tree-chromium-darwin.png",
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
    <div class="ui-workspace-popout-story">
      <div class="ui-workspace-popout-story__frame">
        <AppShellRoot controller={popoutApp} popoutHost={null} theme="inherit">
          <WorkspacePopoutSurface
            controller={popoutApp.renderer}
            window={popoutWindow}
            {drag}
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
