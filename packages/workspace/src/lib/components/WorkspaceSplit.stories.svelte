<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSplit from "./WorkspaceSplit.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Split",
    component: WorkspaceSplit,
    parameters: {
      docs: {
        description: {
          component:
            "Recursive, keyboard-resizable horizontal and vertical workspace splits.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import type {
    WorkspaceDirection,
    WorkspaceLayoutV1,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import { createDemoController } from "./stories/fixtures";

  let pruningController = $state(createDemoController());
  let dragController = $state(createDemoController());
  let edgeDragController = $state(createDemoController());
  let mainPanelController = $state(
    createDemoController(createReferenceLayout()),
  );
  let horizontalController = $state(
    createDemoController(createReferenceLayout("horizontal")),
  );
  let verticalController = $state(
    createDemoController(createReferenceLayout("vertical")),
  );

  function referenceTabs(id: string, title: string): WorkspaceTabsNode {
    return {
      kind: "tabs",
      id,
      activeTabId: `${id}-tab`,
      presentation: "top",
      tabs: [
        {
          id: `${id}-tab`,
          title,
          view: { type: "empty", state: {} },
        },
      ],
    };
  }

  function createReferenceLayout(
    direction?: WorkspaceDirection,
  ): WorkspaceLayoutV1 {
    return {
      version: 1,
      left: {
        open: false,
        size: 304,
        activeTabId: null,
        collapsedGroups: {},
      },
      right: {
        open: false,
        size: 256,
        activeTabId: null,
        collapsedGroups: {},
      },
      main: direction
        ? {
            kind: "split",
            id: `${direction}-reference-split`,
            direction,
            sizes: [50, 50],
            children: [
              referenceTabs(`${direction}-first`, "First pane"),
              referenceTabs(`${direction}-second`, "Second pane"),
            ],
          }
        : referenceTabs("main-panel", "New Tab"),
    };
  }
</script>

<Story
  name="Main panel"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-main-panel-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "New Tab" })).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-split-story"
      data-ui-part="host"
      data-reference-part="main-panel"
    >
      <WorkspaceSplit
        controller={mainPanelController}
        node={mainPanelController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Horizontal split"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-horizontal-split-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "First pane" })).toBeVisible();
    await expect(
      canvas.getByRole("tab", { name: "Second pane" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-split-story"
      data-ui-part="host"
      data-reference-part="horizontal-split"
    >
      <WorkspaceSplit
        controller={horizontalController}
        node={horizontalController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Vertical split"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-vertical-split-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "First pane" })).toBeVisible();
    await expect(
      canvas.getByRole("tab", { name: "Second pane" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-split-story"
      data-ui-part="host"
      data-reference-part="vertical-split"
    >
      <WorkspaceSplit
        controller={verticalController}
        node={verticalController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Moves tabs across panes"
  play={async ({ canvas, canvasElement }) => {
    const source = canvas.getByRole("tab", { name: "Notes" });
    const target = canvas.getByRole("region", {
      name: "Drop a tab into top-tabs",
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
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.5,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await expect(
      canvasElement.querySelector('[data-ui-part="tab-drop-overlay"]'),
    ).toBeVisible();
    target.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.5,
        dataTransfer,
      }),
    );
    await expect(canvas.getByText("Notes view")).toBeVisible();
    await expect(canvas.getAllByRole("tab", { name: "Notes" })).toHaveLength(1);
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-split-story" data-ui-part="host">
      <WorkspaceSplit
        controller={dragController}
        node={dragController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Drops tabs onto pane edges"
  play={async ({ canvas, canvasElement }) => {
    const source = canvas.getByRole("tab", { name: "Notes" });
    const target = canvas.getByRole("region", {
      name: "Drop a tab into top-tabs",
    });
    const initialPaneCount = canvasElement.querySelectorAll(
      '[data-ui-part="tabs"]',
    ).length;
    const dataTransfer = new DataTransfer();
    const rect = target.getBoundingClientRect();
    const clientX = rect.right - rect.width * 0.1;
    const clientY = rect.top + rect.height * 0.5;

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
        clientX,
        clientY,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    const overlay = canvasElement.querySelector(
      '[data-ui-part="tab-drop-overlay"]',
    );
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("data-drop-position", "right");

    target.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    expect(
      canvasElement.querySelectorAll('[data-ui-part="tabs"]').length,
    ).toBeGreaterThan(initialPaneCount);
    await expect(canvas.getByText("Notes view")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-split-story" data-ui-part="host">
      <WorkspaceSplit
        controller={edgeDragController}
        node={edgeDragController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Removes an empty pane"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Close Top pane" }),
    );
    await expect(canvas.queryByText("Top pane view")).not.toBeInTheDocument();
    await expect(canvas.getByText("Bottom pane view")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-split-story" data-ui-part="host">
      <WorkspaceSplit
        controller={pruningController}
        node={pruningController.layout.main}
      />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-split-story"][data-ui-part="host"]) {
    height: 34rem;
    border: 1px solid var(--border);
  }

  :global([data-ui-component="workspace-split-story"][data-reference-part]) {
    width: 672px;
    height: 900px;
    overflow: hidden;
    border: 0;
  }
</style>
