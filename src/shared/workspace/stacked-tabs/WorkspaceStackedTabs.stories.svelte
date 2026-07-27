<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
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
</script>

<Story
  name="Activates and closes vertical tabs"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    const reference = canvas.getByRole("button", { name: "Reference" });
    await userEvent.click(reference);
    await expect(reference).toHaveAttribute("aria-pressed", "true");

    const details = canvas.getByRole("button", { name: "Details" });
    await userEvent.click(
      details.querySelector('[data-ui-part="stacked-tab-close"]')!,
    );
    await expect(canvas.queryByRole("button", { name: "Details" })).toBeNull();
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
