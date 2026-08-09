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
  import * as exampleSources from "./WorkspaceViewHost.example-sources.js";
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
  const emptyTab = createWorkspaceTab({
    id: "empty-view",
    title: "Empty view",
    view: { type: "empty" },
  });
</script>

<Story
  name="Registered Svelte view"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Count 1" }));
    await expect(canvas.getByRole("button", { name: "Count 2" })).toBeVisible();
    const host = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-view-host"]',
    );
    const surface = canvas.getByTestId("view-host-default-surface");
    await expect(host).not.toBeNull();
    expect(getComputedStyle(host!).backgroundColor).toBe(
      getComputedStyle(surface).backgroundColor,
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/view-host/registered-svelte-view-chromium.png",
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
      class="h-[28rem]"
      data-testid="view-host-default-surface"
      style="background: var(--ui-workspace-background); color: var(--ui-workspace-foreground)"
    >
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
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Plugin no longer active" }),
    ).toBeVisible();
    await expect(
      canvas
        .getByRole("heading", { name: "Plugin no longer active" })
        .closest('[data-ui-component="workspace-empty"]'),
    ).toHaveAttribute("data-workspace-surface", "page");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/view-host/missing-view-fallback-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
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

<Story
  name="Empty tab"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(
      canvas
        .getByRole("heading", { name: "No file is open" })
        .closest('[data-ui-component="workspace-empty"]'),
    ).toHaveAttribute("data-workspace-surface", "page");
  }}
>
  {#snippet template()}
    <div class="h-[28rem]">
      <WorkspaceViewHost
        {controller}
        tab={emptyTab}
        hostId="root"
        paneId={registeredPane.id}
      />
    </div>
  {/snippet}
</Story>
