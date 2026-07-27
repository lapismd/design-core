<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import ExampleWorkspaceView from "./ExampleWorkspaceView.svelte";
  import WorkspaceViewHost from "./WorkspaceViewHost.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/View Host",
    component: WorkspaceViewHost,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Resolves a serializable view type through the controller registry and renders Svelte, imperative, empty, or missing-view content.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const registeredTab = createWorkspaceTab({
    id: "registered-view",
    title: "Registered view",
    view: { type: "demo.registered", state: { count: 1 } },
  });
  const layout = createDefaultWorkspaceLayout();
  const registeredPane = createWorkspaceTabs([registeredTab], {
    id: "registered-pane",
    activeItemId: registeredTab.id,
  });
  layout.main = registeredPane;
  layout.active = {
    hostId: "root",
    paneId: registeredPane.id,
    tabId: registeredTab.id,
  };
  const controller = new WorkspaceShellController({ layout });
  controller.registry.register({
    kind: "svelte",
    type: "demo.registered",
    component: ExampleWorkspaceView,
    icon: "layout-template",
  });

  const missingTab = createWorkspaceTab({
    id: "missing-view",
    title: "Missing view",
    view: { type: "demo.missing" },
  });
</script>

<Story
  name="Registered Svelte view"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Count 1" }));
    await expect(canvas.getByRole("button", { name: "Count 2" })).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/view-host/registered-svelte-view-chromium-darwin.png",
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
    <div class="h-[28rem]">
      <WorkspaceViewHost
        {controller}
        tab={registeredTab}
        hostId="root"
        paneId={registeredPane.id}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Missing view fallback"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Plugin no longer active" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="h-[28rem]">
      <WorkspaceViewHost
        {controller}
        tab={missingTab}
        hostId="root"
        paneId={registeredPane.id}
      />
    </div>
  {/snippet}
</Story>
