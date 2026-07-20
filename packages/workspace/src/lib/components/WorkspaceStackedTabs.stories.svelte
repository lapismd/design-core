<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceStackedTabs from "./WorkspaceStackedTabs.svelte";
  import WorkspaceTabs from "./WorkspaceTabs.svelte";

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
  import { createWorkspaceTabs, findWorkspaceNode } from "../core/layout.js";
  import type { WorkspaceTabsNode } from "../core/types.js";

  function createStackedController() {
    return createDemoController({
      version: 1,
      left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      main: createWorkspaceTabs(
        [
          { id: "notes", title: "Notes", view: { type: "story", state: {} } },
          {
            id: "details",
            title: "Details",
            view: { type: "story", state: {} },
          },
          {
            id: "outline",
            title: "Outline",
            view: { type: "story", state: {} },
          },
        ],
        "stacked-tabs",
        "stacked",
      ),
    });
  }

  function createCrossPaneController() {
    return createDemoController({
      version: 1,
      left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      main: {
        kind: "split",
        id: "cross-pane-root",
        direction: "horizontal",
        sizes: [35, 65],
        children: [
          createWorkspaceTabs(
            [
              {
                id: "inbox",
                title: "Inbox",
                view: { type: "story", state: {} },
              },
            ],
            "source-tabs",
          ),
          createWorkspaceTabs(
            [
              {
                id: "stack-notes",
                title: "Notes",
                view: { type: "story", state: {} },
              },
            ],
            "stack-target",
            "stacked",
          ),
        ],
      },
    });
  }

  function tabsFor(
    controller: ReturnType<typeof createDemoController>,
    id: string,
  ) {
    const found = findWorkspaceNode(controller.layout.main, id);
    if (!found || found.node.kind !== "tabs") {
      throw new Error(`Expected tab group ${id}`);
    }
    return found.node;
  }

  let stackedController = $state(createStackedController());
  let dragController = $state(createStackedController());
  let closeController = $state(createStackedController());
  let overflowController = $state(
    createDemoController({
      version: 1,
      left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      main: createWorkspaceTabs(
        Array.from({ length: 10 }, (_, index) => ({
          id: `stacked-${index + 1}`,
          title: `Stacked tab ${index + 1}`,
          view: { type: "story", state: {} },
        })),
        "many-stacked-tabs",
        "stacked",
      ),
    }),
  );
  let crossPaneController = $state(createCrossPaneController());
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

<Story
  name="Reorders vertical rails"
  play={async ({ canvas, canvasElement }) => {
    const outline = canvas.getByRole("button", { name: "Outline" });
    const notes = canvas.getByRole("button", { name: "Notes" });
    const notesPanel = notes.closest<HTMLElement>(
      '[data-ui-part="stacked-panel"]',
    );
    const strip = notes.closest<HTMLElement>('[data-ui-part="stacked-strip"]');
    if (!notesPanel || !strip) throw new Error("Stacked drag targets missing");

    const dataTransfer = new DataTransfer();
    outline.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    notesPanel.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        clientX: notesPanel.getBoundingClientRect().left,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await expect(notesPanel).toHaveAttribute("data-drop-before", "true");
    strip.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    const triggerText = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-workspace-part="stacked-tab-trigger"]',
      ),
      (trigger) => trigger.textContent?.trim(),
    );
    await expect(triggerText).toEqual(["Outline", "Notes", "Details"]);
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-stacked-story" data-ui-part="host">
      <WorkspaceStackedTabs
        controller={dragController}
        group={dragController.layout.main as WorkspaceTabsNode}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Repairs active tab after close"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Close Details" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Details" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText("Outline view")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-stacked-story" data-ui-part="host">
      <WorkspaceStackedTabs
        controller={closeController}
        group={closeController.layout.main as WorkspaceTabsNode}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Many rails without native scrollbars"
  play={async ({ canvasElement }) => {
    const strip = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="stacked-strip"]',
    );
    if (!strip) throw new Error("Stacked strip not found");
    const style = getComputedStyle(strip);
    await expect(style.overflowX).toBe("hidden");
    await expect(style.overflowY).toBe("hidden");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-stacked-story" data-ui-part="host">
      <WorkspaceStackedTabs
        controller={overflowController}
        group={overflowController.layout.main as WorkspaceTabsNode}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Previews an edge drop from another pane"
  play={async ({ canvas, canvasElement }) => {
    const source = canvas.getByRole("tab", { name: "Inbox" });
    const target = canvas.getByRole("region", {
      name: "Drop a tab into stack-target",
    });
    const dataTransfer = new DataTransfer();
    const rect = target.getBoundingClientRect();
    source.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    target.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom - rect.height * 0.1,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await expect(
      canvasElement.querySelector(
        '[data-ui-part="tab-drop-overlay"][data-drop-position="bottom"]',
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-stacked-story"
      data-ui-part="cross-pane-host"
    >
      <WorkspaceTabs
        controller={crossPaneController}
        group={tabsFor(crossPaneController, "source-tabs")}
      />
      <WorkspaceStackedTabs
        controller={crossPaneController}
        group={tabsFor(crossPaneController, "stack-target")}
      />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-stacked-story"][data-ui-part="host"]) {
    height: 30rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-stacked-story"][data-ui-part="cross-pane-host"]
    ) {
    display: grid;
    height: 30rem;
    grid-template-columns: minmax(12rem, 1fr) minmax(18rem, 2fr);
    overflow: hidden;
    border: 1px solid var(--border);
  }
</style>
