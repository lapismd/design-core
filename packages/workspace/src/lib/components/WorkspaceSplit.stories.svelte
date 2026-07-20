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
  import { createDemoController } from "./stories/fixtures";

  let controller = $state(createDemoController());
  let pruningController = $state(createDemoController());
  let dragController = $state(createDemoController());
  let edgeDragController = $state(createDemoController());
</script>

<Story
  name="Nested directions"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-tabs-and-splits-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Notes view")).toBeVisible();
    await expect(canvas.getByText("Top pane view")).toBeVisible();
    await expect(canvas.getByText("Bottom pane view")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-split-story" data-ui-part="host">
      <WorkspaceSplit {controller} node={controller.layout.main} />
    </div>
  {/snippet}
</Story>

<Story
  name="Lapis split-layout reference capture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-tabs-and-splits-chromium-darwin.png",
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
          "The complete central pane tree from the saved Lapis layout, including horizontal and vertical splits, resizers, nested tab groups, stacked scrollbar behavior, and pane-edge geometry.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Lapis split layout reference" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <img
      data-ui-component="workspace-split-story"
      data-ui-part="reference-capture"
      src="/visual-baselines/workspace/reference/lapis-tabs-and-splits-chromium-darwin.png"
      alt="Lapis split layout reference"
      width="677"
      height="900"
    />
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-drop-top-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-right-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-bottom-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-left-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-center-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
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

<Story
  name="Lapis drop-zone reference captures"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-drop-top-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-right-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-bottom-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-left-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-drop-center-chromium-darwin.png",
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
          "Five stabilized captures from Lapis's live dragstart and dragover path. The translucent geometry is the target for top, right, bottom, left, and center drops; dragend cancelled each capture without changing the saved layout.",
      },
    },
  }}
  play={async ({ canvas }) => {
    for (const position of ["top", "right", "bottom", "left", "center"]) {
      await expect(
        canvas.getByRole("img", {
          name: `Lapis ${position} drop-zone reference`,
        }),
      ).toBeVisible();
    }
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-split-story"
      data-ui-part="drop-reference-grid"
    >
      {#each ["top", "right", "bottom", "left", "center"] as position}
        <figure>
          <img
            src={`/visual-baselines/workspace/reference/lapis-drop-${position}-chromium-darwin.png`}
            alt={`Lapis ${position} drop-zone reference`}
            width="225"
            height="450"
          />
          <figcaption>{position}</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-split-story"][data-ui-part="host"]) {
    height: 34rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-split-story"][data-ui-part="drop-reference-grid"]
    ) {
    display: grid;
    width: max-content;
    grid-template-columns: repeat(5, 225px);
    gap: 0.75rem;
  }

  :global(
      [data-ui-component="workspace-split-story"][data-ui-part="drop-reference-grid"]
        figure
    ) {
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--background);
  }

  :global(
      [data-ui-component="workspace-split-story"][data-ui-part="drop-reference-grid"]
        img
    ) {
    display: block;
    width: 225px;
    height: 450px;
  }

  :global(
      [data-ui-component="workspace-split-story"][data-ui-part="drop-reference-grid"]
        figcaption
    ) {
    border-top: 1px solid var(--border);
    padding: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    text-transform: uppercase;
  }

  :global(
      [data-ui-component="workspace-split-story"][data-ui-part="reference-capture"]
    ) {
    display: block;
    width: 677px;
    max-width: none;
    height: 900px;
  }
</style>
