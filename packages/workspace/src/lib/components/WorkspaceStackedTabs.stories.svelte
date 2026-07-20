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
  import { createWorkspaceTabs } from "../core/layout.js";
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
</script>

<Story
  name="Selects the expanded view"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-stacked-tabs-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-stacked-layout-full-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
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
  name="Lapis stacked-tab reference capture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-stacked-tabs-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
    docs: {
      description: {
        story:
          "A live Lapis pane temporarily switched from top tabs to stacked presentation. It records the shared add/overflow header, vertical title rails, close and icon placement, pane widths, dividers, and body alignment. The app was unstacked after capture.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Lapis stacked tabs reference" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <img
      data-ui-component="workspace-stacked-story"
      data-ui-part="reference-capture"
      src="/visual-baselines/workspace/reference/lapis-stacked-tabs-chromium-darwin.png"
      alt="Lapis stacked tabs reference"
      width="336"
      height="450"
    />
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-stacked-story"][data-ui-part="host"]) {
    height: 30rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-stacked-story"][data-ui-part="reference-capture"]
    ) {
    display: block;
    width: 336px;
    max-width: none;
    height: 450px;
  }
</style>
