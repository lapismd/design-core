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
  import * as exampleSources from "./WorkspacePopoutSurface.example-sources.js";
  import WorkspacePopoutSurface from "./WorkspacePopoutSurface.svelte";
  import WorkspaceOverlayPortalFixture from "./WorkspaceOverlayPortalFixture.svelte";
  import WorkspaceTree from "../tree/WorkspaceTree.svelte";
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

  const overlayLayout = createDefaultWorkspaceLayout();
  const overlayTab = createWorkspaceTab({
    id: "popout-overlay-tab",
    title: "Overlay fixture",
    icon: "panels-top-left",
    view: { type: "popout.overlay-fixture", state: {} },
  });
  overlayLayout.main = createWorkspaceTabs([overlayTab], {
    id: "popout-overlay-pane",
    activeItemId: overlayTab.id,
  });
  const overlayApp = new AppShellController({ layout: overlayLayout });
  overlayApp.renderer.registry.register({
    kind: "svelte",
    type: "popout.overlay-fixture",
    component: WorkspaceOverlayPortalFixture,
    showHeader: false,
  });
  const overlayDrag = new WorkspaceDragState(overlayApp.renderer);

  const { Story } = defineMeta({
    title: "Workspace/Components/Popout Surface",
    component: WorkspacePopoutSurface,
    parameters: {
      layout: "fullscreen",
      docs: {
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<Story
  name="Detached workspace tree"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    const popoutSurface = canvasElement.querySelector(
      '[data-workspace-popout-id="popout-story-window"]',
    );
    await expect(popoutSurface).not.toBeNull();
    await expect(popoutSurface).toHaveAttribute(
      "data-ui-scrollbar-visibility",
      "scroll",
    );
    await expect(
      canvas.getByRole("button", { name: /^Detached view$/ }),
    ).toHaveAttribute("aria-pressed", "true");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/popout/detached-workspace-tree-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
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

<Story
  name="Owner-document overlays"
  tags={["visual-pending", "test"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Open overlay fixture in a popout" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-popout-story">
      <div class="ui-workspace-popout-story__frame">
        <AppShellRoot controller={overlayApp} theme="inherit">
          <button
            class="ui-workspace-popout-story__open"
            type="button"
            onclick={() => overlayApp.renderer.popoutTab(overlayTab.id)}
          >
            Open overlay fixture in a popout
          </button>
          <WorkspaceTree
            controller={overlayApp.renderer}
            node={overlayApp.renderer.layout.main}
            hostId="root"
            drag={overlayDrag}
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
