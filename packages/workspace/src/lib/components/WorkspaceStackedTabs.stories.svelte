<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceStackedTabs from "./WorkspaceStackedTabs.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Stacked Tabs",
    component: WorkspaceStackedTabs,
    parameters: {
      docs: {
        description: {
          component:
            "Lapis-style stacked tab view with compact vertical tab rails and one expanded view body.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { createDemoController } from "./stories/fixtures";
  import type { WorkspaceTabsNode } from "../core/types.js";

  const stackedController = createDemoController({
    version: 1,
    left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
    right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
    main: {
      kind: "tabs",
      id: "stacked-tabs",
      activeTabId: "notes",
      presentation: "stacked",
      tabs: [
        { id: "notes", title: "Notes", view: { type: "story", state: {} } },
        { id: "details", title: "Details", view: { type: "story", state: {} } },
        { id: "outline", title: "Outline", view: { type: "story", state: {} } },
      ],
    },
  });
</script>

<Story
  name="Selects the expanded view"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await expect(
      canvas.getByRole("button", { name: "Details" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("Details view")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-stacked-story" data-ui-part="host">
      <WorkspaceStackedTabs
        controller={stackedController}
        group={stackedController.layout.main as WorkspaceTabsNode}
      />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-stacked-story"][data-ui-part="host"]) {
    height: 30rem;
    border: 1px solid var(--border);
  }
</style>
