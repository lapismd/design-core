<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceStackedTabs from "./WorkspaceStackedTabs.svelte";
  import "./WorkspaceStackedTabs.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Stacked Tabs",
    component: WorkspaceStackedTabs,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-shaped stacked workspace tabs with controller-backed activation, closing, overflow actions, drag targets, and hidden-scrollbar pane overflow.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const initialPane = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "stacked-home",
        title: "Framework home",
        icon: "layout-template",
      }),
      createWorkspaceTab({
        id: "stacked-reference",
        title: "Reference",
        icon: "book-open",
      }),
      createWorkspaceTab({
        id: "stacked-details",
        title: "Details",
        icon: "panel-right",
      }),
    ],
    {
      id: "stacked-story-pane",
      activeItemId: "stacked-home",
      presentation: "stacked",
    },
  );
  const layout = createDefaultWorkspaceLayout();
  layout.main = initialPane;
  layout.active = {
    hostId: "root",
    paneId: initialPane.id,
    tabId: "stacked-home",
  };
  const controller = new WorkspaceShellController({ layout });
  const livePane = $derived(
    controller.layout.main.kind === "tabs"
      ? controller.layout.main
      : initialPane,
  );

  const focusPane = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "stacked-focus-home",
        title: "Focus home",
        icon: "layout-template",
      }),
      createWorkspaceTab({
        id: "stacked-focus-reference",
        title: "Focus reference",
        icon: "book-open",
      }),
    ],
    {
      id: "stacked-focus-pane",
      activeItemId: "stacked-focus-home",
      presentation: "stacked",
    },
  );
  const focusLayout = createDefaultWorkspaceLayout();
  focusLayout.main = focusPane;
  focusLayout.active = {
    hostId: "root",
    paneId: focusPane.id,
    tabId: "stacked-focus-home",
  };
  const focusController = new WorkspaceShellController({
    layout: focusLayout,
  });
</script>

<Story
  name="Activates and closes vertical tabs"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="container"]',
    );
    await expect(container).not.toBeNull();
    await expect(container!.scrollWidth).toBeGreaterThan(
      container!.clientWidth,
    );

    const reference = canvas.getByRole("button", { name: "Reference" });
    await userEvent.click(reference);
    await expect(reference).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      expect(container!.scrollLeft).toBeGreaterThan(0);
    });

    const details = canvas.getByRole("button", { name: "Details" });
    await userEvent.click(
      details.querySelector('[data-ui-part="stacked-tab-close"]')!,
    );
    await expect(canvas.queryByRole("button", { name: "Details" })).toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/stacked-tabs/activates-and-closes-vertical-tabs-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-stacked-tabs-story-frame">
      <WorkspaceStackedTabs
        {controller}
        pane={livePane}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Focus mode"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const reference = canvas.getByRole("button", {
      name: "Focus reference",
    });
    await userEvent.dblClick(reference);
    const pane = canvasElement.querySelector(
      '[data-workspace-pane-id="stacked-focus-pane"]',
    );
    await expect(pane).toHaveAttribute("data-workspace-focus-mode", "true");
    await userEvent.click(
      canvas.getByRole("button", { name: "Exit focus mode" }),
    );
    await expect(pane).not.toHaveAttribute("data-workspace-focus-mode");
    await userEvent.dblClick(reference);
  }}
>
  {#snippet template()}
    <div class="ui-workspace-stacked-tabs-story-frame">
      <WorkspaceStackedTabs
        controller={focusController}
        pane={focusPane}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>
